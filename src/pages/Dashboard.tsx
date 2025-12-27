import { useState, useEffect } from "react";
import { BookOpen, Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Package, FolderOpen, Loader2 } from "lucide-react";
import { StatsCard } from "../components/shared/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { StatusBadge } from "../components/shared/StatusBadge";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dashboardAPI, requestBooksAPI, booksAPI, borrowersAPI, paymentsAPI } from "../lib/api";

export function Dashboard() {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: "approve" | "reject" | null }>({ open: false, action: null });
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeBorrowers: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    booksIssued: 0,
    overdueBooks: 0,
    availableBooks: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      const statsResponse = await dashboardAPI.getStatistics();
      const requestsResponse = await requestBooksAPI.getAll();
      const booksResponse = await booksAPI.getAll({ per_page: 1000 });
      const paymentsResponse = await paymentsAPI.getAll();
      
      if (statsResponse.success && statsResponse.data) {
        const dashboardData = statsResponse.data;
        
        // Calculate total revenue from payments
        let totalRevenue = 0;
        if (paymentsResponse.success && paymentsResponse.data) {
          const paidPayments = paymentsResponse.data.filter((p: any) => p.paid_status === 'paid');
          totalRevenue = paidPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        }
        
        // Get pending requests
        let pendingRequests = 0;
        if (requestsResponse.success && requestsResponse.data) {
          pendingRequests = requestsResponse.data.filter((r: any) => r.approval_status === 'pending').length;
        }
        
        // Get overdue books
        const overdueResponse = await dashboardAPI.getOverdueBooks();
        const overdueBooks = overdueResponse.success ? (overdueResponse.data?.length || 0) : 0;
        
        // Get total books
        const totalBooks = booksResponse.success ? (booksResponse.data?.data?.length || booksResponse.data?.length || 0) : 0;
        
        // Get active borrowers (those with approved requests)
        let activeBorrowers = 0;
        if (requestsResponse.success && requestsResponse.data) {
          const activeBorrowerIds = new Set(
            requestsResponse.data
              .filter((r: any) => r.approval_status === 'approved' && !r.return_date)
              .map((r: any) => r.borrower_id)
          );
          activeBorrowers = activeBorrowerIds.size;
        }
        
        // Calculate books issued this month
        let booksIssued = 0;
        if (requestsResponse.success && requestsResponse.data) {
          const now = new Date();
          booksIssued = requestsResponse.data.filter((r: any) => {
            if (!r.borrow_date) return false;
            const borrowDate = new Date(r.borrow_date);
            return borrowDate.getMonth() === now.getMonth() && borrowDate.getFullYear() === now.getFullYear();
          }).length;
        }
        
        setStats({
          totalBooks: totalBooks,
          activeBorrowers: activeBorrowers,
          pendingRequests: pendingRequests,
          totalRevenue: totalRevenue,
          booksIssued: booksIssued,
          overdueBooks: overdueBooks,
          availableBooks: totalBooks, // Simplified - adjust based on your system
        });
        
        // Set recent requests
        if (requestsResponse.success && requestsResponse.data) {
          const formattedRequests = requestsResponse.data
            .slice(0, 5)
            .map((req: any) => ({
              id: req.request_id,
              userName: req.borrower?.name || 'Unknown',
              bookTitle: req.book?.title || 'Unknown Book',
              requestDate: req.request_date,
              status: req.approval_status,
            }));
          setRecentRequests(formattedRequests);
        }
        
        // Set popular books (most requested)
        if (requestsResponse.success && requestsResponse.data && booksResponse.success) {
          const booksData = booksResponse.data.data || booksResponse.data;
          const requestCounts: { [key: number]: number } = {};
          
          requestsResponse.data.forEach((req: any) => {
            if (req.book_id) {
              requestCounts[req.book_id] = (requestCounts[req.book_id] || 0) + 1;
            }
          });
          
          const popularBooksArray = booksData
            .map((book: any) => ({
              id: book.book_id,
              title: book.title,
              author: book.book_authors?.[0]?.author_name || 'Unknown Author',
              category: book.category?.category_name || 'Uncategorized',
              requestCount: requestCounts[book.book_id] || 0,
            }))
            .sort((a: any, b: any) => b.requestCount - a.requestCount)
            .slice(0, 4);
          
          setPopularBooks(popularBooksArray);
        }

        // Set payment method data
        if (dashboardData.payment_stats_by_method) {
          const paymentData = dashboardData.payment_stats_by_method.map((method: any) => ({
            name: method.payment_method,
            value: method.total,
            color: method.payment_method === 'GCash' ? '#007DFF' : 
                   method.payment_method === 'Maya' ? '#00D632' : '#00D4D9'
          }));
          setPaymentMethodData(paymentData);
        }

        // Load monthly statistics
        try {
          const monthlyResponse = await dashboardAPI.getMonthlyStats();
          if (monthlyResponse.success && monthlyResponse.data) {
            // Process monthly data for the chart
            const processedMonthlyData = processMonthlyData(monthlyResponse.data);
            setMonthlyData(processedMonthlyData);
          }
        } catch (error) {
          console.error('Error loading monthly stats:', error);
          // Set empty monthly data to prevent crashes
          setMonthlyData([]);
        }
      } else {
        // If stats API fails, set default values
        setStats({
          totalBooks: 0,
          activeBorrowers: 0,
          pendingRequests: 0,
          totalRevenue: 0,
          booksIssued: 0,
          overdueBooks: 0,
          availableBooks: 0,
        });
        setRecentRequests([]);
        setPopularBooks([]);
        setPaymentMethodData([]);
        setMonthlyData([]);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
      // Set safe default values to prevent crashes
      setStats({
        totalBooks: 0,
        activeBorrowers: 0,
        pendingRequests: 0,
        totalRevenue: 0,
        booksIssued: 0,
        overdueBooks: 0,
        availableBooks: 0,
      });
      setRecentRequests([]);
      setPopularBooks([]);
      setPaymentMethodData([]);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request);
    setActionDialog({ open: true, action: "approve" });
  };

  const handleRejectRequest = (request: any) => {
    setSelectedRequest(request);
    setActionDialog({ open: true, action: "reject" });
  };

  const confirmApprove = async () => {
    if (selectedRequest) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        await requestBooksAPI.update(selectedRequest.id, {
          approval_status: 'approved',
          borrow_date: today,
          due_date: dueDateStr,
        });

        setActionDialog({ open: false, action: null });
        setSelectedRequest(null);
        await loadDashboardData();
        toast.success("Request approved successfully!");
      } catch (error: any) {
        console.error('Error approving request:', error);
        toast.error(error.response?.data?.message || 'Failed to approve request. Please try again.');
      }
    }
  };

  const confirmReject = async () => {
    if (selectedRequest) {
      try {
        await requestBooksAPI.update(selectedRequest.id, {
          approval_status: 'rejected',
        });

        setActionDialog({ open: false, action: null });
        setSelectedRequest(null);
        await loadDashboardData();
        toast.success("Request rejected successfully.");
      } catch (error: any) {
        console.error('Error rejecting request:', error);
        toast.error(error.response?.data?.message || 'Failed to reject request. Please try again.');
      }
    }
  };

  const handleBookClick = (book: any) => {
    setSelectedBook(book);
  };

  // Process monthly data for charts
  function processMonthlyData(data: any) {
    try {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Create a map of month data
      const monthMap: { [key: string]: any } = {};
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthMap[key] = {
          month: monthNames[date.getMonth()],
          requests: 0,
          payments: 0,
          issued: 0
        };
      }
      
      // Fill with actual data if available
      if (data && data.monthly_requests && Array.isArray(data.monthly_requests)) {
        data.monthly_requests.forEach((item: any) => {
          if (item && typeof item.year === 'number' && typeof item.month === 'number' && typeof item.total === 'number') {
            const key = `${item.year}-${item.month - 1}`;
            if (monthMap[key]) {
              monthMap[key].requests = item.total;
            }
          }
        });
      }
      
      if (data && data.monthly_payments && Array.isArray(data.monthly_payments)) {
        data.monthly_payments.forEach((item: any) => {
          if (item && typeof item.year === 'number' && typeof item.month === 'number' && typeof item.total === 'number') {
            const key = `${item.year}-${item.month - 1}`;
            if (monthMap[key]) {
              monthMap[key].payments = item.total;
              monthMap[key].issued = item.total; // Assuming issued = payments for now
            }
          }
        });
      }
      
      return Object.values(monthMap);
    } catch (error) {
      console.error('Error processing monthly data:', error);
      // Return empty array on error
      return [];
    }
  }

  // Chart data
  const requestStatusData = [
    { name: 'Pending', value: Math.max(0, stats.pendingRequests), color: '#f59e0b' },
    { name: 'Active', value: Math.max(0, stats.activeBorrowers), color: '#10b981' },
    { name: 'Returned', value: Math.max(0, stats.booksIssued - stats.activeBorrowers - stats.overdueBooks), color: '#3b82f6' },
    { name: 'Overdue', value: Math.max(0, stats.overdueBooks), color: '#ef4444' },
  ];

  const COLORS = ['#0f4c81', '#0d9488', '#f97316', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => navigate("/admin/books")} className="cursor-pointer">
          <StatsCard
            title="Total Books"
            value={stats.totalBooks}
            change="+12% from last month"
            changeType="increase"
            icon={BookOpen}
            iconColor="bg-blue-500"
          />
        </div>
        <div className="cursor-pointer">
          <StatsCard
            title="Active Borrowers"
            value={stats.activeBorrowers}
            change="+8% from last month"
            changeType="increase"
            icon={Users}
            iconColor="bg-green-500"
          />
        </div>
        <div onClick={() => setShowDialog("pendingRequests")} className="cursor-pointer">
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={FileText}
            iconColor="bg-yellow-500"
          />
        </div>
        <StatsCard
          title="Total Revenue"
          value={`₱${stats.totalRevenue.toFixed(2)}`}
          change="+15% from last month"
          changeType="increase"
          icon={DollarSign}
          iconColor="bg-purple-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Books Issued This Month</p>
              <p className="text-2xl">{stats.booksIssued}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue Books</p>
              <p className="text-2xl">{stats.overdueBooks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Books</p>
              <p className="text-2xl">{stats.availableBooks}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends - Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Library Activity Trends</CardTitle>
            <CardDescription>Monthly requests, payments, and book issuances</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData.length > 0 ? monthlyData : [
                { month: 'Jan', requests: 0, payments: 0, issued: 0 },
                { month: 'Feb', requests: 0, payments: 0, issued: 0 },
                { month: 'Mar', requests: 0, payments: 0, issued: 0 },
                { month: 'Apr', requests: 0, payments: 0, issued: 0 },
                { month: 'May', requests: 0, payments: 0, issued: 0 },
                { month: 'Jun', requests: 0, payments: 0, issued: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#0f4c81" strokeWidth={2} name="Requests" />
                <Line type="monotone" dataKey="payments" stroke="#0d9488" strokeWidth={2} name="Payments" />
                <Line type="monotone" dataKey="issued" stroke="#f97316" strokeWidth={2} name="Issued" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Request Status - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Request Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestStatusData.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {requestStatusData.filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods and Top Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
            <CardDescription>Breakdown by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentMethodData.length > 0 ? paymentMethodData : [{ name: 'No data', value: 1, color: '#e5e7eb' }]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {(paymentMethodData.length > 0 ? paymentMethodData : [{ name: 'No data', value: 1, color: '#e5e7eb' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Borrowed Books - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Most Borrowed Books</CardTitle>
            <CardDescription>Top 5 books by borrow count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularBooks.length > 0 ? popularBooks.map(book => ({
                title: book.title.length > 15 ? book.title.substring(0, 15) + '...' : book.title,
                borrows: book.requestCount
              })) : [
                { title: 'No data', borrows: 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="title" stroke="#64748b" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="borrows" fill="#0f4c81" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Recent Requests</h2>
            <button 
              onClick={() => navigate("/admin/requests")}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent requests</p>
              </div>
            ) : (
              recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{request.bookTitle}</p>
                    <p className="text-xs text-muted-foreground">{request.userName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={request.status} />
                    {request.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => handleRejectRequest(request)}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveRequest(request)}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Popular Books */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Popular Books</h2>
            <button 
              onClick={() => navigate("/admin/books")}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {popularBooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No rated books yet</p>
              </div>
            ) : (
              popularBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleBookClick(book)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {book.available} / {book.available + Math.floor(Math.random() * 5)} Available
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-sm">
                          {star <= Math.round(book.averageRating) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {book.averageRating.toFixed(1)} ({book.ratingCount} reviews)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Pending Requests Dialog */}
      <Dialog open={showDialog === "pendingRequests"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Pending Requests</DialogTitle>
            <DialogDescription>
              View and manage all pending book requests
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {recentRequests.filter(r => r.status === "pending").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending requests</p>
                </div>
              ) : (
                recentRequests.filter(r => r.status === "pending").map((request) => (
                  <div key={request.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{request.bookTitle}</p>
                        <p className="text-sm text-muted-foreground">{request.userName}</p>
                        <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          handleRejectRequest(request);
                          setShowDialog(null);
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          handleApproveRequest(request);
                          setShowDialog(null);
                        }}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Book Details Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
            <DialogDescription>Book Details</DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Author</p>
                  <p className="font-medium">{selectedBook.author}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedBook.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-lg">
                          {star <= Math.round(selectedBook.averageRating) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedBook.averageRating.toFixed(1)} / 5.0 ({selectedBook.ratingCount} reviews)
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium">{selectedBook.available} copies available</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "approve" ? "Approve Request" : "Reject Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "approve"
                ? `Are you sure you want to approve this request? The book will be marked as borrowed for ${selectedRequest?.userName}.`
                : `Are you sure you want to reject this request? This action will remove the request permanently.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={actionDialog.action === "approve" ? confirmApprove : confirmReject}
              className={actionDialog.action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {actionDialog.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}