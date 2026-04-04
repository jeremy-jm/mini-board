import { Button } from "antd";
import clsx from "clsx";
import { memo, useState } from "react";

interface Props {
  id: string;
  title?: string;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskCardComponent({ id, title, onEdit, onDelete }: Props) {
  const [balance, setBalance] = useState(false);

  return (
    <div className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 shadow-sm transition-shadow hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
      <div
        className={clsx(balance && "task-card-balance")}
        onAnimationEnd={() => setBalance(false)}
      >
        <div className="font-medium">{title}</div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button type="primary" onClick={onEdit}>
          Edit
        </Button>
        <Button type="primary" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export const TaskCard = memo(TaskCardComponent);
