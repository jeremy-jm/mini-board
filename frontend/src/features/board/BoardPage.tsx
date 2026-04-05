import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTaskStatuses } from "../../store/taskStatusSlice";
import clsx from "clsx";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragCancelEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { DroppableColumn } from "../dnd/DrappableColumn";
import { DraggableCard } from "../dnd/DraggableCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "../task/TaskCard";
import type { TaskStatus, Task } from "../types/types";

type BoardState = {
  taskStatusMap: Record<string, TaskStatus>;
  taskOrderMap: Record<TaskStatus, string[]>;
};

const initialBoard: BoardState = {
  taskStatusMap: {
    "1": "todo",
    "2": "todo",
    "3": "in_progress",
    "4": "done",
  },
  taskOrderMap: {
    todo: ["1", "2"],
    in_progress: ["3"],
    done: ["4"],
  },
};

function applyDrop(
  activeId: string,
  overId: string,
  board: BoardState,
  columns: { id: TaskStatus; title: string }[],
): BoardState {
  if (activeId === overId) return board;

  const { taskStatusMap: prevMap, taskOrderMap: prevOrder } = board;
  const fromCol = prevMap[activeId];
  if (!fromCol) return board;

  const nextMap = { ...prevMap };
  const nextOrder: Record<TaskStatus, string[]> = {
    todo: [...prevOrder.todo],
    in_progress: [...prevOrder.in_progress],
    done: [...prevOrder.done],
  };

  nextOrder[fromCol] = nextOrder[fromCol].filter((id) => id !== activeId);

  const columnHit = columns.find((c) => c.id === overId);
  let toCol: TaskStatus;
  let insertIndex: number;

  if (columnHit) {
    toCol = columnHit.id;
    insertIndex = nextOrder[toCol].length;
  } else {
    const overCol = prevMap[overId];
    if (!overCol) return board;
    toCol = overCol;
    insertIndex = nextOrder[toCol].indexOf(overId);
    if (insertIndex < 0) insertIndex = nextOrder[toCol].length;
  }

  nextMap[activeId] = toCol;
  nextOrder[toCol].splice(insertIndex, 0, activeId);

  return { taskStatusMap: nextMap, taskOrderMap: nextOrder };
}

function boardEqual(
  a: BoardState,
  b: BoardState,
  columns: { id: TaskStatus; title: string }[],
): boolean {
  if (a.taskStatusMap === b.taskStatusMap && a.taskOrderMap === b.taskOrderMap)
    return true;
  const ids = new Set([
    ...Object.keys(a.taskStatusMap),
    ...Object.keys(b.taskStatusMap),
  ]);
  for (const id of ids) {
    if (a.taskStatusMap[id] !== b.taskStatusMap[id]) return false;
  }
  for (const col of columns) {
    const oa = a.taskOrderMap[col.id];
    const ob = b.taskOrderMap[col.id];
    if (oa.length !== ob.length) return false;
    for (let i = 0; i < oa.length; i++) {
      if (oa[i] !== ob[i]) return false;
    }
  }
  return true;
}

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

  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const boardBeforeDragRef = useRef<BoardState | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const tasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      description: "Description 1",
      status: "todo",
      order: 1,
      priority: "medium",
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assigneeId: null,
      assigneeName: null,
      assigneeAvatar: null,
    },
    {
      id: "2",
      title: "Task 2",
      description: "Description 2",
      status: "todo",
      order: 2,
      priority: "medium",
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assigneeId: null,
      assigneeName: null,
      assigneeAvatar: null,
    },
    {
      id: "3",
      title: "Task 3",
      description: "Description 3",
      status: "in_progress",
      order: 3,
      priority: "medium",
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assigneeId: null,
      assigneeName: null,
      assigneeAvatar: null,
    },
    {
      id: "4",
      title: "Task 4",
      description: "Description 4",
      status: "done",
      order: 4,
      priority: "medium",
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assigneeId: null,
      assigneeName: null,
      assigneeAvatar: null,
    },
  ];

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    const orderIds = board.taskOrderMap[status] ?? [];
    return orderIds
      .map((id) => tasks.find((task) => task.id === id))
      .filter((task): task is Task => task !== undefined);
  };

  const getActiveTask = () => tasks.find((task) => task.id === activeTaskId);

  const commitDrop = (activeId: string, overIdArg: string) => {
    setBoard((prev) => {
      const next = applyDrop(activeId, overIdArg, prev, columns);
      return boardEqual(prev, next, columns) ? prev : next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    boardBeforeDragRef.current = structuredClone(board);
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
    commitDrop(active.id as string, oid);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    const snap = boardBeforeDragRef.current;
    if (snap) setBoard(snap);
    boardBeforeDragRef.current = null;
    setActiveTaskId(null);
    setOverId(null);
    setShake(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      commitDrop(active.id as string, over.id as string);
    }
    boardBeforeDragRef.current = null;
    setActiveTaskId(null);
    setOverId(null);
    setShake(false);
  };

  const isColumnHighlighted = (columnId: TaskStatus): boolean => {
    if (!overId) return false;
    if (overId === columnId) return true;
    return board.taskStatusMap[overId] === columnId;
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
