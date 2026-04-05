import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./taskSlice";
import taskStatusReducer from "./taskStatusSlice";

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    taskStatus: taskStatusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
