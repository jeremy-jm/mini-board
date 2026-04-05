import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchInitialData } from "../../store/taskSlice";
import { fetchTaskStatuses } from "../../store/taskStatusSlice";

/** Load columns + tasks (+ members) once for the board. */
export function useBoardInitialLoad() {
  const dispatch = useAppDispatch();
  const { loadState, error: columnError } = useAppSelector((s) => s.taskStatus);
  const { loading, error: tasksError } = useAppSelector((s) => s.tasks);

  useEffect(() => {
    void dispatch(fetchTaskStatuses());
    void dispatch(fetchInitialData());
  }, [dispatch]);

  const bootstrapping =
    loadState === "idle" ||
    loadState === "loading" ||
    loading;

  const bootstrapError =
    loadState === "failed"
      ? columnError
      : tasksError;

  const retry = () => {
    void dispatch(fetchTaskStatuses());
    void dispatch(fetchInitialData());
  };

  return { bootstrapping, bootstrapError, retry };
}
