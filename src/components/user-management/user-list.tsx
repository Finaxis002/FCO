"use client"; // Not strictly needed

import type { User } from "@/types/franchise";
import { MOCK_USERS } from "@/lib/constants";
import React, { useState, useEffect }from "react"; // Import React
import { Link as RouterLink } from "react-router-dom"; // Changed import
import { MoreHorizontal, Edit, Trash2, UserPlus } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AddEditUserDialog from "./add-edit-user-dialog";


export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [isAddEditUserDialogOpen, setIsAddEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    setUsers(MOCK_USERS);
  }, []);

  const handleAddNewUser = () => {
    setEditingUser(null);
    setIsAddEditUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsAddEditUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: `User with ID ${userId} has been removed.`,
      variant: "destructive",
    });
  };

  const handleSaveUser = (userData: Omit<User, 'id' | 'avatarUrl' | 'dataAIHint'> & { id?: string; avatarUrl?: string; dataAIHint?: string }, isEditing: boolean) => {
    if (isEditing && editingUser) {
      const updatedUser = { ...editingUser, ...userData };
      setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      toast({ title: "User Updated", description: `${updatedUser.name}'s details updated.` });
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        avatarUrl: userData.avatarUrl || `https://picsum.photos/seed/${userData.name.replace(/\s+/g, '-').toLowerCase()}/40/40`,
        dataAIHint: userData.dataAIHint || "person avatar",
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
      toast({ title: "User Added", description: `${newUser.name} has been added.` });
    }
    setIsAddEditUserDialogOpen(false);
    setEditingUser(null);
  };
  

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            Manage all user accounts and their roles within the application.
          </CardDescription>
        </div>
        <Button onClick={handleAddNewUser}>
          <UserPlus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                Avatar
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="hidden sm:table-cell">
                   {user.avatarUrl ? (
                    <img // Changed from next/image
                      alt={`${user.name}'s avatar`}
                      className="aspect-square rounded-md object-cover h-10 w-10" // Fixed height/width
                      src={user.avatarUrl}
                      data-ai-hint={user.dataAIHint || "user avatar"}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      {user.name.substring(0,2).toUpperCase()}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:!bg-destructive hover:!text-destructive-foreground focus:!bg-destructive focus:!text-destructive-foreground">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                       <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <RouterLink to={`/users/${user.id}/permissions`}>Manage Permissions</RouterLink> {/* Changed Link */}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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
    </Card>
  );
}
