"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserCircle,
  Shield,
  Bell,
  CheckCircle2,
  XCircle,
  Check,
  Download,
  PlusCircle,
  Edit,
  Trash,
  BarChart,
  ClipboardList,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from "@/lib/constants";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();

  // Load user from localStorage (parse JSON or null)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser?.avatarUrl || null
  );

  useEffect(() => {
    document.title = `My Profile | ${APP_NAME}`;
  }, []);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });

  const userRole = localStorage.getItem("userRole");
  const userString = localStorage.getItem("user");

  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
      setAvatarPreview(currentUser.avatarUrl || null);
    }
  }, [currentUser, profileForm]);

  if (!currentUser) {
    return <PageHeader title="Profile" description="User data not found." />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Profile Summary */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={avatarPreview || undefined}
                      alt={currentUser.name}
                    />
                    <AvatarFallback className="text-4xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      {currentUser.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-4 border-white">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
                {userRole === "user" && (
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentUser.userId || "N/A"}
                  </h2>
                )}

                <h2 className="text-xl font-bold text-gray-900">
                  {currentUser.name || "N/A"}
                </h2>
                {userRole === "user" && (
                  <p className="text-gray-600">{currentUser.email || "N/A"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Permissions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-indigo-600" />
                  Access Permissions
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Create Content",
                      allowed:
                        currentUser.name === "Super Admin"
                          ? true
                          : currentUser.permissions?.canCreate,
                      icon: <PlusCircle className="h-5 w-5" />,
                    },
                    {
                      label: "Edit Content",
                      allowed:
                        currentUser.name === "Super Admin"
                          ? true
                          : currentUser.permissions?.canEdit,
                      icon: <Edit className="h-5 w-5" />,
                    },
                    {
                      label: "Delete Content",
                      allowed:
                        currentUser.name === "Super Admin"
                          ? true
                          : currentUser.permissions?.canDelete,
                      icon: <Trash className="h-5 w-5" />,
                    },
                    {
                      label: "View Reports",
                      allowed:
                        currentUser.name === "Super Admin"
                          ? true
                          : currentUser.permissions?.canViewReports,
                      icon: <BarChart className="h-5 w-5" />,
                    },
                    {
                      label: "Assign Tasks",
                      allowed:
                        currentUser.name === "Super Admin"
                          ? true
                          : currentUser.permissions?.canAssignTasks,
                      icon: <ClipboardList className="h-5 w-5" />,
                    },
                    {
                      label: "Admin Access",
                      allowed:
                        currentUser.name === "Super Admin" ? true : false,
                      icon: <Lock className="h-5 w-5" />,
                    },
                  ].map(({ label, allowed, icon }) => (
                    <div
                      key={label}
                      className={`p-4 rounded-lg border ${
                        allowed
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            allowed ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          {React.cloneElement(icon, {
                            className: `h-5 w-5 ${
                              allowed ? "text-green-600" : "text-gray-500"
                            }`,
                          })}
                        </div>
                        <div>
                          <h3 className="font-medium">{label}</h3>
                          <p
                            className={`text-sm ${
                              allowed ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {allowed ? "Access granted" : "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
