// components/ActionModal.tsx
import { X } from "lucide-react";

type ActionModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  body: string;
  errorMessage?: string;
};

export default function ActionModal({ open, onClose, onConfirm, title, body, errorMessage }: ActionModalProps) {
  if (!open) return null;

  const isError = !!errorMessage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-neutral-900 rounded-md p-6 w-full max-w-md z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-gray-300">{errorMessage || body}</div>
        <div className="mt-6 text-right">
          {isError ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition"
            >
              Close
            </button>
          ) : (
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
