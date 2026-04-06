import { DeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Popconfirm, Tag } from "antd";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { formatDateTime, isTaskOverdue } from "../../lib/date";
import type { Task } from "../types/types";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function TaskCardComponent({ task, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const overdue = isTaskOverdue(task);
  return (
    <div className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 shadow-sm transition-shadow hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
      <div className="mb-2 flex items-center justify-between gap-2">
        <strong className="text-gray-900 dark:text-gray-50">
          {task.title}
        </strong>
        <Tag
          color={
            task.priority === "high"
              ? "red"
              : task.priority === "medium"
                ? "gold"
                : "green"
          }
          className="m-0 shrink-0"
        >
          {t(task.priority)}
        </Tag>
      </div>
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
        {task.description}
      </p>
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
        {task.assigneeAvatar ? (
          <Avatar size={20} src={task.assigneeAvatar} />
        ) : null}
        <span>{task.assigneeName ?? "-"}</span>
      </div>
      <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {formatDateTime(task.createdAt)}
      </div>
      {task.dueDate ? (
        <div
          className={`mb-3 text-xs ${overdue ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}
        >
          {t("dueDate")}: {formatDateTime(task.dueDate)}{" "}
          {overdue ? `(${t("overdue")})` : ""}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button size="small" onClick={() => onEdit(task)}>
          {t("edit")}
        </Button>
        <Popconfirm
          title={t("deleteConfirm")}
          placement="top"
          okText={t("confirmOk")}
          cancelText={t("cancel")}
          onConfirm={() => onDelete(task.id)}
        >
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            aria-label={t("delete")}
            title={t("delete")}
          />
        </Popconfirm>
      </div>
    </div>
  );
}

export const TaskCard = memo(TaskCardComponent);
