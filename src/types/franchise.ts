export type ServiceStatus = "Pending" | "In-Progress" | "Completed" | "Approved" | "Rejected";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  remarks: string;
  completionPercentage: number;
  assignedUser?: string; // User ID
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
}

export type UserRole = "Admin" | "Back Office" | "Local Area Head" | "Franchise Owner" | "Viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  dataAIHint?: string; // Optional hint for AI image generation/search
  // Permissions can be more granular if needed
  permissions?: {
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
  };
  assignedCases?: string[]; // Case IDs
}

export interface AppNotification {
  id: string;
  timestamp: string;
  userId?: string; // User who performed action or is target of notification
  caseId?: string;
  message: string;
  type: "update" | "creation" | "deletion" | "assign";
  read: boolean;
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

export interface ServiceDefinition { // For managing available services
  id: string;
  name: string;
  defaultStatus: ServiceStatus;
}
