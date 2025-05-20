export type ServiceStatus =
  | "Pending"
  | "In-Progress"
  | "Completed"
  | "Approved"
  | "Rejected";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  remarks: string;
  completionPercentage: number;
  assignedUser?: string; // User ID
}

export interface ChatMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string; // ISO string
}

export interface Case {
  id: string;
  srNo: string;
  ownerName: string;
  unitName: string; // Project Name
  franchiseAddress: string;
  promoters: string;
  authorizedPerson: string;
  services: Service[];
  overallStatus: ServiceStatus; // Can be derived or manually set
  assignedUsers: string[]; // User IDs for back office, local area head etc.
  viewLink?: string; // Optional link for external viewers
  lastUpdate: string; // Timestamp or formatted date string
  reasonForStatus?: string; // For PMEGP status or other specific reasons
  chatMessages?: ChatMessage[];
}

export type UserRole =
  | "Admin"
  | "Back Office"
  | "Local Area Head"
  | "Franchise Owner"
  | "Viewer";

export interface User {
  _id?: string; // MongoDB ID
  id?: string; // Alternative ID field
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  dataAIHint?: string;
  permissions?: {
    canCreateCase?: boolean;
    canEditCase?: boolean;
    canDeleteCase?: boolean;
    canManageUsers?: boolean;
    canManageSettings?: boolean;
    canViewAllCases?: boolean;
  };
  assignedCases?: string[];
}

export interface AppNotification {
  _id?: string; // ✅ Add this if you're using MongoDB
  timestamp: string;
  userId?: string; // User who performed action or is target of notification
  caseId?: string;
  message: string;
  type: "update" | "creation" | "deletion" | "assign"; // 'assign' can be for user to case, or new user creation
  read: boolean;
  id?: string; // Optional: depending on your fallback logic
  srNo: string;
  unitName: string;
  ownerName: string;
  franchiseAddress: string;
  promoters?: string;
  authorizedPerson?: string;
  services: any[];
  assignedUsers: string[];
  reasonForStatus?: string;
  overallStatus: string;
  lastUpdate?: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  dataAIHint?: string;
  user?: string;
}

// For "Advanced Section"
export interface StateItem {
  id: string;
  name: string;
}

export interface AreaItem {
  id: string;
  name: string;
  stateId: string; // Link to StateItem
}

export interface ServiceDefinition {
  // For managing available services
  id: string;
  name: string;
  defaultStatus: ServiceStatus;
}

// For dashboard filtering options, extending ServiceStatus for convenience
export type DashboardFilterStatus = ServiceStatus | "Total" | "Rejected";
