import type { FastifyInstance } from "fastify";
import type { MemberService } from "../services/member.service.js";

export async function registerMemberRoutes(
  app: FastifyInstance,
  service: MemberService,
) {
  app.get("/members", async () => ({ data: await service.listMembers() }));
}
