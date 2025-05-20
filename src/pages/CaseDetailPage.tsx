import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  MOCK_USERS,
  STATUS_CONFIG,
  APP_NAME,
} from "@/lib/constants";
import type { Case, Service, User, ChatMessage } from "@/types/franchise";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusIndicator from "@/components/dashboard/status-indicator";
import {
  ArrowLeft,
  Users as UsersIcon,
  Briefcase,
  Info,
  CalendarDays,
  FileText,
  Building2,
  MessageSquare,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import CaseChat from "@/components/cases/case-chat"; // Import CaseChat

function getFormattedDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | undefined | null>(null); // null for loading state
  const [loading, setLoading] = useState<boolean>(true);
 const currentUser = JSON.parse(
  localStorage.getItem("user") || "{}"
) as User ;

  console.log("logged in user / current user", currentUser)

  useEffect(() => {
    if (caseData && caseData.unitName) {
      document.title = `Case: ${caseData.unitName} | ${APP_NAME}`;
    } else if (caseData === undefined) {
      document.title = `Case Not Found | ${APP_NAME}`;
    }
  }, [caseData]);

  useEffect(() => {
    const fetchCaseById = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/cases/${caseId}`
        );
        if (!response.ok) {
          setCaseData(undefined);
        } else {
          const result = await response.json();
          setCaseData(result);
        }
      } catch (err) {
        setCaseData(undefined);
      }
      setLoading(false);
    };

    if (caseId) fetchCaseById();
  }, [caseId]);

  const handleSendMessage = (messageText: string) => {
    if (!caseData || !caseId) return;

    const newMessage: ChatMessage = {
      id: `msg-${caseId}-${Date.now()}`,
      caseId: caseId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    setCaseData((prevCaseData) => {
      if (!prevCaseData) return prevCaseData;
      return {
        ...prevCaseData,
        chatMessages: [...(prevCaseData.chatMessages || []), newMessage],
      };
    });
  };

  if (loading || caseData === null) {
    return (
      <>
        <PageHeader
          title="Loading Case Details..."
          description="Please wait while we fetch the case information."
        >
          <Button asChild variant="outline">
            <RouterLink to="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Cases
            </RouterLink>
          </Button>
        </PageHeader>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-28 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>{" "}
            {/* Chat Skeleton */}
          </div>
        </div>
      </>
    );
  }

  if (caseData === undefined) {
    return (
      <>
        <PageHeader
          title="Case Not Found"
          description="The requested case could not be found."
        />
        <div className="text-center">
          <p className="mb-4">
            The case with ID "{caseId}" does not exist or you do not have
            permission to view it.
          </p>
          <Button asChild>
            <RouterLink to="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Cases
            </RouterLink>
          </Button>
        </div>
      </>
    );
  }

  const assignedUserObjects = (caseData.assignedUsers ?? [])
    .filter(
      (user): user is { userId: string; _id: string; name?: string; avatarUrl?: string } =>
        typeof user === "object" && user !== null && "userId" in user && "_id" in user
    )
    .map((user) => ({
      id: user.userId,
      name: user.name,
      role: "Team Member",
      avatarUrl: user.avatarUrl || "",
    }));

  return (
    <>
      <PageHeader
        title={`Case Details: ${caseData.unitName}`}
        description={`SRN: ${caseData.srNo}`}
      >
        <Button asChild variant="outline">
          <RouterLink to="/cases">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Cases
          </RouterLink>
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Franchise & Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <strong>Unit Name:</strong> {caseData.unitName}
                </div>
                <div>
                  <strong>Owner Name:</strong> {caseData.ownerName}
                </div>
                <div className="sm:col-span-2">
                  <strong>Franchise Address:</strong>{" "}
                  {caseData.franchiseAddress}
                </div>
                <div>
                  <strong>Promoters:</strong> {caseData.promoters || "N/A"}
                </div>
                <div>
                  <strong>Authorized Person:</strong>{" "}
                  {caseData.authorizedPerson || "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" />
                Compliance Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.services.length > 0 ? (
                <ul className="space-y-4">
                  {caseData.services.map((service: Service) => {
                    const statusConfig =
                      STATUS_CONFIG[service.status] || STATUS_CONFIG.Pending;
                    const serviceAssignedUser = MOCK_USERS.find(
                      (u) => u.id === service.assignedUser
                    );
                    return (
                      <li
                        key={service.id}
                        className="p-3 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-md">
                            {service.name}
                          </h4>
                          <StatusIndicator
                            status={service.status}
                            showText={true}
                          />
                        </div>
                        <div className="mb-2">
                          <Progress
                            value={service.completionPercentage}
                            aria-label={`${service.name} completion ${service.completionPercentage}%`}
                            className="h-2"
                            style={
                              {
                                backgroundColor: statusConfig.lightColor,
                                "--indicator-color": statusConfig.color,
                              } as React.CSSProperties
                            }
                            indicatorClassName="bg-[var(--indicator-color)]"
                          />
                          <p
                            className="text-xs text-right mt-1"
                            style={{ color: statusConfig.color }}
                          >
                            {service.completionPercentage}% Complete
                          </p>
                        </div>
                        {service.remarks && (
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                            <strong>Remarks:</strong> {service.remarks}
                          </p>
                        )}
                        {serviceAssignedUser && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <strong>Assigned to:</strong>{" "}
                            {serviceAssignedUser.name}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No services listed for this case.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Overall Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <StatusIndicator
                  status={caseData.status ?? "Pending"}
                  showText={true}
                  className="text-sm px-3 py-1"
                />
              </div>
              {caseData.reasonForStatus && (
                <div>
                  <p className="text-sm font-medium mb-1">Reason/Note:</p>
                  <p className="text-xs p-2 bg-muted/50 rounded-md border text-muted-foreground">
                    {caseData.reasonForStatus}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />{" "}
                  Last Updated:
                </p>
                <p className="text-sm text-foreground">
                  {getFormattedDate(caseData.lastUpdate)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-primary" />
                Assigned Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedUserObjects.length > 0 ? (
                <ul className="space-y-3">
                  {assignedUserObjects.map((user) => (
                    <li key={user.id} className="flex items-center gap-3">
                      <img
                        src={
                          user.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name || ""
                          )}&background=random`
                        }
                        alt={user.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                        data-ai-hint="user avatar"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No users assigned to this case.
                </p>
              )}
            </CardContent>
          </Card>

          {caseData.viewLink && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Public View Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  A shareable link for external viewers (if applicable).
                </p>
                <Button variant="outline" asChild className="w-full">
                  <RouterLink
                    to={caseData.viewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Public Link
                  </RouterLink>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Team Chat Section */}
      <div className="mt-6">
        {caseData && caseId && (
          <CaseChat
            caseId={caseId}
            currentUser={currentUser}
            assignedUsers={(caseData.assignedUsers || []).map((user: any) => ({
              id: user.userId,
              name: user.name,
              email: user.email || "",
              avatarUrl: user.avatarUrl || "",
              role: user.role || "Team Member",
            }))}
          />
        )}
      </div>
    </>
  );
}
