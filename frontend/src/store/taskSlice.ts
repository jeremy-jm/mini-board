import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  Member,
  Task,
  TaskPayload,
  TaskStatus,
} from "../features/types/types";
import { apiClient } from "../lib/api";

interface TaskState {
  tasks: Task[];
  members: Member[];
  loading: boolean;
  submitting: boolean;
  rollbackSnapshot: Task[] | null;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  members: [],
  loading: false,
  submitting: false,
  rollbackSnapshot: null,
  error: null,
};

export const fetchInitialData = createAsyncThunk(
  "tasks/fetchInitialData",
  async () => {
    const [tasksResponse, membersResponse] = await Promise.all([
      apiClient.get("/tasks"),
      apiClient.get("/members"),
    ]);
    const tasks = tasksResponse.data.data;
    const members = membersResponse.data.data;
    return { tasks, members };
  },
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (task: TaskPayload) => {
    const response = await apiClient.post<{ data: Task }>("/tasks", task);
    return response.data.data;
  },
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, task }: { id: string; task: TaskPayload }) => {
    const response = await apiClient.patch<{ data: Task }>(
      `/tasks/${id}`,
      task,
    );
    return response.data.data;
  },
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: string) => {
    const response = await apiClient.delete<{ data: Task }>(`/tasks/${id}`);
    return response.data.data;
  },
);

// sync reorder tasks
export const syncOrders = createAsyncThunk(
  "tasks/syncReorderTasks",
  async (tasks: { id: string; status: TaskStatus; order: number }[]) => {
    await apiClient.post<{ data: Task[] }>("/tasks/reorder", { tasks });
    return tasks;
  },
);

// sort by order
function sortByOrder(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.order - b.order);
}

export const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // optimistic reorder
    optimisticReorder: (state, action) => {
      state.rollbackSnapshot = state.tasks.map((task) => ({ ...task }));
      state.tasks = sortByOrder(action.payload.nextTasks);
    },
    // rollback affected columns
    rollbackAffectedColumns(
      state,
      action: PayloadAction<{ statuses: TaskStatus[] }>,
    ) {
      if (!state.rollbackSnapshot) return;
      const statuses = new Set(action.payload.statuses);
      const untouched = state.tasks.filter(
        (task) => !statuses.has(task.status),
      );
      const rollback = state.rollbackSnapshot.filter((task) =>
        statuses.has(task.status),
      );
      state.tasks = [...untouched, ...rollback];
      state.rollbackSnapshot = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch initial data
      .addCase(fetchInitialData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.members = action.payload.members;
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      // create task
      .addCase(createTask.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.submitting = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message ?? null;
      })
      // update task
      .addCase(updateTask.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.submitting = false;
        state.tasks = state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        );
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message ?? null;
      })
      // delete task
      .addCase(deleteTask.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.submitting = false;
        state.tasks = state.tasks.filter(
          (task) => task.id !== action.payload.id,
        );
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message ?? null;
      });
  },
});

export const { optimisticReorder, rollbackAffectedColumns } = taskSlice.actions;

export default taskSlice.reducer;
