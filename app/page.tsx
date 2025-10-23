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
  const [complaints, setComplaints] = useState<Complaint[]>([]);
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

  const queryClient = useQueryClient();

  useEffect(() => {
    // Initial welcome notification
    // addNotification({
    //   message:
    //     "Welcome to Better Gondia Mitra! You can start by reviewing open complaints.",
    // });

    // Handle deep linking from URL on initial load
    const params = new URLSearchParams(window.location.search);
    const complaintIdFromUrl = params.get("complaint_id");
    if (complaintIdFromUrl) {
      setUrlDeepLinkedComplaintId(complaintIdFromUrl);
      setSelectedComplaintId(null); // Ensure side panel is closed

      // Clean up the URL
      const nextURL = new URL(window.location.href);
      nextURL.searchParams.delete("complaint_id");
      window.history.replaceState(
        {},
        document.title,
        nextURL.pathname + nextURL.search
      );
    }
  }, [
    // addNotification,
    setSelectedComplaintId,
  ]);

  useEffect(() => {
    // When the context deep link ID changes (from notification click),
    // reset the URL-based one.
    if (deepLinkedComplaintId) {
      setUrlDeepLinkedComplaintId(null);
    }
  }, [deepLinkedComplaintId]);

  // const createHistoryEntry = (
  //   complaint: Complaint,
  //   action: string,
  //   role: UserRole,
  //   details: Partial<ComplaintUpdateData>
  // ): ComplaintHistoryEntry => {
  //   const now = new Date();

  //   let departmentForHistory: Department | undefined = undefined;
  //   // If assigning, the new department is the one for the history record.
  //   if (details.newStatus === "Assign" && details.assignDept) {
  //     departmentForHistory = details.assignDept;
  //   }
  //   // If a department team member acts, it's their department.
  //   else if (role === "Department Team") {
  //     // Use the complaint's current department since it's their action
  //     departmentForHistory = complaint.department;
  //   }

  //   let attachmentUrl: string | undefined = undefined;
  //   if (details.attachment) {
  //     attachmentUrl = URL.createObjectURL(details.attachment);
  //   }

  //   // Extract @-tags from the remark
  //   const taggedUsers: UserRole[] = [];
  //   if (details.remark) {
  //     const matches = details.remark.match(/@([\w\s-]+)/g) || [];
  //     matches.forEach((match) => {
  //       const tagName = match.substring(1);
  //       const taggedRole = userRoles.find(
  //         (r) => r.toLowerCase() === tagName.toLowerCase()
  //       );
  //       if (taggedRole) {
  //         taggedUsers.push(taggedRole);
  //       }
  //     });
  //   }

  //   return {
  //     id: `hist-${now.getTime()}`,
  //     timestamp: now,
  //     user: role,
  //     role: role,
  //     action: action,
  //     notes: details.remark || undefined,
  //     department: departmentForHistory,
  //     // Only record priority in history if it's being set during an assignment
  //     priority:
  //       details.newStatus === "Assign" && details.isHighPriority
  //         ? "High"
  //         : undefined,
  //     eta: details.eta,
  //     attachment: attachmentUrl,
  //     visibility: details.remarkVisibility || "public",
  //     taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
  //   };
  // };

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiPatchComplaint(id, payload),
    onError: () => {
      toast.error("Failed to save update. Reverting changes.");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });

  const handleUpdateComplaint = (updateData: ComplaintUpdateData) => {
    const {
      complaint,
      newStatus,
      newTitle,
      isReopening,
      assignDept,
      isHighPriority,
      newCategory,
      newSubcategory,
      remark,
      remarkVisibility,
    } = updateData;

    let updatedStatus: ComplaintStatus = complaint.status;
    let action: string = "Remark added";

    if (newTitle && newTitle !== complaint.title) {
      action = "Title updated";
    } else if (newCategory || newSubcategory) {
      action = "Complaint details updated";
    } else if (isReopening) {
      action = "Complaint Reopened";
      updatedStatus = complaint.status === "Invalid" ? "Open" : "Assigned";
      // addNotification({
      //   message: `Complaint ${complaint.id} ("${complaint.title}") has been reopened.`,
      //   complaintId: complaint.id,
      // });
    } else if (newStatus) {
      if (newStatus === "Assign" && assignDept) {
        updatedStatus = "Assigned";
        action = "Complaint Assigned";
        // addNotification({
        //   message: `Complaint ${complaint.id} has been assigned to the ${assignDept} department.`,
        //   complaintId: complaint.id,
        // });
      } else {
        updatedStatus = newStatus as ComplaintStatus;
        action = `Status changed to ${newStatus}`;
        // addNotification({
        //   message: `Status of complaint ${complaint.id} changed to "${newStatus}".`,
        //   complaintId: complaint.id,
        // });
      }
    } else if (remark) {
      // addNotification({
      //   message: `A new remark was added to complaint ${complaint.id}.`,
      //   complaintId: complaint.id,
      // });
    }

    // const historyEntry = createHistoryEntry(
    //   complaint,
    //   action,
    //   role,
    //   updateData
    // );

    // Send notifications for tagged users
    // if (historyEntry.taggedUsers && historyEntry.taggedUsers.length > 0) {
    //   historyEntry.taggedUsers.forEach((taggedRole) => {
    //     if (taggedRole !== role) {
    //       // Don't notify yourself
    //       const notificationMessage = `${t(
    //         role.toLowerCase().replace(/ /g, "_")
    //       )} mentioned you in complaint ${complaint.id}: "${
    //         historyEntry.notes
    //       }"`;
    //       // addNotification({
    //       //   message: notificationMessage,
    //       //   targetRole: taggedRole,
    //       //   complaintId: complaint.id,
    //       // });
    //     }
    //   });
    //   toast({
    //     title: "Users Notified",
    //     description: `Notified ${historyEntry.taggedUsers.join(
    //       ", "
    //     )} about your remark.`,
    //   });
    // }

    const updatedComplaint: Complaint = {
      ...complaint,
      status: updatedStatus,
      title: newTitle || complaint.title,
      category: newCategory || complaint.category,
      subcategory: newSubcategory || complaint.subcategory,
      department:
        newStatus === "Assign" && assignDept
          ? assignDept
          : complaint.department,
      priority:
        newStatus === "Assign" && isHighPriority ? "High" : complaint.priority,
      // history: [historyEntry, ...complaint.history],
      // lastUpdated: historyEntry.timestamp,
    };

    // Optimistic update
    setComplaints((prev) =>
      prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
    // Persist to backend (fire-and-forget)
    const payload: any = {
      status: updatedComplaint.status,
      department: updatedComplaint.department,
      priority: updatedComplaint.priority,
      title: updatedComplaint.title,
      category: updatedComplaint.category,
      subcategory: updatedComplaint.subcategory,
      location: updatedComplaint.location,
      linkedComplaintIds: updatedComplaint.linkedComplaintIds,
    };
    updateMutation.mutate({ id: updatedComplaint.id, payload });
  };

  const handleUpdateComplaints = (updatedComplaints: Complaint[]) => {
    setComplaints((prevComplaints) => {
      const updatedComplaintMap = new Map(
        updatedComplaints.map((c) => [c.id, c])
      );
      return prevComplaints.map((c) => updatedComplaintMap.get(c.id) || c);
    });
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
            complaints={complaints}
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

        {activeView === "analytics" && (
          // features.enableRoleAndAnalyticsViews &&

          <AnalyticsDashboard complaints={complaints} />
        )}
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
