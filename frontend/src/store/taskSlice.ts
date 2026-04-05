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
  loading: true,
  submitting: false,
  rollbackSnapshot: null,
  error: null,
};

export const fetchInitialData = createAsyncThunk(
  "tasks/fetchInitialData",
  async (_arg?: { silent?: boolean }) => {
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

export const syncOrders = createAsyncThunk(
  "tasks/syncOrders",
  async (
    items: { id: string; status: TaskStatus; order: number }[],
    { dispatch },
  ) => {
    await apiClient.post("/tasks/reorder", { items });
    await dispatch(fetchInitialData({ silent: true })).unwrap();
  },
);

export const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    optimisticReorder: (
      state,
      action: PayloadAction<{ nextTasks: Task[] }>,
    ) => {
      state.rollbackSnapshot = state.tasks.map((task) => ({ ...task }));
      state.tasks = action.payload.nextTasks;
    },
    replaceTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.rollbackSnapshot = null;
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
      .addCase(fetchInitialData.pending, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.loading = true;
          state.error = null;
        }
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.loading = false;
        }
        state.tasks = action.payload.tasks;
        state.members = action.payload.members;
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.loading = false;
        }
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
      })
      .addCase(syncOrders.pending, (state) => {
        state.submitting = true;
      })
      .addCase(syncOrders.fulfilled, (state) => {
        state.submitting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(syncOrders.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export const { optimisticReorder, rollbackAffectedColumns, replaceTasks } =
  taskSlice.actions;

export default taskSlice.reducer;
