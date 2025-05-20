import type { Case, User, Service, ServiceStatus, UserRole, StateItem, AreaItem, ServiceDefinition, AppNotification, ChatMessage } from "@/types/franchise";
import { Home, Users, Settings, FolderKanban, Briefcase, MapPin, ShieldCheck, Building2, FileText, CheckCircle2, XCircle, Hourglass, Zap, UserPlus, MessageSquare, Users2 } from "lucide-react"; // Added Users2

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
  // Settings might be moved inside user dropdown or kept for admin only
  // { label: "Settings", href: "/settings", icon: Settings, role: ["Admin"] },
];

// Using HSL values from globals.css for direct style binding
export const STATUS_CONFIG: Record<ServiceStatus, { color: string; lightColor: string; Icon: React.ElementType }> = {
  "Pending": { color: "hsl(200, 80%, 60%)", lightColor: "hsl(200, 80%, 90%)", Icon: Hourglass }, // Light Blue
  "In-Progress": { color: "hsl(210, 100%, 55%)", lightColor: "hsl(210, 100%, 85%)", Icon: Zap }, // Medium Blue (Primary) - Adjusted to match primary
  "Completed": { color: "hsl(210, 100%, 40%)", lightColor: "hsl(210, 100%, 75%)", Icon: CheckCircle2 }, // Darker Blue for "Completed"
  "Approved": { color: "hsl(150, 60%, 45%)", lightColor: "hsl(150, 60%, 85%)", Icon: ShieldCheck }, // Green (Accent)
  "Rejected": { color: "hsl(0, 75%, 55%)", lightColor: "hsl(0, 75%, 85%)", Icon: XCircle }, // Red
};


export const USER_ROLES: UserRole[] = ["Admin", "Back Office", "Local Area Head", "Franchise Owner", "Viewer"];

export const MOCK_SERVICES_TEMPLATES: Omit<Service, 'id' | 'status' | 'remarks' | 'completionPercentage' | 'assignedUser'>[] = [
  { name: "DPR (Detailed Project Report)" },
  { name: "UDYAM Registration" },
  { name: "GST Registration" },
  { name: "PMEGP Application" },
  { name: "Store Setup & Branding" },
  { name: "Local Body Permits" },
  { name: "Bank Loan Application" },
  { name: "FSSAI License (if applicable)" },
];

const generateAvatarUrl = (name: string) => `https://picsum.photos/seed/${name.replace(/\s+/g, '-').toLowerCase()}/40/40`;

export const MOCK_USERS: User[] = [
  { id: "user1", name: "Admin User", email: "admin@franchiseflow.com", role: "Admin", avatarUrl: generateAvatarUrl("Admin User"), dataAIHint: "person avatar" },
  { id: "user2", name: "Sarah Miller", email: "sarahm@franchiseflow.com", role: "Back Office", avatarUrl: generateAvatarUrl("Sarah Miller"), dataAIHint: "person avatar" },
  { id: "user3", name: "Deepak Sharma", email: "deepaks@example.com", role: "Local Area Head", avatarUrl: generateAvatarUrl("Deepak Sharma"), dataAIHint: "person avatar" },
  { id: "user4", name: "Priya Singh", email: "priyas@example.com", role: "Franchise Owner", avatarUrl: generateAvatarUrl("Priya Singh"), dataAIHint: "person avatar" },
  { id: "user5", name: "Amit Kumar", email: "amitk@example.com", role: "Back Office", avatarUrl: generateAvatarUrl("Amit Kumar"), dataAIHint: "person avatar" },
  { id: "user6", name: "John Doe", email: "johndoe@example.com", role: "Viewer", avatarUrl: generateAvatarUrl("John Doe"), dataAIHint: "person avatar" },
];

const generateServices = (): Service[] => {
  const availableServices = [...MOCK_SERVICES_TEMPLATES];
  const numServices = Math.floor(Math.random() * (availableServices.length - 2)) + 3; // 3 to MOCK_SERVICES_TEMPLATES.length services
  const selectedServices: Service[] = [];

  for (let i = 0; i < numServices; i++) {
    if (availableServices.length === 0) break;
    const serviceIndex = Math.floor(Math.random() * availableServices.length);
    const template = availableServices.splice(serviceIndex, 1)[0];
    
    const statuses: ServiceStatus[] = ["Pending", "In-Progress", "Completed", "Approved", "Rejected"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    let completionPercentage = 0;
    if (randomStatus === "Pending") completionPercentage = Math.floor(Math.random() * 25);
    else if (randomStatus === "In-Progress") completionPercentage = Math.floor(Math.random() * 50) + 25; // 25-74%
    else if (randomStatus === "Completed") completionPercentage = Math.floor(Math.random() * 25) + 75; // 75-99%
    else if (randomStatus === "Approved") completionPercentage = 100;
    else if (randomStatus === "Rejected") completionPercentage = Math.floor(Math.random() * 100);

    selectedServices.push({
      id: `service${Date.now()}${i}`,
      name: template.name,
      status: randomStatus,
      remarks: randomStatus === "Rejected" ? "Missing document X, please resubmit." : (Math.random() > 0.7 ? "Awaiting client feedback for final review." : ""),
      completionPercentage: completionPercentage,
      assignedUser: MOCK_USERS.filter(u => u.role === "Back Office" || u.role === "Local Area Head")[Math.floor(Math.random() * 3)].id,
    });
  }
  return selectedServices;
};

const calculateOverallStatus = (services: Service[]): ServiceStatus => {
    if (services.every(s => s.status === "Approved")) return "Approved";
    if (services.some(s => s.status === "Rejected")) return "Rejected";
    if (services.every(s => s.status === "Completed" || s.status === "Approved")) return "Completed";
    if (services.some(s => s.status === "In-Progress" || s.status === "Pending")) return "In-Progress";
    return "Pending";
};

const MOCK_CHAT_MESSAGES_CASE1: ChatMessage[] = [
  { id: "msg1-1", caseId: "case1", senderId: "user2", senderName: "Sarah Miller", message: "Just updated the DPR status to Approved. All good to go!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: "msg1-2", caseId: "case1", senderId: "user3", senderName: "Deepak Sharma", message: "Great! Store setup is also complete. This case is flying.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
  { id: "msg1-3", caseId: "case1", senderId: "user1", senderName: "Admin User", message: "Excellent work team! Mrs. Brijwani will be pleased.", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
];

const MOCK_CHAT_MESSAGES_CASE2: ChatMessage[] = [
  { id: "msg2-1", caseId: "case2", senderId: "user2", senderName: "Sarah Miller", message: "PMEGP application is with the bank. Following up with them tomorrow.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "msg2-2", caseId: "case2", senderId: "user5", senderName: "Amit Kumar", message: "Okay, I've marked the UDYAM registration as completed in the system.", timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
];


export const MOCK_CASES: Case[] = [
  {
    id: "case1",
    srNo: "GWL-001",
    ownerName: "Mrs. Karuna Brijwani",
    unitName: "M/s Radha Soami Enterprises",
    franchiseAddress: "City Center, Gwalior, Madhya Pradesh – 474001",
    promoters: "Mrs. Karuna Brijwani",
    authorizedPerson: "Mr. Ajit Singh (Manager)",
    services: [
      { id: "s1-1", name: "DPR (Detailed Project Report)", status: "Approved", remarks: "DPR finalized and submitted.", completionPercentage: 100, assignedUser: "user2" },
      { id: "s1-2", name: "UDYAM Registration", status: "Approved", remarks: "UDYAM registration obtained.", completionPercentage: 100, assignedUser: "user2" },
      { id: "s1-3", name: "GST Registration", status: "Approved", remarks: "GSTIN received.", completionPercentage: 100, assignedUser: "user2" },
      { id: "s1-4", name: "PMEGP Application", status: "Approved", remarks: "Loan sanctioned under PMEGP.", completionPercentage: 100, assignedUser: "user2" },
      { id: "s1-5", name: "Store Setup & Branding", status: "Approved", remarks: "Store live and operational.", completionPercentage: 100, assignedUser: "user3" },
    ],
    overallStatus: "Approved",
    assignedUsers: ["user2", "user3", "user1"],
    lastUpdate: "2024-03-15T10:00:00Z",
    reasonForStatus: "All services completed and store is live.",
    viewLink: "/view/public/case1_token_xyz",
    chatMessages: MOCK_CHAT_MESSAGES_CASE1,
  },
  {
    id: "case2",
    srNo: "JPR-005",
    ownerName: "Mr. Rohan Verma",
    unitName: "Verma Dry Cleaners",
    franchiseAddress: "Malviya Nagar, Jaipur, Rajasthan - 302017",
    promoters: "Mr. Rohan Verma, Mrs. Sunita Verma",
    authorizedPerson: "Mr. Rohan Verma",
    services: (() => {
        const services = generateServices();
        return services.map(s => ({...s, id: `s2-${s.id.substring(7)}`}));
    })(),
    overallStatus: "In-Progress",
    assignedUsers: ["user2", "user5"],
    lastUpdate: "2024-05-10T14:30:00Z",
    reasonForStatus: "PMEGP application pending bank approval.",
    chatMessages: MOCK_CHAT_MESSAGES_CASE2,
  },
  {
    id: "case3",
    srNo: "PUN-012",
    ownerName: "Ms. Anjali Mehta",
    unitName: "Sparkle Laundry Services",
    franchiseAddress: "Koregaon Park, Pune, Maharashtra - 411007",
    promoters: "Ms. Anjali Mehta",
    authorizedPerson: "Ms. Anjali Mehta",
    services: (() => {
        const services = generateServices();
        return services.map(s => ({...s, id: `s3-${s.id.substring(7)}`}));
    })(),
    overallStatus: "Pending",
    assignedUsers: ["user5", "user3"],
    lastUpdate: "2024-05-20T09:15:00Z",
    reasonForStatus: "Initial documents collection phase.",
    chatMessages: [],
  },
   {
    id: "case4",
    srNo: "LKO-003",
    ownerName: "Mr. Sameer Khan",
    unitName: "Khan's Quick Wash",
    franchiseAddress: "Hazratganj, Lucknow, Uttar Pradesh - 226001",
    promoters: "Mr. Sameer Khan",
    authorizedPerson: "Mr. Sameer Khan",
    services: [
        { id: "s4-1", name: "DPR (Detailed Project Report)", status: "Completed", remarks: "DPR approved.", completionPercentage: 100, assignedUser: "user2" },
        { id: "s4-2", name: "UDYAM Registration", status: "Pending", remarks: "Awaiting Aadhar link.", completionPercentage: 10, assignedUser: "user2" },
        { id: "s4-3", name: "GST Registration", status: "Pending", remarks: "PAN card details required.", completionPercentage: 5, assignedUser: "user5" },
    ],
    overallStatus: "Pending",
    assignedUsers: ["user2", "user5"],
    lastUpdate: "2024-05-22T11:00:00Z",
    reasonForStatus: "Awaiting client documentation for UDYAM and GST.",
    chatMessages: [],
  },
  {
    id: "case5",
    srNo: "IND-007",
    ownerName: "Mrs. Priya Sharma",
    unitName: "Indore Laundry Hub",
    franchiseAddress: "Vijay Nagar, Indore, Madhya Pradesh - 452010",
    promoters: "Mrs. Priya Sharma, Mr. Alok Sharma",
    authorizedPerson: "Mrs. Priya Sharma",
    services: [
        { id: "s5-1", name: "DPR (Detailed Project Report)", status: "Approved", remarks: "", completionPercentage: 100, assignedUser: "user3" },
        { id: "s5-2", name: "UDYAM Registration", status: "Approved", remarks: "", completionPercentage: 100, assignedUser: "user3" },
        { id: "s5-3", name: "GST Registration", status: "Approved", remarks: "", completionPercentage: 100, assignedUser: "user2" },
        { id: "s5-4", name: "PMEGP Application", status: "Completed", remarks: "Submitted to bank, awaiting sanction.", completionPercentage: 90, assignedUser: "user2" },
        { id: "s5-5", name: "Store Setup & Branding", status: "In-Progress", remarks: "Interior work ongoing.", completionPercentage: 60, assignedUser: "user3" },
        { id: "s5-6", name: "Bank Loan Application", status: "In-Progress", remarks: "Awaiting PMEGP sanction for final disbursement.", completionPercentage: 75, assignedUser: "user2"},
    ],
    overallStatus: "In-Progress",
    assignedUsers: ["user2", "user3"],
    lastUpdate: "2024-05-18T16:45:00Z",
    reasonForStatus: "Store setup and loan disbursement in progress.",
    chatMessages: [],
  }
].map(c => ({ ...c, overallStatus: calculateOverallStatus(c.services) }));


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
    { id: "area5", name: "Indore", stateId: "state1" },
];

export const MOCK_SERVICE_DEFINITIONS: ServiceDefinition[] = MOCK_SERVICES_TEMPLATES.map((s,i) => ({
    id: `servdef${i+1}`,
    name: s.name,
    defaultStatus: "Pending",
}));

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: "notif1", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), caseId: "case1", message: "GST status updated to Approved.", type: "update", read: false, userId: "user2" },
  { id: "notif2", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), caseId: "case2", message: "New case created.", type: "creation", read: false, userId: "user1" },
  { id: "notif3", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), caseId: "case3", message: "Deepak Sharma assigned.", type: "assign", read: true, userId: "user1" },
  { id: "notif4", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), caseId: "case5", message: "Bank Loan Application moved to In-Progress.", type: "update", read: false, userId: "user2" },
  { id: "notif5", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), message: "New user 'John Doe' added.", type: "assign", read: false, userId: "user1" }, // 'assign' type for user creation as well
  { id: "notif6", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), caseId: "case4", message: "UDYAM Registration status is Pending.", type: "update", read: true, userId: "user5" },
];


export const DEFAULT_USER_PERMISSIONS = {
  canCreateCase: false,
  canEditCase: false,
  canDeleteCase: false,
  canManageUsers: false,
  canManageSettings: false,
  canViewAllCases: false,
};

// Simplified and more logical permission structure
export const ROLE_PERMISSIONS: Record<UserRole, typeof DEFAULT_USER_PERMISSIONS> = {
  "Admin": { 
    canCreateCase: true, canEditCase: true, canDeleteCase: true, 
    canManageUsers: true, canManageSettings: true, canViewAllCases: true 
  },
  "Back Office": { 
    canCreateCase: true, canEditCase: true, canDeleteCase: false, 
    canManageUsers: false, canManageSettings: false, canViewAllCases: true  // Can view all cases they are part of or all, TBD
  },
  "Local Area Head": { 
    canCreateCase: false, canEditCase: true, canDeleteCase: false, 
    canManageUsers: false, canManageSettings: false, canViewAllCases: true // Can view cases in their area
  },
  "Franchise Owner": { // Can only view their own case(s) - logic handled by filtering
    canCreateCase: false, canEditCase: false, canDeleteCase: false, 
    canManageUsers: false, canManageSettings: false, canViewAllCases: false 
  },
  "Viewer": { // Can only view specific shared case(s) - logic handled by filtering/token
    canCreateCase: false, canEditCase: false, canDeleteCase: false, 
    canManageUsers: false, canManageSettings: false, canViewAllCases: false 
  },
};

export { generateAvatarUrl };
