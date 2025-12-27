import { useState, useEffect } from "react";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";

export function MemberSettings() {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    // Load member-specific settings from localStorage
    const memberSettings = localStorage.getItem(`member_settings_${user?.id}`);
    if (memberSettings) {
      setLocalSettings(JSON.parse(memberSettings));
    }
  }, [user?.id]);

  const handleSaveNotifications = () => {
    updateSettings(localSettings);
    localStorage.setItem(`member_settings_${user?.id}`, JSON.stringify(localSettings));
    toast.success("Notification preferences saved successfully");
  };

  const handleChangePassword = () => {
    if (!passwords.current) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    // Simulate password change (in real app, this would call API)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.id === user?.id) {
        return { ...u, password: passwords.new };
      }
      return u;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast.success("Password changed successfully");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and account settings
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-foreground mb-6">Email Notifications</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Borrow Confirmations</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when your borrow request is approved
                  </p>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Due Date Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded before your book due dates
                  </p>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Receipts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email receipts for payments
                  </p>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, emailNotifications: checked })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 pt-6 mt-6 border-t border-border">
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-foreground mb-6">In-App Notifications</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show desktop notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={localSettings.browserNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, browserNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound for notifications
                  </p>
                </div>
                <Switch
                  checked={localSettings.soundAlerts}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, soundAlerts: checked })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 pt-6 mt-6 border-t border-border">
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-foreground mb-6">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-foreground mb-4">Account Security</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">
                      Manage devices where you're logged in
                    </p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}