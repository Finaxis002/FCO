import PageHeader from "@/components/ui/page-header";
import UserList from "@/components/user-management/user-list";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllUsers } from "@/features/userSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";

export default function UsersPage() {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const dispatch = useDispatch<AppDispatch>();

useEffect(() => {
  dispatch(getAllUsers());
}, [dispatch, location.pathname]);

useEffect(() => {
  if (location.pathname === "/users") {
    setRefreshKey((prev) => {
      console.log("Incrementing refreshKey", prev + 1);
      return prev + 1;
    });
  }
}, [location.pathname]);


  return (
    <>
      <PageHeader
        title="User Management"
        description="View, add, or edit user accounts and their roles."
      />
      <UserList refreshKey={refreshKey} />
    </>
  );
}
