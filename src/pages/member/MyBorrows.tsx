import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, CheckCircle, XCircle, Filter, BookMarked } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { useNotifications } from "../../contexts/NotificationContext";
import { BookReader } from "../../components/BookReader";
import { RatingDialog } from "../../components/RatingDialog";
import { requestBooksAPI, booksAPI } from "../../lib/api";
import { getBookContent } from "../../lib/defaultBookContent";

export function MyBorrows() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [borrows, setBorrows] = useState<any[]>([]);
  const [ratingDialog, setRatingDialog] = useState<any>(null);
  const [readingBook, setReadingBook] = useState<any>(null);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (user?.borrower_id || user?.id) {
      loadBorrows();
    }
  }, [user?.borrower_id, user?.id]);

  const loadBorrows = async () => {
    try {
      const borrowerId = user?.borrower_id || user?.id;
      const response = await requestBooksAPI.getAll({ borrower_id: borrowerId });
      
      if (response.success && response.data) {
        const formattedBorrows = response.data.map((req: any) => {
          // Get author from book_authors relationship or use 'Unknown Author'
          const authors = req.book?.book_authors || [];
          const authorName = authors.length > 0 ? authors[0].author_name : 'Unknown Author';
          
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
            bookId: req.book_id,
            bookTitle: req.book?.title || 'Unknown Book',
            author: authorName,
            borrowDate: req.borrow_date || req.request_date,
            dueDate: req.due_date,
            returnDate: req.return_date,
            status: status,
            approval_status: req.approval_status,
          };
        });
        
        setBorrows(formattedBorrows);
      }
    } catch (error: any) {
      console.error('Error loading borrows:', error);
      toast.error('Failed to load borrows. Please try again.');
    }
  };

  const filteredBorrows = borrows.filter(
    (borrow) => statusFilter === "all" || borrow.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "returned":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <BookOpen className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <XCircle className="w-4 h-4" />;
      case "returned":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateFine = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff * 5 : 0; // 5 pesos per day late
  };

  const handleReturnBook = (borrow: any) => {
    setRatingDialog(borrow);
  };

  const handleSubmitRating = async (rating: number, review: string) => {
    if (ratingDialog) {
      try {
        const returnDate = new Date().toISOString().split('T')[0];
        const fine = calculateFine(ratingDialog.dueDate);
        
        // Update request with return date
        await requestBooksAPI.update(ratingDialog.request_id, {
          return_date: returnDate,
        });

        // Reload borrows to reflect the return
        await loadBorrows();

        // If there's a fine, create a payment record via API
        if (fine > 0) {
          // Note: Payment creation would go here if payments API supports it
          // For now, we'll just notify the user
        }

        setRatingDialog(null);
        toast.success(fine > 0 ? `Book returned! Late fee of ₱${fine.toFixed(2)} may apply.` : "Book returned successfully!");
        addNotification({
          title: "Book Returned",
          message: `You have successfully returned "${ratingDialog.bookTitle}". Thank you for rating!`,
          type: "success",
        });
      } catch (error: any) {
        console.error('Error returning book:', error);
        toast.error(error.response?.data?.message || 'Failed to return book. Please try again.');
      }
    }
  };

  const handleCancelRequest = async (borrow: any) => {
    try {
      // Update request status to rejected/cancelled
      await requestBooksAPI.update(borrow.request_id, {
        approval_status: 'rejected',
      });

      // Reload borrows
      await loadBorrows();
      
      toast.success("Request cancelled successfully");
      addNotification({
        title: "Request Cancelled",
        message: `Your book request has been cancelled.`,
        type: "info",
      });
    } catch (error: any) {
      console.error('Error cancelling request:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel request. Please try again.');
    }
  };

  const handleReadBook = async (borrow: any) => {
    try {
      // Only allow reading if request is approved (status is active)
      if (borrow.status !== 'active' && borrow.approval_status !== 'approved') {
        toast.error("You can only read books after your request is approved.");
        return;
      }

      // Fetch book content from API
      let apiContent: string | null = null;
      try {
        const bookResponse = await booksAPI.getById(borrow.bookId);
        if (bookResponse.success && bookResponse.data) {
          apiContent = bookResponse.data.content || null;
        }
      } catch (error) {
        console.warn('Could not fetch book content from API, using default content');
      }

      // Get content (uses API content if available, otherwise uses sample/default content)
      const pages = getBookContent(borrow.bookTitle, borrow.author, apiContent);
      
      if (pages && pages.length > 0) {
        setReadingBook({
          id: borrow.bookId.toString(),
          title: borrow.bookTitle,
          author: borrow.author,
          content: pages,
        });
      } else {
        toast.error("Failed to load book content. Please try again.");
      }
    } catch (error: any) {
      console.error('Error loading book content:', error);
      toast.error("Failed to load book content. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-foreground mb-2">My Borrows</h1>
          <p className="text-muted-foreground">
            Track your borrowed books and return dates
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-semibold text-foreground">
                {borrows.filter((b) => b.status === "active").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-semibold text-foreground">
                {borrows.filter((b) => b.status === "pending").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-xl font-semibold text-foreground">
                {borrows.filter((b) => b.status === "overdue").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Fines</p>
              <p className="text-xl font-semibold text-foreground">
                ₱{borrows.reduce((sum, b) => sum + (b.fine || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Borrows List */}
      <div className="space-y-4">
        {filteredBorrows.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No borrows found</p>
          </Card>
        ) : (
          filteredBorrows.map((borrow) => {
            const daysRemaining = calculateDaysRemaining(borrow.dueDate);
            return (
              <Card key={borrow.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(() => {
                        const savedCover = localStorage.getItem(`book_cover_${borrow.bookId}`);
                        return savedCover ? (
                          <img src={savedCover} alt={borrow.bookTitle} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-white" />
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">{borrow.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">{borrow.author}</p>
                        </div>
                        <Badge className={`${getStatusColor(borrow.status)} flex items-center gap-1`}>
                          {getStatusIcon(borrow.status)}
                          {borrow.status.charAt(0).toUpperCase() + borrow.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Borrowed Date</p>
                          <p className="text-sm text-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(borrow.borrowDate).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'Asia/Manila'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                          <p className="text-sm text-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(borrow.dueDate).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'Asia/Manila'
                            })}
                          </p>
                        </div>
                        {borrow.status === "active" && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Days Remaining</p>
                            <p className={`text-sm font-medium ${
                              daysRemaining < 3 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {daysRemaining} days
                            </p>
                          </div>
                        )}
                        {borrow.returnDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Returned Date</p>
                            <p className="text-sm text-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(borrow.returnDate).toLocaleDateString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'Asia/Manila'
                              })}
                            </p>
                          </div>
                        )}
                        {borrow.fine > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Fine Amount</p>
                            <p className="text-sm font-medium text-red-600">₱{borrow.fine.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                      {(borrow.status === "active" || borrow.approval_status === "approved") && !borrow.returnDate && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={() => handleReadBook(borrow)}
                          >
                            <BookMarked className="w-4 h-4 mr-2" />
                            Read Book
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleReturnBook(borrow)}
                          >
                            Return Book
                          </Button>
                        </div>
                      )}
                      {borrow.status === "pending" && (
                        <div className="mt-4">
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleCancelRequest(borrow)}
                          >
                            Cancel Request
                          </Button>
                        </div>
                      )}
                      {(borrow.status === "returned" || borrow.returnDate) && (
                        <div className="mt-4">
                          <div className="flex-1 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-700 mb-2">✓ Book successfully returned</p>
                                {borrow.rating && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Your rating:</p>
                                    <div className="flex items-center gap-1 mb-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className="text-yellow-400 text-lg">
                                          {star <= borrow.rating ? "★" : "☆"}
                                        </span>
                                      ))}
                                      <span className="ml-2 text-sm text-muted-foreground">
                                        ({borrow.rating}/5)
                                      </span>
                                    </div>
                                    {borrow.review && (
                                      <p className="text-xs text-muted-foreground italic">&ldquo;{borrow.review}&rdquo;</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Book Reader */}
      {readingBook && (
        <BookReader
          book={readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}

      {/* Rating Dialog */}
      {ratingDialog && (
        <RatingDialog
          book={{
            id: ratingDialog.id,
            title: ratingDialog.bookTitle,
            author: ratingDialog.author,
          }}
          open={true}
          onClose={() => setRatingDialog(null)}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
}