import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useState, type PointerEvent, type ReactNode } from "react";

interface Props {
  id: string;
  children: ReactNode;
}

export function DraggableCard({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [balance, setBalance] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // extract onPointerDown from listeners to avoid conflict with custom processor
  const { onPointerDown: listenersPointerDown, ...restListeners } =
    listeners || {};

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setBalance(true);
    listenersPointerDown?.(e);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab touch-none active:cursor-grabbing"
      {...attributes}
      {...restListeners}
      onPointerDown={handlePointerDown}
    >
      <div
        className={clsx(balance && "task-card-balance")}
        onAnimationEnd={() => setBalance(false)}
      >
        {children}
      </div>
    </div>
  );
}
