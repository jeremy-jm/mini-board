import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { PrismaClient } from '@prisma/client';
import { createPrismaTaskService, type TaskService } from './services/task.service.js';
import { registerTaskRoutes } from './routes/tasks.js';

export interface AppDeps {
  service?: TaskService;
}

export async function createApp(deps: AppDeps = {}) {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });
  await app.register(sensible);

  app.get('/api/health', async () => ({ ok: true }));

  const service = deps.service ?? createPrismaTaskService(new PrismaClient());
  await app.register(async (instance) => {
    instance.setErrorHandler((error, _request, reply) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      reply.status(400).send({ message });
    });
    await registerTaskRoutes(instance, service);
  }, { prefix: '/api' });

  return app;
}

