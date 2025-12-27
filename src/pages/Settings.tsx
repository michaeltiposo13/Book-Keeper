import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export function Settings() {
  const { settings, updateLibraryInfo, updateRegionalSettings, updateBorrowingRules, updateBookManagement, updateEmailNotifications, updateBorrowerNotifications, updateAccountInfo, updatePassword } = useSettings();
  const { user } = useAuth();

  // General Tab - Library Info
  const [libraryName, setLibraryName] = useState(settings.libraryInfo.name);
  const [libraryCode, setLibraryCode] = useState(settings.libraryInfo.code);
  const [libraryEmail, setLibraryEmail] = useState(settings.libraryInfo.email);
  const [libraryPhone, setLibraryPhone] = useState(settings.libraryInfo.phone);
  const [libraryAddress, setLibraryAddress] = useState(settings.libraryInfo.address);

  // Regional Settings
  const [timezone, setTimezone] = useState(settings.regionalSettings.timezone);
  const [currency, setCurrency] = useState(settings.regionalSettings.currency);

  // Library Tab - Borrowing Rules
  const [maxBooks, setMaxBooks] = useState(settings.borrowingRules.maxBooksPerBorrower);
  const [borrowPeriod, setBorrowPeriod] = useState(settings.borrowingRules.defaultBorrowPeriod);
  const [lateFee, setLateFee] = useState(settings.borrowingRules.lateFeePerDay);
  const [damageFee, setDamageFee] = useState(settings.borrowingRules.damageFee);

  // Book Management
  const [autoApprove, setAutoApprove] = useState(settings.bookManagement.autoApproveRequests);
  const [sendReminders, setSendReminders] = useState(settings.bookManagement.sendReminders);
  const [allowRenewals, setAllowRenewals] = useState(settings.bookManagement.allowRenewals);

  // Notifications Tab - Email Notifications
  const [newBorrowRequest, setNewBorrowRequest] = useState(settings.emailNotifications.newBorrowRequest);
  const [overdueBooks, setOverdueBooks] = useState(settings.emailNotifications.overdueBooks);
  const [paymentReceived, setPaymentReceived] = useState(settings.emailNotifications.paymentReceived);
  const [lowStockAlert, setLowStockAlert] = useState(settings.emailNotifications.lowStockAlert);

  // Borrower Notifications
  const [requestApproved, setRequestApproved] = useState(settings.borrowerNotifications.requestApproved);
  const [dueDateReminder, setDueDateReminder] = useState(settings.borrowerNotifications.dueDateReminder);
  const [overdueNotice, setOverdueNotice] = useState(settings.borrowerNotifications.overdueNotice);

  // Account Tab
  const [firstName, setFirstName] = useState(settings.accountInfo.firstName);
  const [lastName, setLastName] = useState(settings.accountInfo.lastName);
  const [email, setEmail] = useState(settings.accountInfo.email);
  const [phone, setPhone] = useState(settings.accountInfo.phone);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update local state when settings change
  useEffect(() => {
    setLibraryName(settings.libraryInfo.name);
    setLibraryCode(settings.libraryInfo.code);
    setLibraryEmail(settings.libraryInfo.email);
    setLibraryPhone(settings.libraryInfo.phone);
    setLibraryAddress(settings.libraryInfo.address);
    setTimezone(settings.regionalSettings.timezone);
    setCurrency(settings.regionalSettings.currency);
    setMaxBooks(settings.borrowingRules.maxBooksPerBorrower);
    setBorrowPeriod(settings.borrowingRules.defaultBorrowPeriod);
    setLateFee(settings.borrowingRules.lateFeePerDay);
    setDamageFee(settings.borrowingRules.damageFee);
    setAutoApprove(settings.bookManagement.autoApproveRequests);
    setSendReminders(settings.bookManagement.sendReminders);
    setAllowRenewals(settings.bookManagement.allowRenewals);
    setNewBorrowRequest(settings.emailNotifications.newBorrowRequest);
    setOverdueBooks(settings.emailNotifications.overdueBooks);
    setPaymentReceived(settings.emailNotifications.paymentReceived);
    setLowStockAlert(settings.emailNotifications.lowStockAlert);
    setRequestApproved(settings.borrowerNotifications.requestApproved);
    setDueDateReminder(settings.borrowerNotifications.dueDateReminder);
    setOverdueNotice(settings.borrowerNotifications.overdueNotice);
    if (user) {
      setFirstName(user.name.split(' ')[0] || 'Admin');
      setLastName(user.name.split(' ')[1] || 'User');
      setEmail(user.email);
    }
  }, [settings, user]);

  const handleSaveGeneral = () => {
    updateLibraryInfo({
      name: libraryName,
      code: libraryCode,
      email: libraryEmail,
      phone: libraryPhone,
      address: libraryAddress,
    });
    updateRegionalSettings({
      timezone,
      currency,
    });
    toast.success("General settings saved successfully!");
  };

  const handleSaveLibrary = () => {
    updateBorrowingRules({
      maxBooksPerBorrower: maxBooks,
      defaultBorrowPeriod: borrowPeriod,
      lateFeePerDay: lateFee,
      damageFee: damageFee,
    });
    updateBookManagement({
      autoApproveRequests: autoApprove,
      sendReminders: sendReminders,
      allowRenewals: allowRenewals,
    });
    toast.success("Library settings saved successfully!");
  };

  const handleSaveNotifications = () => {
    updateEmailNotifications({
      newBorrowRequest,
      overdueBooks,
      paymentReceived,
      lowStockAlert,
    });
    updateBorrowerNotifications({
      requestApproved,
      dueDateReminder,
      overdueNotice,
    });
    toast.success("Notification settings saved successfully!");
  };

  const handleSaveAccount = () => {
    updateAccountInfo({
      firstName,
      lastName,
      email,
      phone,
    });
    toast.success("Account information saved successfully!");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const success = await updatePassword(currentPassword, newPassword);
    if (success) {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Current password is incorrect");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">Manage your library system preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Library Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="library-name">Library Name</Label>
                  <Input 
                    id="library-name" 
                    value={libraryName} 
                    onChange={(e) => setLibraryName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="library-code">Library Code</Label>
                  <Input 
                    id="library-code" 
                    value={libraryCode}
                    onChange={(e) => setLibraryCode(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="library-email">Contact Email</Label>
                <Input 
                  id="library-email" 
                  type="email" 
                  value={libraryEmail}
                  onChange={(e) => setLibraryEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="library-phone">Contact Phone</Label>
                <Input 
                  id="library-phone" 
                  value={libraryPhone}
                  onChange={(e) => setLibraryPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="library-address">Address</Label>
                <Input 
                  id="library-address" 
                  value={libraryAddress}
                  onChange={(e) => setLibraryAddress(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Regional Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-manila">Asia/Manila (Philippine Time)</SelectItem>
                      <SelectItem value="utc-5">UTC-5 (Eastern Time)</SelectItem>
                      <SelectItem value="utc-6">UTC-6 (Central Time)</SelectItem>
                      <SelectItem value="utc-7">UTC-7 (Mountain Time)</SelectItem>
                      <SelectItem value="utc-8">UTC-8 (Pacific Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="php">PHP (₱)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Borrowing Rules</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borrow-limit">Max Books per Borrower</Label>
                  <Input 
                    id="borrow-limit" 
                    type="number" 
                    value={maxBooks}
                    onChange={(e) => setMaxBooks(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrow-period">Default Borrow Period (days)</Label>
                  <Input 
                    id="borrow-period" 
                    type="number" 
                    value={borrowPeriod}
                    onChange={(e) => setBorrowPeriod(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="late-fee">Late Fee per Day ({currency === 'php' ? '₱' : '$'})</Label>
                  <Input 
                    id="late-fee" 
                    type="number" 
                    step="0.01"
                    value={lateFee}
                    onChange={(e) => setLateFee(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="damage-fee">Damage Fee ({currency === 'php' ? '₱' : '$'})</Label>
                  <Input 
                    id="damage-fee" 
                    type="number" 
                    step="0.01"
                    value={damageFee}
                    onChange={(e) => setDamageFee(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Book Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Requests</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve borrow requests</p>
                </div>
                <Switch 
                  checked={autoApprove}
                  onCheckedChange={setAutoApprove}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send reminders before due date</p>
                </div>
                <Switch 
                  checked={sendReminders}
                  onCheckedChange={setSendReminders}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Renewals</Label>
                  <p className="text-sm text-muted-foreground">Allow borrowers to renew books</p>
                </div>
                <Switch 
                  checked={allowRenewals}
                  onCheckedChange={setAllowRenewals}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveLibrary}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Borrow Request</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new requests are made</p>
                </div>
                <Switch 
                  checked={newBorrowRequest}
                  onCheckedChange={setNewBorrowRequest}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Overdue Books</Label>
                  <p className="text-sm text-muted-foreground">Get notified about overdue books</p>
                </div>
                <Switch 
                  checked={overdueBooks}
                  onCheckedChange={setOverdueBooks}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Received</Label>
                  <p className="text-sm text-muted-foreground">Get notified when payments are made</p>
                </div>
                <Switch 
                  checked={paymentReceived}
                  onCheckedChange={setPaymentReceived}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alert</Label>
                  <p className="text-sm text-muted-foreground">Get notified when book stock is low</p>
                </div>
                <Switch 
                  checked={lowStockAlert}
                  onCheckedChange={setLowStockAlert}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Borrower Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Request Approved</Label>
                  <p className="text-sm text-muted-foreground">Notify borrowers when requests are approved</p>
                </div>
                <Switch 
                  checked={requestApproved}
                  onCheckedChange={setRequestApproved}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Due Date Reminder</Label>
                  <p className="text-sm text-muted-foreground">Send reminders 2 days before due date</p>
                </div>
                <Switch 
                  checked={dueDateReminder}
                  onCheckedChange={setDueDateReminder}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Overdue Notice</Label>
                  <p className="text-sm text-muted-foreground">Send notices for overdue books</p>
                </div>
                <Switch 
                  checked={overdueNotice}
                  onCheckedChange={setOverdueNotice}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input 
                    id="first-name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input 
                    id="last-name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveAccount}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
