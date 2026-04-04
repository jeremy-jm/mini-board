import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button, Skeleton } from "antd";
import clsx from "clsx";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { TaskCard } from "../task/TaskCard";
import type { TaskStatus, Task } from "../types/types";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

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

  const [taskOrderMap, setTaskOrderMap] = useState<
    Record<TaskStatus, string[]>
  >({
    todo: ["1", "2"],
    in_progress: ["3"],
    done: ["4"],
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
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Task 2",
      description: "Description 2",
      status: "todo",
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Task 3",
      description: "Description 3",
      status: "in_progress",
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      title: "Task 4",
      description: "Description 4",
      status: "done",
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    const orderIds = taskOrderMap[status] || [];
    return orderIds
      .map((id) => tasks.find((task) => task.id === id))
      .filter((task): task is Task => task !== undefined);
  };

  const getActiveTask = () => {
    return tasks.find((task) => task.id === activeTaskId);
  };

  // shake animation for DragOverlay card
  const [shake, setShake] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    setActiveTaskId(taskId);
    setOverId(null);
    // trigger shake animation when drag starts
    setShake(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverId(over.id as string);

      const taskId = activeTaskId;
      if (!taskId) return;

      const overId = over.id as string;
      const currentColumn = taskStatusMap[taskId];

      // check if drag to column
      const targetColumn = COLUMNS.find((col) => col.id === overId)?.id;

      if (targetColumn) {
        // drag to column
        if (currentColumn !== targetColumn) {
          // drag to another column
          setTaskStatusMap((prev) => ({
            ...prev,
            [taskId]: targetColumn,
          }));
          // remove from original column, add to target column
          setTaskOrderMap((prev) => {
            const sourceOrder = prev[currentColumn].filter(
              (id) => id !== taskId,
            );
            return {
              ...prev,
              [currentColumn]: sourceOrder,
              [targetColumn]: [...prev[targetColumn], taskId],
            };
          });
        }
      } else {
        // drag to another card
        const overTaskStatus = taskStatusMap[overId];
        if (overTaskStatus) {
          // drag to same column
          if (currentColumn === overTaskStatus) {
            const columnOrder = taskOrderMap[currentColumn];
            const oldIndex = columnOrder.indexOf(taskId);
            const newIndex = columnOrder.indexOf(overId);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
              setTaskOrderMap((prev) => ({
                ...prev,
                [currentColumn]: arrayMove(
                  prev[currentColumn],
                  oldIndex,
                  newIndex,
                ),
              }));
            }
          } else {
            // drag to another column
            setTaskStatusMap((prev) => ({
              ...prev,
              [taskId]: overTaskStatus,
            }));
            // remove from original column, insert to target position
            setTaskOrderMap((prev) => {
              const sourceOrder = prev[currentColumn].filter(
                (id) => id !== taskId,
              );
              const targetOrder = [...prev[overTaskStatus]];
              const overIndex = targetOrder.indexOf(overId);
              targetOrder.splice(overIndex, 0, taskId);
              return {
                ...prev,
                [currentColumn]: sourceOrder,
                [overTaskStatus]: targetOrder,
              };
            });
          }
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
                        // show placeholder when drag to same column
                        const showPlaceholder =
                          activeTaskId &&
                          overId === task.id &&
                          activeTaskId !== task.id;

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
                      {/* show placeholder when drag to column but no card */}
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

        <DragOverlay dropAnimation={null}>
          {activeTaskId ? (
            <div
              className={clsx("pointer-events-none max-w-md cursor-grabbing", shake && "task-card-balance")}
              onAnimationEnd={() => setShake(false)}
            >
              <TaskCard
                id={activeTaskId}
                title={getActiveTask()?.title}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
