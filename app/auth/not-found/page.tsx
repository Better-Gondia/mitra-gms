"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { MahaGovLogo } from "@/components/mahagov-logo";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthNotFound() {
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
            <div className="mx-auto w-16 h-16 rounded-full bg-muted dark:bg-muted/50 flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                404
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Page Not Found
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                The authentication page you're looking for doesn't exist.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full h-12 text-base font-medium">
                <Link href="/auth/signin">
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  Go to Sign In
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                <Link href="/">
                  <Home className="h-5 w-5 mr-3" />
                  Return Home
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If you believe this is an error, please contact support
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
          <p className="text-xs text-muted-foreground">
            © 2024 Maharashtra Government
          </p>
        </div>
      </div>
    </div>
  );
}
