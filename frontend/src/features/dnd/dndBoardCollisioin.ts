import { closestCorners, pointerWithin, type CollisionDetection } from '@dnd-kit/core';

const COLUMN_IDS = new Set<string>(['todo', 'in_progress', 'done']);

/** Prefer task under pointer, else column; used after pointerWithin. */
export function pickCollisionFromPointerWithin<T extends { id: string | number }>(
    within: T[],
    columnIds: Set<string> = COLUMN_IDS,
): T | undefined {
    const taskHit = within.find((c) => !columnIds.has(String(c.id)));
    if (taskHit) return taskHit;
    return within.find((c) => columnIds.has(String(c.id)));
}

/** Prefer pointer containment so column rects win in empty/upper areas; closestCorners alone favors neighbor cards. */
export const boardCollisionDetection: CollisionDetection = (args) => {
    const within = pointerWithin(args);
    if (within.length > 0) {
        const picked = pickCollisionFromPointerWithin(within);
        if (picked) {
            return [picked];
        }
    }
    return closestCorners(args);
};
