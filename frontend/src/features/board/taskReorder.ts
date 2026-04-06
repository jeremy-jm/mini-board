import { arrayMove } from "@dnd-kit/sortable";
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

  const overIsColumn = columnIds.includes(overId as TaskStatus);

  if (!overIsColumn) {
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return tasks;
    // Same column: insert-at-over-index wrongly keeps [A,B] when dragging A onto B; use arrayMove.
    if (active.status === overTask.status) {
      const colTasks = tasks
        .filter((t) => t.status === active.status)
        .sort((a, b) => a.order - b.order);
      const ids = colTasks.map((t) => t.id);
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0) return tasks;
      if (oldIndex === newIndex) return tasks;
      const newIds = arrayMove(ids, oldIndex, newIndex);
      const byId = new Map(tasks.map((t) => [t.id, t]));
      const reordered = newIds.map((id, order) => {
        const t = byId.get(id)!;
        return { ...t, status: active.status, order };
      });
      const inColumn = new Set(newIds);
      const otherTasks = tasks.filter((t) => !inColumn.has(t.id));
      return [...otherTasks, ...reordered];
    }
  }

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
