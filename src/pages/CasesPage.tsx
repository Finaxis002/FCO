import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import CaseTable from "@/components/cases/case-table";
import { MOCK_CASES } from "@/lib/constants";
import type { Case } from "@/types/franchise";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(() => {
        setCases(MOCK_CASES);
        resolve(null);
      }, 500));
      setLoading(false);
    };
    fetchCases();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="All Cases" description="Manage and track all franchise compliance cases.">
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button asChild disabled>
              <RouterLink to="/cases/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Case
              </RouterLink>
            </Button>
          </div>
        </PageHeader>
        <Card>
          <CardContent className="p-0">
             <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="All Cases" description="Manage and track all franchise compliance cases.">
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button asChild>
            <RouterLink to="/cases/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Case
            </RouterLink>
          </Button>
        </div>
      </PageHeader>
      <CaseTable cases={cases} />
    </>
  );
}
