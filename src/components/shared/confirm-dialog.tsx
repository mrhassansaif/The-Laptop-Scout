"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  pendingLabel?: string;
  destructive?: boolean;
  alert?: string | null;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  pendingLabel = "Please wait...",
  destructive = false,
  alert = null,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && loading) {
          return;
        }

        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!loading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {alert ? (
          <p
            className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {alert}
          </p>
        ) : null}
        <DialogFooter className="mx-0 mt-1 mb-0 flex-col border-0 bg-transparent p-0 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full sm:w-auto"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            className="h-11 w-full sm:w-auto"
            disabled={loading}
            onClick={() => {
              void onConfirm();
            }}
          >
            {loading ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
