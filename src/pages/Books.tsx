import { useState, useEffect } from "react";
import { Plus, Grid, List, Filter, Upload, X, Book, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { BookCard } from "../components/shared/BookCard";
import { DataTable } from "../components/shared/DataTable";
import { booksAPI, categoriesAPI, suppliersAPI, bookAuthorsAPI } from "../lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
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
import { getBookDescription } from "../lib/bookDescriptions";

export function Books() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<any>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    category_id: '',
    supplier_id: '',
    author_name: '',
    content: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadBooks(),
          loadCategories(),
          loadSuppliers()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data. Please refresh the page.');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAll({ per_page: 1000 });
      
      if (response.success && response.data) {
        const booksData = response.data.data || response.data || [];
        
        // Load authors for each book
        const booksWithAuthors = await Promise.all(
          booksData.map(async (book: any) => {
            try {
              const authorsResponse = await bookAuthorsAPI.getAll({ book_id: book.book_id });
              const authors = authorsResponse.success ? authorsResponse.data : [];
              const authorName = authors.length > 0 ? authors[0].author_name : 'Unknown Author';
              
              return {
                id: book.book_id,
                book_id: book.book_id,
                title: book.title || 'Untitled',
                isbn: book.isbn || '',
                author: authorName,
                category: book.category?.category_name || 'Uncategorized',
                category_id: book.category_id,
                supplier_id: book.supplier_id,
                available: 100,
                quantity: 100,
              };
            } catch (authorError) {
              console.warn('Error loading authors for book:', book.book_id, authorError);
              return {
                id: book.book_id,
                book_id: book.book_id,
                title: book.title || 'Untitled',
                isbn: book.isbn || '',
                author: 'Unknown Author',
                category: book.category?.category_name || 'Uncategorized',
                category_id: book.category_id,
                supplier_id: book.supplier_id,
                available: 100,
                quantity: 100,
              };
            }
          })
        );
        
        setBooks(booksWithAuthors);
      } else {
        setBooks([]);
      }
    } catch (error: any) {
      console.error('Error loading books:', error);
      toast.error('Failed to load books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      } else {
        setCategories([]);
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.success && response.data) {
        setSuppliers(Array.isArray(response.data) ? response.data : []);
      } else {
        setSuppliers([]);
      }
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
      setSuppliers([]);
    }
  };

  // Filter books based on category
  const filteredBooks = books && categoryFilter === "all" 
    ? books 
    : books.filter(b => b && b.category_id?.toString() === categoryFilter);

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Title", accessor: "title" },
    { header: "ISBN", accessor: "isbn" },
    { header: "Author", accessor: "author" },
    { header: "Category", accessor: "category" },
    { 
      header: "Available", 
      accessor: "available",
      cell: (value: number, row: any) => <span>{value || 0}/{row?.quantity || 1}</span>
    },
  ];

  const handleBookClick = async (book: any) => {
    // Load full book details including description
    try {
      const bookDetails = await booksAPI.getById(book.book_id);
      if (bookDetails.success && bookDetails.data) {
        setSelectedBook({
          ...book,
          description: bookDetails.data.description || null,
        });
      } else {
        setSelectedBook(book);
      }
    } catch (error) {
      console.warn('Could not load book details:', error);
      setSelectedBook(book);
    }
  };

  const handleEdit = async (book: any) => {
    setSelectedBook(book);
    
    // Load authors for this book
    const authorsResponse = await bookAuthorsAPI.getAll({ book_id: book.book_id });
    const authors = authorsResponse.success ? authorsResponse.data : [];
    const authorName = authors.length > 0 ? authors[0].author_name : '';
    
    // Load book details including content
    let bookContent = '';
    try {
      const bookDetails = await booksAPI.getById(book.book_id);
      if (bookDetails.success && bookDetails.data) {
        bookContent = bookDetails.data.content || '';
      }
    } catch (error) {
      console.warn('Could not load book content:', error);
    }
    
    setFormData({
      title: book.title || '',
      isbn: book.isbn || '',
      category_id: book.category_id?.toString() || '',
      supplier_id: book.supplier_id?.toString() || '',
      author_name: authorName,
      content: bookContent,
    });
    
    // Load existing cover image if available
    const existingCover = localStorage.getItem(`book_cover_${book.book_id}`);
    if (existingCover) {
      setCoverImagePreview(existingCover);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (book: any) => {
    setDeleteDialog(book);
  };

  const confirmDelete = async () => {
    if (deleteDialog) {
      try {
        await booksAPI.delete(deleteDialog.book_id);
        toast.success("Book deleted successfully!");
        setDeleteDialog(null);
        await loadBooks();
      } catch (error: any) {
        console.error('Error deleting book:', error);
        toast.error(error.response?.data?.message || 'Failed to delete book. Please try again.');
      }
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setCoverImagePreview(null);
      setSelectedBook(null);
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let bookResponse: any = null;
    
    try {
      if (selectedBook) {
        // Update existing book
        await booksAPI.update(selectedBook.book_id, {
          title: formData.title,
          isbn: formData.isbn || null,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
          content: formData.content || null,
        });
        
        // Update author if provided
        if (formData.author_name) {
          const authorsResponse = await bookAuthorsAPI.getAll({ book_id: selectedBook.book_id });
          const existingAuthors = authorsResponse.success ? authorsResponse.data : [];
          
          if (existingAuthors.length > 0) {
            // Update first author
            await bookAuthorsAPI.update(existingAuthors[0].book_author_id, {
              author_name: formData.author_name,
            });
          } else {
            // Create new author
            await bookAuthorsAPI.create({
              book_id: selectedBook.book_id,
              author_name: formData.author_name,
            });
          }
        }
        
        toast.success("Book updated successfully!");
      } else {
        // Create new book
        const newBookResponse = await booksAPI.create({
          title: formData.title,
          isbn: formData.isbn || null,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
          content: formData.content || null,
        });
        
        if (newBookResponse.success && newBookResponse.data && formData.author_name) {
          // Create author for the new book
          const bookData = newBookResponse.data.book || newBookResponse.data;
          await bookAuthorsAPI.create({
            book_id: bookData.book_id,
            author_name: formData.author_name,
          });
        }
        
        bookResponse = newBookResponse;
        toast.success("New book added successfully!");
      }
      
      // Save cover image to localStorage if provided
      if (coverImagePreview) {
        let bookId = null;
        if (selectedBook) {
          bookId = selectedBook.book_id || selectedBook.id;
        } else if (bookResponse?.success && bookResponse.data) {
          const bookData = bookResponse.data.book || bookResponse.data;
          bookId = bookData.book_id;
        }
        if (bookId) {
          localStorage.setItem(`book_cover_${bookId}`, coverImagePreview);
        }
      }
      
      setIsDialogOpen(false);
      setCoverImagePreview(null);
      setSelectedBook(null);
      setFormData({
        title: '',
        isbn: '',
        category_id: '',
        supplier_id: '',
        author_name: '',
        content: '',
      });
      
      // Reload books
      await loadBooks();
    } catch (error: any) {
      console.error('Error saving book:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save book. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Books Catalog</h1>
          <p className="text-muted-foreground">Browse and manage your library collection</p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedBook(null);
                setFormData({
                  title: '',
                  isbn: '',
                  category_id: '',
                  supplier_id: '',
                  author_name: '',
                  content: '',
                });
                setCoverImagePreview(null);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedBook ? "Edit Book" : "Add New Book"}</DialogTitle>
                <DialogDescription>
                  {selectedBook ? "Edit the details of the book" : "Add a new book to the catalog"}
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSaveBook}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter book title" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input 
                      id="isbn" 
                      placeholder="Enter ISBN" 
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input 
                      id="author" 
                      placeholder="Enter author name" 
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                            {cat.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select 
                      value={formData.supplier_id}
                      onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((sup: any) => (
                          <SelectItem key={sup.supplier_id} value={sup.supplier_id.toString()}>
                            {sup.supplier_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter book description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Book Content</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Enter the book's readable content (users can read this after their request is approved). You can enter multiple pages separated by blank lines or format as needed." 
                    rows={10}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add the book's content here. Users will be able to read this content only after their borrow request is approved by an admin.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image</Label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          id="coverImage"
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("coverImage")?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Cover Photo
                        </Button>
                        {coverImagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCoverImagePreview(null)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload a book cover image (JPG, PNG, or WebP)
                      </p>
                    </div>
                    {coverImagePreview && (
                      <div className="w-32 h-44 rounded-lg overflow-hidden border-2 border-border shadow-md">
                        <img
                          src={coverImagePreview}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedBook ? "Update" : "Add"} Book
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Books Display */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks && filteredBooks.length > 0 ? filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              bookId={book.id}
              title={book.title || 'Untitled'}
              author={book.author || 'Unknown Author'}
              category={book.category || 'Uncategorized'}
              rating={book.rating}
              available={book.available > 0}
              onClick={() => handleBookClick(book)}
            />
          )) : (
            <div className="col-span-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Book className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No books found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first book to the catalog.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Book
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredBooks || []}
          onView={handleBookClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Book Detail Dialog */}
      {selectedBook && !isDialogOpen && (() => {
        const bookCover = localStorage.getItem(`book_cover_${selectedBook.id}`);
        
        return (
          <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Book Details</DialogTitle>
                <DialogDescription>View complete book information and details</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="authors" className="flex-1">Authors</TabsTrigger>
                  <TabsTrigger value="availability" className="flex-1">Availability</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-6 min-h-[500px]">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1">
                      {bookCover ? (
                        <div className="aspect-[3/4] rounded-lg overflow-hidden">
                          <img
                            src={bookCover}
                            alt={selectedBook.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <Book className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 space-y-4">
                      <div>
                        <h2>{selectedBook.title}</h2>
                        <p className="text-muted-foreground">{selectedBook.author}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">ISBN</p>
                          <p>{selectedBook.isbn}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Category</p>
                          <Badge>{selectedBook.category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Supplier</p>
                          <p>{selectedBook.supplier}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Published</p>
                          <p>{selectedBook.published}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Quantity</p>
                          <p>{selectedBook.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Available</p>
                          <p className="text-green-600">{selectedBook.available}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Description</p>
                        <p className="text-sm">
                          {getBookDescription(selectedBook.title, selectedBook.description)}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="authors" className="space-y-4 min-h-[500px]">
                  <div className="p-4 border border-border rounded-lg">
                    <h3>{selectedBook.author || 'Unknown Author'}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Author of this book</p>
                    <p className="text-sm">Information about the author will be displayed here when available from the system.</p>
                    <p className="text-xs text-muted-foreground mt-2">Books by this author: 1</p>
                  </div>
                </TabsContent>
                <TabsContent value="availability" className="min-h-[500px]">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">Available</p>
                        <p className="text-2xl text-green-700">{selectedBook.available}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">Borrowed</p>
                        <p className="text-2xl text-blue-700">{selectedBook.quantity - selectedBook.available}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">Total</p>
                        <p className="text-2xl text-gray-700">{selectedBook.quantity}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3">Current Borrowers</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="text-sm">Sarah Johnson</p>
                            <p className="text-xs text-muted-foreground">Due: Nov 25, 2024</p>
                          </div>
                          <Badge>Borrowed</Badge>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="text-sm">Michael Chen</p>
                            <p className="text-xs text-muted-foreground">Due: Nov 28, 2024</p>
                          </div>
                          <Badge>Borrowed</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Books</DialogTitle>
            <DialogDescription>
              Filter books by category
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Fiction">Fiction</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Biography">Biography</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Self-Help">Self-Help</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowFilterDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Apply Filter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog?.title}</strong>? This action cannot be undone and will permanently remove the book from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}