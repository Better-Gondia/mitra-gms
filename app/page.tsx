"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { MOCK_COMPLAINTS } from '@/lib/mock-data';
import type {
  Complaint,
  UserRole,
  ComplaintHistoryEntry,
  Department,
  Priority,
  ComplaintStatus,
  RemarkVisibility,
} from "@/lib/types";
import ComplaintsView from "@/components/complaints-view";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import WelcomeGuide from "@/components/welcome-guide";
import { useRole } from "@/hooks/use-role";
import { useNotifications } from "@/hooks/use-notifications";
// use server API routes to avoid bundling node-only deps client-side
import { differenceInDays, isValid } from "date-fns";
import { apiPatchComplaint } from "@/lib/utils";
import { useComplaints } from "@/hooks/use-complaints";
import { stakeholderRoles, userRoles } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/hooks/use-language";
import AuthWrapper from "@/components/auth-wrapper";

type ComplaintUpdateData = {
  complaint: Complaint;
  newStatus?: ComplaintStatus | "Reopen" | "Assign";
  newTitle?: string;
  remark?: string;
  assignDept?: Department;
  isHighPriority?: boolean;
  eta?: Date;
  attachment?: File;
  isReopening?: boolean;
  newCategory?: string;
  newSubcategory?: string;
  remarkVisibility?: RemarkVisibility;
};

function DashboardContent() {
  const {
    role,
    activeView,
    setSelectedComplaintId,
    deepLinkedComplaintId,
    setDeepLinkedComplaintId,
  } = useRole();
  // const { features } = useAdvancedFeatures();
  // const { addNotification } = useNotifications();
  // const [isFindingStale, setIsFindingStale] = useState(false);
  // const [isCalculatingScores, setIsCalculatingScores] = useState(false);
  const { t } = useLanguage();

  // This state is only used to pass the ID to the view from the URL search param
  // after the initial load. It's separate from the context state.
  const [urlDeepLinkedComplaintId, setUrlDeepLinkedComplaintId] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Handle deep linking from URL on initial load
    const params = new URLSearchParams(window.location.search);
    const complaintIdFromUrl = params.get("complaint_id");
    const searchFromUrl = params.get("search");

    // Extract complaint ID from various formats
    let complaintId = null;
    if (complaintIdFromUrl) {
      complaintId = complaintIdFromUrl;
    } else if (searchFromUrl) {
      // Check if search is a pure number
      if (/^\d+$/.test(searchFromUrl)) {
        complaintId = searchFromUrl;
      } else {
        // Check if search is in new format BG-{id} (e.g., BG-1234)
        const bgIdMatch = searchFromUrl.match(/^BG-(\d+)$/i);
        if (bgIdMatch) {
          complaintId = bgIdMatch[1];
        } else {
          // Check if search is in legacy format BG-XXXXXX-NNNN
          const legacyMatch = searchFromUrl.match(/^BG-\d{6}-(\d+)$/i);
          if (legacyMatch) {
            complaintId = legacyMatch[1];
          } else {
            // Fallback: try to extract numeric part from last segment
            const parts = searchFromUrl.split("-");
            if (parts.length > 1) {
              const lastPart = parts[parts.length - 1];
              if (/^\d+$/.test(lastPart)) {
                complaintId = lastPart;
              }
            }
          }
        }
      }
    }

    if (complaintId) {
      setUrlDeepLinkedComplaintId(complaintId);
      setSelectedComplaintId(null); // Ensure side panel is closed

      // Clean up the URL - remove complaint_id and search
      const nextURL = new URL(window.location.href);
      nextURL.searchParams.delete("complaint_id");
      nextURL.searchParams.delete("search");
      window.history.replaceState(
        {},
        document.title,
        nextURL.pathname + nextURL.search
      );
    }
  }, [setSelectedComplaintId]);

  useEffect(() => {
    // When the context deep link ID changes (from notification click),
    // reset the URL-based one.
    if (deepLinkedComplaintId) {
      setUrlDeepLinkedComplaintId(null);
    }
  }, [deepLinkedComplaintId]);

  // Placeholder functions for ComplaintsView - the actual implementation
  // will be handled by the ComplaintsView component itself
  const handleUpdateComplaint = (updateData: ComplaintUpdateData) => {
    // This will be handled by ComplaintsView's internal state management
    console.log("Update complaint:", updateData);
  };

  const handleUpdateComplaints = (updatedComplaints: Complaint[]) => {
    // This will be handled by ComplaintsView's internal state management
    console.log("Update complaints:", updatedComplaints);
  };

  // const handleFindStaleComplaints = async (): Promise<string[]> => {
  //   // setIsFindingStale(true);
  //   try {
  //     const res = await fetch("/api/ai/find-stale", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ complaints }),
  //     });
  //     if (!res.ok) throw new Error("find-stale failed");
  //     const result: {
  //       staleComplaints: Array<{ id: string; daysSinceLastUpdate: number }>;
  //     } = await res.json();
  //     const staleCount = result.staleComplaints.length;

  //     if (staleCount > 0) {
  //       result.staleComplaints.forEach((stale) => {
  //         // addNotification({
  //         //   message: `Complaint ${stale.id} is stale by ${stale.daysSinceLastUpdate} days and needs attention.`,
  //         //   complaintId: stale.id,
  //         // });
  //       });
  //       toast({
  //         title: `${staleCount} Stale Complaint(s) Found`,
  //         description:
  //           "Notifications have been added and the view is now filtered.",
  //       });
  //       return result.staleComplaints.map((c) => c.id);
  //     } else {
  //       toast({
  //         title: "No Stale Complaints Found",
  //         description:
  //           "All active complaints have been updated recently. Great work!",
  //       });
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error("Error finding stale complaints:", error);
  //     toast({
  //       variant: "destructive",
  //       title: "Failed to Find Stale Complaints",
  //       description: "An error occurred while running the analysis.",
  //     });
  //     return [];
  //   } finally {
  //     // setIsFindingStale(false);
  //   }
  // };

  // const handleCalculateAttentionScores = async () => {
  //   // setIsCalculatingScores(true);
  //   const activeComplaints = complaints.filter(
  //     (c) => !["Resolved", "Invalid"].includes(c.status)
  //   );

  //   toast({
  //     title: "Calculating Attention Scores...",
  //     description: `The AI is analyzing ${activeComplaints.length} active complaints. This may take a moment.`,
  //   });

  //   try {
  //     const scorePromises = activeComplaints.map((c) => {
  //       const hasStakeholderRemark = c.history.some(
  //         (h) =>
  //           h.role === "District Collector" ||
  //           stakeholderRoles.includes(h.role as any)
  //       );

  //       const submittedDate = new Date(c.submittedDate);
  //       const lastUpdatedDate = new Date(c.lastUpdated);
  //       const now = new Date();

  //       const input = {
  //         title: c.title,
  //         description: c.description,
  //         daysSinceSubmission: isValid(submittedDate)
  //           ? differenceInDays(now, submittedDate)
  //           : 0,
  //         daysSinceLastUpdate: isValid(lastUpdatedDate)
  //           ? differenceInDays(now, lastUpdatedDate)
  //           : 0,
  //         hasStakeholderRemark,
  //         linkedComplaintsCount: c.linkedComplaintIds?.length || 0,
  //       };

  //       return fetch("/api/ai/attention-score", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(input),
  //       })
  //         .then(async (r) => {
  //           if (!r.ok) throw new Error("score failed");
  //           const result = await r.json();
  //           return { id: c.id, score: result.score };
  //         })
  //         .catch((e) => {
  //           console.error(`Failed to score complaint ${c.id}:`, e);
  //           return { id: c.id, score: c.attentionScore || undefined }; // Keep old score on failure
  //         });
  //     });

  //     const results = await Promise.all(scorePromises);

  //     const scoresMap = new Map(results.map((r) => [r.id, r.score]));

  //     setComplaints((prevComplaints) =>
  //       prevComplaints.map((c) => {
  //         if (scoresMap.has(c.id)) {
  //           return { ...c, attentionScore: scoresMap.get(c.id) };
  //         }
  //         return c;
  //       })
  //     );

  //     toast({
  //       title: "Attention Scores Calculated",
  //       description: `Successfully updated scores for ${activeComplaints.length} active complaints.`,
  //     });
  //   } catch (error) {
  //     console.error("Error calculating attention scores:", error);
  //     toast({
  //       variant: "destructive",
  //       title: "Failed to Calculate Scores",
  //       description:
  //         "An error occurred during the AI analysis. Please ensure your GEMINI_API_KEY is set correctly.",
  //     });
  //   } finally {
  //     // setIsCalculatingScores(false);
  //   }
  // };

  return (
    <>
      <WelcomeGuide />
      <div className="flex-1 flex flex-col gap-6">
        {activeView === "list" && (
          <ComplaintsView
            complaints={[]} // Empty array - ComplaintsView will fetch its own data
            onUpdateComplaint={handleUpdateComplaint}
            onUpdateComplaints={handleUpdateComplaints}
            onFindStaleComplaints={async () => {
              return [];
            }}
            isFindingStale={false}
            onCalculateAttentionScores={() => {}}
            isCalculatingScores={false}
            deepLinkedComplaintId={
              deepLinkedComplaintId || urlDeepLinkedComplaintId
            }
          />
        )}
        {/* 
        {activeView === "analytics" && (
          // features.enableRoleAndAnalyticsViews &&

          <AnalyticsDashboard complaints={[]} />
        )} */}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </AuthWrapper>
  );
}
