export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    order: number;
    createdAt: string;
    updatedAt: string;
};