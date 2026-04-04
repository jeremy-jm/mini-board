import { createSlice } from "@reduxjs/toolkit";
import type { Task } from "../features/types/types";

export const getTasks = () => {
    return {
        type: 'GET_TASKS',
    };
};

export const createTask = (task: Task) => {
    return {
        type: 'CREATE_TASK',
        payload: task,
    };
};

export const updateTask = (task: Task) => {
    return {
        type: 'UPDATE_TASK',
        payload: task,
    };
};

export const deleteTask = (task: Task) => {
    return {
        type: 'DELETE_TASK',
        payload: task,
    };
};

export const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: [],
    },
    reducers: {
        createTask: (state, action) => {
            //state.tasks.push(action.payload);
            console.log(action.payload);
        },
    },
});


export const {  } = taskSlice.actions;

export default taskSlice.reducer;