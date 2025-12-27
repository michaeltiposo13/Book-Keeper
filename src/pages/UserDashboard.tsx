import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle,
  XCircle,
  Calendar,
  Settings,
  Camera,
  Edit2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export function UserDashboard() {
  const { user, updateUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showImageConfirm, setShowImageConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
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

    if (user.role === 'Administrator') {
      // For admin: show request approval/rejection actions
      const activityLog = JSON.parse(localStorage.getItem(`admin_activity_${user.id}`) || '[]');
      setRecentActivity(activityLog.slice(0, 10));
    } else {
      // For members: show borrowing actions
      const borrows = JSON.parse(localStorage.getItem(`borrows_${user.id}`) || '[]');
      const activities = borrows.map((borrow: any) => {
        if (borrow.status === 'returned') {
          return {
            action: `Returned "${borrow.bookTitle}"`,
            date: borrow.returnDate,
            status: 'completed'
          };
        } else if (borrow.status === 'active') {
          return {
            action: `Borrowed "${borrow.bookTitle}"`,
            date: borrow.borrowDate,
            status: 'active'
          };
        } else if (borrow.status === 'pending') {
          return {
            action: `Requested "${borrow.bookTitle}"`,
            date: borrow.borrowDate || new Date().toISOString(),
            status: 'pending'
          };
        }
        return null;
      }).filter(Boolean);
      setRecentActivity(activities.slice(0, 10));
    }
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
    // Reset the input
    e.target.value = '';
  };

  const confirmImageChange = () => {
    if (pendingImage && user) {
      setProfileImage(pendingImage);
      localStorage.setItem(`profile_image_${user.id}`, pendingImage);
      
      // Log the activity
      const activityLog = JSON.parse(localStorage.getItem(`admin_activity_${user.id}`) || '[]');
      activityLog.unshift({
        action: 'Updated profile picture',
        date: new Date().toISOString(),
        status: 'completed'
      });
      localStorage.setItem(`admin_activity_${user.id}`, JSON.stringify(activityLog));
      
      setShowImageConfirm(false);
      setPendingImage(null);
      toast.success('Profile picture updated successfully!');
      loadActivityLog();
    }
  };

  const handleSaveProfile = () => {
    if (editedName.trim() === '') {
      toast.error('Name cannot be empty');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmSaveProfile = () => {
    if (user && editedName.trim()) {
      // Update user name in localStorage users array
      const users = JSON.parse(localStorage.getItem('library_users') || '[]');
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, name: editedName };
        }
        return u;
      });
      localStorage.setItem('library_users', JSON.stringify(updatedUsers));

      // Update context (this will also update localStorage library_user)
      updateUser({ ...user, name: editedName });

      // Log the activity
      const activityLog = JSON.parse(localStorage.getItem(`admin_activity_${user.id}`) || '[]');
      activityLog.unshift({
        action: 'Updated profile information',
        date: new Date().toISOString(),
        status: 'completed'
      });
      localStorage.setItem(`admin_activity_${user.id}`, JSON.stringify(activityLog));

      setShowConfirmDialog(false);
      setIsEditDialogOpen(false);
      toast.success('Profile updated successfully!');
      loadActivityLog();
    }
  };

  if (!user) return null;

  const isAdmin = user.role === 'Administrator';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">My Profile</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and view activity</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <label 
                htmlFor="profile-image" 
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
              >
                <Camera className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  id="profile-image" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-foreground">{user.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
                </div>
              </div>

              <Button variant="outline" onClick={() => {
                setEditedName(user.name);
                setIsEditDialogOpen(true);
              }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Only for members */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Borrows</p>
                  <p className="text-foreground mt-2">
                    {JSON.parse(localStorage.getItem(`borrows_${user.id}`) || '[]').filter((b: any) => b.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Books Returned</p>
                  <p className="text-foreground mt-2">
                    {JSON.parse(localStorage.getItem(`borrows_${user.id}`) || '[]').filter((b: any) => b.status === 'returned').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-foreground mt-2">
                    {JSON.parse(localStorage.getItem(`borrows_${user.id}`) || '[]').filter((b: any) => b.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {isAdmin ? 'Your recent administrative actions' : 'Your recent library transactions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(activity.date).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'Asia/Manila'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      activity.status === 'active' ? 'default' : 
                      activity.status === 'pending' ? 'secondary' :
                      activity.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                  {index < recentActivity.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Confirmation Dialog */}
      <AlertDialog open={showImageConfirm} onOpenChange={setShowImageConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to use this image as your profile picture?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingImage && (
            <div className="flex justify-center py-4">
              <img 
                src={pendingImage} 
                alt="Preview" 
                className="w-32 h-32 rounded-full object-cover border-4 border-border"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImage(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImageChange}>
              Apply Picture
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Name Change Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update your profile information?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSaveProfile}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}