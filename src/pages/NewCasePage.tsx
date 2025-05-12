import AddCaseForm from "@/components/forms/add-case-form";
import PageHeader from "@/components/ui/page-header";
import React from 'react';

export default function NewCasePage() {
  return (
    <>
      <PageHeader 
        title="Create New Case"
        description="Provide the necessary details to register a new franchise compliance case."
      />
      <div className="max-w-4xl mx-auto">
        <AddCaseForm />
      </div>
    </>
  );
}
