import { PrismaClient } from "@prisma/client";
import type { MemberDto } from "../types/types.js";

export interface MemberService {
  listMembers(): Promise<MemberDto[]>;
}

export function createPrismaMemberService(prisma: PrismaClient): MemberService {
  return {
    async listMembers() {
      const members = await prisma.member.findMany({
        orderBy: { createdAt: "asc" },
      });
      return members.map((member) => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
      }));
    },
  };
}
