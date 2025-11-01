"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { MahaGovLogo } from "@/components/mahagov-logo";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage =
    errorMessages[error || "Default"] || errorMessages.Default;

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
        <Card className="shadow-2xl border bg-card/80 backdrop-blur-sm dark:bg-card/60 dark:border-border/50">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Authentication Error
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {errorMessage}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full h-12 text-base font-medium">
                <Link href="/auth/signin">
                  <RefreshCw className="h-5 w-5 mr-3" />
                  Try Again
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                <Link href="/">
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  Return Home
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If the problem persists, please contact support
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo width={24} height={24} />
            {/* <MahaGovLogo className="h-6 w-6" /> */}
            <span className="text-sm font-medium text-muted-foreground">
              GMS by Better Gondia
            </span>
          </div>
          {/* <p className="text-xs text-slate-500">
            © 2024 Maharashtra Government
          </p> */}
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Logo width={32} height={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Loading...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we load the error page.
            </p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
