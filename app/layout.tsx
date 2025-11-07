"use client";

import React, { useEffect, useState, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Providers from "@/components/providers";
import toast from "react-hot-toast";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  Settings,
  LogOut,
  Bell,
  Moon,
  Sun,
  Globe,
  Rocket,
  List,
  AreaChart,
  BellRing,
  Check,
  Info,
  View,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  CheckSquare,
  XSquare,
  MessageSquarePlus,
  Star,
  Camera,
  Bug,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme, ThemeProvider } from "@/hooks/use-theme";
import { useLanguage, LanguageProvider } from "@/hooks/use-language";
import { Logo } from "@/components/logo";
import { MahaGovLogo } from "@/components/mahagov-logo";
import { OnboardingProvider, useOnboarding } from "@/hooks/use-onboarding";
import { RoleProvider, useRole } from "@/hooks/use-role";
import {
  AdvancedFeaturesProvider,
  useAdvancedFeatures,
} from "@/hooks/use-advanced-features";
import { useNotifications } from "@/hooks/use-notifications";
import {
  NotificationProvider,
  type AppNotification,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/relative-time";
import { Toaster } from "react-hot-toast";
import { CommandPalette } from "@/components/command-palette";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import "./globals.css";

function NotificationController() {
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    if (!favicon) return;

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const originalFavicon = new window.Image();
    originalFavicon.src = "/favicon.ico";

    originalFavicon.onload = () => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.drawImage(originalFavicon, 0, 0, 32, 32);

      if (unreadCount > 0) {
        // Draw red circle
        ctx.beginPath();
        ctx.arc(22, 10, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();

        // Draw text
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const text = unreadCount > 9 ? "9+" : unreadCount.toString();
        ctx.fillText(text, 22, 11);
      }

      favicon.href = canvas.toDataURL("image/png");
    };

    // Fallback in case image fails to load
    originalFavicon.onerror = () => {
      favicon.href = "/favicon.ico";
    };
  }, [unreadCount]);

  return null;
}

function NotificationMenu() {
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    hasNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const { role, setSelectedComplaintId, setDeepLinkedComplaintId } = useRole();

  const formatNotificationMessage = (n: AppNotification): React.ReactNode => {
    // Extract BG-style ref first, else any number
    const refMatch = n.message?.match(/(BG-\d{6}-\d+)/i);
    const numericMatch = n.message?.match(/\b(\d{1,})\b/);
    const ref = refMatch?.[1] || numericMatch?.[1] || "";

    // For TAG type, extract and highlight the role name
    if ((n as any).type === "TAG") {
      // Extract role from message format: "You were tagged (@District Collector) in a remark..."
      const roleMatch = n.message?.match(/\(@([^)]+)\)/);
      const roleName = roleMatch?.[1] || "";

      // Use the actual message from backend which includes the role
      if (roleName && n.message) {
        // Replace the (@Role) part with highlighted version
        const parts = n.message.split(`(@${roleName})`);
        if (parts.length > 1) {
          return (
            <span>
              {parts[0]}
              <span className="font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                @{roleName}
              </span>
              {parts.slice(1).join(`(@${roleName})`)}
            </span>
          );
        }
      }
      return n.message || t("notif_tagged_message").replace("{{ref}}", ref);
    }

    switch ((n as any).type || "") {
      case "ASSIGNMENT":
        return t("notif_new_complaint_assigned_message").replace(
          "{{ref}}",
          ref
        );
      case "STATUS_CHANGE":
        return t("notif_complaint_needs_details_message").replace(
          "{{ref}}",
          ref
        );
      case "REMARK":
        return t("notif_new_remark_message").replace("{{ref}}", ref);
      default:
        return n.message || "";
    }
  };

  const relevantNotifications = notifications.filter(
    (n) => !n.targetRole || n.targetRole === role
  );
  const relevantUnreadCount = relevantNotifications.filter(
    (n) => !n.read
  ).length;

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.complaintId) {
      setDeepLinkedComplaintId(notification.complaintId);
      setSelectedComplaintId(null); // Close side panel if open
    }
  };

  const handleBellClick = (e: React.MouseEvent) => {
    // Mark all as read when bell is clicked
    void markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          onClick={handleBellClick}
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">{t("notifications")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t("notifications")}</span>
          {relevantUnreadCount > 0 && (
            <span className="text-xs font-normal text-primary">
              {relevantUnreadCount} New
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {relevantNotifications.length === 0 ? (
          <DropdownMenuItem
            disabled
            className="justify-center text-muted-foreground py-4"
          >
            You're all caught up!
          </DropdownMenuItem>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto">
              {relevantNotifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 py-2 px-3 data-[disabled]:opacity-100",
                    !notif.read && "bg-blue-50 dark:bg-blue-900/30",
                    notif.complaintId && "cursor-pointer"
                  )}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {!notif.read ? (
                      <Info className="text-blue-500 size-4" />
                    ) : (
                      <div className="size-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-snug text-wrap">
                      {formatNotificationMessage(notif)}
                    </p>
                    <RelativeTime
                      date={notif.timestamp}
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                </DropdownMenuItem>
              ))}
            </div>

            {relevantUnreadCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={markAllAsRead}
                  className="flex justify-center items-center gap-2 text-sm"
                >
                  <Check className="size-4" /> Mark all as read
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">{t("toggle_theme")}</span>
    </Button>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("change_language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          disabled={language === "en"}
        >
          <span className="mr-2">🇬🇧</span> English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("mr")}
          disabled={language === "mr"}
        >
          <span className="mr-2">🇮🇳</span> मराठी
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("hi")}
          disabled={language === "hi"}
        >
          <span className="mr-2">🇮🇳</span> हिन्दी
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Shared role mapping function
const getRoleDisplayName = (dbRole: string | undefined): string => {
  const dbRoleToUIRole: Record<string, string> = {
    DISTRICT_COLLECTOR: "District Collector",
    COLLECTOR_TEAM: "Collector Team",
    COLLECTOR_TEAM_ADVANCED: "Collector Team Advanced",
    DEPARTMENT_TEAM: "Department Team",
    SUPERINTENDENT_OF_POLICE: "Superintendent of Police",
    MP_RAJYA_SABHA: "MP Rajya Sabha",
    MP_LOK_SABHA: "MP Lok Sabha",
    MLA_GONDIA: "MLA Gondia",
    MLA_TIRORA: "MLA Tirora",
    MLA_ARJUNI_MORGAON: "MLA Sadak Arjuni",
    MLA_AMGAON_DEORI: "MLA Deori",
    MLC: "MLC",
    ZP_CEO: "Zila Parishad",
    USER: "Citizen",
    ADMIN: "Citizen",
    SUPERADMIN: "Citizen",
    IFS: "Citizen",
    // Department roles - display actual department names
    PWD_1: "PWD 1",
    PWD_2: "PWD 2",
    RTO: "RTO",
    ZILLA_PARISHAD: "Zilla Parishad",
    SP_OFFICE_GONDIA: "SP Office Gondia",
    SUPPLY_DEPARTMENT: "Supply Department",
    HEALTH_DEPARTMENT: "Health Department",
    MSEB_GONDIA: "MSEB Gondia",
    TRAFFIC_POLICE: "Traffic Police",
    NAGAR_PARISHAD_TIRORA: "Nagar Parishad Tirora",
    NAGAR_PARISHAD_GONDIA: "Nagar Parishad Gondia",
    NAGAR_PARISHAD_AMGAON: "Nagar Parishad Amgaon",
    NAGAR_PARISHAD_GOREGAON: "Nagar Parishad Goregaon",
    DEAN_MEDICAL_COLLEGE_GONDIA: "Dean Medical College Gondia",
    FOREST_OFFICE_GONDIA: "Forest Office Gondia",
    SAMAJ_KALYAN_OFFICE_GONDIA: "Samaj Kalyan Office Gondia",
    SLR_OFFICE_GONDIA: "SLR Office Gondia",
  };
  return dbRoleToUIRole[dbRole || "USER"] || "Citizen";
};

// function RoleSwitcher() {
//   const { role, setRole, t } = useRole();
//   const { features } = useAdvancedFeatures();

//   if (!features.enableRoleAndAnalyticsViews) {
//     return null;
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" className="h-9">
//           <Users className="mr-2 h-4 w-4" />
//           <span className="hidden sm:inline">{t("current_role")}:</span>
//           <span className="font-semibold ml-1">
//             {t(role.toLowerCase().replace(/ /g, "_"))}
//           </span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-56">
//         <DropdownMenuLabel>{t("select_role")}</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuRadioGroup
//           value={role}
//           onValueChange={(value) => setRole(value as any)}
//         >
//           {userRoles.map((r) => (
//             <DropdownMenuRadioItem key={r} value={r}>
//               {t(r.toLowerCase().replace(/ /g, "_"))}
//             </DropdownMenuRadioItem>
//           ))}
//         </DropdownMenuRadioGroup>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

function UserMenu() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const { startOnboarding } = useOnboarding();
  const {
    features,
    setFeatureEnabled,
    toggleAllFeatures,
    areAllFeaturesEnabled,
  } = useAdvancedFeatures();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const handleFeatureToggle = (
    feature: keyof typeof features,
    checked: boolean
  ) => {
    setFeatureEnabled(feature, checked);
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRoleDisplay = () => {
    const dbRole = (session?.user as any)?.role || "USER";
    // Return the role in camelCase format (e.g., "Collector Team Advanced")
    return getRoleDisplayName(dbRole);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={session?.user?.image || undefined}
              alt={session?.user?.name || "User"}
            />
            <AvatarFallback>
              {getUserInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email || "user@example.com"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Role: {getUserRoleDisplay()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("log_out")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// function ViewSwitcher() {
//   const { role, activeView, setActiveView } = useRole();
//   const { features } = useAdvancedFeatures();

//   if (role !== "District Collector" || !features.enableRoleAndAnalyticsViews) {
//     return null;
//   }

//   return (
//     <ToggleGroup
//       type="single"
//       size="sm"
//       value={activeView}
//       onValueChange={(value) => {
//         if (value) setActiveView(value as any);
//       }}
//       className="border bg-background p-1 rounded-lg"
//     >
//       <ToggleGroupItem
//         value="list"
//         aria-label="Complaints List"
//         className="px-2 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
//       >
//         <List className="h-4 w-4" />
//       </ToggleGroupItem>
//       <ToggleGroupItem
//         value="analytics"
//         aria-label="Analytics Dashboard"
//         className="px-2 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
//       >
//         <AreaChart className="h-4 w-4" />
//       </ToggleGroupItem>
//     </ToggleGroup>
//   );
// }

function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLanguage();

  const [feedbackType, setFeedbackType] = useState("feedback");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const resetState = () => {
    setFeedbackType("feedback");
    setRating(0);
    setFeedbackText("");
    setScreenshot(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const handleAttachScreenshot = async () => {
    onOpenChange(false); // Hide the dialog temporarily
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const videoTrack = stream.getVideoTracks()[0];

      await new Promise((resolve) => setTimeout(resolve, 300));

      const ImageCaptureCtor: any = (window as any).ImageCapture;
      const imageCapture = new ImageCaptureCtor(videoTrack);
      const bitmap = await imageCapture.grabFrame();

      videoTrack.stop();

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      context?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

      const dataUrl = canvas.toDataURL("image/png");
      setScreenshot(dataUrl);
    } catch (error) {
      console.error("Error capturing screen:", error);
      toast.error(
        "Screen Capture Failed: Could not capture screenshot. Please ensure you have granted permission."
      );
    } finally {
      onOpenChange(true); // Show the dialog again
    }
  };

  const handleSubmit = () => {
    console.log("Feedback submitted:", {
      feedbackType,
      rating,
      feedbackText,
      screenshot: !!screenshot,
    });
    toast.success("Feedback Submitted: Thank you for your valuable feedback!");
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Feedback or Report a Bug</DialogTitle>
          <DialogDescription>
            Your insights help us improve the platform for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <RadioGroup
            value={feedbackType}
            onValueChange={setFeedbackType}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="feedback"
                id="feedback"
                className="peer sr-only"
              />
              <Label
                htmlFor="feedback"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <MessageSquare className="mb-3 h-6 w-6" />
                General Feedback
              </Label>
            </div>
            <div>
              <RadioGroupItem value="bug" id="bug" className="peer sr-only" />
              <Label
                htmlFor="bug"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Bug className="mb-3 h-6 w-6" />
                Report a Bug
              </Label>
            </div>
          </RadioGroup>

          {feedbackType === "feedback" && (
            <div className="space-y-2">
              <Label>How would you rate your experience?</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 cursor-pointer transition-colors",
                        (hoverRating || rating) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="feedback-text">
              {feedbackType === "feedback"
                ? "Any specific comments?"
                : "Please describe the bug"}
            </Label>
            <Textarea
              id="feedback-text"
              placeholder={
                feedbackType === "feedback"
                  ? "Tell us what you liked or where we can improve..."
                  : "Describe the issue, what you expected to happen, and steps to reproduce it."
              }
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Attachment</Label>
            {screenshot ? (
              <div className="relative group">
                <Image
                  src={screenshot}
                  alt="Screenshot preview"
                  width={400}
                  height={225}
                  className="rounded-md border object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => setScreenshot(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAttachScreenshot}
              >
                <Camera className="mr-2 h-4 w-4" />
                Attach Screenshot
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!feedbackText}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();
  const [showCmdk, setShowCmdk] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCmdk((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <NotificationController />
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Logo width={32} height={32} />
          {/* <MahaGovLogo /> */}
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              GMS by Better Gondia
            </h1>
            <p className="text-xs text-muted-foreground">
              Grievance Management System
            </p>
          </div>
        </Link>
        <div className="flex-1 flex justify-center items-center gap-4">
          {/* <RoleSwitcher /> */}
          {/* <ViewSwitcher /> */}
          {session && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">
                {getRoleDisplayName((session?.user as any)?.role)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {session && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsFeedbackDialogOpen(true)}
              >
                <MessageSquarePlus className="h-5 w-5" />
                <span className="sr-only">Provide Feedback</span>
              </Button>
              <NotificationMenu />
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          {session && <UserMenu />}
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-8">
        {children}
      </main>
      <CommandPalette open={showCmdk} onOpenChange={setShowCmdk} />
      <FeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>GMS by Better Gondia</title>
        <meta
          name="description"
          content="GMS by Better Gondia - Grievance Management System"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2274A5" />
        <link rel="icon" href="/favicon.ico" id="favicon" sizes="any" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <Providers>
            <ThemeProvider>
              <LanguageProvider>
                <OnboardingProvider>
                  <RoleProvider>
                    <NotificationProvider>
                      <AdvancedFeaturesProvider>
                        <div className="flex min-h-screen w-full flex-col">
                          <AppLayoutContent>{children}</AppLayoutContent>
                        </div>
                      </AdvancedFeaturesProvider>
                    </NotificationProvider>
                  </RoleProvider>
                </OnboardingProvider>
              </LanguageProvider>
            </ThemeProvider>
          </Providers>
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
