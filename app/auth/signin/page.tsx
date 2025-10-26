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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MahaGovLogo className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h1>
          <p className="text-slate-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Don't render the sign-in form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
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
              <MahaGovLogo className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Better Gondia Mitra
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Grievance Management System
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
                Empowering Citizens,
                <br />
                <span className="text-primary">Transforming Governance</span>
              </h2>

              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                A modern, efficient platform for managing citizen grievances and
                ensuring transparent, accountable governance in Gondia district.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Secure & Reliable
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Real-time Updates
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
                <div className="p-2 rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Multi-role Access
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
                <div className="p-2 rounded-full bg-purple-100">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Easy Communication
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <MahaGovLogo className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-2">
                    Sign in to access your dashboard and manage grievances
                    efficiently
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full h-12 text-base font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                  size="lg"
                >
                  <Chrome className="h-5 w-5 mr-3" />
                  Continue with Google
                </Button>

                <div className="text-center">
                  <p className="text-xs text-slate-500">
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
        <p className="text-xs text-slate-500 text-center">
          © 2024 Better Gondia Mitra. Powered by Maharashtra Government.
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return <SignInContent />;
}
