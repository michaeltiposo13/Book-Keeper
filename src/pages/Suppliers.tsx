import { useState, useEffect } from "react";
import { Plus, Building2, Phone, Mail, MapPin, List, Grid3x3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { DataTable } from "../components/shared/DataTable";
import { suppliersAPI } from "../lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editFormData, setEditFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    address: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<any>(null);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll();
      if (response.success && response.data) {
        setSuppliers(Array.isArray(response.data) ? response.data : []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      toast.error('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const columns = [
    { header: "ID", accessor: "supplier_id" },
    { header: "Name", accessor: "supplier_name" },
    { header: "Contact Email", accessor: "contact" },
    { header: "Phone", accessor: "phone" },
    { header: "Books Supplied", accessor: "booksSupplied" },
  ];

  const handleView = (supplier: any) => {
    setSelectedSupplier(supplier);
  };

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    
    // Parse contact_info back into separate fields
    const contactParts = supplier.contact_info ? supplier.contact_info.split(' | ') : ['', '', ''];
    
    setEditFormData({
      name: supplier.supplier_name || supplier.name,
      contact: contactParts[0] || '',
      phone: contactParts[1] || '',
      address: contactParts[2] || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (supplier: any) => {
    setDeleteDialog(supplier);
  };

  const confirmDelete = async () => {
    if (deleteDialog) {
      try {
        await suppliersAPI.delete(deleteDialog.supplier_id);
        const supplierName = deleteDialog.supplier_name || deleteDialog.name;
        toast.success(`${supplierName} has been deleted successfully.`);
        setDeleteDialog(null);
        await loadSuppliers();
      } catch (error: any) {
        console.error('Error deleting supplier:', error);
        toast.error(error.response?.data?.message || 'Failed to delete supplier. Please try again.');
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Combine contact info into a single string
      const contactInfo = [
        editFormData.contact,
        editFormData.phone,
        editFormData.address
      ].filter(Boolean).join(' | ');
      
      if (selectedSupplier) {
        // Update existing supplier
        await suppliersAPI.update(selectedSupplier.supplier_id, {
          supplier_name: editFormData.name,
          contact_info: contactInfo,
        });
        
        toast.success("Supplier updated successfully!");
      } else {
        // Create new supplier
        await suppliersAPI.create({
          supplier_name: editFormData.name,
          contact_info: contactInfo,
        });
        
        toast.success("Supplier added successfully!");
      }
      
      // Refresh data
      await loadSuppliers();
      
      setIsDialogOpen(false);
      setSelectedSupplier(null);
      setEditFormData({
        name: "",
        contact: "",
        phone: "",
        address: "",
      });
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save supplier. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Suppliers</h1>
          <p className="text-muted-foreground">Manage book suppliers and vendors</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? (
              <>
                <List className="w-4 h-4 mr-2" />
                List View
              </>
            ) : (
              <>
                <Grid3x3 className="w-4 h-4 mr-2" />
                Grid View
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedSupplier(null);
                setEditFormData({
                  name: "",
                  contact: "",
                  phone: "",
                  address: "",
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
                <DialogDescription>
                  {selectedSupplier ? "Edit the supplier's information" : "Add a new supplier to the system"}
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSaveEdit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter supplier name" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Email *</Label>
                    <Input 
                      id="contact" 
                      type="email" 
                      placeholder="Enter email" 
                      value={editFormData.contact}
                      onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone" 
                      placeholder="Enter phone" 
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Enter full address" 
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    rows={2} 
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedSupplier ? "Update" : "Add"} Supplier
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Suppliers Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-muted-foreground">Loading suppliers...</div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers && suppliers.length > 0 ? suppliers.map((supplier) => (
            <Card 
              key={supplier.supplier_id || supplier.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleView(supplier)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(supplier);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-foreground mb-1">{supplier.supplier_name || supplier.name}</h3>
                  <div className="space-y-2">
                    {(() => {
                      const contactParts = supplier.contact_info ? supplier.contact_info.split(' | ') : [];
                      return (
                        <>
                          {contactParts[0] && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{contactParts[0]}</span>
                            </div>
                          )}
                          {contactParts[1] && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{contactParts[1]}</span>
                            </div>
                          )}
                          {contactParts[2] && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{contactParts[2]}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                    <span className="text-sm text-muted-foreground">Books Supplied</span>
                    <span className="text-sm font-medium">{supplier.booksSupplied || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first supplier.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Supplier
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={suppliers || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Supplier Detail Dialog */}
      {selectedSupplier && !isDialogOpen && (
        <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Supplier Details</DialogTitle>
              <DialogDescription>View complete supplier information</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{selectedSupplier.supplier_name || selectedSupplier.name}</h3>
                  <p className="text-sm text-muted-foreground">Supplier ID: #{selectedSupplier.supplier_id || selectedSupplier.id}</p>
                </div>
              </div>
              {(() => {
                const contactParts = selectedSupplier.contact_info ? selectedSupplier.contact_info.split(' | ') : [];
                return (
                  <div className="grid grid-cols-2 gap-6">
                    {contactParts[0] && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Contact Email</p>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">{contactParts[0]}</p>
                        </div>
                      </div>
                    )}
                    {contactParts[1] && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">{contactParts[1]}</p>
                        </div>
                      </div>
                    )}
                    {contactParts[2] && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">Address</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                          <p className="font-medium">{contactParts[2]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Books Supplied</p>
                    <p className="text-2xl font-semibold text-blue-900">{selectedSupplier.booksSupplied}</p>
                  </Card>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <p className="text-sm text-green-700 mb-1">Status</p>
                    <p className="text-lg font-semibold text-green-900">Active</p>
                  </Card>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog?.supplier_name || deleteDialog?.name}</strong>? This action cannot be undone and will permanently remove the supplier from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}