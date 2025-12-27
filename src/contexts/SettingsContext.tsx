import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define interfaces for different settings
interface LibraryInfo {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
}

interface RegionalSettings {
  timezone: string;
  currency: string;
}

interface BorrowingRules {
  maxBooksPerBorrower: number;
  defaultBorrowPeriod: number;
  lateFeePerDay: number;
  damageFee: number;
}

interface BookManagement {
  autoApproveRequests: boolean;
  sendReminders: boolean;
  allowRenewals: boolean;
}

interface EmailNotifications {
  newBorrowRequest: boolean;
  overdueBooks: boolean;
  paymentReceived: boolean;
  lowStockAlert: boolean;
}

interface BorrowerNotifications {
  requestApproved: boolean;
  dueDateReminder: boolean;
  overdueNotice: boolean;
}

interface AccountInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AllSettings {
  libraryInfo: LibraryInfo;
  regionalSettings: RegionalSettings;
  borrowingRules: BorrowingRules;
  bookManagement: BookManagement;
  emailNotifications: EmailNotifications;
  borrowerNotifications: BorrowerNotifications;
  accountInfo: AccountInfo;
}

interface SettingsContextType {
  settings: AllSettings;
  updateLibraryInfo: (info: LibraryInfo) => void;
  updateRegionalSettings: (settings: RegionalSettings) => void;
  updateBorrowingRules: (rules: BorrowingRules) => void;
  updateBookManagement: (management: BookManagement) => void;
  updateEmailNotifications: (notifications: EmailNotifications) => void;
  updateBorrowerNotifications: (notifications: BorrowerNotifications) => void;
  updateAccountInfo: (info: AccountInfo) => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: AllSettings = {
  libraryInfo: {
    name: 'Book Keeper',
    code: 'LIB-2024',
    email: 'Bookkeeper@gmail.com',
    phone: '09102442221',
    address: '6th St. Village II, Butuan City, PH',
  },
  regionalSettings: {
    timezone: 'asia-manila',
    currency: 'php',
  },
  borrowingRules: {
    maxBooksPerBorrower: 5,
    defaultBorrowPeriod: 14,
    lateFeePerDay: 1.0,
    damageFee: 20.0,
  },
  bookManagement: {
    autoApproveRequests: false,
    sendReminders: true,
    allowRenewals: true,
  },
  emailNotifications: {
    newBorrowRequest: true,
    overdueBooks: true,
    paymentReceived: true,
    lowStockAlert: false,
  },
  borrowerNotifications: {
    requestApproved: true,
    dueDateReminder: true,
    overdueNotice: true,
  },
  accountInfo: {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@library.com',
    phone: '+1 234 567 8900',
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AllSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('library_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse stored settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings: AllSettings) => {
    setSettings(newSettings);
    localStorage.setItem('library_settings', JSON.stringify(newSettings));
  };

  const updateLibraryInfo = (info: LibraryInfo) => {
    saveSettings({ ...settings, libraryInfo: info });
  };

  const updateRegionalSettings = (regional: RegionalSettings) => {
    saveSettings({ ...settings, regionalSettings: regional });
  };

  const updateBorrowingRules = (rules: BorrowingRules) => {
    saveSettings({ ...settings, borrowingRules: rules });
  };

  const updateBookManagement = (management: BookManagement) => {
    saveSettings({ ...settings, bookManagement: management });
  };

  const updateEmailNotifications = (notifications: EmailNotifications) => {
    saveSettings({ ...settings, emailNotifications: notifications });
  };

  const updateBorrowerNotifications = (notifications: BorrowerNotifications) => {
    saveSettings({ ...settings, borrowerNotifications: notifications });
  };

  const updateAccountInfo = (info: AccountInfo) => {
    saveSettings({ ...settings, accountInfo: info });
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Get current user
    const storedUser = localStorage.getItem('library_user');
    if (!storedUser) return false;

    const user = JSON.parse(storedUser);
    
    // Get all users
    const storedUsers = localStorage.getItem('library_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    // Find and update the user's password
    const userIndex = users.findIndex((u: any) => u.email === user.email);
    if (userIndex === -1) return false;

    // Verify current password
    if (users[userIndex].password !== currentPassword) {
      return false;
    }

    // Update password
    users[userIndex].password = newPassword;
    localStorage.setItem('library_users', JSON.stringify(users));

    return true;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateLibraryInfo,
        updateRegionalSettings,
        updateBorrowingRules,
        updateBookManagement,
        updateEmailNotifications,
        updateBorrowerNotifications,
        updateAccountInfo,
        updatePassword,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
