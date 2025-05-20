import type { Case } from "@/types/franchise";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/dashboard/status-indicator";
import { MOCK_USERS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Link as LinkIcon,
  Eye,
  CalendarDays,
  User,
  Users,
  Trash,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store"; // adjust path as per your project structure
import { useAppDispatch } from "../../hooks/hooks"; // your typed useDispatch
import { fetchCurrentUser } from "../../features/userSlice";
import { useState, useEffect } from "react";

interface CaseCardProps {
  caseData: Case;
  onDelete?: (caseId: string) => void; // new optional prop
}
export default function CaseCard({ caseData, onDelete }: CaseCardProps) {
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

  const handleDeleteClick = () => {
    if (onDelete) {
      if (window.confirm("Are you sure you want to delete this case?")) {
        onDelete(caseData.id);
      }
    }
  };

  const assignedUserObjects = caseData.assignedUsers
    .map((userId) => MOCK_USERS.find((u) => u.id === userId))
    .filter(Boolean);

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
          <StatusIndicator status={caseData.status} showText />
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
        <div className="flex items-start gap-2 text-muted-foreground">
          <Users className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex flex-col text-sm text-muted-foreground">
            {caseData.assignedUsers?.length ? (
              caseData.assignedUsers.map((user, index) => {
                const userName =
                  typeof user === "string"
                    ? user.trim()
                    : user?.name?.trim() || "Unknown";
                const formattedName =
                  userName.length > 0
                    ? userName.charAt(0).toUpperCase() +
                      userName.slice(1).toLowerCase()
                    : "Unknown";
                return <span key={index}>{formattedName}</span>;
              })
            ) : (
              <span>N/A</span>
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
          {isAdmin || permissions?.canCreate || permissions?.canAssignTasks ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleGenerateLink(caseData)}
              aria-label="Share Case"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          ) : null}

          {/* Edit button */}
          {isAdmin || permissions?.canEdit ? (
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
          {isAdmin || permissions?.canDelete ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(caseData.id)}
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
