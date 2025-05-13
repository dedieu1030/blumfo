
import { useState, useCallback } from "react";

interface ToastState {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
}

// Définir l'interface pour les méthodes d'aide du toast
export interface ToastFunctions {
  (props: Omit<ToastState, "id">): { id: string } & Omit<ToastState, "id">;
  success: (message: string) => { id: string } & Omit<ToastState, "id">;
  error: (message: string) => { id: string } & Omit<ToastState, "id">;
  info: (message: string) => { id: string } & Omit<ToastState, "id">;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = useCallback(
    (props: Omit<ToastState, "id">) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, ...props }]);
      return id;
    },
    [setToasts]
  );

  const dismiss = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [setToasts]
  );

  return {
    toasts,
    toast,
    dismiss,
  };
};

// Créer l'objet toast avec le type correct
const toastFunction = ((props: Omit<ToastState, "id">) => {
  console.log("Toast message:", props.description);
  return {
    id: Math.random().toString(36).slice(2, 9),
    ...props,
  };
}) as ToastFunctions;

// Export toast comme une fonction autonome pour la simplicité
export const toast = toastFunction;

// Les méthodes d'aide (success, error, info) sont définies dans components/ui/use-toast.ts

