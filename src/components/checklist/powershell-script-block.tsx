"use client";

import { CopyCommandButton } from "@/components/checklist/copy-command-button";
import { WINSAT_POWERSHELL_SCRIPT } from "@/lib/checklist/powershell-script";

export function PowershellScriptBlock() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Script
        </p>
        <CopyCommandButton value={WINSAT_POWERSHELL_SCRIPT} />
      </div>
      <pre className="overflow-x-auto rounded-lg bg-zinc-950 px-3 py-3 text-xs leading-relaxed text-zinc-100">
        <code>{WINSAT_POWERSHELL_SCRIPT.trim()}</code>
      </pre>
    </div>
  );
}
