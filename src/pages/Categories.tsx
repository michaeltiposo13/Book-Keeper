import { useState, useMemo, useEffect } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { categoriesAPI, booksAPI } from "../lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
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

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [viewCategoryDialog, setViewCategoryDialog] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, booksResponse] = await Promise.all([
        categoriesAPI.getAll(),
        booksAPI.getAll({ per_page: 1000 })
      ]);
      
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      } else {
        setCategories([]);
      }
      
      if (booksResponse.success && booksResponse.data) {
        const booksData = booksResponse.data.data || booksResponse.data || [];
        setBooks(Array.isArray(booksData) ? booksData : []);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load categories and books');
      setCategories([]);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate accurate book counts for each category
  const categoriesWithCounts = useMemo(() => {
    if (!Array.isArray(categories) || !Array.isArray(books)) {
      return [];
    }
    try {
      return categories.map((category) => {
        if (!category) return null;
        // Match books by category_id (more reliable than category name)
        const booksInCategory = books.filter((book) => 
          book && 
          (book.category_id === category.category_id || 
           book.category?.category_id === category.category_id ||
           book.category_id?.toString() === category.category_id?.toString())
        );
        return {
          ...category,
          bookCount: booksInCategory.length,
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error calculating categories with counts:', error);
      return [];
    }
  }, [categories, books]);

  // Calculate total books for percentage calculation
  const totalBooks = useMemo(() => {
    return Array.isArray(books) ? books.length : 0;
  }, [books]);

  const handleEdit = (category: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setEditFormData({
      name: category.category_name || category.name,
      description: category.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleCategoryClick = (category: any) => {
    // Get books in this category
    const categoryName = category.category_name || category.name;
    const booksInCategory = books.filter((book) => book && book.category === categoryName);
    setViewCategoryDialog({
      ...category,
      books: booksInCategory,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedCategory) {
        // Update existing category
        await categoriesAPI.update(selectedCategory.category_id, {
          category_name: editFormData.name,
        });
        
        toast.success("Category updated successfully!");
      } else {
        // Create new category
        await categoriesAPI.create({
          category_name: editFormData.name,
        });
        
        toast.success("Category added successfully!");
      }
      
      // Refresh data
      await loadData();
      
      setIsDialogOpen(false);
      setSelectedCategory(null);
      setEditFormData({
        name: "",
        description: "",
      });
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save category. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg text-muted-foreground">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Categories</h1>
          <p className="text-muted-foreground">Organize books by categories</p>
        </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setSelectedCategory(null);
                  setEditFormData({
                    name: "",
                    description: "",
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {selectedCategory ? "Edit the category details" : "Add a new category to organize books"}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSaveEdit}>
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter category name" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter description" 
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3} 
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedCategory ? "Update" : "Add"} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoriesWithCounts && categoriesWithCounts.length > 0 ? categoriesWithCounts.map((category) => (
          <Card 
            key={category.category_id || category.id} 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleEdit(category, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Edit
                </Button>
              </div>
              <div>
                <h3 className="text-foreground mb-1">{category.category_name || category.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Books</span>
                  <span className="text-sm font-medium">{category.bookCount || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        )) : (
          <div className="col-span-full flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first category.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Category
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category Stats */}
      {categoriesWithCounts && categoriesWithCounts.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4">Category Statistics</h2>
          <div className="space-y-3">
            {categoriesWithCounts.map((category) => {
              const percentage = totalBooks > 0 ? ((category.bookCount || 0) / totalBooks) * 100 : 0;
              return (
                <div key={category.category_id || category.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{category.category_name || category.name}</span>
                      <span className="text-sm">{category.bookCount || 0} books</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      )}

      {/* View Category Books Dialog */}
      {viewCategoryDialog && (
        <Dialog open={!!viewCategoryDialog} onOpenChange={() => setViewCategoryDialog(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{viewCategoryDialog.category_name || viewCategoryDialog.name}</DialogTitle>
              <DialogDescription>
                {viewCategoryDialog.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Category Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Total Books</p>
                  <p className="text-2xl font-semibold text-blue-900">{viewCategoryDialog.books.length}</p>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                  <p className="text-sm text-green-700 mb-1">Available</p>
                  <p className="text-2xl font-semibold text-green-900">
                    {viewCategoryDialog.books.filter((b: any) => b.available > 0).length}
                  </p>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <p className="text-sm text-purple-700 mb-1">Borrowed</p>
                  <p className="text-2xl font-semibold text-purple-900">
                    {viewCategoryDialog.books.reduce((sum: number, b: any) => sum + (b.quantity - b.available), 0)}
                  </p>
                </Card>
              </div>

              {/* Books List */}
              <div>
                <h3 className="mb-3">Books in this Category</h3>
                <ScrollArea className="h-96">
                  {viewCategoryDialog.books.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No books in this category</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pr-4">
                      {viewCategoryDialog.books.map((book: any) => (
                        <Card key={book.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-foreground">{book.title}</h4>
                                  <p className="text-sm text-muted-foreground">{book.author}</p>
                                </div>
                                <Badge variant={book.available > 0 ? "default" : "secondary"}>
                                  {book.available > 0 ? "Available" : "Borrowed"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-3 text-xs text-muted-foreground">
                                <div>
                                  <p className="mb-1">ISBN</p>
                                  <p className="font-medium text-foreground">{book.isbn}</p>
                                </div>
                                <div>
                                  <p className="mb-1">Publisher</p>
                                  <p className="font-medium text-foreground">{book.supplier}</p>
                                </div>
                                <div>
                                  <p className="mb-1">Published</p>
                                  <p className="font-medium text-foreground">{book.published}</p>
                                </div>
                                <div>
                                  <p className="mb-1">Availability</p>
                                  <p className="font-medium text-foreground">
                                    {book.available}/{book.quantity}
                                  </p>
                                </div>
                              </div>
                              {book.rating && (
                                <div className="flex items-center gap-1 mt-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-yellow-400 text-sm">
                                      {star <= book.rating ? "★" : "☆"}
                                    </span>
                                  ))}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({book.rating}/5)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
