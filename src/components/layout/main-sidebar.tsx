"use client"; // Not strictly needed for Vite
import { Link as RouterLink } from "react-router-dom"; // Changed import
import { Building2, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import MainSidebarNavigation from "./main-sidebar-navigation";
import { APP_NAME } from "@/lib/constants";
// Sidebar context and trigger are specific to shadcn/ui sidebar, ensure it's compatible or adjust
// For now, assuming basic structure without advanced SidebarProvider interactions from shadcn/ui advanced sidebar
import React from "react"; // Import React

export default function MainSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-sidebar text-sidebar-foreground sm:flex print:hidden group-data-[state=expanded]:w-60 transition-all duration-300 ease-in-out">
      <div className="flex h-14 items-center justify-center border-b p-2 group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-4 group-data-[state=expanded]:gap-2">
        <RouterLink // Changed Link
          to="/" // Changed href to to
          className="flex items-center justify-center font-semibold text-sidebar-foreground"
        >
          <Building2 className="h-6 w-6" />
          <span className="sr-only group-data-[state=expanded]:not-sr-only group-data-[state=expanded]:ml-2">{APP_NAME}</span>
        </RouterLink>
      </div>
      
      <MainSidebarNavigation />

      <nav className="mt-auto grid gap-1 p-2 group-data-[state=expanded]:grid group-data-[state=expanded]:gap-2 group-data-[state=expanded]:p-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <RouterLink // Changed Link
                to="/settings" // Changed href to to
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:text-sidebar-primary-foreground hover:bg-sidebar-accent md:h-8 md:w-8 group-data-[state=expanded]:w-full group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-2.5 group-data-[state=expanded]:py-2"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only group-data-[state=expanded]:not-sr-only group-data-[state=expanded]:ml-2">Settings</span>
              </RouterLink>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5} className="group-data-[state=expanded]:hidden">
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
