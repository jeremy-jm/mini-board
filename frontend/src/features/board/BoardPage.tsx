import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { Alert, Button, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  optimisticReorder,
  replaceTasks,
  syncOrders,
} from "../../store/taskSlice";
import { selectColumnsSorted } from "../../store/taskStatusSlice";
import clsx from "clsx";
import { TaskCard } from "../task/TaskCard";
import type { TaskStatus, Task } from "../types/types";
import { applyTasksAfterDrop } from "./taskReorder";
import { useBoardInitialLoad } from "./useBoardInitialLoad";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  SortableContext,
  verticalListSortingStrategy,
  DroppableColumn,
  DraggableCard,
  boardCollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DragCancelEvent,
} from "../dnd/dnd";

function tasksUnchanged(before: Task[], after: Task[]): boolean {
  if (before.length !== after.length) return false;
  const nextById = new Map(after.map((t) => [t.id, t]));
  return before.every((t) => {
    const n = nextById.get(t.id);
    return n && n.status === t.status && n.order === t.order;
  });
}

export function BoardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { bootstrapping, bootstrapError, retry } = useBoardInitialLoad();

  const columns = useAppSelector(selectColumnsSorted);
  const { tasks } = useAppSelector((state) => state.tasks);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // clac preview tasks
  const [previewTasks, setPreviewTasks] = useState<Task[] | null>(null);
  const [shake, setShake] = useState(false);
  const boardBeforeDragRef = useRef<Task[] | null>(null);
  const lastNonSelfOverIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    }),
  );

  const columnIds = columns.map((c) => c.id);

  const displayTasks = previewTasks ?? tasks;

  const getTasksByStatus = (status: TaskStatus): Task[] =>
    displayTasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);

  const getActiveTask = () =>
    displayTasks.find((task) => task.id === activeTaskId);

  // ----- DnD Event Handlers Start -----
  const handleDragStart = (event: DragStartEvent) => {
    const snap = structuredClone(tasks);
    boardBeforeDragRef.current = snap;
    setPreviewTasks(snap);
    lastNonSelfOverIdRef.current = null;
    setActiveTaskId(event.active.id as string);
    setOverId(null);
    setShake(true);
  };

  const resolveEffectiveOverId = (
    activeId: string,
    over: DragOverEvent["over"],
  ): string | null => {
    if (!over) return null;
    const oid = over.id as string;
    if (oid !== activeId) return oid;
    return lastNonSelfOverIdRef.current;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    const base = boardBeforeDragRef.current;
    if (!over) {
      setOverId(null);
      if (base) setPreviewTasks(structuredClone(base));
      return;
    }
    const oid = over.id as string;
    setOverId(oid);
    if (oid !== activeId) {
      lastNonSelfOverIdRef.current = oid;
    }
    if (!base) return;
    const effectiveOverId = resolveEffectiveOverId(activeId, over);
    if (!effectiveOverId || effectiveOverId === activeId) {
      setPreviewTasks(structuredClone(base));
      return;
    }
    setPreviewTasks(
      applyTasksAfterDrop(base, activeId, effectiveOverId, columnIds),
    );
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    const snap = boardBeforeDragRef.current;
    if (snap) dispatch(replaceTasks(snap));
    boardBeforeDragRef.current = null;
    setPreviewTasks(null);
    setActiveTaskId(null);
    setOverId(null);
    setShake(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const snapshot = boardBeforeDragRef.current;
    boardBeforeDragRef.current = null;
    setPreviewTasks(null);
    setActiveTaskId(null);
    setOverId(null);
    setShake(false);

    const activeId = active.id as string;
    let dropTargetId = over?.id as string | undefined;
    if (!dropTargetId || dropTargetId === activeId) {
      dropTargetId = lastNonSelfOverIdRef.current ?? undefined;
    }
    lastNonSelfOverIdRef.current = null;

    if (!dropTargetId) {
      if (snapshot) dispatch(replaceTasks(snapshot));
      return;
    }

    const nextTasks = applyTasksAfterDrop(
      tasks,
      activeId,
      dropTargetId,
      columnIds,
    );
    if (tasksUnchanged(tasks, nextTasks)) return;

    dispatch(optimisticReorder({ nextTasks }));
    const items = nextTasks.map((tk) => ({
      id: tk.id,
      status: tk.status,
      order: tk.order,
    }));
    void (async () => {
      try {
        await dispatch(syncOrders(items)).unwrap();
      } catch {
        if (snapshot) dispatch(replaceTasks(snapshot));
      }
    })();
  };
  // ----- DnD Event Handlers End -----

  // Highlight Column Preview
  const isColumnHighlighted = (columnId: TaskStatus): boolean => {
    if (!overId) return false;
    if (overId === columnId) return true;
    return displayTasks.find((task) => task.id === overId)?.status === columnId;
  };

  const placeholderClass =
    "h-20 shrink-0 rounded-md border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20";

  if (bootstrapping) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 pb-4 pt-2 md:px-6">
        <Spin size="large" description={t("boardLoading")} />
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col px-4 pb-4 pt-2 md:px-6">
        <Alert
          type="error"
          showIcon
          message={t("boardLoadError")}
          description={bootstrapError ?? t("unknownError")}
          action={
            <Button size="small" onClick={() => retry()}>
              {t("retry")}
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
        collisionDetection={boardCollisionDetection}
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
                      ? "bg-blue-100 dark:bg-sky-600/50"
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

                      {columnTasks.map((task) => (
                        <div key={task.id} className="flex flex-col gap-2">
                          <DraggableCard id={task.id}>
                            <TaskCard
                              task={task}
                              onEdit={() => {}}
                              onDelete={() => {}}
                            />
                          </DraggableCard>
                        </div>
                      ))}
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
                task={getActiveTask() as Task}
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
