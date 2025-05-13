
import { useState, useCallback } from "react";

interface ToastState {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
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

// Export toast as a standalone function for simplicity
export const toast = (props: Omit<ToastState, "id">) => {
  console.log("Toast message:", props.description);
  return {
    id: Math.random().toString(36).slice(2, 9),
    ...props,
  };
};

// Add helper methods for common toast types
toast.error = (message: string) => {
  console.error(message);
  return toast({ 
    title: "Erreur", 
    description: message,
    variant: "destructive" 
  });
};

toast.success = (message: string) => {
  console.log(message);
  return toast({ 
    title: "Succès", 
    description: message,
    variant: "success" 
  });
};
