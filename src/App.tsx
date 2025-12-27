import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { MemberRoute } from "./components/MemberRoute";
import { Sidebar } from "./components/layout/Sidebar";
import { MemberSidebar } from "./components/layout/MemberSidebar";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./pages/Dashboard";
import { Borrowers } from "./pages/Borrowers";
import { Books } from "./pages/Books";
import { Categories } from "./pages/Categories";
import { Suppliers } from "./pages/Suppliers";
import { Requests } from "./pages/Requests";
import { Payments } from "./pages/Payments";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { UserDashboard } from "./pages/UserDashboard";
import { MemberDashboard } from "./pages/member/MemberDashboard";
import { BrowseBooks } from "./pages/member/BrowseBooks";
import { MyBorrows } from "./pages/member/MyBorrows";
import { MyPayments } from "./pages/member/MyPayments";
import { MemberProfile } from "./pages/member/MemberProfile";
import { MemberSettings } from "./pages/member/MemberSettings";
import { Toaster } from "./components/ui/sonner";
import { performSystemHealthCheck } from "./lib/systemHealthCheck";
import { useEffect } from "react";

// Admin Layout
function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchPlaceholder="Search library..." />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/borrowers" element={<Borrowers />} />
            <Route path="/books" element={<Books />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<UserDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Member Layout
function MemberLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <MemberSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchPlaceholder="Search books..." />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<MemberDashboard />} />
            <Route path="/books" element={<BrowseBooks />} />
            <Route path="/borrows" element={<MyBorrows />} />
            <Route path="/payments" element={<MyPayments />} />
            <Route path="/profile" element={<MemberProfile />} />
            <Route path="/settings" element={<MemberSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Mock data initialization removed - using real API now
    // initializeMockData();
    performSystemHealthCheck();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <NotificationProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/member/*"
                element={
                  <ProtectedRoute>
                    <MemberRoute>
                      <MemberLayout />
                    </MemberRoute>
                  </ProtectedRoute>
                }
              />
              <Route path="/*" element={<Navigate to="/login" replace />} />
            </Routes>
          </NotificationProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
