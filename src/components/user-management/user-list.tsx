"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  getAllUsers,
  addUser,
  editUser,
  deleteUser as deleteUserThunk,
} from "@/features/userSlice";
import type { User } from "@/types/franchise";
import AddEditUserDialog from "./add-edit-user-dialog";
import { Link as RouterLink } from "react-router-dom";
import { Edit, Trash2, UserPlus, Settings2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/features/userSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust import path for your RootState
import { fetchPermissions } from "@/features/permissionsSlice";


interface UserType {
  name: string;
  role?: string;
  userId?: string;
}

export default function UserList({ refreshKey }: { refreshKey: any }) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState(""); // For new password
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


const [currentUser, setCurrentUser] = useState<UserType | null>(null);


  const permissions = useSelector(
    (state: RootState) => state.permissions.permissions
  );

  const dispatch = useAppDispatch();
  const { users, error } = useAppSelector((state) => state.users);
  const { toast } = useToast();

  const [isAddEditUserDialogOpen, setIsAddEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // Add this at the top of your component

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser({
          name: parsedUser.name,
          role: parsedUser.role,
          userId: parsedUser._id || parsedUser.userId,
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
    dispatch(getAllUsers());
  }, [dispatch, refreshKey]);

  const handleAddNewUser = () => {
    setEditingUser(null);
    setIsAddEditUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsAddEditUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUserThunk(userId)).unwrap();
      toast({
        title: "User Deleted",
        description: `User with ID ${userId} has been removed.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleSaveUser = async (
    userData: Omit<User, "id" | "_id" | "avatarUrl" | "dataAIHint"> & {
      id?: string;
      _id?: string;
    },
    isEditing: boolean
  ) => {
    try {
      if (isEditing && (userData.id || (editingUser && editingUser._id))) {
        const userId = userData.id ?? editingUser!._id;
        if (!userId) {
          throw new Error("User ID is required for editing.");
        }
        await dispatch(
          editUser({
            id: userId,
            user: { ...userData, role: userData.role as UserRole },
          })
        ).unwrap();
        toast({
          title: "User Updated",
          description: `${userData.name}'s details updated.`,
        });
      } else {
        // Ensure id is present when adding a user (can be empty string if backend generates it)
        const { id, _id, ...userDataWithoutIds } = userData;
        await dispatch(
          addUser({
            ...userDataWithoutIds,
            id: id ?? "",
            userId: userData.userId ?? "", // Ensure userId is always a string
            role: userData.role as UserRole, // Ensure role is always defined and cast to correct type
          })
        ).unwrap();
        toast({
          title: "User Added",
          description: `${userData.name} has been added.`,
        });
      }

      setIsAddEditUserDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Operation failed.",
        variant: "destructive",
      });
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setUserToReset(user);
    setShowResetDialog(true);
  };

  const confirmResetPassword = async () => {
    if (!userToReset) return;

    const userId = userToReset._id || userToReset.id;
    if (!userId || !resetPassword) return;

    try {
      const response = await fetch(
        `https://fcobackend-23v7.onrender.com/api/users/${userId}/reset-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: resetPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset",
          description: `${userToReset.name}'s password was reset successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Server error occurred.",
        variant: "destructive",
      });
    } finally {
      setShowResetDialog(false);
      setUserToReset(null);
      setResetPassword(""); // clear input
    }
  };

  const userRole = localStorage.getItem("userRole");

  console.log("permissions : " + permissions);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            Manage all user accounts and their roles within the application.
          </CardDescription>
        </div>
        {(userRole === "Admin" || permissions?.createUserRights === true) && (
          <Button onClick={handleAddNewUser}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Avatar
                  </TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  {(userRole === "Admin" ||
                    permissions?.userRolesAndResponsibility === true) && (
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id || user.id}>
                    <TableCell className="hidden sm:table-cell">
                      {user.avatarUrl ? (
                        <img
                          alt={`${user.name}'s avatar`}
                          className="aspect-square rounded-md object-cover h-10 w-10"
                          src={user.avatarUrl}
                          data-ai-hint={user.dataAIHint || "user avatar"}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{user.userId}</TableCell>

                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "Admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    {(userRole === "Admin" ||
                      permissions?.userRolesAndResponsibility === true) && (
                      <TableCell className="text-right flex justify-end gap-4 flex-wrap">
                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEditUser({
                              ...user,
                              id: user.id ?? user._id ?? "",
                              // Optionally ensure role is cast to the correct type if needed:
                              role: user.role as UserRole,
                            })
                          }
                          className="text-blue-600 hover:!bg-blue-600 hover:!text-white"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        {/* Manage Button */}
                        <RouterLink
                          to={`/users/${user._id || user.id}/permissions`}
                          className="text-gray-600 hover:text-gray-800 flex items-center text-sm font-medium"
                        >
                          <Settings2 className="h-4 w-4 mr-1" />
                          Manage
                        </RouterLink>

                        {/* 🔑 Reset Password Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleResetPasswordClick({
                              ...user,
                              role: user.role as UserRole,
                            })
                          }
                          className="text-yellow-600 hover:!bg-yellow-600 hover:!text-white"
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Reset Password
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id || user.id)}
                          className="text-red-600 hover:!bg-red-600 hover:!text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {users.length === 0 && (
              <CardFooter className="pt-6">
                <div className="text-center p-4 text-muted-foreground border border-dashed rounded-md w-full">
                  No users found. Click "Add New User" to create one.
                </div>
              </CardFooter>
            )}
          </>
        )}
      </CardContent>
      {isAddEditUserDialogOpen && (
        <AddEditUserDialog
          user={editingUser}
          isOpen={isAddEditUserDialogOpen}
          onClose={() => {
            setIsAddEditUserDialogOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
      {showResetDialog && (
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter a new password for <strong>{userToReset?.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmResetPassword}
                disabled={!resetPassword}
              >
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
