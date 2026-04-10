import { useRef, useEffect } from "react";

export function useStreamController() {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  };

  const create = () => {
    abort(); // отменяем предыдущий
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  };

  useEffect(() => {
    return () => abort();
  }, []);

  return { signal: controllerRef.current?.signal, abort, create };
}