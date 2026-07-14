import { useEffect } from "react";

// Adds Escape-to-close and backdrop-click-to-close for modals.
// Returns a ref-like handler to attach to the .modal-backdrop element.
export function useModalDismiss(onClose) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return {
    onClick: (e) => {
      if (e.target === e.currentTarget) onClose();
    },
  };
}
