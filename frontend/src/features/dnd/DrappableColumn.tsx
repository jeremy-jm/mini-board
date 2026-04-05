import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  id: string;
  children: ReactNode;
  /** Highlight when pointer logic targets this column (not useDroppable.isOver — closestCorners can pick neighbor cards). */
  isDropTarget?: boolean;
  className?: string;
}

export function DroppableColumn({
  id,
  children,
  isDropTarget,
  className,
}: Props) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex h-full min-h-0 flex-col",
        isDropTarget && "rounded-md ring-2 ring-blue-400",
        className,
      )}
    >
      {children}
    </div>
  );
}
