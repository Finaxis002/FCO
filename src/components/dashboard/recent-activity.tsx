import React from "react";
import { Link as RouterLink } from "react-router-dom";
import type { AppNotification, Case } from "@/types/franchise";
import { MOCK_CASES } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CheckCircle2,
  FilePlus,
  UserPlus,
  AlertCircle,
} from "lucide-react";

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface RecentCase {
  _id: string;
  unitName: string;
  overallStatus: string;
  lastUpdate: string;
}

interface RecentActivityProps {
  recentCases: RecentCase[];
  loading: boolean;
}

export default function RecentActivity({
  recentCases,
  loading,
}: RecentActivityProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Recent Case Updates
        </CardTitle>
        <CardDescription>
          Latest case progress and status changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-72px)]">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : recentCases.length > 0 ? (
          <ScrollArea className="flex-grow pr-4">
            <ul className="space-y-4">
              {recentCases.slice(0, 3).map((c) => (
                <li
                  key={c._id}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Left colored status indicator */}
                  <div
                    className={`
          w-2 h-12 rounded-full
          ${
            c.overallStatus === "Completed" || c.overallStatus === "Approved"
              ? "bg-green-500"
              : ""
          }
          ${c.overallStatus === "Pending" ? "bg-yellow-500" : ""}
          ${c.overallStatus === "In-Progress" ? "bg-blue-500" : ""}
          ${c.overallStatus === "Rejected" ? "bg-red-500" : ""}
        `}
                  ></div>

                  <div className="flex flex-col flex-grow min-w-0">
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {c.unitName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      Status:{" "}
                      <span className="font-medium">{c.overallStatus}</span>{" "}
                      &mdash; Updated {getRelativeTime(c.lastUpdate)}
                    </p>
                  </div>

                  <RouterLink
                    to={`/cases/${c._id}`}
                    className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                  >
                    View Details →
                  </RouterLink>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No recent case updates to display.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
