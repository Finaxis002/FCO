import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import axios from "axios";
import { Eye } from "lucide-react";

type Tag = {
  _id: string;
  name: string;
  color?: string;
};

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
  const [updatingServices, setUpdatingServices] = useState<
    Record<string, boolean>
  >({});
  const [selectedServiceForRemarks, setSelectedServiceForRemarks] = useState<
    string | null
  >(null);

  const [tagsMap, setTagsMap] = useState<Record<string, Tag>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(
          "https://tumbledrybe.sharda.co.in/api/tags"
        );
        const tags = response.data;
        const map = tags.reduce((acc: Record<string, Tag>, tag: Tag) => {
          acc[tag._id] = tag;
          return acc;
        }, {});
        setTagsMap(map);
      } catch (error) {
        console.error("Failed to fetch tags", error);
      }
    };
    fetchTags();
  }, []);

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
                <TableHead className="w-[400px]">Service</TableHead>
                <TableHead className="w-[200px]">Tag</TableHead>
                <TableHead className="w-[300px]">Status</TableHead>
                <TableHead>Case Name</TableHead>
                <TableHead className="w-[200px]">Remarks</TableHead>
                <TableHead className="">Actions</TableHead>
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
                  <TableCell className="font-medium">
                    {Array.isArray(service.tags) && service.tags.length > 0 ? (
                      (() => {
                        // Filter out tagIds that don't exist in tagsMap
                        const validTags = service.tags
                          .map((tagId: string) => tagsMap[tagId])
                          .filter((tag: { name: any }) => tag && tag.name);

                        return validTags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {validTags.map(
                              (
                                tag: {
                                  _id: React.Key | null | undefined;
                                  name:
                                    | string
                                    | number
                                    | boolean
                                    | React.ReactElement<
                                        any,
                                        | string
                                        | React.JSXElementConstructor<any>
                                      >
                                    | Iterable<React.ReactNode>
                                    | React.ReactPortal
                                    | null
                                    | undefined;
                                },
                                idx: any
                              ) => (
                                <span
                                  key={tag._id}
                                  className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
                                >
                                  {tag.name}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No tags</span>
                        );
                      })()
                    ) : (
                      <span className="text-muted-foreground">No tags</span>
                    )}
                  </TableCell>
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
                  <TableCell className="text-center">
                    <button
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-xs transition"
                      onClick={() => navigate(`/cases/${service.parentCase?._id}?from=services`)}
                      title="View Case"
                      type="button"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        View Case
                      </span>
                    </button>
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
