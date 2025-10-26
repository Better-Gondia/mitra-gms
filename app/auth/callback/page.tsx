"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { MahaGovLogo } from "@/components/mahagov-logo";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "authenticated") {
        setLoading(false);
        // Redirect to dashboard after a brief success display
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else if (status === "unauthenticated") {
        setError("Authentication failed. Please try again.");
        setLoading(false);
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Authenticating...
                </CardTitle>
                <CardDescription className="text-slate-600 mt-2">
                  Please wait while we verify your credentials
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MahaGovLogo className="h-6 w-6" />
              <span className="text-sm font-medium text-slate-600">
                Better Gondia Mitra
              </span>
            </div>
            <p className="text-xs text-slate-500">
              © 2024 Maharashtra Government
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Authentication Failed
                </CardTitle>
                <CardDescription className="text-slate-600 mt-2">
                  {error}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Button 
                onClick={() => router.push("/auth/signin")}
                className="w-full h-12 text-base font-medium"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MahaGovLogo className="h-6 w-6" />
              <span className="text-sm font-medium text-slate-600">
                Better Gondia Mitra
              </span>
            </div>
            <p className="text-xs text-slate-500">
              © 2024 Maharashtra Government
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Welcome!
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Authentication successful. Redirecting to dashboard...
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MahaGovLogo className="h-6 w-6" />
            <span className="text-sm font-medium text-slate-600">
              Better Gondia Mitra
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © 2024 Maharashtra Government
          </p>
        </div>
      </div>
    </div>
  );
}
