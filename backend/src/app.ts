import Fastify from 'fastify';
import sensible from '@fastify/sensible';

export async function createApp() {
  const app = Fastify({ logger: true });
  await app.register(sensible);

  app.get('/api/health', async () => ({ ok: true }));

  return app;
}
