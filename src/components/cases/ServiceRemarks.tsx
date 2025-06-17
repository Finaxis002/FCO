import React, { useState, useEffect } from "react";
import type { Case } from "@/types/franchise";
import { useSelector } from "react-redux";
import type { RootState } from "../../store"; // adjust path as per your project
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Loader2, MessageSquarePlus } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

import { Share2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";

type Remark = {
  _id: string;
  userId: string;
  userName: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[]; // Change from 'read?' to 'readBy'
};

interface ServiceRemarksProps {
  caseId: string;
  serviceId: string;
  currentUser: {
    id: string;
    name: string;
  } | null;
  serviceName: string;
  onRemarkRead?: (serviceId: string, userId: string) => void;
  highlightRemarkId?: string;
  caseName: string;
}

interface CurrentUser {
  userId: string;
  name: string;
  // Add any other properties that `currentUser` should have
}

export default function ServiceRemarks({
  caseId,
  serviceId,
  currentUser,
  serviceName,
  onRemarkRead,
  highlightRemarkId,
  caseName,
}: ServiceRemarksProps) {
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [newRemarkText, setNewRemarkText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRemarkAdded, setNewRemarkAdded] = useState(false);

  const { toast } = useToast();

  const fetchRemarks = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Choose API based on token availability
      const url = token
        ? `https://tumbledrybe.sharda.co.in/api/cases/${caseId}/services/${serviceId}/remarks`
        : `https://tumbledrybe.sharda.co.in/api/cases/${caseId}/services/${serviceId}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to load remarks");

      const data: Remark[] = await res.json();
      setRemarks(data);
      setNewRemarkAdded(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchRemarks();
    }
  }, [isDialogOpen]);

  const SUPER_ADMIN_ID = "68271c74487f3a8ea0dd6bdd";

  // console.log("current user:" , currentUser)

  const handleAddRemark = async () => {
    if (!currentUser || !newRemarkText.trim()) return;

    setIsAddingRemark(true);
    const payload = {
      caseId,
      serviceId,
      userId: currentUser.id,
      userName: currentUser.name,
      remark: newRemarkText.trim(),
    };

    try {
      const token = localStorage.getItem("token"); // or wherever you store it

      const res = await axiosInstance.post(
        `/cases/${caseId}/services/${serviceId}/remarks`,
        payload // Just the payload, NOT body/stringify!
        // If you want to add custom headers, pass as third argument (optional):
        // { headers: { Authorization: `Bearer ${token}` } }
      );

      // Axios automatically throws on error status, so no need for res.ok check
      const newRemark = res.data; // Axios puts the data here

      setRemarks((prev) => [newRemark, ...prev]); // This newRemark will have readBy including currentUser.id

      setNewRemarkText("");
      setNewRemarkAdded(true);
      setIsAddDialogOpen(false);
      // Close the "View All Remarks" dialog after posting
      setIsDialogOpen(false);

      // Send push notification to all assigned users except the sender
      const caseResponse = await axiosInstance.get(`/cases/${caseId}`);
      const caseName = caseResponse.data.unitName; // Adjust this based on your API response
      console.log("caseResponse : ", caseResponse);

      // Send push notification to all assigned users except the sender
      for (const user of caseResponse.data.assignedUsers) {
        // Skip the sender from notifications
        if (user.userId === currentUser.id) {
          continue;
        }

        const userId = user.id; // Correctly access the userId

        // console.log(`Sending notification to userId: ${userId}`);

        // Send a push notification API request
        try {
          await axiosInstance.post("/pushnotifications/send-notification", {
            userId: userId, // Send notification to assigned user's ID
            message: `New remark added in case "${caseName}" by ${currentUser.name}: ${newRemark.remark}.`, // Custom message
            // You can add icon if needed
            // icon: "https://youricon.url"
          });
        } catch (error: unknown) {
          if (error instanceof Error) {
            // Narrow down the error type here
            if (
              error.message.includes("404") ||
              error.message.includes("410")
            ) {
              console.log(
                `User ${userId} not subscribed or subscription expired, skipping notification.`
              );
            } else {
              console.error(`Error sending notification to ${userId}:`, error);
            }
          } else {
            console.error("Unknown error:", error);
          }
        }
      } // Send notification to Super Admin (hardcoded)
      console.log(
        `Sending notification to Super Admin with userId: ${SUPER_ADMIN_ID}`
      );
      await axiosInstance.post("/pushnotifications/send-notification", {
        userId: SUPER_ADMIN_ID, // Send notification to Super Admin
        message: `New remark added in case "${caseName}" by ${currentUser.name}. Remark: "${newRemark.remark}". `,
      });
    } catch (err) {
      alert((err as Error).message || "Error saving remark");
    } finally {
      setIsAddingRemark(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "Just now";
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    if (highlightRemarkId && remarks.some((r) => r._id === highlightRemarkId)) {
      setIsDialogOpen(true); // open dialog if ID is in the list
      // Optionally: scroll or focus to the remark
      setTimeout(() => {
        const remarkElem = document.getElementById(
          `remark-${highlightRemarkId}`
        );
        if (remarkElem) {
          remarkElem.scrollIntoView({ behavior: "smooth", block: "center" });
          remarkElem.classList.add("ring-2", "ring-blue-500");
          setTimeout(() => {
            remarkElem.classList.remove("ring-2", "ring-blue-500");
          }, 2000);
        }
      }, 400); // Wait for dialog/remarks to render
    }
  }, [remarks, highlightRemarkId]);

  useEffect(() => {
    // If highlightRemarkId exists, open the dialog automatically
    if (highlightRemarkId) {
      setIsDialogOpen(true);
    }
  }, [highlightRemarkId]);

  const markAsRead = async (remarkId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.patch(
        `/remarks/${remarkId}/read`
        // No need for data in PATCH if you're just marking as read and sending no body
      );

      // Locally update UI: add current user to readBy[] for this remark
      setRemarks((prevRemarks) =>
        prevRemarks.map((r) =>
          r._id === remarkId && !r.readBy.includes(currentUser?.id || "")
            ? { ...r, readBy: [...r.readBy, currentUser?.id || ""] }
            : r
        )
      );

      if (onRemarkRead) {
        onRemarkRead(serviceId, currentUser?.id || "");
      }
    } catch (err) {
      console.error("Failed to mark remark as read", err);
    }
  };

  const hasRemarkPermission = useSelector(
    (state: RootState) => state.permissions.permissions?.remarks
  );

  // Combined check including Super Admin
  const canAddRemark =
    hasRemarkPermission || currentUser?.name === "Super Admin";

  const isClientPage =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/client/");

  const token = localStorage.getItem("token");

  console.log("case Name : ", caseName);

  function getRemarkPreview(remarkText: string, wordCount = 5): string {
    const words = remarkText.split(" ");
    if (words.length <= wordCount) return remarkText;
    return words.slice(0, wordCount).join(" ") + "...";
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          View All Remarks
        </Button>
        {canAddRemark && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-1">
                <MessageSquarePlus className="h-4 w-4" />
                Add Remark
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Remark</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  rows={4}
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  placeholder="Write your remark here..."
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={handleAddRemark}
                    disabled={
                      !newRemarkText.trim() || isAddingRemark || !canAddRemark
                    }
                  >
                    {isAddingRemark ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Remark"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Remarks for {serviceName}</DialogTitle>
            <DialogDescription>
              You can view and respond to all remarks for this service.
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
          )}

          {!loading && remarks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No remarks yet. Be the first to add one!
            </div>
          )}

          <ScrollArea className="flex-1 pr-4 h-[20vh] overflow-auto">
            <div className="space-y-6 py-2">
              {remarks.map((remark) => {
                return (
                  <div
                    id={`remark-${remark._id}`}
                    key={remark._id}
                    className={`flex gap-3 rounded-md p-3 ${
                      remark.readBy &&
                      !remark.readBy.includes(currentUser?.id || "")
                        ? "bg-green-100 border border-green-300"
                        : ""
                    }`}
                  >
                    <Avatar className="h-9 w-9 mt-1">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {getUserInitials(remark.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{remark.userName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(remark.createdAt)}
                        </span>
                        {/* "New" badge - shows if current user hasn't read this remark */}
                        {remark.readBy &&
                          !remark.readBy.includes(currentUser?.id || "") &&
                          token && (
                            <span className="ml-2 inline-block rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                              New
                            </span>
                          )}

                        {!isClientPage && (
                          <button
                            title="Copy client share link"
                            // onClick={() => {
                            //   const link = `${window.location.origin}/client/cases/${caseId}?serviceId=${serviceId}&remarkId=${remark._id}`;
                            //   navigator.clipboard.writeText(link);
                            //   // Replace alert with your toast if you wish
                            //   toast({
                            //     title: "Link Copied!",
                            //     description: "Remark link copied to clipboard.",
                            //   });
                            // }}

                            onClick={() => {
                              const link = `${window.location.origin}/client/cases/${caseId}?serviceId=${serviceId}&remarkId=${remark._id}`;
                              const preview = getRemarkPreview(
                                remark.remark,
                                5
                              );
                              const message = `${preview} added by ${remark.userName} in ${caseName}\n\nRead more: ${link}`;
                              navigator.clipboard.writeText(message);
                              toast({
                                title: "Copied!",
                                description:
                                  "Preview with link copied to clipboard.",
                              });
                            }}
                            className="ml-2 p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {remark.remark}
                      </p>

                      {/* "Mark as Read" button - shows if current user hasn't read this remark */}
                      {remark.readBy &&
                        !remark.readBy.includes(currentUser?.id || "") &&
                        token && (
                          <Button
                            variant="outline"
                            size="xs"
                            className="mt-2 text-xs bg-green-600 text-white hover:bg-green-700"
                            onClick={() => markAsRead(remark._id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          {canAddRemark && (
            <div className="pt-4 border-t">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {currentUser ? getUserInitials(currentUser.name) : "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <Textarea
                    rows={3}
                    value={newRemarkText}
                    onChange={(e) => setNewRemarkText(e.target.value)}
                    placeholder="Add a new remark..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>

                    <Button
                      onClick={handleAddRemark}
                      disabled={!newRemarkText.trim()}
                    >
                      {isAddingRemark ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Remark"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
