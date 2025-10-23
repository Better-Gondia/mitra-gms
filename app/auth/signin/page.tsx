"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome } from "lucide-react";

export default function SignIn() {
  const handleGoogleSignIn = () => {
    signIn("google");
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to Better Gondia Mitra
          </CardTitle>
          <CardDescription>
            Sign in with your Google account to access the complaint management
            system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
