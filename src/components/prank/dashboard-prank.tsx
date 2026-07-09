"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { PrankConfetti } from "@/components/prank/prank-confetti";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import prankImage from "@/components/assets/funnyafrican.jpg";
import { isPrankWhitelistEmail } from "@/lib/prank/config";
import {
  hasPrankPlayedThisLogin,
  markPrankPlayedThisLogin,
} from "@/lib/prank/session";

export function DashboardPrank() {
  const { user, loading } = useAuth();
  const [finished, setFinished] = useState(false);
  const [trapped, setTrapped] = useState(false);
  const [view, setView] = useState<"main" | "complete">("main");

  const email = user?.email;
  const userId = user?.uid;

  const alreadyPlayedThisLogin =
    !userId || hasPrankPlayedThisLogin(userId);

  const shouldRunPrank =
    !loading &&
    isPrankWhitelistEmail(email) &&
    !!userId &&
    !alreadyPlayedThisLogin &&
    !finished;

  function handleAcceptFate() {
    setView("complete");
  }

  function handleMisunderstanding() {
    setTrapped(true);
  }

  function handleCompleteClose() {
    if (userId) {
      markPrankPlayedThisLogin(userId);
    }

    setFinished(true);
  }

  if (!shouldRunPrank) {
    return null;
  }

  return (
    <>
      <PrankConfetti active={view === "main"} />

      <Dialog open={view === "main"} onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-md"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/60">
            <Image
              src={prankImage}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, 28rem"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />
          </div>

          <div className="space-y-4 p-5">
            <DialogHeader className="space-y-2 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-brand/12 text-brand">
                <Sparkles className="size-4" />
              </div>
              <DialogTitle className="text-title text-xl">
                Why are you Gay?
              </DialogTitle>
              <DialogDescription className="text-subtitle text-center">
                {trapped ? (
                  <>
                    Nice try. I know you are gay.
                    <br />
                    App can sense gayness.
                  </>
                ) : (
                  <>
                    You have entered the judgment zone.
                    <br />
                    Is Bilal Gay?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="grid gap-2 border-0 bg-transparent p-0 sm:grid-cols-1">
              <Button type="button" className="h-11 w-full" onClick={handleAcceptFate}>
                Yes, I am gay!
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={handleMisunderstanding}
              >
                No, I am not gay!
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={view === "complete"} onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          className="border-border/70 bg-card sm:max-w-sm"
        >
          <DialogHeader className="text-center">
            <DialogTitle className="text-title text-xl">Hehehe, I knew it.</DialogTitle>
            <DialogDescription className="text-subtitle text-center">
              Bilal the gayest gay person in the world.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent p-0">
            <Button type="button" className="h-11 w-full" onClick={handleCompleteClose}>
              Ja Kela 🍌 Kha...
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
