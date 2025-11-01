"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Chrome,
  Shield,
  Users,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { MahaGovLogo } from "@/components/mahagov-logo";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

function SignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if already authenticated
    if (status === "authenticated" && session) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleGoogleSignIn = () => {
    signIn("google");
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Logo width={32} height={32} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Loading...
          </h1>
          <p className="text-muted-foreground">
            Checking authentication status...
          </p>
        </div>
      </div>
    );
  }

  // Don't render the sign-in form if already authenticated
  if (status === "authenticated") {
    return null;
  }

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

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Features */}
          <div className="text-center lg:text-left space-y-8">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <Logo width={48} height={48} />
              {/* <MahaGovLogo className="h-12 w-12" /> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  GMS by Better Gondia
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Grievance Management System
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Empowering Citizens,
                <br />
                <span className="text-primary">Transforming Governance</span>
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                A modern, efficient platform for managing citizen grievances and
                ensuring transparent, accountable governance in Gondia district.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50 dark:bg-card/40 dark:border-border/30">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Secure & Reliable
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50 dark:bg-card/40 dark:border-border/30">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Real-time Updates
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50 dark:bg-card/40 dark:border-border/30">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Multi-role Access
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50 dark:bg-card/40 dark:border-border/30">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Easy Communication
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-2xl border bg-card/80 backdrop-blur-sm dark:bg-card/60 dark:border-border/50">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Logo
                    width={32}
                    height={32}
                    className="brightness-0 invert"
                  />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    Sign in to access your dashboard and manage grievances
                    efficiently
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full h-12 text-base font-medium bg-background hover:bg-accent text-foreground border border-border hover:border-border/80 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-card dark:hover:bg-accent/50"
                  size="lg"
                >
                  <Chrome className="h-5 w-5 mr-3" />
                  Continue with Google
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    By signing in, you agree to our terms of service and privacy
                    policy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 GMS by Better Gondia
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return <SignInContent />;
}
