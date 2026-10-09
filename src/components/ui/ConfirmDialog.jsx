// src/components/ui/ConfirmDialog.jsx
"use client";

import Modal from "./Modal";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95 hover:shadow-lg ${
            danger
              ? "bg-rose-500 hover:bg-rose-600 hover:shadow-rose-500/25"
              : "bg-teal-600 hover:bg-teal-700 hover:shadow-teal-500/25"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}