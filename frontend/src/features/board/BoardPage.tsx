import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button, Skeleton } from "antd";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragCancelEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { DroppableColumn } from "../../dnd/DrappableColumn";
import { DraggableCard } from "../../dnd/DraggableCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "../task/TaskCard";
import type { TaskStatus, Task } from "../types/types";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function BoardPageSkeleton() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
    </div>
  );
}

export function BoardPage() {
  const { t } = useTranslation();

  // task status mapping: task id -> column id
  const [taskStatusMap, setTaskStatusMap] = useState<
    Record<string, TaskStatus>
  >({
    "1": "todo",
    "2": "todo",
    "3": "in_progress",
    "4": "done",
  });

  // current task id
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // over id
  const [overId, setOverId] = useState<string | null>(null);

  // tasks data
  const tasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      description: "Description 1",
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Task 2",
      description: "Description 2",
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Task 3",
      description: "Description 3",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      title: "Task 4",
      description: "Description 4",
      status: "done",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => taskStatusMap[task.id] === status);
  };

  const getActiveTask = () => {
    return tasks.find((task) => task.id === activeTaskId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    setActiveTaskId(taskId);
    setOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverId(over.id as string);

      const taskId = activeTaskId;
      if (!taskId) return;

      const overId = over.id as string;

      // check if in column
      const targetColumn = COLUMNS.find((col) => col.id === overId)?.id;

      if (targetColumn) {
        // drag to column
        setTaskStatusMap((prev) => ({
          ...prev,
          [taskId]: targetColumn,
        }));
      } else {
        // drag to another card, update position in column
        const overTaskStatus = taskStatusMap[overId];
        if (overTaskStatus) {
          setTaskStatusMap((prev) => ({
            ...prev,
            [taskId]: overTaskStatus,
          }));
        }
      }
    }
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveTaskId(null);
    setOverId(null);
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveTaskId(null);
    setOverId(null);
  };

  // check if column should be highlighted
  const isColumnHighlighted = (columnId: TaskStatus): boolean => {
    if (!overId) return false;
    // if drag to column itself
    if (overId === columnId) return true;
    // if drag to card in column
    return taskStatusMap[overId] === columnId;
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col px-4 pb-4 pt-2 md:px-6">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          {t("appName")}
        </h1>
        <Button type="primary">{t("addTask")}</Button>
      </div>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            const isHighlighted =
              activeTaskId && isColumnHighlighted(column.id);

            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                isDropTarget={true}
                className={
                  isHighlighted
                    ? "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-900"
                    : ""
                }
              >
                <div
                  className={`flex min-h-0 flex-1 flex-col rounded-md p-3 transition-all duration-200 ${
                    isHighlighted
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "bg-gray-200 dark:bg-gray-800/80"
                  }`}
                >
                  <div className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {column.title} ({columnTasks.length})
                  </div>
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-1 flex-col gap-2">
                      {columnTasks.map((task) => {
                        // 在目标位置前显示占位符
                        const showPlaceholder =
                          activeTaskId &&
                          overId === task.id &&
                          taskStatusMap[activeTaskId] !== column.id;

                        return (
                          <div key={task.id} className="flex flex-col gap-2">
                            {showPlaceholder && (
                              <div className="h-20 rounded-md border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20" />
                            )}
                            <DraggableCard id={task.id}>
                              <TaskCard
                                id={task.id}
                                title={task.title}
                                onEdit={() => {}}
                                onDelete={() => {}}
                              />
                            </DraggableCard>
                          </div>
                        );
                      })}
                      {/* 如果吸附到列但没有具体卡片，在底部显示占位符 */}
                      {activeTaskId &&
                        overId === column.id &&
                        columnTasks.length === 0 && (
                          <div className="h-20 rounded-md border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20" />
                        )}
                    </div>
                  </SortableContext>
                </div>
              </DroppableColumn>
            );
          })}
        </div>

        {/* 拖拽预览覆盖层 */}
        <DragOverlay>
          {activeTaskId ? (
            <div className="pointer-events-none max-w-md cursor-grabbing">
              <TaskCard
                id={activeTaskId}
                title={getActiveTask()?.title}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : // <div className="rotate-3 scale-105 cursor-grabbing opacity-90">
          //   <div className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 shadow-xl ring-2 ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          //     <div className="font-medium">{getActiveTask()?.title}</div>\
          //   </div>
          // </div>
          null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
