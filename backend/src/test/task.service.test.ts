import { describe, expect, it, vi } from "vitest";
import { createPrismaTaskService } from "../services/task.service.js";

describe("task service", () => {
  it("reorderTasks updates all task orders in a transaction", async () => {
    const update = vi.fn(({ where, data }) =>
      Promise.resolve({ id: where.id, ...data }),
    );
    const transaction = vi.fn(async (queries: Promise<unknown>[]) => {
      await Promise.all(queries);
    });
    const prisma = {
      task: { update },
      $transaction: transaction,
    } as unknown as Parameters<typeof createPrismaTaskService>[0];

    const service = createPrismaTaskService(prisma);
    await service.reorderTasks([
      { id: "t1", status: "todo", order: 0 },
      { id: "t2", status: "done", order: 1 },
    ]);

    expect(update).toHaveBeenCalledTimes(2);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
