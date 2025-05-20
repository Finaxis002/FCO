import type { Case } from "@/types/franchise";
import CaseCard from "./case-card";
import { Button } from "@/components/ui/button";
import { Link as RouterLink } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

interface CaseCardViewProps {
  cases: Case[];
}

export default function CaseCardView({ cases }: CaseCardViewProps) {
  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
            <p className="text-xl font-semibold text-muted-foreground">No cases found.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new case.</p>
            <Button asChild className="mt-4">
              <RouterLink to="/cases/new">
                Add New Case
              </RouterLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((caseData) => (
        <CaseCard key={caseData.id} caseData={caseData} />
      ))}
    </div>
  );
}
