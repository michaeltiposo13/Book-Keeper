import { useState } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Simple time ago formatter
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

export function NotificationDropdown() {
  const { notifications, markAsRead, markAllAsRead, clearNotification, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Route based on notification title/type
    const isAdmin = user?.role === 'admin';
    
    if (notification.title === 'New Book Request') {
      // Navigate to requests page
      navigate(isAdmin ? '/admin/requests' : '/member/borrows');
    } else if (notification.title === 'Overdue Payment') {
      // Navigate to payments page
      navigate(isAdmin ? '/admin/payments' : '/member/payments');
    } else if (notification.title === 'Book Returned') {
      // Navigate to requests/borrows page
      navigate(isAdmin ? '/admin/requests' : '/member/borrows');
    } else if (notification.title === 'Low Stock Alert') {
      // Navigate to books page (admin only)
      if (isAdmin) {
        navigate('/admin/books');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    const baseClasses = "w-2 h-2 rounded-full";
    switch (type) {
      case 'success':
        return <div className={`${baseClasses} bg-green-500`} />;
      case 'warning':
        return <div className={`${baseClasses} bg-yellow-500`} />;
      case 'error':
        return <div className={`${baseClasses} bg-red-500`} />;
      default:
        return <div className={`${baseClasses} bg-blue-500`} />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-medium text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors mb-1 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <div className="flex gap-3 pr-6">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''} text-foreground`}>
                          {notification.title}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(new Date(notification.timestamp))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}