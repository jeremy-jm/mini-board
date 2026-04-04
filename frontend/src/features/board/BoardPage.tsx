import { useTranslation } from "react-i18next";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Button, ConfigProvider, Skeleton, Spin, theme } from "antd";
import {
  DndContext,
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

  const handleDragStart = (event: DragStartEvent) => {
    console.log("drag start", event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    console.log("drag over", event);
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    console.log("drag cancel", event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("drag end", event);
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
          <DroppableColumn id="todo" isDropTarget={true}>
            <div className="flex min-h-0 flex-1 flex-col rounded-md bg-gray-200 p-3 dark:bg-gray-800/80">
              <div>Todo</div>
              <SortableContext
                items={["1"]}
                strategy={verticalListSortingStrategy}
              >
                <DraggableCard id="1">
                  <TaskCard id="1" onEdit={() => {}} onDelete={() => {}}>
                    <div>Task 1</div>
                  </TaskCard>
                </DraggableCard>
              </SortableContext>
            </div>
          </DroppableColumn>
          <DroppableColumn id="in-progress" isDropTarget={true}>
            <div className="flex min-h-0 flex-1 flex-col rounded-md bg-gray-200 p-3 dark:bg-gray-800/80">
              <div>In Progress</div>
              <SortableContext
                items={["2"]}
                strategy={verticalListSortingStrategy}
              >
                <DraggableCard id="2">
                  <TaskCard id="2" onEdit={() => {}} onDelete={() => {}}>
                    <div>Task 2</div>
                  </TaskCard>
                </DraggableCard>
              </SortableContext>
            </div>
          </DroppableColumn>
          <DroppableColumn id="done" isDropTarget={true}>
            <div className="flex min-h-0 flex-1 flex-col rounded-md bg-gray-200 p-3 dark:bg-gray-800/80">
              <div>Done</div>
              <SortableContext
                items={["3"]}
                strategy={verticalListSortingStrategy}
              >
                <DraggableCard id="3">
                  <TaskCard id="3" onEdit={() => {}} onDelete={() => {}}>
                    <div>Task 3</div>
                  </TaskCard>
                </DraggableCard>
              </SortableContext>
            </div>
          </DroppableColumn>
        </div>
      </DndContext>
    </div>
  );
}
