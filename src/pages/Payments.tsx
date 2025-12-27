import { useState, useEffect } from "react";
import { DollarSign, CreditCard, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
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
import { paymentsAPI } from "../lib/api";

export function Payments() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [confirmPaymentDialog, setConfirmPaymentDialog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAll();
      
      if (response.success && response.data) {
        // Format payments data
        const formattedPayments = response.data.map((payment: any) => ({
          id: payment.payment_id || payment.id,
          payment_id: payment.payment_id,
          request_id: payment.request_id,
          borrower_id: payment.request?.borrower_id,
          userName: payment.request?.borrower?.name || 'Unknown',
          userEmail: payment.request?.borrower?.email || '',
          amount: payment.amount || 0,
          type: payment.payment_type || payment.type || 'Unknown',
          paymentMethod: payment.payment_method || payment.paymentMethod || '',
          referenceNo: payment.reference_no || payment.referenceNo || '',
          date: payment.payment_date || payment.date || payment.created_at,
          status: payment.paid_status === 'paid' ? 'Paid' : payment.paid_status === 'pending' ? 'Pending' : 'Unpaid',
          description: payment.description || `${payment.payment_type || 'Payment'}`,
          bookTitle: payment.request?.book?.title || '',
        }));
        
        setPayments(formattedPayments);
      } else {
        setPayments([]);
      }
    } catch (error: any) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Borrower", accessor: "userName" },
    { 
      header: "Amount", 
      accessor: "amount",
      cell: (value: number) => `₱${value.toFixed(2)}`
    },
    { header: "Type", accessor: "type" },
    { 
      header: "Payment Method", 
      accessor: "paymentMethod",
      cell: (value: string) => value || "-"
    },
    { 
      header: "Reference No.", 
      accessor: "referenceNo",
      cell: (value: string) => value || "-"
    },
    { 
      header: "Payment Date", 
      accessor: "date",
      cell: (value: string) => {
        if (!value) return '-';
        try {
          const date = new Date(value);
          if (isNaN(date.getTime())) return '-';
          return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Manila'
          });
        } catch {
          return '-';
        }
      }
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const handleView = (payment: any) => {
    setSelectedPayment(payment);
  };

  const handleConfirmPayment = async () => {
    if (!confirmPaymentDialog) return;

    try {
      // Update payment status via API
      await paymentsAPI.update(confirmPaymentDialog.payment_id, {
        paid_status: 'paid',
      });

      setConfirmPaymentDialog(null);
      setSelectedPayment(null);
      await loadPayments();
      toast.success("Payment confirmed successfully!");
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment. Please try again.');
    }
  };

  const totalPaid = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);
  const totalUnpaid = payments.filter(p => p.status === "Unpaid").reduce((sum, p) => sum + p.amount, 0);

  // Calculate payment method distribution
  const paymentMethodStats = [
    { method: "GCash", count: payments.filter(p => p.paymentMethod?.toLowerCase() === 'gcash').length, color: "from-blue-500 to-blue-600" },
    { method: "Maya", count: payments.filter(p => p.paymentMethod?.toLowerCase() === 'maya').length, color: "from-green-500 to-green-600" },
    { method: "GoTyme", count: payments.filter(p => p.paymentMethod?.toLowerCase() === 'gotyme').length, color: "from-cyan-500 to-teal-500" },
  ];

  const totalTransactions = payments.length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Payments</h1>
          <p className="text-muted-foreground">Track and manage payment transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl">₱{totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl">₱{totalPending.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unpaid</p>
              <p className="text-2xl">₱{totalUnpaid.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl">{totalTransactions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods Overview */}
      <Card className="p-6">
        <h2 className="mb-4">Payment Methods Distribution</h2>
        <div className="space-y-3">
          {paymentMethodStats.map((stat) => {
            const percentage = totalTransactions > 0 ? (stat.count / totalTransactions) * 100 : 0;
            return (
              <div key={stat.method} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{stat.method}</span>
                    <span className="text-sm text-muted-foreground">{stat.count} transactions ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Data Table - View Only */}
      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </Card>
      ) : payments.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No payments found</h3>
          <p className="text-sm text-muted-foreground">
            Payment transactions will appear here when available.
          </p>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          onView={handleView}
        />
      )}

      {/* Payment Detail Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>View the complete details of this payment</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment ID</p>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={selectedPayment.status} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Borrower Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedPayment.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedPayment.userEmail}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium text-lg">₱{selectedPayment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{selectedPayment.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span className="font-medium">{selectedPayment.description}</span>
                  </div>
                  {selectedPayment.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{selectedPayment.paymentMethod}</span>
                    </div>
                  )}
                  {selectedPayment.referenceNo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference No:</span>
                      <span className="font-medium font-mono">{selectedPayment.referenceNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {selectedPayment.date ? (() => {
                        try {
                          const date = new Date(selectedPayment.date);
                          if (isNaN(date.getTime())) return '-';
                          return date.toLocaleDateString('en-PH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'Asia/Manila'
                          });
                        } catch {
                          return '-';
                        }
                      })() : '-'}
                    </span>
                  </div>
                  {selectedPayment.bookTitle && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Related Book:</span>
                      <span className="font-medium">{selectedPayment.bookTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Note Section */}
              {selectedPayment.paymentNote && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Payment Note</h3>
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-sm text-gray-700">{selectedPayment.paymentNote}</p>
                  </div>
                </div>
              )}

              {/* Proof of Payment Section */}
              {selectedPayment.proofOfPayment && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Proof of Payment</h3>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img
                      src={selectedPayment.proofOfPayment}
                      alt="Proof of Payment"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              {selectedPayment.status === "Pending" && (
                <div className="border-t pt-4">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setConfirmPaymentDialog(selectedPayment)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Payment Dialog */}
      <AlertDialog open={!!confirmPaymentDialog} onOpenChange={() => setConfirmPaymentDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this payment of <strong>₱{confirmPaymentDialog?.amount.toFixed(2)}</strong> from <strong>{confirmPaymentDialog?.userName}</strong>? This will mark the payment as paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700">
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}