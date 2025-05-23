import type { Case } from "@/types/franchise";
import { Link as RouterLink } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Link as LinkIcon,
  Eye,
  CalendarDays,
  User,
  Users,
  Trash,
  PercentSquare,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store"; // adjust path as per your project structure
import { useAppDispatch } from "../../hooks/hooks"; // your typed useDispatch
import { fetchCurrentUser } from "../../features/userSlice";
import { useState, useEffect } from "react";
import axios from "axios";

export interface CaseCardViewProps {
  cases: Case[];
  onDelete?: (caseId: string) => void | Promise<void>; // add this line
}

interface CaseCardProps {
  caseData: Case;
  onDelete?: (caseId: string) => void; // new optional prop
}

const statusStyles: Record<string, string> = {
  "New-Case": "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900",
  "In-Progress":
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900",
  Completed:
    "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900",
  Rejected: "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900",
  Approved:
    "bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900",
};

const allowedStatuses = ["New-Case", "In-Progress", "Completed", "Rejected"];

export default function CaseCard({ caseData, onDelete }: CaseCardProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(
    caseData.status || "New-Case"
  );
  const [updating, setUpdating] = useState(false);

  const { toast } = useToast();
  const [lastUpdateDisplay, setLastUpdateDisplay] =
    useState<string>("Loading...");

  const dispatch = useAppDispatch();

  const userRole = localStorage.getItem("userRole");

  const isAdmin = userRole === "Admin" || userRole === "Super Admin";

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const permissions = useSelector(
    (state: RootState) => state.users.permissions
  );

  useEffect(() => {
    if (caseData.lastUpdate) {
      setLastUpdateDisplay(
        new Date(caseData.lastUpdate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    } else {
      setLastUpdateDisplay("N/A");
    }
  }, [caseData.lastUpdate]);

  const handleGenerateLink = () => {
    const viewLink =
      caseData.viewLink ||
      `/view/case/${caseData.id}?token=${Math.random()
        .toString(36)
        .substring(7)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${viewLink}`);
      toast({
        title: "Link Generated & Copied!",
        description: "Viewer link copied to clipboard.",
      });
    } else {
      toast({
        title: "Clipboard Error",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Prevent invalid change (optional)
    if (
      newStatus === "New-Case" &&
      (caseData.overallCompletionPercentage ?? 0) > 50
    ) {
      toast({
        title: "Invalid Status Change",
        description:
          "Cannot change status to 'New-Case' when completion is above 50%.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStatus(newStatus);
    setUpdating(true);

    try {
      const payload: any = { status: newStatus };

      if (newStatus === "In-Progress") {
        payload.overallStatus = "In-Progress";
      }

      await axios.put(
        `https://fcobackend-23v7.onrender.com/api/cases/${caseData.id}`,
        payload
      );

      toast({
        title: "Status Updated",
        description: `Case status updated to "${newStatus}".`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update case status. Please try again.",
        variant: "destructive",
      });
      // Revert UI status on failure
      setCurrentStatus(caseData.status || "New-Case");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            <RouterLink
              to={`/cases/${caseData.id}`}
              className="hover:underline"
            >
              {caseData.unitName}
            </RouterLink>
          </CardTitle>
          {isAdmin || permissions?.edit ? (
            <Select
              value={currentStatus}
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger
                className={`w-[150px] rounded-md ${
                  statusStyles[currentStatus] || ""
                }`}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className={`flex items-center rounded-md px-2 py-1 ${
                      statusStyles[status] || ""
                    }`}
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div
              className={`inline-block px-3 py-1 rounded-md text-center ${
                statusStyles[currentStatus] || ""
              }`}
            >
              {currentStatus}
            </div>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
          SRN: {caseData.srNo}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4 shrink-0" />
          <span>{caseData.ownerName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>Last Update: {lastUpdateDisplay}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <PercentSquare className="h-4 w-4 shrink-0" />
          <span>Progress: {`${caseData.overallCompletionPercentage.toFixed(2)}%`}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <Users className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-2 text-sm">
            {caseData.assignedUsers?.length ? (
              (caseData.assignedUsers as (string | { name?: string })[]).map(
                (user, index) => {
                  const userName =
                    typeof user === "string"
                      ? user.trim()
                      : user?.name?.trim() || "Unknown";
                  const formattedName =
                    userName.length > 0
                      ? userName.charAt(0).toUpperCase() +
                        userName.slice(1).toLowerCase()
                      : "Unknown";
                  return (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 whitespace-nowrap shadow-sm hover:bg-blue-200 transition cursor-default"
                      title={formattedName}
                    >
                      {formattedName}
                    </span>
                  );
                }
              )
            ) : (
              <span className="italic text-gray-400">N/A</span>
            )}
          </div>
        </div>

        
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full justify-end gap-2">
          {/* View button - usually everyone can view */}
          <Button
            variant="outline"
            size="sm"
            asChild
            aria-label="View Case Details"
          >
            <RouterLink to={`/cases/${caseData.id}`}>
              <Eye className="h-4 w-4 mr-1.5" />
            </RouterLink>
          </Button>

          {/* Share button */}
          {isAdmin || permissions?.createCaseRights ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleGenerateLink}
              aria-label="Share Case"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          ) : null}

          {/* Edit button */}
          {isAdmin || permissions?.edit ? (
            <Button
              variant="outline"
              size="icon"
              asChild
              aria-label="Edit Case"
            >
              <RouterLink to={`/cases/${caseData.id}/edit`}>
                <Edit className="h-4 w-4" />
              </RouterLink>
            </Button>
          ) : null}

          {/* Delete button */}
          {isAdmin || permissions?.delete ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete && onDelete(caseData.id!)}
              aria-label="Delete Case"
              className="text-red-600 hover:text-red-800"
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
