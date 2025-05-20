"use client"; // Not strictly needed in Vite
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MOCK_SERVICES_TEMPLATES, MOCK_USERS } from "@/lib/constants";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectReact from "react-select";
import { addCase } from "@/features/caseSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useAppSelector } from "@/hooks/hooks";
import CreatableSelect from "react-select/creatable";
import { Controller } from "react-hook-form";
import { getAllUsers } from "@/features/userSlice"; // adjust path if needed
import { AddServiceDialog } from "../ui/AddServiceDialog";
import type { ServiceStatus } from "@/types/franchise"; // <-- Adjust the import path as needed

const allowedStatuses = [
  "Pending",
  "In-Progress",
  "Completed",
  "Rejected",
  "Approved",
] as const;

const caseFormSchema = z.object({
  srNo: z.string().min(1, "SR. No. is required"),
  ownerName: z.string().min(2, "Owner's name must be at least 2 characters."),
  clientName: z.string().min(2, "Client name must be at least 2 characters."), // new client field
  unitName: z.string().min(2, "Unit name must be at least 2 characters."),
  franchiseAddress: z.string().min(5, "Franchise address is required."),
  promoters: z.string().optional(),
  authorizedPerson: z.string().optional(),
  services: z
    .array(
      z.object({
        name: z.string(),
        selected: z.boolean(),
      })
    )
    .refine((value) => value.some((service) => service.selected), {
      message: "You must select at least one service.",
    }),
  assignedUsers: z.array(z.string()).optional(),
  status: z.enum(allowedStatuses, {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  reasonForStatus: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseFormSchema>;

const defaultServices = MOCK_SERVICES_TEMPLATES.map((service) => ({
  name: service.name,
  selected: false,
}));

export default function AddCaseForm() {
  const [globalServices, setGlobalServices] = useState<{ name: string }[]>([]);
  const { caseId } = useParams();
  const isEditing = !!caseId;
  const [loadingEdit, setLoadingEdit] = useState(false);
  // Change these state declarations
  const [ownerOptions, setOwnerOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [clientOptions, setClientOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // For debounce search

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useAppSelector((state) => state.users);
  console.log("Loaded users:", users);
    const defaultServices = globalServices.map((service) => ({
    name: service.name,
    selected: false,
  }));

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      srNo: "",
      ownerName: "",
      clientName: "", // new client field
      unitName: "",
      franchiseAddress: "",
      promoters: "",
      authorizedPerson: "",
      services: defaultServices,
      assignedUsers: [],
      reasonForStatus: "",
      status: "Pending",
    },
  });
  


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/services");
        setGlobalServices(res.data);
      } catch (e) {
        console.error("Failed to fetch services", e);
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive",
        });
      }
    };
    fetchServices();
  }, []);


  // Inside the AddCaseForm component, add this function:
  const handleAddNewService = (serviceName: string) => {
    const currentServices = form.getValues("services");

    // Check if service already exists
    if (
      currentServices.some(
        (s) => s.name.toLowerCase() === serviceName.toLowerCase()
      )
    ) {
      toast({
        title: "Service exists",
        description: "This service already exists in the list",
        variant: "destructive",
      });
      return;
    }

    // Add new service
    form.setValue("services", [
      ...currentServices,
      { name: serviceName, selected: true },
    ]);

    toast({
      title: "Service added",
      description: `${serviceName} has been added to the services list`,
    });
  };

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    const fetchCase = async () => {
      if (!isEditing) return;

      setLoadingEdit(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/cases/${caseId}`
        );
        const caseData = res.data;

        // Extract service names from MOCK_SERVICES_TEMPLATES
        const templateServiceNames = MOCK_SERVICES_TEMPLATES.map((s) => s.name);

        // Extract service names from saved case data
        const savedServices = caseData.services || [];
        const savedServiceNames = savedServices.map((s: any) => s.name);

        // Find any additional services saved but NOT in template
        const additionalServices = savedServices.filter(
          (s: any) => !templateServiceNames.includes(s.name)
        );

        // Create combined services list: template + any additional
        const combinedServices = [
          ...MOCK_SERVICES_TEMPLATES,
          ...additionalServices,
        ];

        // Now map combined list to checkbox form, mark selected if present in saved services
        const serviceDefaults = combinedServices.map((s: any) => ({
          name: s.name,
          selected: savedServiceNames.includes(s.name),
        }));

        // Handle assignedUsers as before...
        const assignedUserIds =
          caseData.assignedUsers?.map((u: any) =>
            typeof u === "string" ? u : u._id
          ) || [];

        form.reset({
          srNo: caseData.srNo,
          ownerName: caseData.ownerName,
          clientName: caseData.clientName,
          unitName: caseData.unitName,
          franchiseAddress: caseData.franchiseAddress,
          promoters: Array.isArray(caseData.promoters)
            ? caseData.promoters.join(", ")
            : caseData.promoters || "",
          authorizedPerson: caseData.authorizedPerson,
          assignedUsers: assignedUserIds,
          reasonForStatus: caseData.reasonForStatus,
          services: serviceDefaults,
          status: caseData.status || "Pending",
        });
      } catch (err) {
        console.error("Failed to load case:", err);
      } finally {
        setLoadingEdit(false);
      }
    };

    fetchCase();
  }, [caseId, isEditing, form]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/owners");
        setOwnerOptions(
          res.data.map((o: any) => ({
            label: o.name,
            value: o.name,
          }))
        );
      } catch (e) {
        console.error("Failed to fetch owners", e);
      }
    };

    fetchOwners();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/clients");
        setClientOptions(
          res.data.map((c: any) => ({
            label: c.name,
            value: c.name,
          }))
        );
      } catch (e) {
        console.error("Failed to fetch clients", e);
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        });
      }
    };
    fetchClients();
  }, []);

  // Create Owner if not exists
  const createOwner = async (name: string) => {
    try {
      const res = await axios.post("http://localhost:5000/api/owners", {
        name,
      });
      const newOption = { label: name, value: name }; // Create proper option object
      setOwnerOptions((prev) => [...prev, newOption]); // Add the complete option
      return name; // Return the name for consistency
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create owner",
        variant: "destructive",
      });
      return null;
    }
  };
  // Create Client if not exists
  const createClient = async (name: string) => {
    console.log("Attempting to create client:", name);
    try {
      const res = await axios.post("http://localhost:5000/api/clients", {
        name,
      });
      console.log("Client creation response:", res.data);
      const newOption = { label: name, value: name };
      setClientOptions((prev) => [...prev, newOption]);
      return name;
    } catch (err) {
      let errorMessage = "Unknown error";
      if (typeof err === "object" && err !== null) {
        if (
          "response" in err &&
          typeof (err as any).response === "object" &&
          (err as any).response !== null
        ) {
          errorMessage =
            (err as any).response.data?.message ||
            (err as any).message ||
            "Unknown error";
        } else if ("message" in err) {
          errorMessage = (err as any).message;
        }
      }
      console.error("Client creation error:", errorMessage);
      toast({
        title: "Error",
        description: "Failed to create client: " + errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const onSubmit = async (data: CaseFormValues) => {
    try {
      if (!ownerOptions.some((opt) => opt.value === data.ownerName)) {
        const createdOwner = await createOwner(data.ownerName);
        if (!createdOwner) {
          throw new Error("Failed to create owner.");
        }
        // After creating, add to options if not already there
        if (!ownerOptions.some((opt) => opt.value === createdOwner)) {
          setOwnerOptions((prev) => [
            ...prev,
            { label: createdOwner, value: createdOwner },
          ]);
        }
      }

      // Check if client exists (using correct option format)
      if (!clientOptions.some((opt) => opt.value === data.clientName)) {
        const createdClient = await createClient(data.clientName);
        if (!createdClient) throw new Error("Failed to create client.");
      }
      // Step 2: Prepare service details
      const newCaseServices = data.services
        .filter((s) => s.selected)
        .map((s, index) => ({
          id: `service-${index}-${Date.now()}`,
          name: s.name,
          status: "Pending" as ServiceStatus, // <-- Cast to ServiceStatus
          remarks: "",
          completionPercentage: 0,
        }));

      const casePayload = {
        srNo: data.srNo,
        ownerName: data.ownerName,
        clientName: data.clientName, // Include client name
        unitName: data.unitName,
        franchiseAddress: data.franchiseAddress,
        promoters: data.promoters || "",
        authorizedPerson: data.authorizedPerson || "",
        services: newCaseServices,
        assignedUsers: (data.assignedUsers || []).map((userId) => {
          const user = users.find((u) => u._id === userId);
          if (!user) {
            console.warn(`User with ID ${userId} not found`);
            return {
              _id: userId,
              userId: "",
              name: "Unknown User",
            };
          }
          return {
            _id: user._id,
            userId: user.userId || "",
            name: user.name,
          };
        }),
        reasonForStatus: data.reasonForStatus,
        status: data.status, // <-- include this
        overallStatus: data.status, // or set a default/logic if needed
        lastUpdate: new Date().toISOString(), // or use Date.now() if backend expects a number
        _id: "", // Placeholder for new case, backend should assign real _id
        updatedAt: new Date().toISOString(), // Placeholder, backend should update this
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/cases/${caseId}`,
          casePayload
        );
        toast({
          title: "Case Updated!",
          description: "Changes saved successfully.",
        });
        navigate(`/cases/${caseId}`);
      } else {
        const result = await dispatch(addCase(casePayload));
        if (addCase.fulfilled.match(result)) {
          toast({
            title: "Case Created!",
            description: `${data.unitName} was added.`,
          });
          navigate(`/cases/${result.payload._id || result.payload.id}`);
        } else {
          throw new Error(
            typeof result.payload === "string"
              ? result.payload
              : JSON.stringify(result.payload) || "Failed to add case"
          );
        }
      }

      navigate("/cases");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Submission failed",
          variant: "destructive",
        });
      }
    }
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Franchise & Owner Details</CardTitle>
              <CardDescription>
                Provide the basic information about the franchise unit and its
                owner.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                {/* SR No */}
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

                {/* Unit Name */}
                <FormField
                  control={form.control}
                  name="unitName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Name / Project Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., M/s Tumbledry Hub"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Owner Name */}
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner's Name</FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="ownerName"
                          render={({ field: { onChange, value, ref } }) => (
                            <CreatableSelect
                              isClearable
                              isSearchable
                              options={ownerOptions}
                              onChange={(selectedOption) =>
                                onChange(
                                  selectedOption ? selectedOption.value : ""
                                )
                              }
                              value={
                                value
                                  ? ownerOptions.find(
                                      (opt) => opt.value === value
                                    ) || {
                                      label: value,
                                      value: value,
                                    }
                                  : null
                              }
                              placeholder="Select or create owner..."
                              ref={ref}
                              classNamePrefix="react-select"
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Client Name */}
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client's Name</FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="clientName"
                          render={({ field: { onChange, value, ref } }) => (
                            <CreatableSelect
                              isClearable
                              isSearchable
                              options={clientOptions}
                              onChange={(selectedOption) =>
                                onChange(
                                  selectedOption ? selectedOption.value : ""
                                )
                              }
                              value={
                                value
                                  ? clientOptions.find(
                                      (opt) => opt.value === value
                                    ) || {
                                      label: value,
                                      value: value,
                                    }
                                  : null
                              }
                              placeholder="Select or create client..."
                              ref={ref}
                              classNamePrefix="react-select"
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Franchise Address */}
                <FormField
                  control={form.control}
                  name="franchiseAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Franchise Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full address of the franchise unit"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Promoters */}
                <FormField
                  control={form.control}
                  name="promoters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promoters (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Self, Co-promoter"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Authorized Person */}
                <FormField
                  control={form.control}
                  name="authorizedPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authorized Person (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Contact person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Services Opted</CardTitle>
                  <CardDescription>Select applicable services.</CardDescription>
                </div>
                <AddServiceDialog onAddService={handleAddNewService}>
                  <Button variant="outline" size="sm">
                    Add Service
                  </Button>
                </AddServiceDialog>
              </div>
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
                            <FormItem className="flex flex-row items-center space-x-3 rounded-md border p-4 shadow-sm hover:shadow-md transition-shadow">
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
                    <FormMessage className="mt-2">
                      {form.formState.errors.services?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assignments & Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment & Notes</CardTitle>
              <CardDescription>Assign users and add notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="assignedUsers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Users</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="assignedUsers"
                        render={({ field: { onChange, value, ref } }) => (
                          <SelectReact
                            ref={ref}
                            isMulti
                            options={users.map((user) => ({
                              label: `${user.name} (${user.userId})`, // format: name (userId)
                              value: user._id,
                            }))}
                            value={
                              value
                                ? users
                                    .filter((u) => value.includes(u._id))
                                    .map((u) => ({
                                      label: `${u.name} (${u.userId})`, // same format for selected values
                                      value: u._id,
                                    }))
                                : []
                            }
                            onChange={(selectedOptions) =>
                              onChange(selectedOptions.map((opt) => opt.value))
                            }
                            placeholder="Select one or more users"
                            classNamePrefix="react-select"
                          />
                        )}
                      />
                    </FormControl>
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
                      <Textarea
                        placeholder="e.g., PMEGP status reason..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? isEditing
                  ? "Updating Case..."
                  : "Creating Case..."
                : isEditing
                ? "Update Case"
                : "Create Case"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
