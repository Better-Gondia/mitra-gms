"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Sun, Moon, List, AreaChart, HelpCircle, FileText } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { useRole } from "@/hooks/use-role";
import { MOCK_COMPLAINTS } from "@/lib/mock-data";
import { FaqDialog } from "@/components/faq-dialog";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleFaqs: Record<string, string[]> = {
  "District Collector": [
    "faq_q_get_overview",
    "faq_q_flag_urgent",
    "faq_q_what_is_attention_score",
  ],
  "Collector Team": [
    "faq_q_process_new",
    "faq_q_invalid_vs_details",
    "faq_q_find_old",
  ],
  "Department Team": [
    "faq_q_see_dept_complaints",
    "faq_q_resolve_complaint",
    "faq_q_what_is_backlog",
  ],
  "Superintendent of Police": ["faq_q_what_can_stakeholders_do"],
  "MP Rajya Sabha": ["faq_q_what_can_stakeholders_do"],
  "MP Lok Sabha": ["faq_q_what_can_stakeholders_do"],
  "MLA Gondia": ["faq_q_what_can_stakeholders_do"],
  "MLA Tirora": ["faq_q_what_can_stakeholders_do"],
  "MLA Sadak Arjuni": ["faq_q_what_can_stakeholders_do"],
  "MLA Deori": ["faq_q_what_can_stakeholders_do"],
  MLC: ["faq_q_what_can_stakeholders_do"],
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t, setLanguage } = useLanguage();
  const { toggleTheme } = useTheme();
  const { role, setActiveView, setSelectedComplaintId } = useRole();
  const [faqItem, setFaqItem] = React.useState<{ q: string; a: string } | null>(
    null
  );

  const handleSelectComplaint = (id: string) => {
    setSelectedComplaintId(id);
    onOpenChange(false);
  };

  const handleNavigate = (view: "list" | "analytics") => {
    setActiveView(view);
    onOpenChange(false);
  };

  const handleFaqSelect = (faqKey: string) => {
    setFaqItem({ q: t(faqKey), a: t(`${faqKey}_ans`) });
    // Not closing the main command palette, so user can browse other FAQs
  };

  const customFilter = (value: string, search: string) => {
    const keywords = search.toLowerCase().split(" ");
    const isAdvancedSearch = keywords.some((k) => k.includes(":"));

    if (isAdvancedSearch) {
      const title = value.toLowerCase();
      const complaint = MOCK_COMPLAINTS.find(
        (c) => `complaint ${c.id} ${c.title}`.toLowerCase() === title
      );
      if (!complaint) return 0;

      let score = 1;
      keywords.forEach((keyword) => {
        const [key, val] = keyword.split(":");
        if (!val) {
          // normal keyword search
          if (title.includes(key)) score = 1;
          else {
            score = 0;
            return;
          }
        } else {
          // advanced key:value search
          switch (key) {
            case "dept":
            case "department":
              if (complaint.department?.toLowerCase().includes(val)) score = 1;
              else {
                score = 0;
                return;
              }
              break;
            case "status":
              if (
                complaint.status.toLowerCase().replace(/ /g, "").includes(val)
              )
                score = 1;
              else {
                score = 0;
                return;
              }
              break;
            case "prio":
            case "priority":
              if (complaint.priority?.toLowerCase().includes(val)) score = 1;
              else {
                score = 0;
                return;
              }
              break;
            default:
              if (title.includes(keyword)) score = 1;
              else {
                score = 0;
                return;
              }
          }
        }
      });
      return score;
    }
    // Default filter
    return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
  };

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        filter={customFilter}
      >
        <CommandInput placeholder="Search complaints or ask a question... (e.g. status:open)" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="How do I...?">
            {(roleFaqs[role] || []).map((faqKey) => (
              <CommandItem
                key={faqKey}
                value={`faq ${t(faqKey)}`}
                onSelect={() => handleFaqSelect(faqKey)}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>{t(faqKey)}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Complaints">
            {MOCK_COMPLAINTS.slice(0, 5).map((complaint) => (
              <CommandItem
                key={complaint.id}
                value={`complaint ${complaint.id} ${complaint.title}`}
                onSelect={() => handleSelectComplaint(complaint.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>
                  {complaint.id}: {complaint.title}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleNavigate("list")}>
              <List className="mr-2 h-4 w-4" />
              <span>Complaints List</span>
            </CommandItem>
            {role === "District Collector" && (
              <CommandItem onSelect={() => handleNavigate("analytics")}>
                <AreaChart className="mr-2 h-4 w-4" />
                <span>Analytics Dashboard</span>
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          {/* <CommandGroup heading="Roles">
            {userRoles.map((r) => (
              <CommandItem
                key={r}
                value={`role ${r}`}
                onSelect={() => handleSelectRole(r)}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Switch to {t(r.toLowerCase().replace(/ /g, "_"))}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator /> */}

          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                toggleTheme();
                onOpenChange(false);
              }}
            >
              <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>Toggle Theme</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setLanguage("en");
                onOpenChange(false);
              }}
            >
              <span className="mr-2">🇬🇧</span>
              <span>Switch to English</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setLanguage("mr");
                onOpenChange(false);
              }}
            >
              <span className="mr-2">🇮🇳</span>
              <span>Switch to Marathi</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setLanguage("hi");
                onOpenChange(false);
              }}
            >
              <span className="mr-2">🇮🇳</span>
              <span>Switch to Hindi</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <FaqDialog
        item={faqItem}
        open={!!faqItem}
        onOpenChange={() => setFaqItem(null)}
      />
    </>
  );
}
