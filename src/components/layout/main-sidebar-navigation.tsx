"use client"; // Not strictly needed for Vite
import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom"; // Changed imports
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import type { NavItem } from "@/lib/constants";

interface MainSidebarNavigationProps {
  isMobile?: boolean;
}

export default function MainSidebarNavigation({
  isMobile = false,
}: MainSidebarNavigationProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const filteredNavItems =
    userRole === "user"
      ? NAV_ITEMS.filter((item) => item.label.toLowerCase() !== "users")
      : NAV_ITEMS;

  const renderNavItem = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));

    const linkContent = (
      <>
        <item.icon className="h-5 w-5" />
        <span
          className={cn(
            isMobile
              ? ""
              : "sr-only group-data-[state=expanded]:not-sr-only group-data-[state=expanded]:ml-2"
          )}
        >
          {item.label}
        </span>
      </>
    );

    if (isMobile) {
      return (
        <RouterLink // Changed Link
          key={item.href}
          to={item.href} // Changed href to to
          className={cn(
            "flex items-center gap-4 px-2.5",
            isActive
              ? "text-sidebar-primary-foreground bg-sidebar-primary"
              : "text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent",
            "rounded-lg py-2"
          )}
        >
          {linkContent}
        </RouterLink>
      );
    }

    return (
      <TooltipProvider key={item.href} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <RouterLink // Changed Link
              to={item.href} // Changed href to to
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                "group-data-[state=expanded]:w-full group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-2.5 group-data-[state=expanded]:py-2",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
              )}
            >
              {linkContent}
            </RouterLink>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={5}
            className="group-data-[state=expanded]:hidden"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (isMobile) {
    return <>{filteredNavItems.map(renderNavItem)}</>;
  }

  return (
    <nav className="grid gap-1 p-2 group-data-[state=expanded]:grid group-data-[state=expanded]:gap-2 group-data-[state=expanded]:p-4">
      {filteredNavItems.map(renderNavItem)}
    </nav>
  );
}
