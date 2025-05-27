"use client"; // This directive is not strictly necessary in Vite but doesn't harm.

import type { Case } from "@/types/franchise";
import { useSelector } from "react-redux";
import type { RootState } from "../../store"; // adjust path as per your project

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Edit, Link as LinkIcon, Eye, Trash } from "lucide-react";
import { Link as RouterLink } from "react-router-dom"; // Changed import
import { MOCK_USERS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react"; // Import React
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useAppDispatch } from "../../hooks/hooks"; // your typed useDispatch
import { fetchCurrentUser } from "../../features/userSlice";


const statusStyles: Record<string, string> = {
  "New-Case":
    "bg-blue-100 text-blue-800 hover:!bg-blue-200 hover:!text-blue-900",

  "In-Progress":
    "bg-yellow-100 text-yellow-800 hover:!bg-yellow-200 hover:!text-yellow-900",
  Completed:
    "bg-green-100 text-green-800 hover:!bg-green-200 hover:!text-green-900",
  Rejected: "bg-red-100 text-red-800 hover:!bg-red-200 hover:!text-red-900",
  Approved:
    "bg-purple-100 text-purple-800 hover:!bg-purple-200 hover:!text-purple-900",
};

interface CaseCardViewProps {
  cases: Case[]; // array of Case objects
  onDelete: (caseId: string) => void; // function called when delete happens
}

export default function CaseCardView({ cases, onDelete }: CaseCardViewProps) {
  const { toast } = useToast();
  const [displayCases, setDisplayCases] = useState<Case[]>(cases);
  const [lastUpdateDisplayCache, setLastUpdateDisplayCache] = useState<
    Record<string, string>
  >({});

  const [caseStatuses, setCaseStatuses] = useState<Record<string, string>>(
    () => {
      const initialStatuses: Record<string, string> = {};
      cases.forEach((c: Case) => {
        if (!c.id) return;
        initialStatuses[c.id] = c.status || c.status || "New-Case";
      });

      return initialStatuses;
    }
  );

  const permissions = useSelector(
    (state: RootState) => state.users.permissions
  );

  const userRole = localStorage.getItem("userRole");

  const isAdmin = userRole === "Admin" || userRole === "Super Admin";

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    const updatedStatuses: Record<string, string> = {};
    cases.forEach((c: Case) => {
      if (c.id) {
        updatedStatuses[c.id] = c.status || c.status || "";
      }
    });
    setCaseStatuses(updatedStatuses);
  }, [cases]);

  const allowedStatuses = ["New-Case", "In-Progress", "Completed", "Rejected"];

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    // Check if userRole is "Viewer" - block change
    if (userRole === "Viewer") {
      toast({
        title: "Permission Denied",
        description: "You are a Viewer and can not change the case status.",
        variant: "destructive",
      });
      // Reset the select dropdown to current status (don't update UI)
      setCaseStatuses((prev) => ({
        ...prev,
        [caseId]:
          displayCases.find((c) => c.id === caseId)?.status || "New-Case",
      }));
      return; // Stop further processing
    }
    try {
      const currentCase = displayCases.find((c) => c.id === caseId);
      if (!currentCase) {
        toast({
          title: "Error",
          description: "Case not found.",
          variant: "destructive",
        });
        return;
      }

      // Prevent changing to "New-Case" if overallCompletionPercentage > 50
      if (
        newStatus === "New-Case" &&
        (currentCase.overallCompletionPercentage ?? 0) > 50
      ) {
        toast({
          title: "Invalid Status Change",
          description:
            "Can not change status to 'New-Case' when completion is above 50%.",
          variant: "destructive",
        });
        // Reset select value to current status
        setCaseStatuses((prev) => ({
          ...prev,
          [caseId]: currentCase.status || "",
        }));
        return;
      }

      setCaseStatuses((prev) => ({ ...prev, [caseId]: newStatus }));
      console.log(`Updating status for case ${caseId} to ${newStatus}`);

      // Prepare payload
      const payload: any = { status: newStatus };

      if (newStatus === "In-Progress") {
        payload.overallStatus = "In-Progress";
      }

      const response = await axios.put(
        `https://fcobackend-23v7.onrender.com/api/cases/${caseId}`,
        payload
      );

      console.log("API response:", response.data);

      setDisplayCases((prev: Case[]) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                status: newStatus as Case["status"],
                // Update overallStatus only if newStatus is In-Progress
                overallStatus:
                  newStatus === "In-Progress" ? "In-Progress" : c.overallStatus,
              }
            : c
        )
      );

      toast({
        title: "Status Updated",
        description: `Case status updated to "${newStatus}".`,
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update case status. Please try again.",
        variant: "destructive",
      });

      setCaseStatuses((prev) => ({
        ...prev,
        [caseId]: cases.find((c: Case) => c.id === caseId)?.status || "",
      }));
    }
  };

  const sortedCases = [...cases].sort(
    (a, b) => Number(a.srNo) - Number(b.srNo)
  );

  useEffect(() => {
    // This effect is client-side only
    const newCache: Record<string, string> = {};
    cases.forEach((caseData) => {
      if (caseData.lastUpdate) {
        newCache[caseData.id ?? ""] = new Date(
          caseData.lastUpdate
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        newCache[caseData.id ?? ""] = "N/A";
      }
    });
    setLastUpdateDisplayCache(newCache);
  }, [cases]);

  const handleGenerateLink = (caseData: Case) => {
    const viewLink =
      caseData.viewLink ||
      `/client/cases/${caseData.id}?token=${Math.random()
        .toString(36)
        .substring(7)}`;
    // Ensure window and navigator are available (standard for client-side)
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

  if (displayCases.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
            <p className="text-xl font-semibold text-muted-foreground">
              No cases found.
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or add a new case.
            </p>
            <Button asChild className="mt-4">
              <RouterLink to="/cases/new">
                {" "}
                {/* Changed Link */}
                Add New Case
              </RouterLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    setDisplayCases(cases);
  }, [cases]);

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">SR No.</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Owner Name</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[180px]">Last Update</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCases.map((caseData: Case) => {
              const lastUpdateDisplay =
                lastUpdateDisplayCache[caseData.id ?? ""] || "Loading...";

              const displayStatus =
                caseStatuses[caseData.id ?? ""] ||
                caseData.status ||
                "New-Case";

              return (
                <TableRow
                  key={caseData.id}
                  data-testid={`case-row-${caseData.id}`}
                >
                  <TableCell className="font-medium">{caseData.srNo}</TableCell>
                  <TableCell>{caseData.unitName}</TableCell>
                  <TableCell>{caseData.ownerName}</TableCell>
                  <TableCell>
                    <Select
                      value={displayStatus}
                      onValueChange={(value) =>
                        handleStatusChange(caseData.id ?? "", value)
                      }
                    >
                      <SelectTrigger
                        className={`w-[150px] rounded-md case-table ${
                          statusStyles[caseStatuses[caseData.id ?? ""]] || ""
                        }`}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        {allowedStatuses.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className={`flex items-center rounded-md px-2 py-1 ${statusStyles[status]}`}
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>{lastUpdateDisplay}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
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
                          return (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 whitespace-nowrap shadow-sm hover:bg-gray-200 transition cursor-default"
                              title={formattedName}
                            >
                              {formattedName}
                            </span>
                          );
                        })
                      ) : (
                        <span className="italic text-gray-400">N/A</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{`${caseData.overallCompletionPercentage.toFixed(
                    2
                  )}%`}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {/* View button - assuming everyone can view */}
                      {isAdmin || permissions?.viewRights ? (
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          aria-label="View Case Details"
                        >
                          <RouterLink
                            to={`/cases/${
                              ((caseData as any)._id ?? caseData.id) as string
                            }`}
                          >
                            <Eye className="h-4 w-4" />
                          </RouterLink>
                        </Button>
                      ) : null}

                      {/* Share button */}
                      
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleGenerateLink(caseData)}
                          aria-label="Share Case"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                    

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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
