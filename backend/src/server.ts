import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

const app = await createApp();
await app.listen({ port, host });

const displayHost = host === '0.0.0.0' ? 'localhost' : host;
console.log(`Server listening at http://${displayHost}:${port} (bound to ${host}:${port})`);
