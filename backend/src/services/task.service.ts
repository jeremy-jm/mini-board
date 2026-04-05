import { PrismaClient } from "@prisma/client";
import type {
  MemberDto,
  ReorderItem,
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "../types/types.js";

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

function toTaskDto(task: any): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    order: task.order,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assigneeId: task.assigneeId ?? null,
    assigneeName: task.assignee?.name ?? null,
    assigneeAvatar: task.assignee?.avatar ?? null,
  };
}

export function createPrismaTaskService(prisma: PrismaClient): TaskService {
  return {
    async listTasks() {
      const tasks = await prisma.task.findMany({
        include: {
          assignee: true,
        },
        orderBy: [
          {
            order: "asc",
          },
          {
            createdAt: "asc",
          },
          {
            status: "asc",
          },
        ],
      });
      return tasks.map(toTaskDto);
    },

    async createTask(input) {
      const count = await prisma.task.count({
        where: { status: input.status },
      });
      const task = await prisma.task.create({
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          order: count,
          assigneeId: input.assigneeId ?? null,
          priority: input.priority,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        },
        include: {
          assignee: true,
        },
      });
      return toTaskDto(task);
    },

    async updateTask(id, input) {
      const task = await prisma.task.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          assigneeId: input.assigneeId ?? null,
          priority: input.priority,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        },
        include: {
          assignee: true,
        },
      });
      return toTaskDto(task);
    },

    async deleteTask(id) {
      await prisma.task.delete({ where: { id } });
    },

    async reorderTasks(items) {
      await prisma.task.updateMany({
        where: { id: { in: items.map((item) => item.id) } },
        data: { order: { increment: 1 } },
      });
    },

    async listMembers() {
      const members = await prisma.member.findMany({
        orderBy: { createdAt: "asc" },
      });
      return members.map((member) => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
      }));
    },
  };
}
