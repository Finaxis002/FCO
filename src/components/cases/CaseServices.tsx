import React, { useState } from "react";
import { SERVICE_STATUS, STATUS_COLORS } from "@/lib/statusConfig";
import { Progress } from "@/components/ui/progress";
import ServiceRemarks from "./ServiceRemarks";
import { useAppDispatch } from "../../hooks/hooks";
import { updateCase } from "../../features/caseSlice";
import { useToast } from "@/hooks/use-toast";
import type { CaseStatus, Service, ServiceStatus } from "@/types/franchise"; // wherever it is declared

interface CaseServicesProps {
  caseId: string;
  caseName?: string;
  unitName?: string;
  services: Service[];
  overallStatus: string;
  overallCompletionPercentage: number;
  currentUser: any;
  onUpdate?: () => void;
}

const statusStyles: Record<string, string> = {
  "To be Started":
    "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 text-xs",
  "Detail Required":
    "bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 text-xs",
  "In-Progress":
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900 text-xs", // Fixed
  Completed:
    "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 text-xs",
};

const CaseServices: React.FC<CaseServicesProps> = ({
  caseId,
  caseName,
  unitName,
  services,
  overallStatus,
  overallCompletionPercentage,
  currentUser,
  onUpdate,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [localServices, setLocalServices] = useState(services);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingServices, setUpdatingServices] = useState<
    Record<string, boolean>
  >({});

  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleStatusChange = (serviceId: string, newStatus: string) => {
    // If overallCompletionPercentage > 50 and newStatus is 'To be Started' (aka New-Case), block update
    if (
      overallCompletionPercentage > 50 &&
      (newStatus === SERVICE_STATUS.TO_BE_STARTED || newStatus === "New-Case")
    ) {
      toast({
        title: "Action Not Allowed",
        description:
          "Cannot change status to 'To be Started' because the overall completion is already above 50%.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI update for service status
    setUpdatingServices((prev) => ({ ...prev, [serviceId]: true }));

    const updatedServices = localServices.map((service) =>
      service.id === serviceId
        ? { ...service, status: newStatus as ServiceStatus }
        : service
    );

    setLocalServices(updatedServices);

    // If any service status changed to In-Progress, set overallStatus to In-Progress
    let newOverallStatus = overallStatus;
    if (newStatus === SERVICE_STATUS.IN_PROGRESS) {
      newOverallStatus = SERVICE_STATUS.IN_PROGRESS;
    }

    const updatePayload = {
      id: caseId,
      services: updatedServices,
      overallCompletionPercentage,
      overallStatus: newOverallStatus as CaseStatus, // Cast here
      name: caseName || unitName || "", // <-- always a string
      unitName: unitName || caseName || "",
      updatedAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    };

    dispatch(updateCase(updatePayload))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Service status updated successfully.",
        });
        if (onUpdate) onUpdate(); // Notify parent to refetch updated data
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to update service status.",
          variant: "destructive",
        });
        setLocalServices(services); // revert on failure
      })
      .finally(() => {
        setIsUpdating(false);
        setUpdatingServices((prev) => ({ ...prev, [serviceId]: false }));
      });
  };

  console.log(overallCompletionPercentage);

  const visibleServices = showAll ? localServices : localServices.slice(0, 3);
  const displayCaseName = caseName || unitName || "Case Details";

  let progressValue = 0;

  if (overallStatus === "New-Case") {
    progressValue = 0;
  } else if (
    overallStatus === "In-Progress" &&
    (!overallCompletionPercentage || overallCompletionPercentage < 50)
  ) {
    progressValue = 50;
  } else {
    progressValue = overallCompletionPercentage;
  }

  const userRole = localStorage.getItem("userRole");

  return (
    <div>
      {/* Overall Progress Bar */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{displayCaseName}</h3>
        </div>
        <Progress
          value={progressValue}
          aria-label={`Overall case completion ${progressValue}%`}
          className="h-3 rounded"
          style={
            {
              backgroundColor: ` "#00a4fc"}33`,
              "--indicator-color": "#00a4fc",
            } as React.CSSProperties
          }
          indicatorClassName="bg-[var(--indicator-color)]"
        />
        <p
          className="text-xs text-right mt-1 font-medium"
          style={{ color: "#02527d" }}
        >
          {progressValue.toFixed(2)}% Complete
        </p>
      </div>

      {/* Services List */}
      <ul className="space-y-4">
        {visibleServices.map((service) => (
          <li
            key={service.id}
            className="p-3 border rounded-lg shadow-xs bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-md">{service.name}</h4>
              <select
                disabled={isUpdating}
                value={service.status}
                onChange={(e) => handleStatusChange(service.id, e.target.value)}
                className={`cursor-pointer rounded-2xl px-3 py-1 font-semibold border ${
                  statusStyles[service.status] ||
                  "bg-blue-100 text-blue-800 border-gray-300 text-xs"
                }`}
              >
                {Object.values(SERVICE_STATUS).map((statusOption) => (
                  <option
                    key={statusOption}
                    value={statusOption}
                    className={`${
                      statusStyles[statusOption] || "bg-white text-black"
                    }`}
                  >
                    {statusOption}
                  </option>
                ))}
              </select>
            </div>
            {service.remarks && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                <strong>Remarks:</strong> {service.remarks}
              </p>
            )}
            {userRole && (
              <ServiceRemarks
                caseId={caseId}
                serviceId={service.id}
                currentUser={currentUser}
                serviceName={service.name}
              />
            )}
          </li>
        ))}
      </ul>

      {/* Show More / Less Button */}
      {localServices.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition"
        >
          {showAll ? "View Less Services" : "View More Services"}
        </button>
      )}
    </div>
  );
};

export default CaseServices;
