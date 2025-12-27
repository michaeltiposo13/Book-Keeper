import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { User, Mail, Shield, Calendar, BookOpen, CreditCard, Camera, Edit2, Clock, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export function MemberProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showImageConfirm, setShowImageConfirm] = useState(false);
  const [showNameConfirm, setShowNameConfirm] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Renew membership states
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Load profile image
      const savedImage = localStorage.getItem(`profile_image_${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }

      // Load activity log
      loadActivityLog();
    }
  }, [user]);

  const loadActivityLog = () => {
    if (!user) return;
    
    const borrows = JSON.parse(localStorage.getItem(`borrows_${user.id}`) || '[]');
    const payments = JSON.parse(localStorage.getItem(`payments_${user.id}`) || '[]');
    
    const activities: any[] = [];
    
    // Add borrow activities
    borrows.forEach((borrow: any) => {
      if (borrow.status === 'returned') {
        activities.push({
          action: `Returned "${borrow.bookTitle}"`,
          date: borrow.returnDate,
          status: 'completed',
          type: 'return'
        });
      } else if (borrow.status === 'active') {
        activities.push({
          action: `Borrowed "${borrow.bookTitle}"`,
          date: borrow.borrowDate,
          status: 'active',
          type: 'borrow'
        });
      } else if (borrow.status === 'pending') {
        activities.push({
          action: `Requested to borrow "${borrow.bookTitle}"`,
          date: borrow.borrowDate || new Date().toISOString(),
          status: 'pending',
          type: 'request'
        });
      }
    });
    
    // Add payment activities
    payments.forEach((payment: any) => {
      activities.push({
        action: `Paid ₱${payment.amount.toFixed(2)} for ${payment.reason || 'late fee'}`,
        date: payment.date,
        status: 'completed',
        type: 'payment'
      });
    });

    // Check for profile updates
    const profileUpdates = JSON.parse(localStorage.getItem(`member_activity_${user.id}`) || '[]');
    activities.push(...profileUpdates);
    
    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setRecentActivity(activities.slice(0, 20));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPendingImage(base64String);
        setShowImageConfirm(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const confirmImageChange = () => {
    if (pendingImage && user) {
      setProfileImage(pendingImage);
      localStorage.setItem(`profile_image_${user.id}`, pendingImage);
      
      // Log the activity
      const activityLog = JSON.parse(localStorage.getItem(`member_activity_${user.id}`) || '[]');
      activityLog.unshift({
        action: 'Updated profile picture',
        date: new Date().toISOString(),
        status: 'completed',
        type: 'profile'
      });
      localStorage.setItem(`member_activity_${user.id}`, JSON.stringify(activityLog));
      
      setShowImageConfirm(false);
      setPendingImage(null);
      toast.success('Profile picture updated successfully!');
      loadActivityLog();
    }
  };

  const handleSave = () => {
    if (formData.name.trim() === '') {
      toast.error('Name cannot be empty');
      return;
    }
    setShowNameConfirm(true);
  };

  const confirmSave = () => {
    if (user && formData.name.trim()) {
      // Update user name in localStorage users array
      const users = JSON.parse(localStorage.getItem('library_users') || '[]');
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, name: formData.name };
        }
        return u;
      });
      localStorage.setItem('library_users', JSON.stringify(updatedUsers));

      // Update context
      updateUser({ ...user, name: formData.name });

      // Log the activity
      const activityLog = JSON.parse(localStorage.getItem(`member_activity_${user.id}`) || '[]');
      activityLog.unshift({
        action: 'Updated profile information',
        date: new Date().toISOString(),
        status: 'completed',
        type: 'profile'
      });
      localStorage.setItem(`member_activity_${user.id}`, JSON.stringify(activityLog));

      setShowNameConfirm(false);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      loadActivityLog();
    }
  };

  const handleRenewMembership = () => {
    setShowRenewDialog(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowRenewDialog(false);
    setShowQRDialog(true);
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProof = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
  };

  const handleSubmitPayment = () => {
    if (!paymentProof) {
      toast.error('Please upload proof of payment');
      return;
    }
    setShowPaymentConfirm(true);
  };

  const confirmPayment = () => {
    if (user && selectedPaymentMethod && paymentProof) {
      const renewalFee = 500; // ₱500 renewal fee
      
      // Add payment to payments list
      const payments = JSON.parse(localStorage.getItem(`payments_${user.id}`) || '[]');
      const newPayment = {
        id: `PAY-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        amount: renewalFee,
        reason: 'Membership Renewal',
        paymentMethod: selectedPaymentMethod,
        date: new Date().toISOString(),
        status: 'completed',
        proofOfPayment: paymentProofPreview
      };
      payments.push(newPayment);
      localStorage.setItem(`payments_${user.id}`, JSON.stringify(payments));
      
      // Add to global payments
      const allPayments = JSON.parse(localStorage.getItem('all_payments') || '[]');
      allPayments.push(newPayment);
      localStorage.setItem('all_payments', JSON.stringify(allPayments));

      // Log the activity
      const activityLog = JSON.parse(localStorage.getItem(`member_activity_${user.id}`) || '[]');
      activityLog.unshift({
        action: `Paid ₱${renewalFee.toFixed(2)} for membership renewal via ${selectedPaymentMethod}`,
        date: new Date().toISOString(),
        status: 'completed',
        type: 'payment'
      });
      localStorage.setItem(`member_activity_${user.id}`, JSON.stringify(activityLog));

      setShowPaymentConfirm(false);
      setShowQRDialog(false);
      setSelectedPaymentMethod("");
      setPaymentProof(null);
      setPaymentProofPreview(null);
      toast.success('Payment submitted successfully! Your membership has been renewed.');
      loadActivityLog();
    }
  };

  const membershipInfo = {
    memberSince: "2024-01-15",
    membershipType: "Basic",
    expiryDate: "2025-01-15",
    borrowLimit: 3,
    currentBorrows: JSON.parse(localStorage.getItem(`borrows_${user?.id}`) || '[]').filter((b: any) => b.status === 'active').length,
  };

  const stats = {
    totalBorrows: JSON.parse(localStorage.getItem(`borrows_${user?.id}`) || '[]').length,
    activeBorrows: JSON.parse(localStorage.getItem(`borrows_${user?.id}`) || '[]').filter((b: any) => b.status === 'active').length,
    totalFines: JSON.parse(localStorage.getItem(`payments_${user?.id}`) || '[]')
      .filter((p: any) => p.reason?.toLowerCase().includes('fine') || p.reason?.toLowerCase().includes('late'))
      .reduce((sum: number, p: any) => sum + p.amount, 0),
    paidFines: JSON.parse(localStorage.getItem(`payments_${user?.id}`) || '[]')
      .filter((p: any) => p.reason?.toLowerCase().includes('fine') || p.reason?.toLowerCase().includes('late'))
      .reduce((sum: number, p: any) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and view your library activity
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground">Personal Information</h2>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <label 
                  htmlFor="member-profile-image" 
                  className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input 
                    type="file" 
                    id="member-profile-image" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-medium text-foreground">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <Badge variant="secondary">{user?.role}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Membership Tab */}
        <TabsContent value="membership" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-foreground mb-6">Membership Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium text-foreground">
                      {new Date(membershipInfo.memberSince).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'Asia/Manila'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Membership Type</p>
                    <p className="font-medium text-foreground">{membershipInfo.membershipType}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Membership Expiry</p>
                    <p className="font-medium text-foreground">
                      {new Date(membershipInfo.expiryDate).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'Asia/Manila'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Borrow Limit</p>
                    <p className="font-medium text-foreground">
                      {membershipInfo.currentBorrows} / {membershipInfo.borrowLimit} books
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <Button onClick={handleRenewMembership}>
                <CreditCard className="w-4 h-4 mr-2" />
                Renew Membership
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Borrows</p>
                  <p className="text-xl font-semibold text-foreground">{stats.totalBorrows}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Borrows</p>
                  <p className="text-xl font-semibold text-foreground">{stats.activeBorrows}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Fines</p>
                  <p className="text-xl font-semibold text-foreground">₱{stats.totalFines.toFixed(2)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid Fines</p>
                  <p className="text-xl font-semibold text-foreground">₱{stats.paidFines.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-foreground mb-4">Activity Logs</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All your library activities are recorded with Philippine timezone (Asia/Manila)
            </p>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No activity recorded yet</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3 pr-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'active' ? 'bg-blue-500' : 
                            activity.status === 'pending' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <div>
                            <p className="text-sm text-foreground">{activity.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.date).toLocaleString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Asia/Manila'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          activity.status === 'active' ? 'default' : 
                          activity.status === 'pending' ? 'secondary' :
                          'secondary'
                        }>
                          {activity.status}
                        </Badge>
                      </div>
                      {index < recentActivity.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Picture Confirmation Dialog */}
      <AlertDialog open={showImageConfirm} onOpenChange={setShowImageConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>Do you want to use this image as your profile picture?</p>
                {pendingImage && (
                  <div className="flex justify-center">
                    <img 
                      src={pendingImage} 
                      alt="Preview" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-border"
                    />
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImage(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImageChange}>
              Apply Picture
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Name Change Confirmation Dialog */}
      <AlertDialog open={showNameConfirm} onOpenChange={setShowNameConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update your profile information?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Renew Membership Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Renew Membership</DialogTitle>
            <DialogDescription>
              Select your payment method to renew your membership for ₱500.00
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">Renewal Fee</p>
              <p className="text-2xl font-semibold text-blue-900">₱500.00</p>
              <p className="text-xs text-blue-600 mt-1">Valid for 1 year</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Select Payment Method</p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handlePaymentMethodSelect('GCash')}
                  className="p-4 border-2 border-border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">GCash</p>
                        <p className="text-xs text-muted-foreground">Pay with GCash</p>
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handlePaymentMethodSelect('Maya')}
                  className="p-4 border-2 border-border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Maya</p>
                        <p className="text-xs text-muted-foreground">Pay with Maya</p>
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handlePaymentMethodSelect('GoTyme')}
                  className="p-4 border-2 border-border rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">GoTyme</p>
                        <p className="text-xs text-muted-foreground">Pay with GoTyme</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={(open) => {
        setShowQRDialog(open);
        if (!open) {
          setPaymentProof(null);
          setPaymentProofPreview(null);
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Submit Payment</DialogTitle>
            <DialogDescription>
              Select a payment method and upload proof of payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <Label htmlFor="payment-method-select">Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger id="payment-method-select">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GCash">GCash QR</SelectItem>
                  <SelectItem value="Maya">Maya QR</SelectItem>
                  <SelectItem value="GoTyme">GoTyme QR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* QR Code Display */}
            {selectedPaymentMethod && (
              <div className="space-y-2">
                <Label>Scan QR Code to Pay</Label>
                <div className="flex justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="w-64 h-64 bg-white shadow-lg rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedPaymentMethod === 'Maya' ? (
                      <div className="w-full h-full bg-gradient-to-b from-emerald-400 to-teal-500 flex flex-col items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 shadow-xl">
                          <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                            <div className="grid grid-cols-8 gap-1">
                              {Array.from({ length: 64 }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-white text-sm mt-3 font-medium">maya</p>
                      </div>
                    ) : selectedPaymentMethod === 'GCash' ? (
                      <div className="w-full h-full bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 shadow-xl">
                          <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                            <div className="grid grid-cols-8 gap-1">
                              {Array.from({ length: 64 }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-white text-sm mt-3 font-medium">GCash</p>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-cyan-400 to-teal-500 flex flex-col items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 shadow-xl">
                          <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                            <div className="grid grid-cols-8 gap-1">
                              {Array.from({ length: 64 }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-white text-sm mt-3 font-medium">GoTyme</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Proof of Payment */}
            <div className="space-y-2">
              <Label htmlFor="payment-proof-upload">
                Upload Proof of Payment (Screenshot) <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="payment-proof-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePaymentProofChange}
                  className="cursor-pointer"
                />
              </div>
              
              {paymentProofPreview && (
                <div className="relative mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveProof}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <img
                    src={paymentProofPreview}
                    alt="Payment Proof Preview"
                    className="w-full h-48 object-contain rounded"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {paymentProof?.name}
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Please upload a clear screenshot of your payment confirmation
              </p>
            </div>

            {/* Note */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your payment will be reviewed by the admin. Once confirmed, your payment status will be updated.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQRDialog(false);
                setPaymentProof(null);
                setPaymentProofPreview(null);
                setShowRenewDialog(true);
              }}
            >
              Back
            </Button>
            <Button onClick={handleSubmitPayment} disabled={!paymentProof}>
              Submit Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <AlertDialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>You are about to pay ₱500.00 for membership renewal using {selectedPaymentMethod}.</p>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">₱500.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{selectedPaymentMethod}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPaymentMethod("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPayment}>
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}