import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Eye, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SERVICE_STATUS } from "@/lib/statusConfig";
import Remarks from "./Remarks";

const statusStyles: Record<string, string> = {
  "To be Started":
    "bg-blue-100 text-blue-800 hover:!bg-blue-200 hover:!text-blue-900",
  "Detail Required":
    "bg-orange-100 text-orange-800 hover:!bg-orange-200 hover:!text-orange-900",
  "In-Progress":
    "bg-yellow-100 text-yellow-800 hover:!bg-yellow-200 hover:!text-yellow-900",
  Completed:
    "bg-green-100 text-green-800 hover:!bg-green-200 hover:!text-green-900",
};

interface ServiceTableProps {
  caseId: string;
  services: any[];
  onDelete: (service: any) => void;
  onViewRemarks?: (service: any) => void;
  onAddRemark?: (service: any) => void;
  onStatusChange?: (serviceId: string, newStatus: string) => Promise<void>;
  currentUser?: any;
  showTags?: boolean;
  onRemarkRead?: (serviceId: string, userId: string) => void;
}

export default function ServiceTable({
  services,
  onDelete,
  onViewRemarks,
  onAddRemark,
  onStatusChange,
  currentUser,
  caseId,
  showTags,
  onRemarkRead,
}: ServiceTableProps) {
  const { toast } = useToast();
  const [updatingServices, setUpdatingServices] = useState<
    Record<string, boolean>
  >({});
  const [selectedServiceForRemarks, setSelectedServiceForRemarks] = useState<
    string | null
  >(null);

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    try {
      setUpdatingServices((prev) => ({ ...prev, [serviceId]: true }));

      if (onStatusChange) {
        await onStatusChange(serviceId, newStatus);
      }

      toast({
        title: "Status Updated",
        description: `Service status updated to "${newStatus}".`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update service status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingServices((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  if (!services.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
            <p className="text-xl font-semibold text-muted-foreground">
              No services found.
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or add a new service.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">Sr</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead>Case Name</TableHead>
                <TableHead className="w-[200px]">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service, idx) => (
                <TableRow
                  key={service._id || idx}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-center">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Select
                      value={service.status}
                      onValueChange={(value) =>
                        handleStatusChange(service.id, value)
                      }
                      disabled={updatingServices[service.id]}
                    >
                      <SelectTrigger
                        className={`w-[150px] rounded-md ${
                          statusStyles[service.status] || ""
                        }`}
                      >
                        {updatingServices[service.id] ? (
                          <span className="animate-pulse">Updating...</span>
                        ) : (
                          <SelectValue placeholder="Select status" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SERVICE_STATUS).map(([key, status]) => (
                          <SelectItem
                            key={key}
                            value={status}
                            className={`${
                              statusStyles[status] || "bg-white"
                            } my-1`}
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {service.parentCase?.unitName || (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {caseId && currentUser ? (
                        <>
                          <Remarks
                            caseId={service.parentCase?._id}
                            serviceId={service.id}
                            currentUser={currentUser}
                            serviceName={service.name}
                            onRemarkRead={onRemarkRead}
                          />
                        </>
                      ) : (
                        <>
                          {/* <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-8 gap-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-sm transition"
                              onClick={() =>
                                onViewRemarks && onViewRemarks(service)
                              }
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                View
                              </span>
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 gap-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-sm transition"
                              onClick={() =>
                                onAddRemark && onAddRemark(service)
                              }
                            >
                              <Plus className="h-4 w-4 text-green-600" />
                              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Add
                              </span>
                            </Button>
                          </div> */}

                          <Remarks
                            caseId={service.parentCase?._id}
                            serviceId={service.id}
                            currentUser={currentUser}
                            serviceName={service.name}
                            onRemarkRead={onRemarkRead}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
