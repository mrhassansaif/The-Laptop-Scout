"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  NotebookPen,
  Phone,
  ReceiptText,
  Sparkles,
  Store,
  Tag,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLaptop } from "@/lib/firestore/laptops";
import type { CreateLaptopInput } from "@/lib/types";
import {
  formatPriceInput,
  parsePriceInput,
} from "@/lib/visit-dates";
import { cn } from "@/lib/utils";

const initialForm: CreateLaptopInput = {
  laptopName: "",
  details: "",
  shopNumber: "",
  shopKeeperNumber: "",
  price: "",
};

type FieldErrors = Partial<Record<keyof CreateLaptopInput, string>>;

function FloatingField({
  id,
  label,
  icon,
  required,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {icon}
        {label}
        {required ? <span className="text-brand">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function validateForm(form: CreateLaptopInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.laptopName?.trim()) {
    errors.laptopName = "Laptop name is required.";
  }

  const priceDigits = parsePriceInput(form.price ?? "");
  if (!priceDigits) {
    errors.price = "Price is required.";
  } else if (Number(priceDigits) <= 0) {
    errors.price = "Enter a valid price greater than zero.";
  }

  return errors;
}

export function AddLaptopForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<CreateLaptopInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField(field: keyof CreateLaptopInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSuccess(false);
    setError(null);
  }

  function updatePrice(value: string) {
    updateField("price", formatPriceInput(value));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      setError("You must be signed in to save a laptop.");
      return;
    }

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await createLaptop(
        {
          ...form,
          price: parsePriceInput(form.price ?? ""),
        },
        { userId: user.uid },
      );
      setForm(initialForm);
      setFieldErrors({});
      setSuccess(true);
    } catch {
      setError("Could not save this laptop. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="animate-soft-in space-y-4 pb-[var(--app-mobile-sticky-save-offset)] md:space-y-5 md:pb-0 [&_input]:scroll-mb-[calc(var(--app-mobile-nav-offset)+var(--app-mobile-sticky-save-offset))] [&_textarea]:scroll-mb-[calc(var(--app-mobile-nav-offset)+var(--app-mobile-sticky-save-offset))]"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(event);
      }}
    >
      <section className="surface-card overflow-hidden">
        <div className="border-b border-border/60 p-4 md:p-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--brand)_30%,transparent)] md:size-12">
              <NotebookPen className="size-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-title text-lg md:text-xl">Laptop details</h2>
              <p className="text-subtitle">
                Laptop name and price are required. All other fields are
                optional and the entry lands in today&apos;s visit automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-4 md:space-y-6 md:p-6">
          <FloatingField
            id="laptopName"
            label="Laptop name"
            icon={<NotebookPen className="size-3.5" />}
            required
            error={fieldErrors.laptopName}
          >
            <Input
              id="laptopName"
              placeholder="ThinkPad X1 Carbon Gen 9"
              value={form.laptopName}
              onChange={(event) => updateField("laptopName", event.target.value)}
              className={cn("h-12 text-base", fieldErrors.laptopName && "border-destructive")}
              aria-invalid={Boolean(fieldErrors.laptopName)}
            />
          </FloatingField>

          <FloatingField
            id="price"
            label="Price"
            icon={<Tag className="size-3.5" />}
            required
            error={fieldErrors.price}
          >
            <Input
              id="price"
              inputMode="numeric"
              placeholder="85,000"
              value={form.price}
              onChange={(event) => updatePrice(event.target.value)}
              className={cn("h-12 text-base", fieldErrors.price && "border-destructive")}
              aria-invalid={Boolean(fieldErrors.price)}
            />
          </FloatingField>

          <FloatingField
            id="details"
            label="Details"
            icon={<ReceiptText className="size-3.5" />}
          >
            <Textarea
              id="details"
              placeholder="Specs, condition, warranty, battery health, visible marks..."
              rows={5}
              value={form.details}
              onChange={(event) => updateField("details", event.target.value)}
              className="min-h-28 rounded-xl border-input bg-card text-base shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus-visible:ring-4 focus-visible:ring-ring/15 md:min-h-32"
            />
          </FloatingField>

          <div className="grid gap-5 lg:grid-cols-2">
            <FloatingField
              id="shopNumber"
              label="Shop number"
              icon={<Store className="size-3.5" />}
            >
              <Input
                id="shopNumber"
                placeholder="Shop / stall"
                value={form.shopNumber}
                onChange={(event) =>
                  updateField("shopNumber", event.target.value)
                }
                className="h-12"
              />
            </FloatingField>
            <FloatingField
              id="shopKeeperNumber"
              label="Shop keeper's number"
              icon={<Phone className="size-3.5" />}
            >
              <Input
                id="shopKeeperNumber"
                type="tel"
                inputMode="tel"
                placeholder="Contact number"
                value={form.shopKeeperNumber}
                onChange={(event) =>
                  updateField("shopKeeperNumber", event.target.value)
                }
                className="h-12"
              />
            </FloatingField>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="animate-success-pop flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-4 text-sm text-emerald-800 dark:text-emerald-200">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="font-semibold">Saved to today&apos;s visit.</p>
            <p className="text-emerald-800/75 dark:text-emerald-200/75">
              You can add another laptop or review the visit log.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-background/60"
              onClick={() => router.push("/visits")}
            >
              View visits
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-[var(--app-mobile-nav-offset)] z-30 border-t border-border/70 bg-background/95 px-[max(1rem,env(safe-area-inset-left,0px))] py-3 pr-[max(1rem,env(safe-area-inset-right,0px))] backdrop-blur-xl md:static md:bottom-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full shadow-[0_8px_24px_color-mix(in_oklch,var(--brand)_28%,transparent)] md:w-auto"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Save laptop
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
