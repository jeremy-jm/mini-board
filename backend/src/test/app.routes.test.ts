import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import type { MemberService } from "../services/member.service.js";
import type { TaskService } from "../services/task.service.js";

const taskService: TaskService = {
  async listTaskStatuses() {
    return [
      { id: "todo", title: "Todo", sortOrder: 0 },
      { id: "in_progress", title: "In Progress", sortOrder: 1 },
      { id: "done", title: "Done", sortOrder: 2 },
    ];
  },
  async listTasks() {
    return [];
  },
  async createTask(input) {
    return {
      id: "task-1",
      title: input.title,
      description: input.description,
      status: input.status,
      order: 0,
      priority: input.priority,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assigneeId: input.assigneeId,
      assigneeName: null,
      assigneeAvatar: null,
    };
  },
  async updateTask() {
    throw new Error("not implemented in test");
  },
  async deleteTask() {
    return;
  },
  async reorderTasks() {
    return;
  },
};

const memberService: MemberService = {
  async listMembers() {
    return [];
  },
};

const app = await createApp({ service: taskService, memberService });

afterAll(async () => {
  await app.close();
});

describe("task routes", () => {
  it("returns structured validation error for invalid create payload", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: {
        title: "a",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Validation failed");
    expect(body.error.details.fieldErrors.title).toBeTruthy();
  });
});
