import PageHeader from "@/components/ui/page-header";
import UserList from "@/components/user-management/user-list";
import React from 'react';

export default function UsersPage() {
  return (
    <>
      <PageHeader 
        title="User Management" 
        description="View, add, or edit user accounts and their roles."
      >
        {/* Button is part of UserList actions */}
      </PageHeader>
      <UserList />
    </>
  );
}
