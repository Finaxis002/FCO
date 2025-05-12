"use client"; // Not strictly needed in Vite

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_SERVICES_TEMPLATES, MOCK_USERS } from "@/lib/constants";
import type { Service, Case, ServiceStatus } from "@/types/franchise";
import { useNavigate } from "react-router-dom"; // Changed import
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";


const caseFormSchema = z.object({
  srNo: z.string().min(1, "SR. No. is required"),
  ownerName: z.string().min(2, "Owner's name must be at least 2 characters."),
  unitName: z.string().min(2, "Unit name must be at least 2 characters."),
  franchiseAddress: z.string().min(5, "Franchise address is required."),
  promoters: z.string().optional(),
  authorizedPerson: z.string().optional(),
  services: z.array(z.object({
    name: z.string(),
    selected: z.boolean(),
  })).refine(value => value.some(service => service.selected), {
    message: "You must select at least one service.",
  }),
  assignedUsers: z.array(z.string()).optional(),
  reasonForStatus: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseFormSchema>;

const defaultServices = MOCK_SERVICES_TEMPLATES.map(service => ({
  name: service.name,
  selected: false,
}));

export default function AddCaseForm() {
  const navigate = useNavigate(); // Changed from useRouter
  const { toast } = useToast();

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      srNo: "",
      ownerName: "",
      unitName: "",
      franchiseAddress: "",
      promoters: "",
      authorizedPerson: "",
      services: defaultServices,
      assignedUsers: [],
      reasonForStatus: "",
    },
  });

  function onSubmit(data: CaseFormValues) {
    const newCaseServices: Service[] = data.services
      .filter(s => s.selected)
      .map((s, index) => ({
        id: `new-service-${index}-${Date.now()}`,
        name: s.name,
        status: "Pending" as ServiceStatus,
        remarks: "",
        completionPercentage: 0,
      }));

    const newCase: Partial<Case> = {
      id: `case-${Date.now()}`,
      srNo: data.srNo,
      ownerName: data.ownerName,
      unitName: data.unitName,
      franchiseAddress: data.franchiseAddress,
      promoters: data.promoters || "",
      authorizedPerson: data.authorizedPerson || "",
      services: newCaseServices,
      overallStatus: "Pending" as ServiceStatus,
      assignedUsers: data.assignedUsers || [],
      reasonForStatus: data.reasonForStatus,
      lastUpdate: new Date().toISOString(),
    };

    console.log("New Case Data:", newCase);
    // MOCK_CASES.unshift(newCase as Case); // This would typically be an API call
    toast({
      title: "Case Created!",
      description: `${newCase.unitName} has been successfully added.`,
    });
    navigate("/"); // Changed from router.push
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Franchise & Owner Details</CardTitle>
            <CardDescription>Provide the basic information about the franchise unit and its owner.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
              <FormField
                control={form.control}
                name="srNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SR. No.</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Name / Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., M/s Tumbledry Hub" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mr. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="franchiseAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Franchise Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Full address of the franchise unit" {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promoters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promoters (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Self, Co-promoter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authorizedPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authorized Person (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Contact person for communications" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Opted</CardTitle>
            <CardDescription>Select all services applicable for this case.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"> 
                  {form.getValues("services").map((service, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`services.${index}.selected`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:shadow-md transition-shadow">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {form.getValues("services")[index].name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  </div>
                  <FormMessage className="mt-2">{form.formState.errors.services?.message}</FormMessage>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Assignment & Notes</CardTitle>
            <CardDescription>Assign users and add any initial notes for this case.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="assignedUsers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Users (Optional)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value ? [value] : [])} defaultValue={field.value?.[0]}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select users to assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_USERS.filter(u => u.role === "Back Office" || u.role === "Local Area Head").map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select primary back-office or local area head. More can be assigned later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="reasonForStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Note / Reason (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Initial assessment notes, PMEGP status reason..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
        </Card>
            
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}> {/* Changed from router.back */}
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating Case..." : "Create Case"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
