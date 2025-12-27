import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BookOpen, Clock, CheckCircle, X, BookMarked, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { BookReader } from "../../components/BookReader";
import { toast } from "sonner";
import { requestBooksAPI, booksAPI, bookAuthorsAPI } from "../../lib/api";
import { getBookContent } from "../../lib/defaultBookContent";

export function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [showCompletedReturns, setShowCompletedReturns] = useState(false);
  const [readingBook, setReadingBook] = useState<any>(null);
  const [completedReturns, setCompletedReturns] = useState<any[]>([]);
  const [activeBorrows, setActiveBorrows] = useState<any[]>([]);
  const [stats, setStats] = useState({
    currentlyBorrowed: 0,
    pendingRequests: 0,
    completedReturns: 0,
  });

  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    if (user?.borrower_id) {
      loadBorrows();
    }
  }, [user?.borrower_id]);

  const loadBorrows = async () => {
    try {
      setLoading(true);
      const response = await requestBooksAPI.getAll({ borrower_id: user?.borrower_id });
      
      if (response.success && response.data) {
        const formattedBorrows = await Promise.all(
          response.data.map(async (req: any) => {
            // Get author from book_authors relationship
            const authors = req.book?.book_authors || [];
            const authorName = authors.length > 0 ? authors[0].author_name : 'Unknown Author';
            
            // Map approval_status to status
            let status = req.approval_status;
            if (status === 'approved' && req.due_date) {
              const dueDate = new Date(req.due_date);
              const today = new Date();
              if (dueDate < today && !req.return_date) {
                status = 'overdue';
              } else {
                status = 'active';
              }
            }
            if (req.return_date) {
              status = 'returned';
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
          })
        );
        
        const returnedBooks = formattedBorrows.filter((b: any) => b.status === "returned" || b.returnDate);
        const activeBooks = formattedBorrows.filter((b: any) => (b.status === "active" || b.approval_status === "approved") && !b.returnDate);
        const pendingBooks = formattedBorrows.filter((b: any) => b.status === "pending");
        
        setCompletedReturns(returnedBooks);
        setActiveBorrows(activeBooks);
        setStats({
          currentlyBorrowed: activeBooks.length,
          pendingRequests: pendingBooks.length,
          completedReturns: returnedBooks.length,
        });
      }
    } catch (error: any) {
      console.error('Error loading borrows:', error);
      toast.error('Failed to load borrows. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stats cards with dynamic values
  const statsCards = [
    {
      name: "Currently Borrowed",
      value: stats.currentlyBorrowed.toString(),
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate("/member/borrows"),
    },
    {
      name: "Pending Requests",
      value: stats.pendingRequests.toString(),
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      onClick: () => setShowPendingRequests(true),
    },
    {
      name: "Completed Returns",
      value: stats.completedReturns.toString(),
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      onClick: () => setShowCompletedReturns(true),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-foreground mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's your library activity overview
        </p>
      </div>

      {/* Stats Grid - Only 3 cards now, no Outstanding Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.name} 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.onClick}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.name}</p>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Borrows - Clickable to view details */}
      <Card className="p-6">
        <h2 className="text-foreground mb-4">Currently Borrowed Books</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeBorrows.length > 0 ? (
              activeBorrows.map((borrow) => {
                // Retrieve cover image from localStorage
                const coverImage = localStorage.getItem(`book_cover_${borrow.bookId}`);
                
                return (
                  <div 
                    key={borrow.id} 
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => {
                      // Set the book details for viewing
                      const bookDetails = {
                        ...borrow,
                        title: borrow.bookTitle,
                        category: "Fiction", // You can enhance this by storing category with borrow
                        isbn: "N/A",
                        description: "Currently borrowed book.",
                      };
                      setSelectedBook(bookDetails);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {coverImage ? (
                        <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={coverImage} 
                            alt={borrow.bookTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-foreground">{borrow.bookTitle}</h3>
                        <p className="text-sm text-muted-foreground">{borrow.author}</p>
                        <div className="flex gap-4 mt-1">
                          <p className="text-xs text-muted-foreground">
                            Borrowed: {new Date(borrow.borrowDate).toLocaleDateString('en-PH', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              timeZone: 'Asia/Manila'
                            })}
                          </p>
                          {borrow.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(borrow.dueDate).toLocaleDateString('en-PH', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                timeZone: 'Asia/Manila'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No borrowed books at the moment</p>
                <p className="text-sm mt-1">Visit "Browse Books" to borrow a book</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Quick Actions - Only Request a Book */}
      <Card 
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate("/member/books")}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Request a Book</h3>
            <p className="text-sm text-muted-foreground">Borrow a new book</p>
          </div>
        </div>
      </Card>

      {/* Book Details Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
            <DialogDescription>Book Details and Content</DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(() => {
                    const coverImage = localStorage.getItem(`book_cover_${selectedBook.bookId}`);
                    return coverImage ? (
                      <img src={coverImage} alt={selectedBook.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-16 h-16 text-gray-600" />
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-lg mb-2">{selectedBook.title}</h3>
                  <p className="text-muted-foreground mb-1">by {selectedBook.author}</p>
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700">{selectedBook.category}</Badge>
                    <Badge className="bg-green-100 text-green-700">{selectedBook.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">ISBN: {selectedBook.isbn}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Borrowed: {new Date(selectedBook.borrowDate).toLocaleDateString('en-PH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      timeZone: 'Asia/Manila'
                    })}</p>
                    <p>Due Date: {new Date(selectedBook.dueDate).toLocaleDateString('en-PH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      timeZone: 'Asia/Manila'
                    })}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Description</h4>
                <ScrollArea className="h-[200px] rounded border p-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedBook.description}
                  </p>
                </ScrollArea>
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-blue-500 text-white"
                  onClick={async () => {
                    try {
                      // Fetch book content from API
                      let apiContent: string | null = null;
                      try {
                        const bookResponse = await booksAPI.getById(selectedBook.bookId);
                        if (bookResponse.success && bookResponse.data) {
                          apiContent = bookResponse.data.content || null;
                        }
                      } catch (error) {
                        console.warn('Could not fetch book content from API, using default content');
                      }

                      // Get content (uses API content if available, otherwise uses sample/default content)
                      const pages = getBookContent(selectedBook.title, selectedBook.author, apiContent);
                      
                      if (pages && pages.length > 0) {
                        setReadingBook({
                          id: selectedBook.bookId.toString(),
                          title: selectedBook.title,
                          author: selectedBook.author,
                          content: pages,
                        });
                        setSelectedBook(null);
                      } else {
                        toast.error("Failed to load book content. Please try again.");
                      }
                    } catch (error: any) {
                      console.error('Error loading book content:', error);
                      toast.error("Failed to load book content. Please try again.");
                    }
                  }}
                >
                  <BookMarked className="w-4 h-4 mr-2" />
                  Read Book
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pending Requests Dialog */}
      <Dialog open={showPendingRequests} onOpenChange={setShowPendingRequests}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pending Requests</DialogTitle>
            <DialogDescription>Your book requests awaiting approval</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {statsCards[1].value > 0 && (
                <Card key="1" className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">Book Title</h4>
                      <p className="text-sm text-muted-foreground mb-2">Author Name</p>
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700">Category</Badge>
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date().toLocaleDateString('en-PH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          timeZone: 'Asia/Manila'
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Completed Returns Dialog */}
      <Dialog open={showCompletedReturns} onOpenChange={setShowCompletedReturns}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Completed Returns</DialogTitle>
            <DialogDescription>Your book return history</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {completedReturns.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{item.bookTitle}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
                      <Badge className="bg-green-100 text-green-700 mb-2">Returned</Badge>
                      {item.rating && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-yellow-400 text-lg">
                                {star <= item.rating ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                          {item.review && (
                            <p className="text-xs text-muted-foreground mt-1 italic">&ldquo;{item.review}&rdquo;</p>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Borrowed: {new Date(item.borrowDate).toLocaleDateString('en-PH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          timeZone: 'Asia/Manila'
                        })}</p>
                        <p>Returned: {new Date(item.returnDate).toLocaleDateString('en-PH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          timeZone: 'Asia/Manila'
                        })}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Book Reader */}
      {readingBook && (
        <BookReader
          book={readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}
    </div>
  );
}