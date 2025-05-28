import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, MessageSquareText, FileText } from "lucide-react";

function getRelativeTime(dateString: string) {
  if (!dateString) return "Unknown time";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

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
  _id?: string;
  unitName?: string;
  overallStatus?: string;
  lastUpdate: string;
  latestRemark?: string; // 👈 Add this
}

interface RecentRemark {
  _id: string;
  caseId: string;
  caseName: string;
  remark: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RecentActivityProps {
  recentCases: RecentCase[];
  loading: boolean;
}

export default function RecentActivity({
  recentCases,
  loading,
}: RecentActivityProps) {
  const [remarks, setRemarks] = useState<RecentRemark[]>([]);
  const [remarksLoading, setRemarksLoading] = useState(true);

  useEffect(() => {
    const fetchRecentRemarks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://fcobackend-23v7.onrender.com/api/remarks/recent",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch recent remarks");
        const data = await res.json();
        setRemarks(data);
      } catch (error) {
        console.error("Error fetching recent remarks:", error);
      } finally {
        setRemarksLoading(false);
      }
    };

    fetchRecentRemarks();
  }, []);

  // Combine cases and remarks into a single timeline
  const combinedActivities = [
    ...recentCases.map((c) => ({
      type: "case" as const,
      id: c._id || "",
      title: c.unitName || "",
      status: c.overallStatus || "",
      date: c.lastUpdate,
      content: c.latestRemark || "",
    })),
    ...(Array.isArray(remarks)
      ? remarks.map((r) => ({
          type: "remark" as const,
          id: r.caseId,
          title: r.caseName,
          status: r.status,
          date: r.createdAt, // <-- use createdAt instead of updatedAt
          content: r.remark,
        }))
      : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isLoading = loading || remarksLoading;

  return (
    // <Card className="h-full">
    //   <CardHeader>
    //     <CardTitle className="flex items-center">
    //       <Activity className="mr-2 h-5 w-5 text-primary" />
    //       Recent Case Updates
    //     </CardTitle>
    //     <CardDescription>
    //       Latest case progress and status changes.
    //     </CardDescription>
    //   </CardHeader>
    //   <CardContent className="flex flex-col h-[calc(100%-72px)]">
    //     {loading ? (
    //       <div className="space-y-4">
    //         {[...Array(5)].map((_, i) => (
    //           <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
    //         ))}
    //       </div>
    //     ) : recentCases.length > 0 ? (
    //       <ScrollArea className="flex-grow pr-4">
    //         <ul className="space-y-4">
    //           {recentCases.slice(0, 3).map((c) => (
    //             <li
    //               key={c._id}
    //               className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    //             >
    //               {/* Left colored status indicator */}
    //               <div
    //                 className={`
    //       w-2 h-12 rounded-full
    //       ${
    //         c.overallStatus === "Completed" || c.overallStatus === "Approved"
    //           ? "bg-green-500"
    //           : ""
    //       }
    //       ${c.overallStatus === "Pending" ? "bg-yellow-500" : ""}
    //       ${c.overallStatus === "In-Progress" ? "bg-blue-500" : ""}
    //       ${c.overallStatus === "Rejected" ? "bg-red-500" : ""}
    //     `}
    //               ></div>

    //               <div className="flex flex-col flex-grow min-w-0">
    //                 <p className="text-lg font-semibold text-gray-900 truncate">
    //                   {c.unitName}
    //                 </p>
    //                 <p className="text-sm text-gray-600 truncate">
    //                   Status:{" "}
    //                   <span className="font-medium">{c.overallStatus}</span>{" "}
    //                   &mdash; Updated {getRelativeTime(c.lastUpdate)}
    //                 </p>

    //                 {c.latestRemark && (
    //                   <p className="text-sm text-muted-foreground truncate">
    //                     📝 {c.latestRemark}
    //                   </p>
    //                 )}
    //               </div>

    //               <RouterLink
    //                 to={`/cases/${c._id}`}
    //                 className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
    //               >
    //                 View Details →
    //               </RouterLink>
    //             </li>
    //           ))}
    //         </ul>
    //       </ScrollArea>
    //     ) : (
    //       <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
    //         <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
    //         <p className="text-muted-foreground">
    //           No recent case updates to display.
    //         </p>
    //       </div>
    //     )}
    //   </CardContent>
    // </Card>
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest case updates and remarks from your team.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-72px)]">
  {isLoading ? (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  ) : combinedActivities.length > 0 ? (
    <ScrollArea className="flex-grow pr-4">
      <ul className="space-y-4">
        {combinedActivities.slice(0, 3).map((activity) => (
          <li
            key={`${activity.type}-${activity.id}-${activity.date}`}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Vertical indicator - different colors for cases vs remarks */}
            <div
              className={`
                w-2 h-12 rounded-full
                ${
                  activity.type === "case"
                    ? activity.status === "Completed" || activity.status === "Approved"
                      ? "bg-green-500"
                      : activity.status === "Pending"
                      ? "bg-yellow-500"
                      : activity.status === "In-Progress"
                      ? "bg-blue-500"
                      : activity.status === "Rejected"
                      ? "bg-red-500"
                      : "bg-gray-300"
                    : "bg-purple-500" // Different color for remarks
                }
              `}
            ></div>

            <div className="flex flex-col flex-grow min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-sm text-gray-800 truncate">
                {activity.type === "case" ? "Status" : "Remark added"}:{" "}
                <span 
                  className={`font-medium ${
                    activity.type === "case"
                      ? activity.status === "Completed" || activity.status === "Approved"
                        ? "text-green-600"
                        : activity.status === "Pending"
                        ? "text-yellow-600"
                        : activity.status === "In-Progress"
                        ? "text-blue-600"
                        : activity.status === "Rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                      : "text-purple-600" // Different color for remarks
                  }`}
                >
                  {activity.status}
                </span>{" "}
                &mdash; Updated {getRelativeTime(activity.date)}
              </p>

              {activity.content && (
                <div className="mt-1">
                  <p className={`text-sm ${
                    activity.type === "remark" 
                      ? "text-purple-700 bg-purple-50 p-2 rounded" 
                      : "text-muted-foreground"
                  } truncate`}>
                    {activity.type === "remark" ? "💬 " : "📝 "}
                    {activity.content}
                  </p>
                </div>
              )}
            </div>

            <RouterLink
              to={`/cases/${activity.id}`}
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
        No recent activity to display.
      </p>
    </div>
  )}
</CardContent>
    </Card>
  );
}
