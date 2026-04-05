import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTaskStatuses } from "../../store/taskStatusSlice";
import clsx from "clsx";
import { TaskCard } from "../task/TaskCard";
import type { TaskStatus, Task } from "../types/types";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  SortableContext,
  verticalListSortingStrategy,
  DroppableColumn,
  DraggableCard,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DragCancelEvent,
} from "../dnd/dnd";

export function BoardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) =>
    [...s.taskStatus.items].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const loadState = useAppSelector((s) => s.taskStatus.loadState);
  const loadError = useAppSelector((s) => s.taskStatus.error);

  useEffect(() => {
    void dispatch(fetchTaskStatuses());
  }, [dispatch]);

  const { tasks, members, loading, submitting, error } = useAppSelector(
    (state) => state.tasks,
  );

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const boardBeforeDragRef = useRef<Task[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    const orderIds = tasks
      .filter((task) => task.status === status)
      .map((task) => task.id);
    return orderIds
      .map((id) => tasks.find((task) => task.id === id))
      .filter((task): task is Task => task !== undefined);
  };

  const getActiveTask = () => tasks.find((task) => task.id === activeTaskId);

  const handleDragStart = (event: DragStartEvent) => {
    boardBeforeDragRef.current = structuredClone(tasks);
    const taskId = event.active.id as string;
    setActiveTaskId(taskId);
    setOverId(null);
    setShake(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverId(null);
      return;
    }
    const oid = over.id as string;
    setOverId(oid);
    void dispatch(
      syncReorderTasks([
        {
          id: active.id as string,
          status: oid,
          order: tasks.find((task) => task.id === active.id)?.order ?? 0,
        },
      ]),
    );
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    const snap = boardBeforeDragRef.current;
    if (snap) void dispatch(syncReorderTasks(snap));
    boardBeforeDragRef.current = null;
    setActiveTaskId(null);
    setOverId(null);
    setShake(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      void dispatch(
        syncReorderTasks([
          {
            id: active.id as string,
            status: over.id as string,
            order: tasks.find((task) => task.id === active.id)?.order ?? 0,
          },
        ]),
      );
    }
    boardBeforeDragRef.current = null;
    setActiveTaskId(null);
    setOverId(null);
    setShake(false);
  };

  const isColumnHighlighted = (columnId: TaskStatus): boolean => {
    if (!overId) return false;
    if (overId === columnId) return true;
    return tasks.find((task) => task.id === overId)?.status === columnId;
  };

  const placeholderClass =
    "h-20 shrink-0 rounded-md border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20";

  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 pb-4 pt-2 md:px-6">
        <Spin size="large" tip="Loading columns…" />
      </div>
    );
  }

  if (loadState === "failed") {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col px-4 pb-4 pt-2 md:px-6">
        <Alert
          type="error"
          showIcon
          message="Failed to load board columns"
          description={loadError ?? "Unknown error"}
          action={
            <Button
              size="small"
              onClick={() => void dispatch(fetchTaskStatuses())}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col px-4 pb-4 pt-2 md:px-6">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          {t("appName")}
        </h1>
        <Button type="primary">{t("addTask")}</Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            const isHighlighted =
              Boolean(activeTaskId) && isColumnHighlighted(column.id);

            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                isDropTarget={true}
                className={
                  isHighlighted
                    ? "ring-2 ring-blue-50 ring-offset-2 dark:ring-offset-gray-900"
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
                    items={columnTasks.map((tk) => tk.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex min-h-[4.5rem] flex-1 flex-col gap-2">
                      {columnTasks.length === 0 &&
                        activeTaskId &&
                        overId === column.id && (
                          <div className={placeholderClass} />
                        )}

                      {columnTasks.map((task) => {
                        const showPlaceholder =
                          Boolean(activeTaskId) &&
                          overId === task.id &&
                          activeTaskId !== task.id;

                        return (
                          <div key={task.id} className="flex flex-col gap-2">
                            {showPlaceholder && (
                              <div className={placeholderClass} />
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

                      {Boolean(activeTaskId) &&
                        overId === column.id &&
                        columnTasks.length > 0 && (
                          <div className={placeholderClass} />
                        )}
                    </div>
                  </SortableContext>
                </div>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 220,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: { opacity: "0.35" },
              },
            }),
          }}
        >
          {activeTaskId ? (
            <div
              className={clsx(
                "pointer-events-none w-full max-w-full cursor-grabbing",
                shake && "task-card-balance",
              )}
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
