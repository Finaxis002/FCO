import { Link as RouterLink } from "react-router-dom"; // Changed import
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store"; // adjust path as per your project
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import {
  PanelLeft,
  Search,
  Settings,
  UserCircle,
  LogOut,
  Bell,
  Building2,
  CheckCircle2,
  FilePlus,
  UserPlus,
  AlertCircle,
  Activity,
  MessageSquarePlus,
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
import { APP_NAME, MOCK_USERS, MOCK_NOTIFICATIONS } from "@/lib/constants";
import React, { useMemo } from "react";
import type { AppNotification } from "@/types/franchise";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added AvatarImage

function getRelativeTimeShort(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

const NOTIFICATION_ICONS_DROPDOWN: Record<
  AppNotification["type"],
  React.ElementType
> = {
  update: CheckCircle2,
  creation: FilePlus,
  assign: UserPlus,
  deletion: AlertCircle,
};

export default function MainHeader() {
  const [recentNotifications, setRecentNotifications] = useState<
    AppNotification[]
  >([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [recentRemarks, setRecentRemarks] = useState<any[]>([]);
  const [unreadRemarkCount, setUnreadRemarkCount] = useState(0);
  //serachbar
  const [searchQuery, setSearchQuery] = useState("");
  // State to hold current search term
  const [searchTerm, setSearchTerm] = useState("");

  // Array of highlighted elements (<mark> tags)
  const [highlightRefs, setHighlightRefs] = useState<HTMLElement[]>([]);

  // Index to track currently selected highlighted match
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Clear previous highlights
    document.querySelectorAll("mark[data-highlight]").forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(
        document.createTextNode(mark.textContent || ""),
        mark
      );
      parent.normalize();
    });

    if (!searchTerm) {
      setHighlightRefs([]);
      setCurrentIndex(0);
      return;
    }

    // Escape regex special characters in searchTerm
    const escapedTerm = searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${escapedTerm})`, "gi");

    const foundMarks: HTMLElement[] = [];

    // Recursive function to walk text nodes and highlight matches
    const walk = (node: Node) => {
      if (
        node.nodeType === 3 && // text node
        node.parentNode &&
        node.parentNode.nodeName !== "SCRIPT" &&
        node.parentNode.nodeName !== "STYLE"
      ) {
        const text = node.nodeValue;
        if (text && regex.test(text)) {
          const span = document.createElement("span");
          span.innerHTML = text.replace(
            regex,
            `<mark data-highlight style="background: yellow;">$1</mark>`
          );
          const fragment = document.createDocumentFragment();
          while (span.firstChild) {
            const child = span.firstChild;
            if ((child as HTMLElement).tagName === "MARK")
              foundMarks.push(child as HTMLElement);
            fragment.appendChild(child);
          }
          node.parentNode.replaceChild(fragment, node);
        }
      } else if (node.nodeType === 1) {
        // element node
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    };

    walk(document.body);

    setHighlightRefs(foundMarks);
    setCurrentIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && highlightRefs.length > 0) {
        e.preventDefault();
        const el = highlightRefs[currentIndex];
        if (!el) return;

        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.background = "orange";

        // Reset other highlights to yellow
        highlightRefs.forEach((mark, idx) => {
          if (idx !== currentIndex) mark.style.background = "yellow";
        });

        setCurrentIndex((prev) => (prev + 1) % highlightRefs.length);
      } else if (e.key === "Escape") {
        // Clear search and highlights on Escape
        setSearchTerm("");
        setHighlightRefs([]);
        setCurrentIndex(0);

        document.querySelectorAll("mark[data-highlight]").forEach((mark) => {
          const parent = mark.parentNode;
          if (!parent) return;
          parent.replaceChild(
            document.createTextNode(mark.textContent || ""),
            mark
          );
          parent.normalize();
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [highlightRefs, currentIndex]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === "k") || e.key === "/") {
        e.preventDefault();
        const input = document.getElementById(
          "global-search-input"
        ) as HTMLInputElement | null;
        if (input) input.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const clearSearch = () => {
    setSearchTerm("");
    setHighlightRefs([]);
    setCurrentIndex(0);

    document.querySelectorAll("mark[data-highlight]").forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(
        document.createTextNode(mark.textContent || ""),
        mark
      );
      parent.normalize();
    });
  };

  //notification badge
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://tumbledrybe.sharda.co.in/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();

        setRecentNotifications(data);

        const unreadCount = data.filter((n: { read: any }) => !n.read).length;
        setUnreadNotificationCount(unreadCount);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  //remarks badge

  const userRole = localStorage.getItem("userRole");

  const isAdmin = userRole === "Admin" || userRole === "Super Admin";

  const fetchRecentRemarks = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const res = await fetch(
        "https://tumbledrybe.sharda.co.in/api/remarks/recent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch recent remarks");
      const data = await res.json();

      setRecentRemarks(data);
      // console.log("Current user ID:", currentUserId);
      // console.log(
      //   "Remarks readBy arrays:",
      //   data.map((r: { readBy: any }) => r.readBy)
      // );

      // Calculate unread count based on currentUser.id and readBy array
      const unread = data.filter((r: any) => {
        return !(r.readBy ?? []).includes(currentUserId);
      }).length;
      setUnreadRemarkCount(unread);
    } catch (err) {
      console.error("Error loading recent remarks:", err);
    }
  };

  useEffect(() => {
    fetchRecentRemarks();
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage or any auth tokens/state
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");

    // Optionally clear other app state or context if needed

    // Redirect to login page
    navigate("/login");
  };

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId =
    currentUser?._id || currentUser?.id || currentUser?.userId;

  useEffect(() => {
    const handleUpdate = () => {
      fetchRecentRemarks(); // Make sure this function sets unreadRemarkCount
    };

    window.addEventListener("remarks-updated", handleUpdate);
    return () => {
      window.removeEventListener("remarks-updated", handleUpdate);
    };
  }, []);

  // console.log("unread remark count", unreadRemarkCount);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 print:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="sm:max-w-xs bg-sidebar text-sidebar-foreground"
        >
          <nav className="grid gap-6 text-lg font-medium">
            <RouterLink
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
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search in page..."
              className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[320px]"
              aria-label="Search cases"
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-3 mr-5 flex items-center gap-2">
              {highlightRefs.length > 0 && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {currentIndex === 0 ? 1 : currentIndex}/{highlightRefs.length}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* notification  */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Notifications</span>
            {unreadNotificationCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {unreadNotificationCount} New
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {recentNotifications.length > 0 ? (
            recentNotifications
              .slice(0, 3) // ✅ Limit to latest 3
              .map((notification: AppNotification, index: number) => {
                const Icon =
                  NOTIFICATION_ICONS_DROPDOWN[notification.type] || Activity;

                return (
                  <DropdownMenuItem
                    key={notification.id ?? index}
                    asChild
                    className="cursor-pointer !p-0"
                  >
                    <RouterLink
                      to={
                        notification.caseId
                          ? `/cases/${notification.caseId}`
                          : "/notifications"
                      }
                      className="flex items-start gap-2 p-2 w-full"
                    >
                      <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                        {" "}
                        {/* Added shrink-0 */}
                        <AvatarFallback
                          className={
                            notification.read
                              ? "bg-muted"
                              : "bg-primary/10 text-primary"
                          }
                        >
                          <Icon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        {" "}
                        {/* Added overflow-hidden */}
                        <p
                          className={`text-xs leading-snug ${
                            !notification.read ? "font-medium" : ""
                          } truncate`}
                        >
                          {notification.message}
                        </p>{" "}
                        {/* Added truncate */}
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTimeShort(notification.timestamp)}
                        </p>
                      </div>
                    </RouterLink>
                  </DropdownMenuItem>
                );
              })
          ) : (
            <DropdownMenuItem disabled>
              <div className="text-xs text-muted-foreground text-center py-2 w-full">
                No new notifications
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="!p-0">
            <RouterLink
              to="/notifications"
              className="flex items-center justify-center py-2 text-sm font-medium text-primary hover:bg-accent w-full"
            >
              View all notifications
            </RouterLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* remarks  */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <MessageSquarePlus className="h-5 w-5" />
            {unreadRemarkCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
            )}
            <span className="sr-only">Toggle remarks</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Recent Remarks</span>
            {unreadRemarkCount > 0 && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {unreadRemarkCount} New
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {recentRemarks.length > 0 ? (
            recentRemarks.slice(0, 3).map((remark) => (
              <DropdownMenuItem
                key={remark._id}
                asChild
                className="cursor-pointer !p-0"
              >
                <RouterLink
                  to={`/cases/${remark.caseId}?serviceId=${remark.serviceId}`}
                  className="flex items-start gap-2 p-2 w-full"
                >
                  <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {remark.userName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium truncate">
                      {remark.remark.length > 50
                        ? remark.remark.slice(0, 47) + "..."
                        : remark.remark}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTimeShort(remark.createdAt)}
                    </p>
                  </div>
                </RouterLink>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              <div className="text-xs text-muted-foreground text-center py-2 w-full">
                No recent remarks
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="!p-0">
            <RouterLink
              to="/remarks"
              className="flex items-center justify-center py-2 text-sm font-medium text-primary hover:bg-accent w-full"
            >
              View all remarks
            </RouterLink>
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
            <Avatar className="h-full w-full">
              {currentUser.avatarUrl ? (
                <AvatarImage
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  data-ai-hint={currentUser.dataAIHint || "user avatar"}
                />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.name
                    ? currentUser.name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <RouterLink to="/profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" /> Profile
            </RouterLink>
          </DropdownMenuItem>
          {isAdmin ? (
            <DropdownMenuItem asChild>
              <RouterLink to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </RouterLink>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
