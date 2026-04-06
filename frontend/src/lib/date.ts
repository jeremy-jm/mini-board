import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { Task } from '../features/types/types';

dayjs.extend(utc);
dayjs.extend(timezone);

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') {
    return false;
  }
  return dayjs(task.dueDate).isBefore(dayjs());
}

export function formatDateTime(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD HH:mm');
}

export function toUtcIso(localValue: string | null): string | null {
  if (!localValue) return null;
  return dayjs(localValue).utc().toISOString();
}

