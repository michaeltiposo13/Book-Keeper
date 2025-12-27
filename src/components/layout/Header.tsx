import { Search, Bell, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NotificationDropdown } from "./NotificationDropdown";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export function Header({ title, searchPlaceholder = "Search...", onSearch }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    // Navigate based on user role
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else {
      navigate('/member/settings');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Trigger search based on current page
    if (location.pathname.includes('/books')) {
      // Store search in session storage for books page
      sessionStorage.setItem('bookSearchQuery', query);
      window.dispatchEvent(new CustomEvent('bookSearch', { detail: query }));
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-white/80 backdrop-blur-sm px-6 shadow-sm">
      {/* Title */}
      {title && <h1 className="text-foreground">{title}</h1>}
      
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9 bg-input-background border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationDropdown />
      </div>
    </header>
  );
}