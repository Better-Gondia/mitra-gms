"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, CheckCircle, ArrowLeft } from "lucide-react";
import { MahaGovLogo } from "@/components/mahagov-logo";
import Link from "next/link";

export default function SignOut() {
  useEffect(() => {
    // Automatically sign out after a brief delay
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/auth/signin" });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

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
            <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <LogOut className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Signing Out
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                You are being signed out of your account. Thank you for using
                GMS by Better Gondia.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSignOut}
                className="w-full h-12 text-base font-medium"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out Now
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                <Link href="/">
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  Cancel & Return
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                You will be redirected to the sign-in page automatically
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
          {/* <p className="text-xs text-slate-500">
            © 2024 Maharashtra Government
          </p> */}
        </div>
      </div>
    </div>
  );
}
