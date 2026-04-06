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

/** plus one hour, and set minute to 0 */
export function getInitialDueDate(task: Task | undefined): dayjs.Dayjs | null {
  if (task == null) return dayjs().add(1, 'hour').startOf('minute');
  if (task.dueDate) return dayjs(task.dueDate);
  return null;
}
