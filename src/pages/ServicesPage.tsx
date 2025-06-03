import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { getCases, updateCase } from "@/features/caseSlice";
import { flattenServices } from "@/utils/flattenServices";
import ServiceTable from "@/components/Services/ServiceTable";
import { Card, CardContent } from "@/components/ui/card";
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

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Completed", value: "Completed" },
  { label: "In-Progress", value: "In-Progress" },
  // Add more as needed
];

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
    // Attach parentCase.lastUpdate to each service for sorting
    const mapped = flattenServices(allCases || [])
      .map((service: any) => ({
        ...service,
        status: mapServiceStatus(service.status),
        lastUpdate: service.parentCase?.lastUpdate || "", // Attach parent's lastUpdate
      }))
      .sort((a, b) => {
        const dateA = a.lastUpdate ? new Date(a.lastUpdate).getTime() : 0;
        const dateB = b.lastUpdate ? new Date(b.lastUpdate).getTime() : 0;
        return dateB - dateA; // descending: latest first
      });

    setAllServices(mapped);
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
      </PageHeader>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Loading services...
          </CardContent>
        </Card>
      ) : (
        <ServiceTable
          services={filteredServices}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          caseId={" "}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
