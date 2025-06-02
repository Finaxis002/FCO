import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Settings2, ShieldCheck, Trash2 } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { UserRole } from "@/types/franchise";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface User {
  _id: string;
  id?: string;
  userId: string;
  name: string;
  email: string;
  role?: UserRole;
  avatarUrl?: string;
  dataAIHint?: string;
  permissions?: any;
}

interface UserCardViewProps {
  refreshKey?: any;
}

const BASE_URL = "https://tumbledrybe.sharda.co.in/api/users";

const UserCardView: React.FC<UserCardViewProps> = ({ refreshKey }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // You can add your permission logic here if needed
  const userRole = localStorage.getItem("userRole") || "User";
  const [permissions, setPermissions] = useState<any>({});

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [refreshKey]);

  // Dummy handlers for edit, delete, reset password
  const handleEditUser = (user: User) => {
    // Implement your edit logic or dialog here
    alert(`Edit user: ${user.name}`);
  };
  const handleDeleteUser = (userId: string) => {
    // Implement your delete logic here
    alert(`Delete user: ${userId}`);
  };
  const handleResetPassword = (user: User) => {
    // Implement your reset password logic here
    alert(`Reset password for: ${user.name}`);
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }
  if (!users.length) {
    return (
      <div className="text-center p-6 text-muted-foreground border border-dashed rounded-md w-full">
        No users found. Click "Add New User" to create one.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ">
      {users.map((user) => (
        <Card key={user._id} className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-center gap-4">
            {user.avatarUrl ? (
              <img
                alt={`${user.name}'s avatar`}
                className="aspect-square rounded-md object-cover h-12 w-12"
                src={user.avatarUrl}
                data-ai-hint={user.dataAIHint || "user avatar"}
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <CardTitle className="text-base">{user.name}</CardTitle>
              <CardDescription className="text-xs">{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-2">
              <span className="font-semibold">User ID:</span> {user.userId}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Role:</span>{" "}
              <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </div>
          </CardContent>
    
{(userRole === "Admin" || permissions?.userRolesAndResponsibility) && (
  <CardFooter className="flex flex-wrap gap-2 justify-end p-3 sm:p-4">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleEditUser(user)}
      className="text-blue-600 hover:!bg-blue-600 hover:!text-white flex items-center"
    >
      <Edit className="h-4 w-4 mr-1" />
      <span className="hidden xs:inline">Edit</span>
    </Button>
    <RouterLink
      to={`/users/${user._id}/permissions`}
      className="text-gray-600 hover:text-gray-800 flex items-center text-sm font-medium"
    >
      <Settings2 className="h-4 w-4 mr-1" />
      <span className="hidden xs:inline">Manage</span>
    </RouterLink>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleResetPassword(user)}
      className="text-yellow-600 hover:!bg-yellow-600 hover:!text-white flex items-center"
    >
      <ShieldCheck className="h-4 w-4 mr-1" />
      <span className="hidden xs:inline">Reset</span>
      <span className="hidden sm:inline"> Password</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDeleteUser(user._id)}
      className="text-red-600 hover:!bg-red-600 hover:!text-white flex items-center"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      <span className="hidden xs:inline">Delete</span>
    </Button>
  </CardFooter>
)}

        </Card>
      ))}
    </div>
  );
};

export default UserCardView;