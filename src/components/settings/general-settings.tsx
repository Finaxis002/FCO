import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function GeneralSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage general application settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="appName">Application Name</Label>
          <Input id="appName" defaultValue="FranchiseFlow" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Enable or disable email notifications for case updates.
            </p>
          </div>
          <Switch id="emailNotifications" defaultChecked />
        </div>
         <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="darkMode" className="font-medium">Dark Mode</Label>
            <p className="text-xs text-muted-foreground">
              Toggle dark mode for the application. (Theme refresh may be needed)
            </p>
          </div>
          <Switch id="darkMode" />
        </div>
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
