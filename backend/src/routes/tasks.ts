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
    const body = z.object({
      title: z.string().min(2),
      description: z.string().default(''),
      status: statusSchema.default('todo'),
      assigneeId: z.string().nullable().default(null),
      priority: prioritySchema.default('medium'),
      dueDate: z.string().nullable().default(null),
    }).parse(request.body);

    const task = await service.createTask(body);
    return reply.code(201).send({ data: task });
  });

  app.patch("/tasks/:id", async (request) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);

    const body = z.object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      status: statusSchema.optional(),
      assigneeId: z.string().nullable().optional(),
      priority: prioritySchema.optional(),
      dueDate: z.string().nullable().optional(),
    }).parse(request.body);
    
    const task = await service.updateTask(params.id, body);

    return { data: task };
  });

  app.delete("/tasks/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    await service.deleteTask(params.id);

    return reply.code(204).send();
  });

  app.post("/tasks/reorder", async (request, reply) => {
    const body = z.object({
      items: z.array(z.object({
        id: z.string().min(1),
        status: statusSchema,
        order: z.number().int().min(0),
      })),
    }).parse(request.body);

    await service.reorderTasks(body.items);

    return reply.code(204).send({ data: { success: true } });
  });
}
