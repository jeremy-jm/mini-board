import { describe, expect, it } from "vitest";
import { isTaskOverdue } from "../lib/date";
import type { Task } from "../features/types/types";

function createTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    title: "title",
    description: "desc",
    status: "todo",
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assigneeId: null,
    assigneeName: null,
    assigneeAvatar: null,
    priority: "medium",
    dueDate: null,
    ...overrides,
  };
}

describe("isTaskOverdue", () => {
  it("returns true when due date is in the past and task is not done", () => {
    const task = createTask({
      dueDate: new Date(Date.now() - 60_000).toISOString(),
      status: "in_progress",
    });
    expect(isTaskOverdue(task)).toBe(true);
  });

  it("returns false when task is done even if due date is in the past", () => {
    const task = createTask({
      dueDate: new Date(Date.now() - 60_000).toISOString(),
      status: "done",
    });
    expect(isTaskOverdue(task)).toBe(false);
  });
});
