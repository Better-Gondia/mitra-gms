"use client";

import { MahaGovLogo } from "@/components/mahagov-logo";
import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MahaGovLogo className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Better Gondia Mitra
          </h1>
          <p className="text-slate-600 mb-8">
            Loading your dashboard...
          </p>
          
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            © 2024 Maharashtra Government
          </p>
        </div>
      </div>
    </div>
  );
}
