import { useState, useEffect } from "react";
import { Search, Grid, List, BookOpen, User, Clock, Star, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { booksAPI, requestBooksAPI, bookAuthorsAPI } from "../../lib/api";

export function BrowseBooks() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [requestedBooks, setRequestedBooks] = useState<number[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Load books and requested books from API
  useEffect(() => {
    if (user?.borrower_id) {
      loadBooks();
      loadRequestedBooks();
    }
    
    // Listen for search events from header
    const handleHeaderSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    
    window.addEventListener('bookSearch', handleHeaderSearch);
    
    // Check for existing search query
    const existingQuery = sessionStorage.getItem('bookSearchQuery');
    if (existingQuery) {
      setSearchQuery(existingQuery);
    }
    
    return () => {
      window.removeEventListener('bookSearch', handleHeaderSearch);
    };
  }, [user?.borrower_id]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // Get all books with high per_page limit
      const response = await booksAPI.getAll({ per_page: 1000 });
      
      if (response.success && response.data) {
        // Handle paginated response
        const booksData = response.data.data || response.data;
        
        // Map backend books to frontend format
        const formattedBooks = await Promise.all(
          booksData.map(async (book: any) => {
            // Get authors for this book
            const authorsResponse = await bookAuthorsAPI.getAll({ book_id: book.book_id });
            const authors = authorsResponse.success ? authorsResponse.data : [];
            const authorName = authors.length > 0 ? authors[0].author_name : 'Unknown Author';
            
            return {
              id: book.book_id,
              book_id: book.book_id,
              title: book.title,
              isbn: book.isbn || '',
              author: authorName,
              category: book.category?.category_name || 'Uncategorized',
              available: 100, // Default quantity per book
              total: 100,
              description: `Book: ${book.title}`,
              rating: 4.5,
              reviews: [],
            };
          })
        );
        
        setBooks(formattedBooks);
      }
    } catch (error: any) {
      console.error('Error loading books:', error);
      toast.error('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRequestedBooks = async () => {
    if (!user?.borrower_id) return;
    
    try {
      const response = await requestBooksAPI.getAll({ borrower_id: user.borrower_id });
      
      if (response.success && response.data) {
        // Get book IDs that have been requested
        const requestedIds = response.data
          .filter((req: any) => req.approval_status === 'pending')
          .map((req: any) => req.book_id);
        
        setRequestedBooks(requestedIds);
      }
    } catch (error: any) {
      console.error('Error loading requested books:', error);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleRequestBook = async (book: any) => {
    if (!user?.borrower_id) {
      toast.error("Please login to request books");
      return;
    }

    try {
      // Check if already requested
      if (requestedBooks.includes(book.book_id)) {
        toast.error("You have already requested this book");
        return;
      }

      // Check if user already has active/approved requests (excluding returned books)
      const existingRequestsResponse = await requestBooksAPI.getAll({ borrower_id: user.borrower_id });
      if (existingRequestsResponse.success && existingRequestsResponse.data) {
        // Filter out returned books - only count active/pending requests
        const activeRequests = existingRequestsResponse.data.filter((req: any) => {
          // Exclude returned books
          if (req.return_date) return false;
          // Count pending or approved requests
          return req.approval_status === 'pending' || req.approval_status === 'approved';
        });
        
        // Allow up to 3 books at a time
        if (activeRequests.length >= 3) {
          toast.error("You can only borrow up to 3 books at a time. Please return or cancel some of your current requests first.");
          return;
        }
      }

      // Create request via API
      const today = new Date().toISOString().split('T')[0];
      const response = await requestBooksAPI.create({
        borrower_id: user.borrower_id,
        book_id: book.book_id,
        request_date: today,
        approval_status: 'pending',
        quantity: 1,
      });

      if (response.success) {
        setRequestedBooks([...requestedBooks, book.book_id]);
        await loadRequestedBooks(); // Reload to get updated list
        toast.success("Book request submitted successfully! Waiting for admin approval.");
        addNotification({
          title: "Request Submitted",
          message: `Your request for "${book.title}" has been submitted for approval.`,
          type: "info",
        });
        setSelectedBook(null);
        setIsRequestDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error requesting book:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit request. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleViewBook = (book: any) => {
    setSelectedBook(book);
    setIsViewDialogOpen(true);
  };

  const confirmRequest = () => {
    if (user) {
      const newRequestedBooks = [...requestedBooks, selectedBook.id];
      setRequestedBooks(newRequestedBooks);
      localStorage.setItem(`book_requests_${user.id}`, JSON.stringify(newRequestedBooks));
      toast.success(`Request submitted for "${selectedBook.title}"`);
      addNotification({
        title: "Book Request Submitted",
        message: `Your request for "${selectedBook.title}" has been submitted.`,
        type: "success",
      });
    }
    setIsRequestDialogOpen(false);
    setSelectedBook(null);
  };

  const handleCancelRequest = (bookId: string) => {
    if (user) {
      const newRequestedBooks = requestedBooks.filter(id => id !== bookId);
      setRequestedBooks(newRequestedBooks);
      localStorage.setItem(`book_requests_${user.id}`, JSON.stringify(newRequestedBooks));
      toast.success("Request cancelled successfully");
      addNotification({
        title: "Request Cancelled",
        message: `Your request has been cancelled.`,
        type: "info",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-foreground mb-2">Browse Books</h1>
          <p className="text-muted-foreground">
            Discover and request books from our collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Books Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const savedCover = localStorage.getItem(`book_cover_${book.id}`);
            return (
              <Card key={book.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    {savedCover ? (
                      <img src={savedCover} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {book.author}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {book.category}
                      </Badge>
                      <Badge
                        variant={book.available > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {book.available} / {book.total} Available
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {book.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewBook(book)}
                    >
                      View
                    </Button>
                    {requestedBooks.includes(book.id) ? (
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleCancelRequest(book.id)}
                      >
                        Cancel Request
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        disabled={book.available === 0}
                        onClick={() => handleRequestBook(book)}
                      >
                        {book.available === 0 ? "Unavailable" : "Request"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-6">
                <div className="w-32 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(() => {
                    const savedCover = localStorage.getItem(`book_cover_${book.id}`);
                    return savedCover ? (
                      <img src={savedCover} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-12 h-12 text-white" />
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-foreground mb-2">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {book.author}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{book.category}</Badge>
                    <Badge variant={book.available > 0 ? "default" : "destructive"}>
                      {book.available} / {book.total} Available
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {book.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewBook(book)}
                    >
                      View Details
                    </Button>
                    {requestedBooks.includes(book.id) ? (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelRequest(book.id)}
                      >
                        Cancel Request
                      </Button>
                    ) : (
                      <Button
                        disabled={book.available === 0}
                        onClick={() => handleRequestBook(book)}
                      >
                        {book.available === 0 ? "Unavailable" : "Request Book"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No books found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query
          </p>
        </Card>
      )}

      {/* Request Confirmation Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to request "{selectedBook?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRequestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmRequest}>
              Confirm Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Book Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
            <DialogDescription>Book Details & Reviews</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-4">
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center overflow-hidden">
                {(() => {
                  const savedCover = localStorage.getItem(`book_cover_${selectedBook?.id}`);
                  return savedCover ? (
                    <img src={savedCover} alt={selectedBook?.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-20 h-20 text-white" />
                  );
                })()}
              </div>
              
              {/* Book Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Author</p>
                  <p className="font-medium">{selectedBook?.author}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedBook?.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-medium">{selectedBook?.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium">
                    {selectedBook?.available} of {selectedBook?.total} copies available
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedBook?.description}</p>
                </div>
              </div>

              {/* Rating */}
              {selectedBook?.rating && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(selectedBook.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : i < selectedBook.rating
                            ? 'fill-yellow-200 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{selectedBook?.rating?.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({selectedBook?.reviews?.length} {selectedBook?.reviews?.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Reviews Section */}
              {selectedBook?.reviews && selectedBook.reviews.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-medium text-foreground">Member Reviews</h3>
                  <div className="space-y-4">
                    {selectedBook.reviews.map((review: any) => (
                      <div key={review.id} className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{review.userName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.date).toLocaleDateString('en-PH', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <Separator className="my-4" />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {requestedBooks.includes(selectedBook?.id) ? (
              <Button
                variant="destructive"
                onClick={() => {
                  handleCancelRequest(selectedBook?.id);
                  setIsViewDialogOpen(false);
                }}
              >
                Cancel Request
              </Button>
            ) : (
              <Button
                disabled={selectedBook?.available === 0}
                onClick={() => {
                  handleRequestBook(selectedBook);
                  setIsViewDialogOpen(false);
                }}
              >
                {selectedBook?.available === 0 ? "Unavailable" : "Request Book"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}