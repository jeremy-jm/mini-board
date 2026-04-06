import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import type { TaskStatus } from "../features/types/types";
import { apiClient } from "../lib/api";

import type { RootState } from "./store";

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
  try {
    const response = await apiClient.get<{ data: TaskStatusColumnDto[] }>(
      "/task-statuses",
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch task statuses",
    );
  }
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

// Memoized selector - only returns new array when items actually change
export const selectColumnsSorted = createSelector(
  [(state: RootState) => state.taskStatus.items],
  (items) => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
);
