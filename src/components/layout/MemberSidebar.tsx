import { Home, BookOpen, FileText, CreditCard, Settings, LogOut, User as UserIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import logoImage from "figma:asset/7a426d3e88da63d501cc1619361ed2fb3a0a1ad3.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const navigation = [
  { name: "Home", href: "/member", icon: Home },
  { name: "Browse Books", href: "/member/books", icon: BookOpen },
  { name: "My Borrows", href: "/member/borrows", icon: FileText },
  { name: "My Payments", href: "/member/payments", icon: CreditCard },
  { name: "Settings", href: "/member/settings", icon: Settings },
];

export function MemberSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const savedImage = localStorage.getItem(`profile_image_${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  }, [user]);

  // Listen for storage changes to update profile image in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        setProfileImage(savedImage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check for changes every second (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-[#0a3a5f] to-[#0f4c81] border-r border-white/10">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center p-1.5">
            <img src={logoImage} alt="Book Keeper" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-semibold text-white block">Book Keeper</span>
            <span className="text-xs text-white/60">Member Portal</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white shadow-lg backdrop-blur-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/10 p-4">
        <Link to="/member/profile" className="flex items-center gap-3 px-2 hover:bg-white/5 rounded-lg p-2 transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center overflow-hidden ring-2 ring-white/20">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">{user?.name || 'Member'}</p>
            <p className="text-xs text-white/60 truncate">{user?.email || ''}</p>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsDialogOpen(true);
            }}
            className="text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will end your session and log you out of the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}