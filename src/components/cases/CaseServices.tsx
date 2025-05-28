import React, { useState, useEffect, useRef } from "react";
import { SERVICE_STATUS, STATUS_COLORS } from "@/lib/statusConfig";
import { Progress } from "@/components/ui/progress";
import ServiceRemarks from "./ServiceRemarks";
import { useAppDispatch } from "../../hooks/hooks";
import { updateCase } from "../../features/caseSlice";
import { useToast } from "@/hooks/use-toast";
import type { CaseStatus, Service, ServiceStatus } from "@/types/franchise"; // wherever it is declared
import { useSelector } from "react-redux";
import type { RootState } from "../../store"; // adjust path as per your project
import { fetchPermissions } from "@/features/permissionsSlice";

interface CaseServicesProps {
  caseId: string;
  caseName?: string;
  unitName?: string;
  services: Service[];
  overallStatus: string;
  overallCompletionPercentage: number;
  currentUser: any;
  onUpdate?: () => void;
  onRemarkRead?: (serviceId: string, userId: string) => void;
  highlightServiceId?: string;
  allRemarks: Array<{
    serviceId: string;
    readBy: string[]; // ✅ fixed from read: boolean
  }>;
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
  onRemarkRead, // ✅ Add this missing line
  highlightServiceId,
  allRemarks = [],
}) => {

  // const [showAll, setShowAll] = useState(false);
  const [showAll, setShowAll] = useState(() => !!highlightServiceId);

  const [localServices, setLocalServices] = useState(services);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingServices, setUpdatingServices] = useState<
    Record<string, boolean>
  >({});

  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const serviceRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // In your component
  useEffect(() => {
    // Pass any required argument to fetchPermissions, e.g., currentUser or caseId if needed
    dispatch(fetchPermissions(currentUser?.id)); // Replace with the correct argument as per your fetchPermissions definition
  }, [dispatch, currentUser]);

  // Access permissions from Redux state
  const permissions = useSelector((state: RootState) => state.permissions);

  useEffect(() => {
    if (highlightServiceId) {
      setShowAll(true);
    }
  }, [highlightServiceId]);

  const handleStatusChange = (serviceId: string, newStatus: string) => {
    setUpdatingServices((prev) => ({ ...prev, [serviceId]: true }));

    const updatedServices = localServices.map((service) =>
      service.id === serviceId
        ? { ...service, status: newStatus as ServiceStatus }
        : service
    );

    setLocalServices(updatedServices);

    // Calculate new overall status
    let newOverallStatus: CaseStatus = "New-Case";
    const allCompleted = updatedServices.every((s) => s.status === "Completed");
    const anyInProgressOrCompleted = updatedServices.some(
      (s) => s.status === "In-Progress" || s.status === "Completed"
    );

    if (allCompleted) {
      newOverallStatus = "Completed";
    } else if (anyInProgressOrCompleted) {
      newOverallStatus = "In-Progress";
    }

    // Calculate completion percentage
    const completedServices = updatedServices.filter(
      (s) => s.status === "Completed"
    ).length;
    const newCompletionPercentage = Math.round(
      (completedServices / updatedServices.length) * 100
    );

    const updatePayload = {
      id: caseId,
      services: updatedServices,
      overallCompletionPercentage: newCompletionPercentage,
      overallStatus: newOverallStatus,
      status: newOverallStatus,
      name: caseName || unitName || "",
      unitName: unitName || caseName || "",
      updatedAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      readBy: [],
    };

    dispatch(updateCase(updatePayload))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Service status updated successfully.",
        });
        if (onUpdate) onUpdate();
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

  // console.log(overallCompletionPercentage);

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
  console.log("prrmissions", permissions);

  useEffect(() => {
    if (!highlightServiceId) return;

    // Delay scroll until next paint
    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        const element = serviceRefs.current[highlightServiceId];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          console.log(`✅ Scrolled to service ID: ${highlightServiceId}`);

          element.classList.add("animate-pulse", "bg-blue-50");
          setTimeout(() => {
            element.classList.remove("animate-pulse", "bg-blue-50");
          }, 3000);
        } else {
          console.warn(
            `⚠️ Element not found for service ID: ${highlightServiceId}`
          );
        }
      });
    }, 200); // Slight delay to allow any re-renders

    return () => clearTimeout(timeout);
  }, [highlightServiceId, localServices]);

  const isAdmin = userRole === "Admin" || userRole === "Super Admin";

  const canEdit = isAdmin || (permissions?.permissions?.edit ?? false);

  console.log("isAdmin", isAdmin);
  console.log("canEdit", canEdit);

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
        {visibleServices.map((service) => {
          // Filter remarks belonging to this service and are unread
          const unreadRemarkCount = allRemarks.filter(
            (r) =>
              r.serviceId === service.id && !r.readBy?.includes(currentUser?.id)
          ).length;

          console.log(
            `Service: ${service.name} (ID: ${service.serviceId}), Unread Remark Count: ${unreadRemarkCount}`
          );

          return (
            <li
              id={`service-${service.serviceId}`}
              key={service.id}
              ref={(el) => {
                if (el) serviceRefs.current[service.id] = el;
              }}
              className={`p-3 border rounded-lg shadow-xs bg-card hover:shadow-md transition-shadow ${
                highlightServiceId === service.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-md">{service.name}</h4>

                  {/* Show badge only if unread remarks exist */}
                  {unreadRemarkCount > 0 && userRole && (
                    <span className="inline-flex items-center justify-center text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      {unreadRemarkCount} unread remark
                      {unreadRemarkCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <select
                  value={service.status}
                  onChange={(e) => {
                    if (canEdit) {
                      handleStatusChange(service.id, e.target.value);
                    } else {
                      toast({
                        title: "Permission Denied",
                        description:
                          "You are a Viewer and cannot change the service status.",
                        variant: "destructive",
                      });
                      // Reset select value to current status (optional)
                      e.target.value = service.status;
                    }
                  }}
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

              {/* Optionally display remarks text if needed - comment out if redundant */}
              {/* {remarkCount > 0 && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
            <strong>Remarks Count:</strong> {remarkCount}
          </p>
        )} */}

              <ServiceRemarks
                caseId={caseId}
                serviceId={service.id}
                currentUser={currentUser}
                serviceName={service.name}
                onRemarkRead={onRemarkRead} // ✅ added
              />
            </li>
          );
        })}
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
