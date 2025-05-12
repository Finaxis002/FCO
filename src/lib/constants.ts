import type { Case, User, Service, ServiceStatus, UserRole, StateItem, AreaItem, ServiceDefinition, AppNotification } from "@/types/franchise";
import { Home, Users, Settings, FolderKanban, Briefcase, MapPin, ShieldCheck, Building2, FileText, CheckCircle2, XCircle, Hourglass, Zap } from "lucide-react";

export const APP_NAME = "FranchiseFlow";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  role?: UserRole[]; // Optional: specify roles that can see this item
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Cases", href: "/cases", icon: FolderKanban },
  { label: "Users", href: "/users", icon: Users, role: ["Admin"] },
  { label: "Settings", href: "/settings", icon: Settings, role: ["Admin"] },
];

export const STATUS_CONFIG: Record<ServiceStatus, { color: string; lightColor: string; Icon: React.ElementType }> = {
  "Pending": { color: "hsl(200, 80%, 60%)", lightColor: "hsl(200, 80%, 90%)", Icon: Hourglass }, // Light Blue
  "In-Progress": { color: "hsl(211, 100%, 50%)", lightColor: "hsl(211, 100%, 85%)", Icon: Zap }, // Medium Blue (Primary)
  "Completed": { color: "hsl(211, 100%, 30%)", lightColor: "hsl(211, 100%, 75%)", Icon: CheckCircle2 }, // Dark Blue
  "Approved": { color: "hsl(145, 63%, 42%)", lightColor: "hsl(145, 63%, 85%)", Icon: ShieldCheck }, // Green (Accent)
  "Rejected": { color: "hsl(0, 70%, 50%)", lightColor: "hsl(0, 70%, 85%)", Icon: XCircle }, // Red
};

export const USER_ROLES: UserRole[] = ["Admin", "Back Office", "Local Area Head", "Franchise Owner", "Viewer"];

export const MOCK_SERVICES_TEMPLATES: Omit<Service, 'id' | 'status' | 'remarks' | 'completionPercentage' | 'assignedUser'>[] = [
  { name: "DPR" },
  { name: "UDYAM Registration" },
  { name: "GST Registration" },
  { name: "PMEGP Application" },
  { name: "Store Setup" },
  { name: "Local Permits" },
];

export const MOCK_USERS: User[] = [
  { id: "user1", name: "Admin User", email: "admin@franchiseflow.com", role: "Admin", avatarUrl: `https://picsum.photos/seed/admin/40/40`, dataAIHint: "person avatar" },
  { id: "user2", name: "Back Office Staff 1", email: "bo1@franchiseflow.com", role: "Back Office", avatarUrl: `https://picsum.photos/seed/bo1/40/40`, dataAIHint: "person avatar" },
  { id: "user3", name: "Deepak Sharma", email: "deepak@example.com", role: "Local Area Head", avatarUrl: `https://picsum.photos/seed/deepak/40/40`, dataAIHint: "person avatar" },
  { id: "user4", name: "Priya Singh", email: "priya@example.com", role: "Franchise Owner", avatarUrl: `https://picsum.photos/seed/priya/40/40`, dataAIHint: "person avatar" },
  { id: "user5", name: "Amit Kumar", email: "amit@example.com", role: "Back Office", avatarUrl: `https://picsum.photos/seed/amit/40/40`, dataAIHint: "person avatar" },
];

const generateServices = (): Service[] => {
  return MOCK_SERVICES_TEMPLATES.map((template, index) => {
    const statuses: ServiceStatus[] = ["Pending", "In-Progress", "Completed", "Approved", "Rejected"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    let completionPercentage = 0;
    if (randomStatus === "Pending") completionPercentage = Math.floor(Math.random() * 25);
    else if (randomStatus === "In-Progress") completionPercentage = Math.floor(Math.random() * 50) + 25;
    else if (randomStatus === "Completed") completionPercentage = Math.floor(Math.random() * 25) + 75;
    else if (randomStatus === "Approved") completionPercentage = 100;
    else if (randomStatus === "Rejected") completionPercentage = Math.floor(Math.random() * 100); // Could be any for rejected

    return {
      id: `service${index + 1}`,
      name: template.name,
      status: randomStatus,
      remarks: randomStatus === "Rejected" ? "Missing document X" : (Math.random() > 0.7 ? "Awaiting client feedback" : ""),
      completionPercentage: completionPercentage,
      assignedUser: MOCK_USERS[1].id, // Default to Back Office Staff 1
    };
  });
};


export const MOCK_CASES: Case[] = [
  {
    id: "case1",
    srNo: "1",
    ownerName: "Mrs. Karuna Brijwani",
    unitName: "M/s Radha Soami Enterprises",
    franchiseAddress: "Gwalior, Madhya Pradesh – 474001",
    promoters: "Mrs. Karuna Brijwani",
    authorizedPerson: "Ajit",
    services: [
      { id: "s1-1", name: "DPR", status: "Completed", remarks: "DPR finalized and submitted.", completionPercentage: 100, assignedUser: "user2" },
      { id: "s1-2", name: "UDYAM", status: "Completed", remarks: "UDYAM registration obtained.", completionPercentage: 100, assignedUser: "user2" },
      { id: "s1-3", name: "GST", status: "Approved", remarks: "GSTIN received.", completionPercentage: 100, assignedUser: "user2" },
      { id: "s1-4", name: "PMEGP", status: "Approved", remarks: "Loan sanctioned under PMEGP.", completionPercentage: 100, assignedUser: "user2" },
    ],
    overallStatus: "Approved",
    assignedUsers: ["user2", "user3"],
    lastUpdate: "2023-10-26T10:00:00Z",
    reasonForStatus: "STORE IS LIVE",
    viewLink: "/view/case1_public_token"
  },
  {
    id: "case2",
    srNo: "2",
    ownerName: "Mr. Rohan Verma",
    unitName: "Verma Dry Cleaners",
    franchiseAddress: "Jaipur, Rajasthan - 302017",
    promoters: "Mr. Rohan Verma",
    authorizedPerson: "Rohan Verma",
    services: generateServices().map(s => ({...s, id: `s2-${s.id.substring(7)}`})),
    overallStatus: "In-Progress",
    assignedUsers: ["user2"],
    lastUpdate: "2023-11-15T14:30:00Z",
  },
  {
    id: "case3",
    srNo: "3",
    ownerName: "Ms. Anjali Mehta",
    unitName: "Sparkle Laundry Services",
    franchiseAddress: "Pune, Maharashtra - 411007",
    promoters: "Ms. Anjali Mehta",
    authorizedPerson: "Anjali Mehta",
    services: generateServices().map(s => ({...s, id: `s3-${s.id.substring(7)}`})),
    overallStatus: "Pending",
    assignedUsers: ["user5", "user3"],
    lastUpdate: "2023-12-01T09:15:00Z",
  },
];

export const MOCK_STATES: StateItem[] = [
    { id: "state1", name: "Madhya Pradesh" },
    { id: "state2", name: "Rajasthan" },
    { id: "state3", name: "Maharashtra" },
    { id: "state4", name: "Uttar Pradesh" },
];

export const MOCK_AREAS: AreaItem[] = [
    { id: "area1", name: "Gwalior", stateId: "state1" },
    { id: "area2", name: "Jaipur", stateId: "state2" },
    { id: "area3", name: "Pune", stateId: "state3" },
    { id: "area4", name: "Lucknow", stateId: "state4" },
];

export const MOCK_SERVICE_DEFINITIONS: ServiceDefinition[] = MOCK_SERVICES_TEMPLATES.map((s,i) => ({
    id: `servdef${i+1}`,
    name: s.name,
    defaultStatus: "Pending",
}));

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: "notif1", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), caseId: "case1", message: "GST status updated to Approved for M/s Radha Soami Enterprises.", type: "update", read: false, userId: "user2" },
  { id: "notif2", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), caseId: "case2", message: "New case 'Verma Dry Cleaners' created.", type: "creation", read: false, userId: "user1" },
  { id: "notif3", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), caseId: "case3", message: "Deepak Sharma assigned to 'Sparkle Laundry Services'.", type: "assign", read: true, userId: "user1" },
];

export const DEFAULT_USER_PERMISSIONS = {
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

export const ROLE_PERMISSIONS: Record<UserRole, typeof DEFAULT_USER_PERMISSIONS> = {
  "Admin": { canCreate: true, canEdit: true, canDelete: true },
  "Back Office": { canCreate: true, canEdit: true, canDelete: false },
  "Local Area Head": { canCreate: false, canEdit: true, canDelete: false },
  "Franchise Owner": { canCreate: false, canEdit: false, canDelete: false },
  "Viewer": { canCreate: false, canEdit: false, canDelete: false },
};
