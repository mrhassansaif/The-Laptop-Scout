import { cn } from "@/lib/utils";

type SurfaceProps = React.ComponentProps<"div"> & {
  level?: "base" | "raised" | "overlay" | "inset";
};

const levelStyles = {
  base: "surface-base",
  raised: "surface-raised",
  overlay: "surface-overlay",
  inset: "surface-inset",
};

export function Surface({
  level = "base",
  className,
  ...props
}: SurfaceProps) {
  return (
    <div className={cn(levelStyles[level], className)} {...props} />
  );
}
