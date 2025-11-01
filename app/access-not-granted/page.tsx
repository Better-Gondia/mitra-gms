"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldX, LogOut, Mail, RefreshCw, Loader2 } from "lucide-react";
import { MahaGovLogo } from "@/components/mahagov-logo";
import type { ExtendedSession } from "@/lib/auth";
import { useState } from "react";

export default function AccessNotGranted() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  // If user has a role other than USER, redirect them to root
  useEffect(() => {
    if (status === "loading") return;
    const userRole = (session as ExtendedSession)?.user?.role;
    if (userRole && userRole !== "USER") {
      router.push("/");
    }
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const handleTryAgain = async () => {
    setIsCheckingRole(true);
    try {
      const response = await fetch("/api/auth/check-role");
      const data = await response.json();

      if (data.role && data.role !== "USER") {
        // Role has been upgraded, sign out and redirect to sign in
        // This will fetch the new role on next sign in
        await signOut({
          callbackUrl: "/auth/signin",
          redirect: true,
        });
      } else {
        // Still USER role, show alert
        alert(
          "Your access is still pending. Please contact the Better Gondia team."
        );
        setIsCheckingRole(false);
      }
    } catch (error) {
      console.error("Error checking role:", error);
      alert("Failed to check your role. Please try again later.");
      setIsCheckingRole(false);
    }
  };

  const userEmail = session?.user?.email || "";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <ShieldX className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h1>
        </div>
      </div>
    );
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

      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Access Not Granted
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                You don&apos;t have access to visit this website. Please contact
                the Better Gondia team to grant access to GMS.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {userEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Your Email
                    </p>
                    <p className="text-sm text-blue-700 mt-1 break-all">
                      {userEmail}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Share this email address with the Better Gondia team for
                      access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleTryAgain}
                disabled={isCheckingRole}
                className="w-full h-12 text-base font-medium"
              >
                {isCheckingRole ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Checking Access...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-3" />
                    Try Again
                  </>
                )}
              </Button>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                If you believe this is an error, please contact support
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* <MahaGovLogo className="h-6 w-6" /> */}
            <span className="text-sm font-medium text-slate-600">
              GMS by Better Gondia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
