import { create } from "zustand";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  show: (message: string, type?: "success" | "error" | "info", duration?: number) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, type = "success", duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().show(msg, "success"),
  error: (msg: string) => useToastStore.getState().show(msg, "error"),
  info: (msg: string) => useToastStore.getState().show(msg, "info"),
};
