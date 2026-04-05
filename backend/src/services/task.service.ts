import { PrismaClient } from '@prisma/client';
import type { MemberDto, ReorderItem, TaskDto, TaskPriority, TaskStatus } from '../types/types.js';

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  priority: TaskPriority;
  dueDate: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskService {
  listTasks(): Promise<TaskDto[]>;
  createTask(input: CreateTaskInput): Promise<TaskDto>;
  updateTask(id: string, input: UpdateTaskInput): Promise<TaskDto>;
  deleteTask(id: string): Promise<void>;
  reorderTasks(items: ReorderItem[]): Promise<void>;
  listMembers(): Promise<MemberDto[]>;
}

export function createPrismaTaskService(prisma: PrismaClient): TaskService {
  return {
    async listTasks() {
      return [];
    },
    async createTask(input) {
      return Promise.resolve({} as TaskDto);
    },
    async updateTask(id, input) {
      return Promise.resolve({} as TaskDto);
    },
    async deleteTask(id) {
      return Promise.resolve();
    },
    async reorderTasks(items) {
      return Promise.resolve();
    },
    async listMembers() {
      return Promise.resolve([] as MemberDto[]);
    },
  };
}

