"use client"; // This directive is not strictly necessary in Vite but doesn't harm.

import type { Case } from "@/types/franchise";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Link as LinkIcon, Eye } from "lucide-react";
import { Link as RouterLink } from "react-router-dom"; // Changed import
import StatusIndicator from "@/components/dashboard/status-indicator";
import { MOCK_USERS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react"; // Import React
import { Card, CardContent } from "@/components/ui/card";


interface CaseTableProps {
  cases: Case[];
}

export default function CaseTable({ cases }: CaseTableProps) {
  const { toast } = useToast();
  const [displayCases, setDisplayCases] = useState<Case[]>(cases);
  const [lastUpdateDisplayCache, setLastUpdateDisplayCache] = useState<Record<string, string>>({});

  useEffect(() => {
    setDisplayCases(cases);
  }, [cases]);

  useEffect(() => {
    // This effect is client-side only
    const newCache: Record<string, string> = {};
    cases.forEach(caseData => {
      if (caseData.lastUpdate) { 
        newCache[caseData.id] = new Date(caseData.lastUpdate).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } else {
        newCache[caseData.id] = 'N/A';
      }
    });
    setLastUpdateDisplayCache(newCache);
  }, [cases]);


  const handleGenerateLink = (caseData: Case) => {
    const viewLink = caseData.viewLink || `/view/case/${caseData.id}?token=${Math.random().toString(36).substring(7)}`;
    // Ensure window and navigator are available (standard for client-side)
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${viewLink}`);
      toast({
        title: "Link Generated & Copied!",
        description: "Viewer link copied to clipboard.",
      });
    } else {
      toast({
        title: "Clipboard Error",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  if (displayCases.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
            <p className="text-xl font-semibold text-muted-foreground">No cases found.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new case.</p>
            <Button asChild className="mt-4">
              <RouterLink to="/cases/new"> {/* Changed Link */}
                Add New Case
              </RouterLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">SR No.</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Owner Name</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[180px]">Last Update</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCases.map((caseData) => {
              const assignedUserObjects = caseData.assignedUsers
                .map(userId => MOCK_USERS.find(u => u.id === userId))
                .filter(Boolean);
              
              const lastUpdateDisplay = lastUpdateDisplayCache[caseData.id] || 'Loading...';

              return (
                <TableRow key={caseData.id} data-testid={`case-row-${caseData.id}`}>
                  <TableCell className="font-medium">{caseData.srNo}</TableCell>
                  <TableCell>{caseData.unitName}</TableCell>
                  <TableCell>{caseData.ownerName}</TableCell>
                  <TableCell>
                    <StatusIndicator status={caseData.overallStatus} showText />
                  </TableCell>
                  <TableCell>{lastUpdateDisplay}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                       {assignedUserObjects.length > 0 
                        ? (
                            <div className="flex -space-x-2 overflow-hidden">
                                {assignedUserObjects.slice(0,3).map(u => u && (
                                    <img 
                                         key={u.id} 
                                         className="inline-block h-6 w-6 rounded-full ring-2 ring-background" 
                                         src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}&background=random`} 
                                         alt={u.name}
                                         data-ai-hint="user avatar" />
                                ))}
                                {assignedUserObjects.length > 3 && (
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground ring-2 ring-background text-xs">
                                        +{assignedUserObjects.length - 3}
                                    </span>
                                )}
                            </div>
                        )
                        : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                       <Button variant="outline" size="icon" asChild aria-label="View Case Details">
                        <RouterLink to={`/cases/${caseData.id}`}> {/* Changed Link */}
                          <Eye className="h-4 w-4" />
                        </RouterLink>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleGenerateLink(caseData)} aria-label="Share Case">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" asChild aria-label="Edit Case">
                        {/* Assuming edit page route, if not, this can be a modal trigger */}
                        <RouterLink to={`/cases/${caseData.id}/edit`}> {/* Changed Link */}
                          <Edit className="h-4 w-4" />
                        </RouterLink>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
