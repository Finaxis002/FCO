import UserList from "@/components/user-management/user-list";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllUsers } from "@/features/userSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UserCardView from "@/components/user-management/UserCardView";

export default function UsersPage() {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch, location.pathname]);

  useEffect(() => {
    if (location.pathname === "/users") {
      setRefreshKey((prev) => prev + 1);
    }
  }, [location.pathname]);

  const pageActions = (
    <div className="flex flex-wrap items-center gap-2">
      <TooltipProvider>
        {/* Hide table/card toggle on mobile, show only on desktop */}
        <div className="hidden sm:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "table" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
                aria-label="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Table View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "card" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("card")}
                aria-label="Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Card View</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );

  return (
    <>
     <div className="flex items-center justify-between mb-4">
      <div>
         <h1 className="text-2xl font-bold mb-1 px-2 sm:px-0">User Management</h1>
      <p className="text-muted-foreground mb-4 px-2 sm:px-0">
        View, add, or edit user accounts and their roles.
      </p>
      </div>
      <div className="px-2 sm:px-0">{pageActions}</div>
      </div>
      {/* On mobile, always show card view. On desktop, allow toggle */}
      <div className="px-1 sm:px-0">
        <div className="block sm:hidden">
          <UserCardView refreshKey={refreshKey} />
        </div>
        <div className="hidden sm:block">
          {viewMode === "table" ? (
            <UserList refreshKey={refreshKey} />
          ) : (
            <UserCardView refreshKey={refreshKey} />
          )}
        </div>
      </div>
    </>
  );
}