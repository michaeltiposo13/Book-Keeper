import { useState, useEffect } from "react";
import { Filter, User, Mail, Phone, Calendar, BookOpen, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { borrowersAPI, requestBooksAPI } from "../lib/api";

export function Borrowers() {
  const [selectedBorrower, setSelectedBorrower] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBorrowers();
  }, []);

  const loadBorrowers = async () => {
    try {
      setLoading(true);
      const response = await borrowersAPI.getAll();
      
      if (response.success && response.data) {
        // Get all requests to count active borrows
        const requestsResponse = await requestBooksAPI.getAll();
        const allRequests = requestsResponse.success ? requestsResponse.data : [];
        
        // Map borrowers and add active borrow count
        const borrowersWithData = response.data.map((borrower: any) => {
          // Filter requests for this borrower that are approved/active
          const activeRequests = allRequests.filter((req: any) => 
            req.borrower_id === borrower.borrower_id && 
            (req.approval_status === 'approved' || req.approval_status === 'returned') &&
            !req.return_date
          );
          
          return {
            id: borrower.borrower_id,
            borrower_id: borrower.borrower_id,
            name: borrower.name,
            email: borrower.email,
            phone: borrower.phone || "N/A",
            createdAt: borrower.joined_date || borrower.created_at,
            activeBorrowCount: activeRequests.length,
            status: "Active", // All borrowers from API are active
            role: borrower.role || 'Member',
          };
        });
        
        setBorrowers(borrowersWithData);
      }
    } catch (error: any) {
      console.error('Error loading borrowers:', error);
      toast.error('Failed to load borrowers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBorrowers = statusFilter === "all" 
    ? borrowers 
    : borrowers.filter(b => b.status.toLowerCase() === statusFilter.toLowerCase());

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { 
      header: "Phone", 
      accessor: "phone",
      cell: (value: string) => <span className="text-muted-foreground">{value || "N/A"}</span>
    },
    { 
      header: "Joined Date", 
      accessor: "createdAt",
      cell: (value: string) => value ? new Date(value).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Manila'
      }) : "N/A"
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const handleView = async (borrower: any) => {
    try {
      // Load borrower's requests
      const requestsResponse = await requestBooksAPI.getAll({ borrower_id: borrower.borrower_id });
      const requests = requestsResponse.success ? requestsResponse.data : [];
      
      // Format requests as borrows for display
      const borrows = requests.map((req: any) => ({
        id: req.request_id,
        bookTitle: req.book?.title || 'Unknown Book',
        bookId: req.book_id,
        requestDate: req.request_date,
        borrowDate: req.borrow_date,
        dueDate: req.due_date,
        returnDate: req.return_date,
        status: req.approval_status === 'approved' ? 'active' : req.approval_status,
        quantity: req.quantity,
      }));
      
      setSelectedBorrower({ ...borrower, borrows });
    } catch (error: any) {
      console.error('Error loading borrower details:', error);
      toast.error('Failed to load borrower details.');
    }
  };

  const handleDelete = (borrower: any) => {
    setDeleteDialog(borrower);
  };

  const confirmDelete = async () => {
    if (deleteDialog) {
      try {
        await borrowersAPI.delete(deleteDialog.borrower_id);
        toast.success(`${deleteDialog.name}'s account has been deleted successfully.`);
        setDeleteDialog(null);
        await loadBorrowers();
      } catch (error: any) {
        console.error('Error deleting borrower:', error);
        toast.error(error.response?.data?.message || 'Failed to delete borrower. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg text-muted-foreground">Loading borrowers...</div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1>Borrowers</h1>
              <p className="text-muted-foreground">Manage library members and their information</p>
            </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBorrowers}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Borrower Detail Dialog */}
      {selectedBorrower && (
        <Dialog open={!!selectedBorrower} onOpenChange={() => setSelectedBorrower(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Member Information</DialogTitle>
              <DialogDescription>Detailed information about this member</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Member Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </p>
                  <p className="font-medium">{selectedBorrower.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="font-medium">{selectedBorrower.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </p>
                  <p className="font-medium">{selectedBorrower.phone || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedBorrower.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined Date
                  </p>
                  <p className="font-medium">
                    {selectedBorrower.createdAt ? new Date(selectedBorrower.createdAt).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Asia/Manila'
                    }) : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Member ID</p>
                  <p className="font-medium font-mono">#{selectedBorrower.id}</p>
                </div>
              </div>

              {/* Borrowing Statistics */}
              <div className="border-t pt-6">
                <h3 className="mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Borrowing Activity
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Active Borrows</p>
                    <p className="text-2xl font-semibold text-blue-900">
                      {selectedBorrower.borrows?.filter((b: any) => b.status === "active").length || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Returned Books</p>
                    <p className="text-2xl font-semibold text-green-900">
                      {selectedBorrower.borrows?.filter((b: any) => b.status === "returned").length || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-1">Pending Requests</p>
                    <p className="text-2xl font-semibold text-yellow-900">
                      {selectedBorrower.borrows?.filter((b: any) => b.status === "pending").length || 0}
                    </p>
                  </div>
                </div>

                {/* Borrowing History */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Borrows</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedBorrower.borrows && selectedBorrower.borrows.length > 0 ? (
                      selectedBorrower.borrows.slice(0, 10).map((borrow: any) => (
                        <div key={borrow.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{borrow.bookTitle}</p>
                              <p className="text-xs text-muted-foreground">{borrow.author}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {borrow.borrowDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Borrowed: {new Date(borrow.borrowDate).toLocaleDateString('en-PH', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      timeZone: 'Asia/Manila'
                                    })}
                                  </p>
                                )}
                                {borrow.returnDate && (
                                  <p className="text-xs text-muted-foreground">
                                    • Returned: {new Date(borrow.returnDate).toLocaleDateString('en-PH', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      timeZone: 'Asia/Manila'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge className={
                              borrow.status === "active" ? "bg-blue-100 text-blue-700" :
                              borrow.status === "returned" ? "bg-green-100 text-green-700" :
                              "bg-yellow-100 text-yellow-700"
                            }>
                              {borrow.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No borrowing history</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Borrowers</DialogTitle>
            <DialogDescription>Filter borrowers by status</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setShowFilterDialog(false);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog?.name}</strong>'s account? This will permanently remove all their data including borrows, payments, and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
    </div>
  );
}
