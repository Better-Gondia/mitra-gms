import type {
  Complaint,
  ComplaintHistoryEntry,
  UserRole,
  Department,
  Priority,
  Eta,
  MediaAttachment,
} from "@/lib/types";

const createHistory = (
  date: Date,
  role: UserRole,
  action: string,
  notes?: string,
  department?: Department,
  priority?: Priority,
  eta?: Eta,
  attachment?: string
): ComplaintHistoryEntry => ({
  id: `hist-${date.getTime()}-${Math.random()}`,
  timestamp: date,
  user:
    role === "Collector Team"
      ? "Collector Staff"
      : role === "Department Team"
      ? "Department Staff"
      : role,
  role,
  action,
  notes,
  department,
  priority,
  eta,
  attachment,
});

const oldDate = (daysAgo: number, hour: number = 10, minutes: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minutes, 0, 0);
  return date;
};

const rawComplaints: Omit<Complaint, "lastUpdated">[] = [
  // 1. Simple 'Open' Complaint (Recent)
  {
    id: "GC-301",
    title: "Street light flickering on main road",
    description:
      "The street light outside my house at 123, Civil Lines has been flickering for the last two nights. It might go out completely soon.",
    status: "Open",
    priority: "Normal",
    submittedDate: oldDate(1, 9, 15),
    history: [],
    category: "Utilities",
    subcategory: "Streetlights",
    location: "Civil Lines, Gondia",
    media: [
      {
        url: "https://picsum.photos/seed/GC-301/800/600",
        type: "image" as const,
        filename: "street_light_flickering.jpg",
        extension: "jpg",
      },
    ],
  },

  // 2. Simple 'Assigned' Complaint (Recent)
  {
    id: "GC-302",
    title: "Garbage not collected for 3 days",
    description:
      "Garbage bins in our area are overflowing. The collection truck has not come for the past three days. It is causing a foul smell and attracting stray animals.",
    status: "Assigned",
    department: "Sanitation",
    priority: "Normal",
    submittedDate: oldDate(2, 11, 0),
    history: [
      createHistory(
        oldDate(1, 10, 30),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Sanitation department for necessary action.",
        "Sanitation"
      ),
    ],
    category: "Waste Management",
    subcategory: "Garbage Collection",
    location: "Nehru Ward, Tirora",
  },

  // 3. 'In Progress' Complaint (Recent)
  {
    id: "GC-303",
    title: "Broken swing in children's park",
    description:
      "The main swing set in the public park at Ramnagar is broken and has sharp edges. It is dangerous for the children playing there.",
    status: "In Progress",
    department: "Public Works",
    priority: "High",
    submittedDate: oldDate(4, 14, 0),
    history: [
      createHistory(
        oldDate(3, 11, 0),
        "Department Team",
        "Status changed to In Progress",
        "Repair team has been notified. The broken equipment will be removed today.",
        undefined,
        undefined,
        oldDate(1, 17, 0)
      ),
      createHistory(
        oldDate(4, 15, 0),
        "Collector Team",
        "Complaint Assigned",
        "Assigned to Public Works for park maintenance.",
        "Public Works",
        "High"
      ),
    ],
    category: "Infrastructure",
    subcategory: "Public Spaces",
    location: "Ramnagar Park, Gondia",
    media: [
      {
        url: "https://picsum.photos/seed/GC-303/800/600",
        type: "image" as const,
        filename: "pothole_main_road.jpg",
        extension: "jpg",
      },
    ],
  },

  // 4. Recently 'Resolved' Complaint
  {
    id: "GC-304",
    title: "Fallen tree blocking road after storm",
    description:
      "Due to yesterday's storm, a huge tree has fallen and is completely blocking the main road to our village, affecting transport.",
    status: "Resolved",
    department: "Public Works",
    priority: "High",
    submittedDate: oldDate(2, 6, 0),
    history: [
      createHistory(
        oldDate(1, 14, 0),
        "Department Team",
        "Status changed to Resolved",
        "The road has been cleared and traffic is now normal.",
        undefined,
        undefined,
        undefined,
        "https://picsum.photos/seed/GC-304-res/800/600"
      ),
      createHistory(
        oldDate(1, 18, 0),
        "Department Team",
        "Status changed to In Progress",
        "Team with heavy machinery has been dispatched to the location.",
        "Public Works"
      ),
      createHistory(
        oldDate(2, 7, 0),
        "Collector Team",
        "Complaint Assigned",
        "Urgent. PWD team dispatched for immediate clearance.",
        "Public Works",
        "High"
      ),
    ],
    category: "Infrastructure",
    subcategory: "Roads",
    location: "Village Road, Deori",
    media: [
      {
        url: "https://picsum.photos/seed/GC-304/800/600",
        type: "image" as const,
        filename: "garbage_dump_site.jpg",
        extension: "jpg",
      },
    ],
  },

  // 5. Old, Complex 'Resolved' Complaint with 'Backlog' and Stakeholder Remark
  {
    id: "GC-255",
    title: "Improper disposal of medical waste near hospital",
    description:
      "A local clinic near the General Hospital is disposing of used syringes, masks, and other medical waste in the public garbage dump. This is a severe health hazard for the entire locality.",
    status: "Resolved",
    department: "Health",
    priority: "High",
    submittedDate: oldDate(45, 16, 0),
    history: [
      createHistory(
        oldDate(20, 10, 0),
        "Department Team",
        "Status changed to Resolved",
        "Inspection completed. The clinic has been issued a formal warning and a fine has been levied. The waste has been cleared by the municipal sanitation team.",
        undefined,
        undefined,
        undefined,
        "https://picsum.photos/seed/GC-255-res/800/600"
      ),
      createHistory(
        oldDate(25, 9, 0),
        "Department Team",
        "Status changed to In Progress",
        "Taking this up on high priority after the Collector's remark. An inspection team is scheduled for tomorrow."
      ),
      createHistory(
        oldDate(28, 12, 0),
        "District Collector",
        "Remark added",
        "This is a major health hazard and completely unacceptable. The Chief Health Officer must inspect this site personally and submit a report to my office within 48 hours. Escalate immediately."
      ),
      createHistory(
        oldDate(40, 14, 0),
        "Department Team",
        "Status changed to Backlog",
        "Inspection team is currently occupied with a district-wide cholera prevention audit. This will be picked up next week."
      ),
      createHistory(
        oldDate(44, 11, 0),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to the Chief Health Officer for immediate investigation and action.",
        "Health",
        "High"
      ),
    ],
    category: "Health",
    subcategory: "Medical Waste",
    location: "Near General Hospital, Sadak-Arjuni",
  },

  // 6. Old 'Need Details' Complaint, now stuck
  {
    id: "GC-281",
    title: "Error in new property tax assessment",
    description:
      "My property tax bill for this year seems to have been calculated incorrectly. The amount is almost double compared to last year, without any apparent reason or new construction.",
    status: "Need Details",
    department: "Urban Planning",
    submittedDate: oldDate(50, 13, 0),
    history: [
      createHistory(
        oldDate(45, 16, 0),
        "Department Team",
        "Status changed to Need Details",
        "To verify your claim, please upload a copy of your previous year's tax receipt and the current year's bill through the citizen portal."
      ),
      createHistory(
        oldDate(49, 14, 0),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to revenue department for clarification and verification.",
        "Urban Planning"
      ),
    ],
    category: "Utilities",
    subcategory: "Billing",
    location: "Subhash Ward, Amgaon",
    media: [
      {
        url: "https://example.com/documents/tax_receipt_2023.pdf",
        type: "document" as const,
        filename: "tax_receipt_2023.pdf",
        extension: "pdf",
      },
      {
        url: "https://example.com/documents/tax_bill_2024.pdf",
        type: "document" as const,
        filename: "tax_bill_2024.pdf",
        extension: "pdf",
      },
    ],
  },

  // 7. Old 'Invalid' Complaint
  {
    id: "GC-290",
    title: "Complaint about my noisy neighbour",
    description:
      "My neighbour in the apartment above plays loud music late into the night every day. I have tried talking to them but it has not helped. Please take action against them.",
    status: "Invalid",
    submittedDate: oldDate(55, 20, 0),
    history: [
      createHistory(
        oldDate(54, 21, 0),
        "Collector Team",
        "Status changed to Invalid",
        "This is a private dispute between neighbors. The district administration does not have jurisdiction over such matters. You are advised to contact the local police station for noise complaints under public nuisance laws."
      ),
    ],
    category: "Noise Complaint",
    subcategory: "Residential",
    location: "Private Residence, Amgaon",
    media: [
      {
        url: "https://d2jow4rnitzfmr.cloudfront.net/whatsapp-media/1759950159777_ee6sma.jpeg",
        type: "image" as const,
        filename: "noise_complaint_evidence.jpg",
        extension: "jpeg",
      },
    ],
  },

  // 8. Reopened Complaint, now 'In Progress'
  {
    id: "GC-218",
    title: "Street lights in lane not working AGAIN",
    description:
      "The street lights in our lane were fixed last week, but they have stopped working again after just two days. This seems to be a recurring problem that needs a permanent solution.",
    status: "In Progress", // Reopened and now being worked on
    department: "Public Works",
    priority: "High",
    submittedDate: oldDate(30, 20, 0),
    history: [
      createHistory(
        oldDate(3, 11, 0),
        "Department Team",
        "Status changed to In Progress",
        "An engineer is on-site to inspect the entire circuit and find the root cause of the repeated failure."
      ),
      createHistory(
        oldDate(6, 9, 0),
        "Collector Team",
        "Complaint Reopened",
        "Reopening as the issue has resurfaced. PWD to investigate the root cause instead of a temporary fix.",
        "Public Works",
        "High"
      ),
      createHistory(
        oldDate(20, 16, 0),
        "Department Team",
        "Status changed to Resolved",
        "Faulty transformer fuse was replaced. All lights in the lane were checked and found to be functional."
      ),
      createHistory(
        oldDate(29, 9, 0),
        "Collector Team",
        "Complaint Assigned",
        "Assigning to PWD electrical maintenance wing.",
        "Public Works"
      ),
    ],
    category: "Infrastructure",
    subcategory: "Streetlights",
    location: "Gandhi Nagar, Gondia",
  },

  // 9. Police Department Complaint (Old)
  {
    id: "GC-240",
    title: "Chain snatching incident",
    description:
      "There has been a rise in chain snatching incidents in our neighborhood. We request increased police patrolling in the area, especially during evening hours.",
    status: "Assigned",
    department: "Police",
    priority: "High",
    submittedDate: oldDate(40, 18, 0),
    history: [
      createHistory(
        oldDate(39, 10, 0),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to the Superintendent of Police for immediate action and to increase patrolling.",
        "Police",
        "High"
      ),
    ],
    category: "Law & Order",
    subcategory: "Theft",
    location: "Vivek Nagar, Gondia",
    media: [
      {
        url: "https://d2jow4rnitzfmr.cloudfront.net/whatsapp-media/1759950159777_ee6sma.jpeg",
        type: "image" as const,
        filename: "incident_location.jpg",
        extension: "jpeg",
      },
      {
        url: "https://example.com/video/security_footage.mp4",
        type: "video" as const,
        filename: "security_footage.mp4",
        extension: "mp4",
      },
    ],
  },

  // 10. Linked Complaint (Duplicate)
  {
    id: "GC-311",
    title: "No water supply for 2 days",
    description:
      "There is no water supply in our area, Pratap Nagar, for the last 2 days. We are facing a lot of problems. Please resolve this urgently.",
    status: "Resolved",
    department: "Water Supply",
    submittedDate: oldDate(15, 8, 0),
    history: [
      createHistory(
        oldDate(14, 15, 0),
        "Collector Team",
        "Status changed to Resolved",
        "This is a duplicate of a master complaint GC-312 regarding a pipeline burst. Closing this ticket. Please follow GC-312 for updates."
      ),
      createHistory(
        oldDate(15, 9, 0),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Water Supply dept.",
        "Water Supply"
      ),
    ],
    category: "Utilities",
    subcategory: "Water Supply",
    location: "Pratap Nagar, Gondia",
    linkedComplaintIds: ["GC-312"],
  },

  // 11. Master Complaint for the Linked one above
  {
    id: "GC-312",
    title: "Major pipeline burst affecting Pratap Nagar and surrounding areas",
    description:
      "A main water supply pipeline has burst near the Pratap Nagar junction, leading to a complete shutdown of water supply to multiple areas. Repair work is needed on an emergency basis.",
    status: "In Progress",
    department: "Water Supply",
    priority: "High",
    submittedDate: oldDate(15, 7, 0),
    history: [
      createHistory(
        oldDate(14, 14, 0),
        "Department Team",
        "Status changed to In Progress",
        "Repair team is on site. Expected time to fix the breach is approximately 8 hours.",
        undefined,
        undefined,
        oldDate(11, 22, 0)
      ),
      createHistory(
        oldDate(15, 7, 30),
        "Collector Team",
        "Complaint Assigned",
        "Urgent. Forwarded to Water Supply department.",
        "Water Supply",
        "High"
      ),
    ],
    category: "Utilities",
    subcategory: "Water Supply",
    location: "Pratap Nagar Junction, Gondia",
    linkedComplaintIds: ["GC-311"],
  },

  // 12. Marathi Complaint (Old, Resolved)
  {
    id: "GC-M22",
    title: "सार्वजनिक शौचालयाची दुरवस्था",
    description:
      "बस स्थानकाजवळील सार्वजनिक शौचालयाची अत्यंत वाईट अवस्था आहे. स्वच्छता केली जात नाही आणि पाण्याची सोय नाही. कृपया त्वरित लक्ष द्या.",
    status: "Resolved",
    department: "Sanitation",
    submittedDate: oldDate(45, 9, 15),
    history: [
      createHistory(
        oldDate(40, 17, 0),
        "Department Team",
        "Status changed to Resolved",
        "शौचालयाची पूर्ण स्वच्छता करण्यात आली आहे आणि पाण्याची सोय पूर्ववत केली आहे.",
        undefined,
        undefined,
        undefined,
        "https://picsum.photos/seed/GC-M22-res/800/600"
      ),
      createHistory(
        oldDate(44, 11, 30),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Sanitation department.",
        "Sanitation"
      ),
    ],
    category: "Sanitation",
    subcategory: "Public Toilets",
    location: "Bus Stand, Goregaon",
  },

  // 13. Hindi Complaint (Old, In Progress)
  {
    id: "GC-H15",
    title: "अवैध निर्माण के खिलाफ कार्रवाई",
    description:
      "हमारे इलाके में एक अवैध निर्माण चल रहा है जो सड़क की सीमा में आ रहा है। इससे भविष्य में ट्रैफिक की समस्या होगी। कृपया इसे रोकें।",
    status: "In Progress",
    department: "Urban Planning",
    submittedDate: oldDate(65, 10, 0),
    history: [
      createHistory(
        oldDate(55, 12, 0),
        "Department Team",
        "Status changed to In Progress",
        "An encroachment notice has been served to the property owner. Awaiting response before further action."
      ),
      createHistory(
        oldDate(63, 14, 0),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Urban Planning for verification and action.",
        "Urban Planning"
      ),
    ],
    category: "Encroachment",
    subcategory: "Illegal Construction",
    location: "Ganesh Nagar, Gondia",
  },

  // 14. A very old, resolved complaint for analytics
  {
    id: "GC-101",
    title: "Request for speed breaker on school road",
    description:
      "The road in front of the Vidya Mandir school has very fast traffic. We request the installation of speed breakers to ensure the safety of children.",
    status: "Resolved",
    department: "Public Works",
    submittedDate: oldDate(95, 8, 0),
    history: [
      createHistory(
        oldDate(80, 15, 0),
        "Department Team",
        "Status changed to Resolved",
        "Two speed breakers have been installed at the requested location.",
        undefined,
        undefined,
        undefined,
        "https://picsum.photos/seed/GC-101-res/800/600"
      ),
      createHistory(
        oldDate(90, 10, 0),
        "Department Team",
        "Status changed to In Progress",
        "The proposal has been approved. Work is scheduled for next week."
      ),
      createHistory(
        oldDate(94, 9, 0),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to PWD. Marked as high priority due to school safety.",
        "Public Works",
        "High"
      ),
    ],
    category: "Infrastructure",
    subcategory: "Roads",
    location: "Vidya Mandir School, Tirora",
  },

  // NEW BATCH 1 (15-38)
  {
    id: "GC-315",
    title: "Pothole on Main Street",
    description:
      "A large pothole has formed on Main Street, causing traffic issues.",
    status: "Resolved",
    department: "Public Works",
    submittedDate: oldDate(20),
    history: [
      createHistory(
        oldDate(18),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to PWD.",
        "Public Works"
      ),
      createHistory(
        oldDate(15),
        "Department Team",
        "Status changed to In Progress",
        "Team dispatched."
      ),
      createHistory(
        oldDate(14),
        "Department Team",
        "Status changed to Resolved",
        "Pothole repaired."
      ),
    ],
    category: "Infrastructure",
    subcategory: "Roads",
    location: "Main Street, Gondia",
  },
  {
    id: "GC-316",
    title: "Water Leakage",
    description: "Constant water leakage from the main pipeline.",
    status: "In Progress",
    department: "Water Supply",
    submittedDate: oldDate(5),
    history: [
      createHistory(
        oldDate(4),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Water Supply.",
        "Water Supply"
      ),
      createHistory(
        oldDate(2),
        "Department Team",
        "Status changed to In Progress",
        "Inspection underway."
      ),
    ],
    category: "Utilities",
    subcategory: "Water Supply",
    location: "Market Road, Amgaon",
  },
  {
    id: "GC-317",
    title: "Unauthorised Parking",
    description: "Vehicles are parked illegally, blocking the road.",
    status: "Assigned",
    department: "Police",
    submittedDate: oldDate(3),
    history: [
      createHistory(
        oldDate(2),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Police.",
        "Police"
      ),
    ],
    category: "Law & Order",
    subcategory: "Traffic",
    location: "Station Road, Gondia",
  },
  {
    id: "GC-318",
    title: "Lack of Cleanliness in Public Toilet",
    description: "The public toilet near the bus stand is very dirty.",
    status: "Backlog",
    department: "Sanitation",
    submittedDate: oldDate(10),
    history: [
      createHistory(
        oldDate(9),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Sanitation.",
        "Sanitation"
      ),
      createHistory(
        oldDate(7),
        "Department Team",
        "Status changed to Backlog",
        "Manpower shortage."
      ),
    ],
    category: "Sanitation",
    subcategory: "Public Toilets",
    location: "Bus Stand, Tirora",
  },
  {
    id: "GC-319",
    title: "Illegal Hawkers",
    description: "Illegal hawkers have occupied the footpath.",
    status: "Need Details",
    department: "Urban Planning",
    submittedDate: oldDate(8),
    history: [
      createHistory(
        oldDate(7),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Urban Planning.",
        "Urban Planning"
      ),
      createHistory(
        oldDate(6),
        "Department Team",
        "Status changed to Need Details",
        "Please provide exact location and photos."
      ),
    ],
    category: "Encroachment",
    subcategory: "Illegal Hawkers",
    location: "Jaistambh Chowk, Gondia",
  },
  {
    id: "GC-320",
    title: "Open manhole",
    description:
      "An open manhole on the footpath is dangerous for pedestrians.",
    status: "Resolved",
    department: "Public Works",
    priority: "High",
    submittedDate: oldDate(6),
    history: [
      createHistory(
        oldDate(5),
        "Collector Team",
        "Complaint Assigned",
        "Urgent action needed.",
        "Public Works",
        "High"
      ),
      createHistory(
        oldDate(4),
        "Department Team",
        "Status changed to In Progress",
        "Team sent to cover the manhole."
      ),
      createHistory(
        oldDate(4),
        "Department Team",
        "Status changed to Resolved",
        "Manhole has been covered safely."
      ),
    ],
    category: "Infrastructure",
    subcategory: "Safety Hazard",
    location: "Hospital Road, Deori",
  },
  {
    id: "GC-321",
    title: "Damaged Park Bench",
    description: "A bench in the city park is broken.",
    status: "Open",
    submittedDate: oldDate(1),
    history: [],
    category: "Infrastructure",
    subcategory: "Public Spaces",
    location: "City Park, Gondia",
  },
  {
    id: "GC-322",
    title: "Frequent Power Cuts",
    description: "Experiencing frequent power cuts in our area.",
    status: "Assigned",
    department: "Public Works",
    submittedDate: oldDate(4),
    history: [
      createHistory(
        oldDate(3),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to electricity board.",
        "Public Works"
      ),
    ],
    category: "Utilities",
    subcategory: "Electricity",
    location: "Ramnagar, Gondia",
  },
  {
    id: "GC-323",
    title: "Broken Street Sign",
    description: "A street sign is broken and hanging dangerously.",
    status: "In Progress",
    department: "Public Works",
    submittedDate: oldDate(7),
    history: [
      createHistory(
        oldDate(6),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to PWD.",
        "Public Works"
      ),
      createHistory(
        oldDate(4),
        "Department Team",
        "Status changed to In Progress",
        "Repair team is on its way."
      ),
    ],
    category: "Infrastructure",
    subcategory: "Roads",
    location: "Shivaji Nagar, Sadak-Arjuni",
  },
  {
    id: "GC-324",
    title: "Stray Dog Menace",
    description: "Stray dogs are causing a nuisance in our colony.",
    status: "Invalid",
    submittedDate: oldDate(9),
    history: [
      createHistory(
        oldDate(8),
        "Collector Team",
        "Status changed to Invalid",
        "Animal welfare NGOs should be contacted for this issue."
      ),
    ],
    category: "Animal Welfare",
    subcategory: "Stray Animals",
    location: "Ganesh Nagar, Gondia",
  },
  {
    id: "GC-325",
    title: "Waterlogging issue",
    description: "Waterlogging on the road after rain.",
    status: "Resolved",
    department: "Public Works",
    submittedDate: oldDate(12),
    history: [
      createHistory(
        oldDate(11),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to PWD.",
        "Public Works"
      ),
      createHistory(
        oldDate(9),
        "Department Team",
        "Status changed to In Progress",
        "Drainage cleaning started."
      ),
      createHistory(
        oldDate(7),
        "Department Team",
        "Status changed to Resolved",
        "Water has been cleared."
      ),
    ],
    category: "Infrastructure",
    subcategory: "Drainage",
    location: "Subhash Nagar, Goregaon",
  },
  {
    id: "GC-326",
    title: "Irregular Water Supply",
    description: "Water supply is irregular and at low pressure.",
    status: "Backlog",
    department: "Water Supply",
    submittedDate: oldDate(14),
    history: [
      createHistory(
        oldDate(13),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Water Supply.",
        "Water Supply"
      ),
      createHistory(
        oldDate(11),
        "Department Team",
        "Status changed to Backlog",
        "Pipeline upgrade is planned."
      ),
    ],
    category: "Utilities",
    subcategory: "Water Supply",
    location: "Indira Nagar, Gondia",
  },
  {
    id: "GC-327",
    title: "Encroachment on footpath",
    description: "A shop has encroached upon the footpath.",
    status: "Assigned",
    department: "Urban Planning",
    submittedDate: oldDate(2),
    history: [
      createHistory(
        oldDate(1),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Urban Planning.",
        "Urban Planning"
      ),
    ],
    category: "Encroachment",
    subcategory: "Illegal Construction",
    location: "Main Bazar, Tirora",
  },
  {
    id: "GC-328",
    title: "Request for new bus stop",
    description: "Request for a new bus stop near the college.",
    status: "Open",
    submittedDate: oldDate(0),
    history: [],
    category: "Transport",
    subcategory: "Bus Service",
    location: "College Road, Deori",
  },
  {
    id: "GC-329",
    title: "Poor condition of health center",
    description: "The local health center is in poor condition.",
    status: "Resolved",
    department: "Health",
    submittedDate: oldDate(25),
    history: [
      createHistory(
        oldDate(24),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Health dept.",
        "Health"
      ),
      createHistory(
        oldDate(20),
        "Department Team",
        "Status changed to In Progress",
        "Inspection completed. Renovation planned."
      ),
      createHistory(
        oldDate(10),
        "Department Team",
        "Status changed to Resolved",
        "Renovation work completed."
      ),
    ],
    category: "Health",
    subcategory: "Public Health",
    location: "Health Center, Arjuni-Morgaon",
  },
  {
    id: "GC-330",
    title: "Theft in the area",
    description: "There have been several thefts in our area recently.",
    status: "In Progress",
    department: "Police",
    submittedDate: oldDate(11),
    history: [
      createHistory(
        oldDate(10),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Police.",
        "Police"
      ),
      createHistory(
        oldDate(8),
        "Department Team",
        "Status changed to In Progress",
        "Increased patrolling and investigation started."
      ),
    ],
    category: "Law & Order",
    subcategory: "Theft",
    location: "Shastri Ward, Gondia",
  },
  {
    id: "GC-331",
    title: "Lack of street lights",
    description: "No street lights on the road to the village.",
    status: "Need Details",
    department: "Public Works",
    submittedDate: oldDate(13),
    history: [
      createHistory(
        oldDate(12),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to PWD.",
        "Public Works"
      ),
      createHistory(
        oldDate(10),
        "Department Team",
        "Status changed to Need Details",
        "Please specify the exact stretch of road."
      ),
    ],
    category: "Utilities",
    subcategory: "Streetlights",
    location: "Village Road, Salekasa",
  },
  {
    id: "GC-332",
    title: "Damaged electricity pole",
    description: "An electricity pole is damaged and could fall.",
    status: "Assigned",
    department: "Public Works",
    priority: "High",
    submittedDate: oldDate(1),
    history: [
      createHistory(
        oldDate(0),
        "Collector Team",
        "Complaint Assigned",
        "Urgent. Forwarded to electricity board.",
        "Public Works",
        "High"
      ),
    ],
    category: "Utilities",
    subcategory: "Electricity",
    location: "Patel Colony, Gondia",
  },
  {
    id: "GC-333",
    title: "Need for a public library",
    description: "Request to build a public library for students.",
    status: "Backlog",
    department: "Urban Planning",
    submittedDate: oldDate(30),
    history: [
      createHistory(
        oldDate(29),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Urban Planning.",
        "Urban Planning"
      ),
      createHistory(
        oldDate(25),
        "Department Team",
        "Status changed to Backlog",
        "Proposal under consideration."
      ),
    ],
    category: "Education",
    subcategory: "Public Facilities",
    location: "Amgaon",
  },
  {
    id: "GC-334",
    title: "Blocked sewer line",
    description: "The main sewer line in our street is blocked.",
    status: "Resolved",
    department: "Sanitation",
    submittedDate: oldDate(18),
    history: [
      createHistory(
        oldDate(17),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Sanitation.",
        "Sanitation"
      ),
      createHistory(
        oldDate(16),
        "Department Team",
        "Status changed to In Progress",
        "Cleaning team at work."
      ),
      createHistory(
        oldDate(15),
        "Department Team",
        "Status changed to Resolved",
        "Sewer line has been cleared."
      ),
    ],
    category: "Sanitation",
    subcategory: "Sewerage",
    location: "Nehru Chowk, Gondia",
  },
  {
    id: "GC-335",
    title: "Overcrowded public transport",
    description: "Buses are always overcrowded during peak hours.",
    status: "Open",
    submittedDate: oldDate(2),
    history: [],
    category: "Transport",
    subcategory: "Bus Service",
    location: "Gondia",
  },
  {
    id: "GC-336",
    title: "Lack of drinking water facility",
    description: "No drinking water facility at the public park.",
    status: "Assigned",
    department: "Water Supply",
    submittedDate: oldDate(4),
    history: [
      createHistory(
        oldDate(3),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Water Supply.",
        "Water Supply"
      ),
    ],
    category: "Utilities",
    subcategory: "Water Supply",
    location: "City Park, Gondia",
  },
  {
    id: "GC-337",
    title: "Illegal dumping of garbage",
    description: "People are dumping garbage in the open plot.",
    status: "In Progress",
    department: "Sanitation",
    submittedDate: oldDate(9),
    history: [
      createHistory(
        oldDate(8),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Sanitation.",
        "Sanitation"
      ),
      createHistory(
        oldDate(6),
        "Department Team",
        "Status changed to In Progress",
        "Warning signs installed. Area is being monitored."
      ),
    ],
    category: "Waste Management",
    subcategory: "Illegal Dumping",
    location: "Vivekanand Nagar, Tirora",
  },
  {
    id: "GC-338",
    title: "Poor road condition",
    description:
      "The road leading to the industrial area is in very poor condition.",
    status: "Invalid",
    submittedDate: oldDate(16),
    history: [
      createHistory(
        oldDate(15),
        "Collector Team",
        "Status changed to Invalid",
        "This road belongs to MIDC. Complaint forwarded to them."
      ),
    ],
    category: "Infrastructure",
    subcategory: "Roads",
    location: "MIDC Area, Gondia",
  },

  // NEW BATCH 2 (39-62)
  {
    id: "GC-339",
    title: "Malfunctioning Traffic Signal",
    description:
      "The traffic signal at the main square is not working properly.",
    status: "Resolved",
    department: "Police",
    submittedDate: oldDate(22),
    history: [
      createHistory(
        oldDate(21),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Traffic Police.",
        "Police"
      ),
      createHistory(
        oldDate(19),
        "Department Team",
        "Status changed to In Progress",
        "Technician dispatched."
      ),
      createHistory(
        oldDate(18),
        "Department Team",
        "Status changed to Resolved",
        "Signal repaired and functional."
      ),
    ],
    category: "Law & Order",
    subcategory: "Traffic",
    location: "Main Square, Gondia",
  },
  {
    id: "GC-340",
    title: "Request for Zebra Crossing",
    description:
      "A zebra crossing is needed near the school for children's safety.",
    status: "Backlog",
    department: "Public Works",
    submittedDate: oldDate(35),
    history: [
      createHistory(
        oldDate(34),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to PWD.",
        "Public Works"
      ),
      createHistory(
        oldDate(30),
        "Department Team",
        "Status changed to Backlog",
        "Proposal submitted for approval."
      ),
    ],
    category: "Infrastructure",
    subcategory: "Roads",
    location: "School Road, Amgaon",
  },
  {
    id: "GC-341",
    title: "Contaminated Water Supply",
    description: "The tap water has a foul smell and is muddy.",
    status: "In Progress",
    department: "Water Supply",
    priority: "High",
    submittedDate: oldDate(3),
    history: [
      createHistory(
        oldDate(2),
        "Collector Team",
        "Complaint Assigned",
        "Urgent. Forwarded to Water Supply.",
        "Water Supply",
        "High"
      ),
      createHistory(
        oldDate(1),
        "Department Team",
        "Status changed to In Progress",
        "Water sample collected for testing. Tankers arranged."
      ),
    ],
    category: "Utilities",
    subcategory: "Water Supply",
    location: "Gandhi Ward, Deori",
  },
  {
    id: "GC-342",
    title: "Noise pollution from factory",
    description:
      "A factory in the residential area is causing a lot of noise pollution.",
    status: "Assigned",
    department: "Urban Planning",
    submittedDate: oldDate(5),
    history: [
      createHistory(
        oldDate(4),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Urban Planning & Pollution Control.",
        "Urban Planning"
      ),
    ],
    category: "Environment",
    subcategory: "Noise Pollution",
    location: "Industrial Area, Sadak-Arjuni",
  },
  {
    id: "GC-343",
    title: "Faded road markings",
    description: "The markings on the highway are faded, causing confusion.",
    status: "Open",
    submittedDate: oldDate(0),
    history: [],
    category: "Infrastructure",
    subcategory: "Roads",
    location: "National Highway, Gondia",
  },
  {
    id: "GC-344",
    title: "Lack of medicines at health center",
    description:
      "Essential medicines are not available at the primary health center.",
    status: "Resolved",
    department: "Health",
    submittedDate: oldDate(28),
    history: [
      createHistory(
        oldDate(27),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Health dept.",
        "Health"
      ),
      createHistory(
        oldDate(26),
        "Department Team",
        "Status changed to In Progress",
        "Stock verification underway."
      ),
      createHistory(
        oldDate(25),
        "Department Team",
        "Status changed to Resolved",
        "Required medicines have been supplied."
      ),
    ],
    category: "Health",
    subcategory: "Public Health",
    location: "PHC, Goregaon",
  },
  {
    id: "GC-345",
    title: "Gambling in public place",
    description: "People are gambling openly in the public garden.",
    status: "Need Details",
    department: "Police",
    submittedDate: oldDate(15),
    history: [
      createHistory(
        oldDate(14),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Police.",
        "Police"
      ),
      createHistory(
        oldDate(13),
        "Department Team",
        "Status changed to Need Details",
        "Please specify the time when this happens."
      ),
    ],
    category: "Law & Order",
    subcategory: "Public Nuisance",
    location: "Public Garden, Tirora",
  },
  {
    id: "GC-346",
    title: "Request for community hall",
    description: "Our village needs a community hall for public functions.",
    status: "Invalid",
    submittedDate: oldDate(40),
    history: [
      createHistory(
        oldDate(39),
        "Collector Team",
        "Status changed to Invalid",
        "Please submit this proposal through the Gram Panchayat."
      ),
    ],
    category: "Community",
    subcategory: "Public Facilities",
    location: "Village Panchayat, Salekasa",
  },
  {
    id: "GC-347",
    title: "Wild animal menace",
    description: "Wild boars are destroying crops in our fields.",
    status: "Assigned",
    department: "Police",
    submittedDate: oldDate(6),
    history: [
      createHistory(
        oldDate(5),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Forest Department via Police liaison.",
        "Police"
      ),
    ],
    category: "Agriculture",
    subcategory: "Wildlife",
    location: "Farm Area, Deori",
  },
  {
    id: "GC-348",
    title: "Poor internet connectivity",
    description: "Internet connectivity is very poor in our area.",
    status: "Open",
    submittedDate: oldDate(1),
    history: [],
    category: "Utilities",
    subcategory: "Telecommunication",
    location: "Gondia",
  },
  {
    id: "GC-349",
    title: "School building in bad condition",
    description: "The local government school building needs urgent repairs.",
    status: "In Progress",
    department: "Public Works",
    priority: "High",
    submittedDate: oldDate(19),
    history: [
      createHistory(
        oldDate(18),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to PWD.",
        "Public Works",
        "High"
      ),
      createHistory(
        oldDate(15),
        "Department Team",
        "Status changed to In Progress",
        "Structural audit completed. Repair estimate prepared."
      ),
    ],
    category: "Education",
    subcategory: "Infrastructure",
    location: "Govt. School, Arjuni-Morgaon",
  },
  {
    id: "GC-350",
    title: "Illegal sand mining",
    description: "Illegal sand mining is happening on the river bank.",
    status: "Resolved",
    department: "Police",
    submittedDate: oldDate(50),
    history: [
      createHistory(
        oldDate(49),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Police and Revenue Dept.",
        "Police"
      ),
      createHistory(
        oldDate(45),
        "Department Team",
        "Status changed to In Progress",
        "Joint raid conducted."
      ),
      createHistory(
        oldDate(44),
        "Department Team",
        "Status changed to Resolved",
        "Equipment seized and case registered."
      ),
    ],
    category: "Environment",
    subcategory: "Illegal Mining",
    location: "River Bank, Sadak-Arjuni",
  },
  {
    id: "GC-351",
    title: "Delay in pension disbursement",
    description: "Senior citizen pensions have been delayed this month.",
    status: "Backlog",
    department: "Sanitation", // Incorrect, but for testing
    submittedDate: oldDate(23),
    history: [
      createHistory(
        oldDate(22),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Treasury.",
        "Sanitation"
      ), // Wrong dept
      createHistory(
        oldDate(20),
        "Department Team",
        "Status changed to Backlog",
        "Awaiting funds from state government."
      ),
    ],
    category: "Social Welfare",
    subcategory: "Pension",
    location: "Gondia",
  },
  {
    id: "GC-352",
    title: "Need for more public buses",
    description: "The number of public buses is not enough for the population.",
    status: "Assigned",
    department: "Urban Planning",
    submittedDate: oldDate(17),
    history: [
      createHistory(
        oldDate(16),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Transport Dept.",
        "Urban Planning"
      ),
    ],
    category: "Transport",
    subcategory: "Bus Service",
    location: "Gondia",
  },
  {
    id: "GC-353",
    title: "Non-functional hand pump",
    description: "The community hand pump is not working.",
    status: "Resolved",
    department: "Water Supply",
    submittedDate: oldDate(4),
    history: [
      createHistory(
        oldDate(3),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Water Supply.",
        "Water Supply"
      ),
      createHistory(
        oldDate(2),
        "Department Team",
        "Status changed to In Progress",
        "Mechanic sent for repair."
      ),
      createHistory(
        oldDate(1),
        "Department Team",
        "Status changed to Resolved",
        "Hand pump repaired and working."
      ),
    ],
    category: "Utilities",
    subcategory: "Water Supply",
    location: "Village Square, Salekasa",
  },
  {
    id: "GC-354",
    title: "Rude behavior of hospital staff",
    description: "The staff at the government hospital were very rude.",
    status: "In Progress",
    department: "Health",
    submittedDate: oldDate(8),
    history: [
      createHistory(
        oldDate(7),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Hospital Superintendent.",
        "Health"
      ),
      createHistory(
        oldDate(5),
        "Department Team",
        "Status changed to In Progress",
        "Inquiry initiated."
      ),
    ],
    category: "Public Service",
    subcategory: "Behavior",
    location: "Govt. Hospital, Gondia",
  },
  {
    id: "GC-355",
    title: "Need for a playground",
    description: "There is no playground for children in our area.",
    status: "Open",
    submittedDate: oldDate(1),
    history: [],
    category: "Community",
    subcategory: "Public Spaces",
    location: "New Colony, Amgaon",
  },
  {
    id: "GC-356",
    title: "Unfair price at ration shop",
    description:
      "The ration shop owner is charging more than the government price.",
    status: "Resolved",
    department: "Urban Planning", // incorrect
    submittedDate: oldDate(33),
    history: [
      createHistory(
        oldDate(32),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Food Supply Officer.",
        "Urban Planning"
      ),
      createHistory(
        oldDate(30),
        "Department Team",
        "Status changed to In Progress",
        "Surprise inspection conducted."
      ),
      createHistory(
        oldDate(29),
        "Department Team",
        "Status changed to Resolved",
        "Shop owner warned and penalized."
      ),
    ],
    category: "Social Welfare",
    subcategory: "Public Distribution System",
    location: "Ration Shop, Tirora",
  },
  {
    id: "GC-357",
    title: "Dangerous electric wires",
    description: "Low-hanging electric wires are a safety hazard.",
    status: "Backlog",
    department: "Public Works",
    priority: "High",
    submittedDate: oldDate(26),
    history: [
      createHistory(
        oldDate(25),
        "Collector Team",
        "Complaint Assigned",
        "Urgent. Forwarded to Electricity Board.",
        "Public Works",
        "High"
      ),
      createHistory(
        oldDate(22),
        "Department Team",
        "Status changed to Backlog",
        "Special equipment needed. Will be done next week."
      ),
    ],
    category: "Utilities",
    subcategory: "Electricity",
    location: "Market Area, Deori",
  },
  {
    id: "GC-358",
    title: "Request for new Anganwadi center",
    description: "Our village needs an Anganwadi center for child development.",
    status: "Assigned",
    department: "Health",
    submittedDate: oldDate(19),
    history: [
      createHistory(
        oldDate(18),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Women and Child Development Officer.",
        "Health"
      ),
    ],
    category: "Social Welfare",
    subcategory: "Child Development",
    location: "Village, Arjuni-Morgaon",
  },
  {
    id: "GC-359",
    title: "Mosquito menace",
    description:
      "Mosquitoes have increased a lot in our area. Fogging is needed.",
    status: "Resolved",
    department: "Sanitation",
    submittedDate: oldDate(6),
    history: [
      createHistory(
        oldDate(5),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Sanitation.",
        "Sanitation"
      ),
      createHistory(
        oldDate(4),
        "Department Team",
        "Status changed to In Progress",
        "Fogging scheduled for this evening."
      ),
      createHistory(
        oldDate(3),
        "Department Team",
        "Status changed to Resolved",
        "Fogging has been done in the area."
      ),
    ],
    category: "Health",
    subcategory: "Pest Control",
    location: "Shanti Nagar, Gondia",
  },
  {
    id: "GC-360",
    title: "Rash driving by bikers",
    description: "Youngsters are driving bikes very rashly in the evening.",
    status: "In Progress",
    department: "Police",
    submittedDate: oldDate(1),
    history: [
      createHistory(
        oldDate(0),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Traffic Police.",
        "Police"
      ),
    ],
    category: "Law & Order",
    subcategory: "Traffic",
    location: "Lake Road, Gondia",
  },
  {
    id: "GC-361",
    title: "Fake currency circulation",
    description: "A shopkeeper gave me a fake 500 rupee note.",
    status: "Need Details",
    department: "Police",
    submittedDate: oldDate(21),
    history: [
      createHistory(
        oldDate(20),
        "Collector Team",
        "Complaint Assigned",
        "Forwarded to Police.",
        "Police"
      ),
      createHistory(
        oldDate(19),
        "Department Team",
        "Status changed to Need Details",
        "Please provide details of the shop and the note."
      ),
    ],
    category: "Law & Order",
    subcategory: "Crime",
    location: "Main Market, Sadak-Arjuni",
  },
  {
    id: "GC-362",
    title: "Poor mobile network",
    description: "We are facing constant call drops and poor mobile network.",
    status: "Invalid",
    submittedDate: oldDate(24),
    history: [
      createHistory(
        oldDate(23),
        "Collector Team",
        "Status changed to Invalid",
        "This issue should be raised with the concerned mobile service provider."
      ),
    ],
    category: "Utilities",
    subcategory: "Telecommunication",
    location: "Gondia",
  },
];

export const MOCK_COMPLAINTS: Complaint[] = rawComplaints.map((c) => {
  const lastHistoryTimestamp =
    c.history.length > 0
      ? c.history.reduce((latest, current) =>
          new Date(current.timestamp) > new Date(latest.timestamp)
            ? current
            : latest
        ).timestamp
      : null;

  const lastUpdated = lastHistoryTimestamp || c.submittedDate;

  return {
    ...c,
    lastUpdated: new Date(lastUpdated),
  };
});
