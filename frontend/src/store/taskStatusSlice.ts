import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { TaskStatus } from "../features/types/types";

export interface TaskStatusColumnDto {
  id: TaskStatus;
  title: string;
  sortOrder: number;
}

export const fetchTaskStatuses = createAsyncThunk<
  TaskStatusColumnDto[],
  void,
  { rejectValue: string }
>("taskStatus/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch("/api/task-statuses");
  if (!res.ok) {
    const text = await res.text();
    return rejectWithValue(text || res.statusText);
  }
  return res.json() as Promise<TaskStatusColumnDto[]>;
});

type LoadState = "idle" | "loading" | "succeeded" | "failed";

const taskStatusSlice = createSlice({
  name: "taskStatus",
  initialState: {
    items: [] as TaskStatusColumnDto[],
    loadState: "idle" as LoadState,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskStatuses.pending, (state) => {
        state.loadState = "loading";
        state.error = null;
      })
      .addCase(fetchTaskStatuses.fulfilled, (state, action) => {
        state.loadState = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTaskStatuses.rejected, (state, action) => {
        state.loadState = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.error.message ?? "Failed to load columns");
      });
  },
});

export default taskStatusSlice.reducer;
