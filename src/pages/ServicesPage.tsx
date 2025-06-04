import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { getCases, updateCase } from "@/features/caseSlice";
import { flattenServices } from "@/utils/flattenServices";
import ServiceTable from "@/components/Services/ServiceTable";
import ServiceCardView from "@/components/Services/ServiceCardView";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import type { Case, User } from "@/types/franchise";
import { fetchPermissions } from "@/features/permissionsSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@radix-ui/react-tooltip";
import { List, LayoutGrid } from "lucide-react";

type ViewMode = "table" | "card";

function mapServiceStatus(status: string) {
  if (status === "New-Case") return "To be Started";
  return status;
}

export default function ServicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { cases: allCases, loading } = useSelector(
    (state: RootState) => state.case
  );

  const [allServices, setAllServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceSearch, setServiceSearch] = useState<string>("");
  const [statusSearch, setStatusSearch] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const uniqueServiceNames = Array.from(
    new Set(allServices.map((s) => s.name).filter(Boolean))
  );
  const uniqueStatuses = Array.from(
    new Set(allServices.map((s) => s.status).filter(Boolean))
  );

  useEffect(() => {
    let filtered = allServices;
    if (serviceFilter !== "all") {
      filtered = filtered.filter((service) => service.name === serviceFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((service) => service.status === statusFilter);
    }
    if (activeFilter !== "all") {
      filtered = filtered.filter((service) => service.status === activeFilter);
    }
    setFilteredServices(filtered);
  }, [allServices, serviceFilter, statusFilter, activeFilter]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser({
          id: parsedUser._id || parsedUser.userId || "", // Required by User type
          name: parsedUser.name,
          email: parsedUser.email || "", // Required by User type
          role: parsedUser.role,
          userId: parsedUser._id || parsedUser.userId, // Your additional field if neede
          permissions: {
            // Remove the ? since we're defining the object
            canViewAllCases: false,
            canCreateCase: false,
            canEditCase: false,
            canDeleteCase: false,
            canManageUsers: false,
            canManageSettings: false,
          },
        });

        // Skip fetching permissions if Super Admin
        if (
          parsedUser.name !== "Super Admin" &&
          (parsedUser._id || parsedUser.userId)
        ) {
          dispatch(fetchPermissions(parsedUser._id || parsedUser.userId));
        }
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCases());
  }, [dispatch]);

  useEffect(() => {
    setAllServices(flattenServices(allCases || []));
  }, [allCases]);

  useEffect(() => {
    let filtered = allServices;
    if (activeFilter !== "all") {
      filtered = filtered.filter((service) => service.status === activeFilter);
    }
    setFilteredServices(filtered);
  }, [allServices, activeFilter]);

  const handleDelete = (service: any) => {
    if (window.confirm(`Delete service "${service.name}"?`)) {
      // Implement API call here
      alert("Service deleted (implement API call here)");
    }
  };

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    // Find the service and its parent case
    const service = allServices.find((s) => s.id === serviceId);
    if (!service) return;
    const caseId = service.parentCase?._id;
    if (!caseId) return;

    // Prepare updated services array for the case
    const parentCase = allCases.find((c: any) => c._id === caseId);
    if (!parentCase) return;

    const updatedServices = (parentCase.services ?? []).map((s: any) =>
      s.id === serviceId ? { ...s, status: newStatus } : s
    );

    // Dispatch updateCase (or your update service API)
    await dispatch(
      updateCase({
        ...parentCase,
        services: updatedServices,
      })
    );
    // Optionally, refresh cases after update
    dispatch(getCases());
  };

  useEffect(() => {
    const mapped = flattenServices(allCases || []).map((service: any) => ({
      ...service,
      status: mapServiceStatus(service.status),
      lastUpdate: service.parentCase?.lastUpdate || "",
      lastEditedServiceId: service.parentCase?.lastEditedService?.id || "",
      lastEditedServiceEditedAt:
        service.parentCase?.lastEditedService?.editedAt || null,
      isLastEdited: service.id === service.parentCase?.lastEditedService?.id,
    }));
    const getTimeSafe = (d: any) => {
      if (!d) return 0;
      const t = new Date(d).getTime();
      return isNaN(t) ? 0 : t;
    };

    const sorted = mapped.sort((a, b) => {
      // 1. Put all last edited services on top, sorted by editedAt (desc)
      if (a.isLastEdited && b.isLastEdited) {
        // Both are lastEdited for their cases, sort by editedAt
        return (
          getTimeSafe(b.lastEditedServiceEditedAt) -
          getTimeSafe(a.lastEditedServiceEditedAt)
        );
      }
      if (a.isLastEdited) return -1; // a comes first
      if (b.isLastEdited) return 1; // b comes first

      // 2. Then, the rest by lastUpdate (desc)
      return getTimeSafe(b.lastUpdate) - getTimeSafe(a.lastUpdate);
    });

    setAllServices(sorted);
  }, [allCases]);

  const handleServiceSelectOpenChange = (open: boolean) => {
    if (!open) setServiceSearch(""); // Reset search only when closing
  };
  const handleStatusSelectOpenChange = (open: boolean) => {
    if (!open) setStatusSearch(""); // Reset search only when closing
  };

  return (
    <>
      <PageHeader
        title="All Services"
        description="View and manage all services across cases."
      >
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 ml-auto">
            <TooltipProvider>
              <div className="hidden sm:flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "table" ? "secondary" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("table")}
                      aria-label="Table View"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Table View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "card" ? "secondary" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("card")}
                      aria-label="Card View"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Card View</TooltipContent>
                </Tooltip>
              </div>
              {/* On mobile, show only Card view icon, but disabled */}
              <div className="block sm:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" disabled>
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Card View</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Service Filter */}
            <div>
              <label className="block text-xs mb-1">Service</label>
              <Select
                value={serviceFilter}
                onValueChange={setServiceFilter}
                onOpenChange={handleServiceSelectOpenChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search service..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="mb-2"
                      onClick={(e) => e.stopPropagation()} // Prevent Select from closing
                      onKeyDown={(e) => e.stopPropagation()} // Prevent keydown bubbling
                    />
                  </div>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueServiceNames
                    .filter((name) =>
                      name.toLowerCase().includes(serviceSearch.toLowerCase())
                    )
                    .map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* Status Filter */}
            <div>
              <label className="block text-xs mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search status..."
                      value={statusSearch}
                      onChange={(e) => setStatusSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueStatuses
                    .filter((status) =>
                      status.toLowerCase().includes(statusSearch.toLowerCase())
                    )
                    .map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PageHeader>

      {filteredServices.length === 0 ? (
        <div className="text-center p-6 sm:p-10 text-gray-500 text-sm sm:text-base">
          No services found for this filter.
        </div>
      ) : (
        // On mobile, always show CardView. On desktop, allow switching.
        <div>
          {/* Mobile: Always CardView */}
          <div className="block sm:hidden">
            <ServiceCardView
              services={filteredServices}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              currentUser={currentUser}
              caseId={""}
            />
          </div>
          {/* Desktop: Table or CardView based on viewMode */}
          <div className="hidden sm:block">
            {viewMode === "table" ? (
              <ServiceTable
                services={filteredServices}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                currentUser={currentUser}
                caseId={""}
              />
            ) : (
              <ServiceCardView
                services={filteredServices}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                currentUser={currentUser}
                caseId={""}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
