"use client";

import { MahaGovLogo } from "@/components/mahagov-logo";
import { Logo } from "@/components/logo";
import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-border/50">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Logo width={32} height={32} />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            GMS by Better Gondia
          </h1>
          <p className="text-muted-foreground mb-8">
            Loading your dashboard...
          </p>

          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          {/* <p className="text-xs text-slate-500">
            © 2024 Maharashtra Government
          </p> */}
        </div>
      </div>
    </div>
  );
}
