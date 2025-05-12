"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES, ROLE_PERMISSIONS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/franchise";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

export default function RoleManagementSettings() {
    const { toast } = useToast();

    const handlePermissionChange = (role: UserRole, permission: string, checked: boolean) => {
        // Placeholder: In a real app, update backend and global state
        console.log(`Permission change: Role ${role}, Permission ${permission}, Checked ${checked}`);
        toast({
            title: "Permission Updated (Simulated)",
            description: `Permission '${permission}' for role '${role}' set to ${checked}.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Define roles and their permissions within the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {USER_ROLES.map((role) => (
                        <AccordionItem value={role} key={role}>
                            <AccordionTrigger className="text-base font-medium">{role}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                                    <h4 className="text-sm font-semibold mb-2">Permissions for {role}:</h4>
                                    {Object.entries(ROLE_PERMISSIONS[role] || {}).map(([permissionKey, initialValue]) => (
                                        <div key={permissionKey} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`${role}-${permissionKey}`} 
                                                defaultChecked={initialValue}
                                                onCheckedChange={(checked) => handlePermissionChange(role, permissionKey, !!checked)}
                                            />
                                            <Label htmlFor={`${role}-${permissionKey}`} className="capitalize text-sm font-normal">
                                                {permissionKey.replace(/([A-Z])/g, ' $1').replace(/^can\s/, '')} {/* e.g. canCreate -> Create */}
                                            </Label>
                                        </div>
                                    ))}
                                    {Object.keys(ROLE_PERMISSIONS[role] || {}).length === 0 && (
                                        <p className="text-xs text-muted-foreground">No specific permissions defined for this role.</p>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                 <div className="mt-6 flex justify-end">
                    <Button>Save All Role Changes</Button> {/* Placeholder for a global save */}
                </div>
            </CardContent>
        </Card>
    );
}
