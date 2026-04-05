import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { TaskService } from "../services/task.service.js";

const statusSchema = z.enum(["todo", "in_progress", "done"]);
const prioritySchema = z.enum(["low", "medium", "high"]);

export async function registerTaskRoutes(
  app: FastifyInstance,
  service: TaskService,
) {
  app.get("/tasks", async () => ({ data: await service.listTasks() }));

  app.get("/members", async () => ({ data: await service.listMembers() }));

  app.post("/tasks", async (request, reply) => {
    return reply.code(201).send({});
  });

  app.patch("/tasks/:id", async (request) => {
    return { data: {} };
  });

  app.delete("/tasks/:id", async (request, reply) => {
    return reply.code(204).send();
  });

  app.post("/tasks/reorder", async (request, reply) => {
    return reply.code(204).send();
  });
}
