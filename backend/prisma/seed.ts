import {
  PrismaClient,
  type TaskPriority,
  type TaskStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const members = [
    { name: "Jeremy", avatar: "https://i.pravatar.cc/100?img=1" },
    { name: "Rayman", avatar: "https://i.pravatar.cc/100?img=2" },
    { name: "Ian", avatar: "https://i.pravatar.cc/100?img=3" },
    { name: "Tom", avatar: "https://i.pravatar.cc/100?img=4" },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { name: member.name },
      update: { avatar: member.avatar },
      create: member,
    });
  }

  const memberByName = async (name: string) =>
    prisma.member.findUnique({ where: { name } });

  const tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    order: number;
    priority: TaskPriority;
    assigneeName?: string;
    dueDate?: Date;
  }> = [
    {
      id: "seed-task-1",
      title: "完成 Homework",
      description: "学习一下DND和看一下Redux的更新",
      status: "todo",
      order: 0,
      priority: "high",
      assigneeName: "Jeremy",
    },
    {
      id: "seed-task-2",
      title: "给娃娃测试黄疸",
      description: "黄疸变化太快，需要随时监测",
      status: "todo",
      order: 1,
      priority: "medium",
      assigneeName: "Jeremy",
    },
    {
      id: "seed-task-3",
      title: "编写 Prisma 迁移",
      description: "Member / Task 模型与索引",
      status: "in_progress",
      order: 2,
      priority: "high",
      assigneeName: "Ian",
    },
    {
      id: "seed-task-4",
      title: "健康检查接口",
      description: "GET /api/health",
      status: "done",
      order: 3,
      priority: "low",
      assigneeName: "Tom",
    },
    {
      id: "seed-task-5",
      title: "国际化文案",
      description: "zh-CN / en 任务相关 key",
      status: "in_progress",
      order: 4,
      priority: "medium",
    },
  ];

  for (const task of tasks) {
    const assignee = task.assigneeName
      ? await memberByName(task.assigneeName)
      : null;

    await prisma.task.upsert({
      where: { id: task.id },
      create: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        order: task.order,
        priority: task.priority,
        assigneeId: assignee?.id ?? null,
        dueDate: task.dueDate ?? null,
      },
      update: {
        title: task.title,
        description: task.description,
        status: task.status,
        order: task.order,
        priority: task.priority,
        assigneeId: assignee?.id ?? null,
        dueDate: task.dueDate ?? null,
      },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
