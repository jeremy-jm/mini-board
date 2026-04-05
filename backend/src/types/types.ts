export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface MemberDto {
  id: string;
  name: string;
  avatar: string;
}

export interface TaskStatusColumnDto {
  id: TaskStatus;
  title: string;
  sortOrder: number;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  order: number;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;
}

export interface ReorderItem {
  id: string;
  status: TaskStatus;
  order: number;
}

