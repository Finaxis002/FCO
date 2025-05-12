import { Link as RouterLink } from "react-router-dom"; // Changed import
import {
  PanelLeft,
  Search,
  Settings,
  UserCircle,
  LogOut,
  Bell,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MainSidebarNavigation from "./main-sidebar-navigation"; 
import { APP_NAME, MOCK_USERS } from "@/lib/constants";
import React from "react"; // Import React

export default function MainHeader() {
  const currentUser = MOCK_USERS[0]; 

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 print:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground">
          <nav className="grid gap-6 text-lg font-medium">
            <RouterLink // Changed Link
              to="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Building2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">{APP_NAME}</span>
            </RouterLink>
            <MainSidebarNavigation isMobile={true} />
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Placeholder for Breadcrumbs or Page Title if needed */}
      </div>

      <div className="relative ml-auto flex-shrink-0 md:grow-0">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases..."
              className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[320px]"
              aria-label="Search cases"
            />
          </div>
        </form>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="text-xs text-muted-foreground">No new notifications</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
            <RouterLink to="/notifications" className="flex items-center justify-center py-2 text-sm">View all notifications</RouterLink> {/* Changed Link */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            {currentUser.avatarUrl ? (
              <img // Changed from next/image
                src={currentUser.avatarUrl}
                width={36}
                height={36}
                alt="User Avatar"
                className="overflow-hidden rounded-full object-cover" // Added object-cover
                data-ai-hint={currentUser.dataAIHint || "user avatar"}
              />
            ) : (
              <UserCircle className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <RouterLink to="/profile" className="flex items-center gap-2"> {/* Changed Link */}
              <UserCircle className="h-4 w-4" /> Profile
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <RouterLink to="/settings" className="flex items-center gap-2"> {/* Changed Link */}
              <Settings className="h-4 w-4" /> Settings
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem> {/* onClick for logout would be needed */}
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
