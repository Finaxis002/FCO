import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Filter as FilterIcon,
  ChevronDown,
  List,
  LayoutGrid,
  Trash,
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import CaseTable from "@/components/cases/case-table";
import CaseCardView from "@/components/cases/case-card-view";
import type {
  Case,
  ServiceStatus,
  DashboardFilterStatus,
} from "@/types/franchise";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getCases, deleteCase } from "@/features/caseSlice";
import { fetchPermissions } from "@/features/permissionsSlice";

const FILTER_OPTIONS: { label: string; value: DashboardFilterStatus }[] = [
  { label: "All Cases", value: "Total" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In-Progress" },
  { label: "Completed", value: "Completed" },
  { label: "Rejected", value: "Rejected" },
];

type ViewMode = "table" | "card";

export default function CasesPage() {
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role?: string;
    userId?: string;
    permissions?: {
      canCreate?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
      canViewReports?: boolean;
      canAssignTasks?: boolean;
      allCaseAccess?: boolean;
      viewRights?: boolean;
      createCaseRights?: boolean;
      createUserRights?: boolean;
      userRolesAndResponsibility?: boolean;
      remarksAndChat?: boolean;
       canShare?:boolean;
    };
  } | null>(null);

  const [activeFilter, setActiveFilter] =
    useState<DashboardFilterStatus>("Total");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const { cases: allCases, loading } = useSelector(
    (state: RootState) => state.case
  );

  useEffect(() => {
    dispatch(getCases());
  }, [dispatch]);

  useEffect(() => {
    const filterFromState = location.state?.filter as
      | DashboardFilterStatus
      | undefined;
    if (filterFromState) {
      setActiveFilter(filterFromState);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const { permissions, loading: permissionsLoading } = useSelector(
    (state: RootState) => state.permissions
  );

  useEffect(() => {
    console.log("Fetched permissions from redux:", permissions);
  }, [permissions]);

  const isAdmin =
    currentUser?.role?.toLowerCase() === "admin" ||
    currentUser?.name === "Super Admin";

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

  const canSeeAddButton =
  currentUser?.name === "Super Admin" || permissions?.createCaseRights === true;

  function normalizeStatus(status?: string) {
  if (!status) return "";
  return status.toLowerCase().replace(/\s/g, "-"); // replace spaces with dash
}

useEffect(() => {
  if (!allCases || !currentUser) {
    setFilteredCases([]);
    return;
  }

  let casesToDisplay = allCases;

  // Apply assigned users filter for non-Super Admins without allCaseAccess
  if (currentUser.name !== "Super Admin" && !permissions?.allCaseAccess) {
    casesToDisplay = allCases.filter((c) =>
      c.assignedUsers?.some((user) => {
        if (typeof user === "string") {
          return user === currentUser.userId || user === currentUser.name;
        } else {
          return (
            user._id === currentUser.userId ||
            user.userId === currentUser.userId ||
            user.name === currentUser.name
          );
        }
      })
    );
  }

  // Apply status filter for all users including Super Admin
  if (activeFilter && activeFilter !== "Total") {
    if (activeFilter === "Completed") {
      casesToDisplay = casesToDisplay.filter(
        (c) =>
          c.status?.toLowerCase() === "completed" ||
          c.status?.toLowerCase() === "approved"
      );
    } else {
      casesToDisplay = casesToDisplay.filter(
        (c) => c.status?.toLowerCase() === activeFilter.toLowerCase()
      );
    }
  }

  setFilteredCases(casesToDisplay);
}, [allCases, activeFilter, permissions, currentUser]);

  const handleDelete = async (caseId: string) => {
    if (window.confirm("Are you sure you want to delete this case?")) {
      await dispatch(deleteCase(caseId));
      // Optionally refresh cases after delete
      dispatch(getCases());
    }
  };

  const handleFilterChange = (filterValue: DashboardFilterStatus) => {
    setActiveFilter(filterValue);
  };

  const currentFilterLabel =
    FILTER_OPTIONS.find((opt) => opt.value === activeFilter)?.label || "Filter";

  const pageActions = (
    <div className="flex items-center gap-2">
      <TooltipProvider>
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
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" /> {currentFilterLabel}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FILTER_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => handleFilterChange(option.value)}
              className={cn(
                activeFilter === option.value &&
                  "bg-accent text-accent-foreground"
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {canSeeAddButton && (
        <Button asChild>
          <RouterLink to="/cases/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Case
          </RouterLink>
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <>
        <PageHeader
          title="All Cases"
          description="Manage and track all franchise compliance cases."
        >
          {pageActions}
        </PageHeader>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              {[...Array(viewMode === "table" ? 3 : 6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className={
                    viewMode === "table"
                      ? "h-10 w-full"
                      : "h-48 w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.66rem)]"
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="All Cases"
        description="Manage and track all franchise compliance cases."
      >
        {pageActions}
      </PageHeader>
      {viewMode === "table" ? (
        <CaseTable cases={filteredCases} onDelete={handleDelete} />
      ) : (
        <CaseCardView cases={filteredCases} onDelete={handleDelete} />
      )}
    </>
  );
}
