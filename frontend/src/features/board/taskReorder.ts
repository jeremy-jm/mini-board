import type { Task, TaskStatus } from "../types/types";

/** Recompute full task list after dropping `activeId` onto column or task `overId`. */
export function applyTasksAfterDrop(
  tasks: Task[],
  activeId: string,
  overId: string,
  columnIds: TaskStatus[],
): Task[] {
  const active = tasks.find((t) => t.id === activeId);
  if (!active) return tasks;

  const rest = tasks.filter((t) => t.id !== activeId);
  const queues: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  for (const t of rest) {
    queues[t.status].push({ ...t });
  }
  for (const s of columnIds) {
    queues[s].sort((a, b) => a.order - b.order);
  }

  const overIsColumn = columnIds.includes(overId as TaskStatus);
  let targetStatus: TaskStatus;
  let insertIndex: number;

  if (overIsColumn) {
    targetStatus = overId as TaskStatus;
    insertIndex = queues[targetStatus].length;
  } else {
    const overTask = rest.find((t) => t.id === overId);
    if (!overTask) return tasks;
    targetStatus = overTask.status;
    insertIndex = queues[targetStatus].findIndex((t) => t.id === overId);
    if (insertIndex < 0) insertIndex = queues[targetStatus].length;
  }

  const moved: Task = { ...active, status: targetStatus };
  queues[targetStatus].splice(insertIndex, 0, moved);

  const result: Task[] = [];
  for (const s of columnIds) {
    queues[s].forEach((t, i) => {
      result.push({ ...t, status: s, order: i });
    });
  }
  return result;
}
