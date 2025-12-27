import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, User, BookOpen, Calendar, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { requestBooksAPI, bookAuthorsAPI } from "../lib/api";

export function Requests() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: "approve" | "reject" | null }>({ open: false, action: null });
  const [filter, setFilter] = useState<string>("all");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load requests from API
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestBooksAPI.getAll();
      
      if (response.success && response.data) {
        // Map backend data to frontend format and fetch authors for each book
        const formattedRequests = await Promise.all(
          response.data.map(async (req: any) => {
            // Try to get author from book_authors relationship first
            let authorName = 'Unknown Author';
            const authors = req.book?.book_authors || [];
            
            if (authors.length > 0) {
              authorName = authors[0].author_name;
            } else if (req.book_id) {
              // If not in relationship, fetch authors separately
              try {
                const authorsResponse = await bookAuthorsAPI.getAll({ book_id: req.book_id });
                if (authorsResponse.success && authorsResponse.data && authorsResponse.data.length > 0) {
                  authorName = authorsResponse.data[0].author_name;
                }
              } catch (error) {
                console.warn('Could not fetch author for book:', req.book_id, error);
              }
            }
            
            // Map approval_status to status
            let status = req.approval_status;
            
            // If book is returned, status should be 'returned'
            if (req.return_date) {
              status = 'returned';
            } else if (status === 'approved' && req.due_date) {
              const dueDate = new Date(req.due_date);
              const today = new Date();
              if (dueDate < today) {
                status = 'overdue';
              } else {
                status = 'active';
              }
            }
            
            return {
              id: req.request_id,
              request_id: req.request_id,
              userName: req.borrower?.name || 'Unknown',
              userEmail: req.borrower?.email || '',
              userId: req.borrower_id,
              borrowerId: req.borrower_id,
              bookTitle: req.book?.title || 'Unknown Book',
              bookId: req.book_id,
              author: authorName,
              requestDate: req.request_date,
              borrowDate: req.borrow_date,
              dueDate: req.due_date,
              returnDate: req.return_date,
              status: status,
              approval_status: req.approval_status,
              quantity: req.quantity,
              remarks: req.remarks,
            };
          })
        );
        
        setRequests(formattedRequests);
      }
    } catch (error: any) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = filter === "all" 
    ? requests 
    : filter === "pending"
    ? requests.filter(r => r.approval_status === 'pending')
    : filter === "approved"
    ? requests.filter(r => r.approval_status === 'approved' || r.status === 'active')
    : requests.filter(r => r.approval_status === filter);

  const columns = [
    { header: "Borrower", accessor: "userName" },
    { header: "Email", accessor: "userEmail" },
    { header: "Book", accessor: "bookTitle" },
    { header: "Author", accessor: "author" },
    { 
      header: "Request Date", 
      accessor: "requestDate",
      cell: (value: string) => new Date(value).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Manila'
      })
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string, row: any) => {
        // If book is returned, show returned status
        if (row.returnDate) {
          return <StatusBadge status="returned" />;
        }
        // Use approval_status for badge display, but show 'active' or 'overdue' if applicable
        const displayStatus = row.approval_status === 'approved' ? (value === 'overdue' ? 'overdue' : 'active') : row.approval_status;
        return <StatusBadge status={displayStatus} />;
      },
    },
  ];

  const handleView = (request: any) => {
    setSelectedRequest(request);
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14-day borrowing period
        const dueDateStr = dueDate.toISOString().split('T')[0];

        await requestBooksAPI.update(selectedRequest.request_id, {
          approval_status: 'approved',
          borrow_date: today,
          due_date: dueDateStr,
        });

        setActionDialog({ open: false, action: null });
        setSelectedRequest(null);
        await loadRequests();
        toast.success("Request approved successfully! User can now borrow the book.");
      } catch (error: any) {
        console.error('Error approving request:', error);
        toast.error(error.response?.data?.message || 'Failed to approve request. Please try again.');
      }
    }
  };

  const handleReject = async () => {
    if (selectedRequest) {
      try {
        await requestBooksAPI.update(selectedRequest.request_id, {
          approval_status: 'rejected',
        });

        setActionDialog({ open: false, action: null });
        setSelectedRequest(null);
        await loadRequests();
        toast.success("Request rejected successfully.");
      } catch (error: any) {
        console.error('Error rejecting request:', error);
        toast.error(error.response?.data?.message || 'Failed to reject request. Please try again.');
      }
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === "pending" && !r.returnDate).length,
    approved: requests.filter(r => (r.status === "active" || r.status === "approved") && !r.returnDate).length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Borrow Requests</h1>
          <p className="text-muted-foreground">Manage book borrowing requests and approvals</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl">{stats.approved}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl">{stats.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          <Card className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No requests found</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredRequests}
                onView={handleView}
                actionLabel="View"
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>View and manage book borrow request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Request ID</p>
                  <p className="font-medium">{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Borrower Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedRequest.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedRequest.userEmail}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Book Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{selectedRequest.bookTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium">{selectedRequest.author}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Request Date
                </h3>
                <p className="text-sm">
                  {new Date(selectedRequest.requestDate).toLocaleDateString('en-PH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Manila'
                  })}
                </p>
              </div>

              {selectedRequest.approval_status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setActionDialog({ open: true, action: "reject" })}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setActionDialog({ open: true, action: "approve" })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
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
              onClick={actionDialog.action === "approve" ? handleApprove : handleReject}
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