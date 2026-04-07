import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { PrismaClient } from '@prisma/client';
import { ZodError } from 'zod';
import { createPrismaMemberService, type MemberService } from './services/member.service.js';
import { createPrismaTaskService, type TaskService } from './services/task.service.js';
import { registerMemberRoutes } from './routes/members.js';
import { registerTaskRoutes } from './routes/tasks.js';

export interface AppDeps {
  service?: TaskService;
  memberService?: MemberService;
  prisma?: PrismaClient;
}

export async function createApp(deps: AppDeps = {}) {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });
  await app.register(sensible);

  app.get('/api/health', async () => ({ ok: true, date: new Date().toString() }));

  const prisma = deps.prisma ?? new PrismaClient();
  const service = deps.service ?? createPrismaTaskService(prisma);
  const memberService = deps.memberService ?? createPrismaMemberService(prisma);

  await app.register(async (instance) => {
    instance.setErrorHandler((error, _request, reply) => {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.flatten(),
          },
        });
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.status(400).send({
        error: {
          code: 'BAD_REQUEST',
          message,
        },
      });
    });
    await registerTaskRoutes(instance, service);
    await registerMemberRoutes(instance, memberService);
  }, { prefix: '/api' });

  return app;
}

