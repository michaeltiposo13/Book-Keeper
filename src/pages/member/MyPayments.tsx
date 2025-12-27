import { useState, useEffect } from "react";
import { CreditCard, Calendar, CheckCircle, Clock, Filter, ExternalLink } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import mayaQR from "figma:asset/5dcc535aed2ad781a81b745e1ccf7725745398d1.png";
import gcashQR from "figma:asset/5a48d2acdef75ac74874ba1654fa55c246695499.png";
import gotymeQR from "figma:asset/861ceebbb98765d955ed7ee701411732ebf4c6fd.png";

export function MyPayments() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentDialog, setPaymentDialog] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [viewPaymentDialog, setViewPaymentDialog] = useState<any>(null);
  const [paymentNote, setPaymentNote] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    // Load payments from localStorage
    const savedPayments = localStorage.getItem(`payments_${user?.id}`);
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      // Initialize with empty payments array
      const initialPayments = [];
      setPayments(initialPayments);
      localStorage.setItem(`payments_${user?.id}`, JSON.stringify(initialPayments));
    }
  }, [user?.id]);

  const filteredPayments = payments.filter(
    (payment) => statusFilter === "all" || payment.status.toLowerCase() === statusFilter.toLowerCase()
  );

  // Calculate totals based on confirmed payments only
  const totalPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUnpaid = payments
    .filter((p) => p.status === "Unpaid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = payments.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Unpaid":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Fine":
        return "text-red-600 bg-red-50";
      case "Membership":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handlePayNow = (payment: any) => {
    setPaymentDialog(payment);
    setPaymentMethod("");
  };

  const handleSubmitPayment = () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    if (!proofOfPayment) {
      toast.error("Please upload proof of payment (screenshot)");
      return;
    }
    
    // Update payment with proof and method
    const updatedPayments = payments.map((p) => {
      if (p.id === paymentDialog.id) {
        return {
          ...p,
          status: "Pending",
          paymentMethod: paymentMethod,
          proofOfPayment: proofPreview,
          paymentNote: paymentNote || "",
          submittedDate: new Date().toISOString(),
        };
      }
      return p;
    });
    
    setPayments(updatedPayments);
    localStorage.setItem(`payments_${user?.id}`, JSON.stringify(updatedPayments));
    
    toast.success("Payment submitted successfully! Awaiting admin confirmation.");
    setPaymentDialog(null);
    setPaymentMethod("");
    setProofOfPayment(null);
    setProofPreview(null);
    setPaymentNote("");
  };

  const handleProofOfPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofOfPayment(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-foreground mb-2">My Payments</h1>
          <p className="text-muted-foreground">
            View your payment history and pending charges
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-semibold text-foreground">₱{totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
              <p className="text-2xl font-semibold text-foreground">₱{totalPending.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-2xl font-semibold text-foreground">{totalTransactions}</p>
            </div>
          </div>
        </Card>
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
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <Card className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payments found</p>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${getTypeColor(payment.type)}`}>
                        {payment.type}
                      </span>
                      <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-foreground mb-1">{payment.description}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(payment.date).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'Asia/Manila'
                        })}
                      </span>
                      {payment.paymentMethod && (
                        <span>Payment: {payment.paymentMethod}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setViewPaymentDialog(payment)}
                  >
                    View Info
                  </Button>
                  {payment.status === "Unpaid" && (
                    <Button 
                      onClick={() => handlePayNow(payment)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Pay Now
                    </Button>
                  )}
                  <p className="text-2xl font-semibold text-foreground">₱{payment.amount.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pending Payments Notice */}
      {totalPending > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-900 mb-1">Pending Payments</h3>
              <p className="text-sm text-yellow-800 mb-3">
                You have outstanding payments totaling ₱{totalPending.toFixed(2)}.
              </p>
              <p className="text-xs text-yellow-700">
                Note: Pending payments may affect your ability to borrow new books.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Dialog */}
      {paymentDialog && (
        <Dialog open={true} onOpenChange={() => {
          setPaymentDialog(null);
          setPaymentMethod("");
          setProofOfPayment(null);
          setProofPreview(null);
          setPaymentNote("");
        }}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Payment</DialogTitle>
              <DialogDescription>
                Select a payment method and upload proof of payment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">GCash QR</SelectItem>
                    <SelectItem value="maya">Maya QR</SelectItem>
                    <SelectItem value="gotyme">GoTyme QR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {paymentMethod && (
                <>
                  {/* QR Code Display */}
                  <div className="space-y-2">
                    <Label>Scan QR Code to Pay</Label>
                    <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
                      {paymentMethod === "gcash" && (
                        <img src={gcashQR} alt="GCash QR Code" className="max-w-full h-auto" style={{ maxHeight: "400px" }} />
                      )}
                      {paymentMethod === "maya" && (
                        <img src={mayaQR} alt="Maya QR Code" className="max-w-full h-auto" style={{ maxHeight: "300px" }} />
                      )}
                      {paymentMethod === "gotyme" && (
                        <img src={gotymeQR} alt="GoTyme QR Code" className="max-w-full h-auto" style={{ maxHeight: "400px" }} />
                      )}
                    </div>
                  </div>

                  {/* Upload Proof */}
                  <div className="space-y-2">
                    <Label htmlFor="proofOfPayment">Upload Proof of Payment (Screenshot) *</Label>
                    <Input
                      type="file"
                      id="proofOfPayment"
                      accept="image/*"
                      onChange={handleProofOfPaymentChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Please upload a clear screenshot of your payment confirmation
                    </p>
                    {proofPreview && (
                      <div className="mt-3 border rounded-lg p-2 bg-gray-50">
                        <img
                          src={proofPreview}
                          alt="Proof of Payment Preview"
                          className="max-w-full h-auto rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* Note Section */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentNote">Note (Optional)</Label>
                    <Textarea
                      id="paymentNote"
                      placeholder="Add any additional notes or details about your payment..."
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can include reference numbers, transaction details, or any other relevant information
                    </p>
                  </div>
                </>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Your payment will be reviewed by the admin. Once confirmed, your payment status will be updated.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPaymentDialog(null);
                  setPaymentMethod("");
                  setProofOfPayment(null);
                  setProofPreview(null);
                  setPaymentNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitPayment}
                disabled={!paymentMethod || !proofOfPayment}
              >
                Submit Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Payment Information Dialog */}
      {viewPaymentDialog && (
        <Dialog open={true} onOpenChange={() => setViewPaymentDialog(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Payment Information</DialogTitle>
              <DialogDescription>
                Detailed information about this payment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment ID</p>
                  <p className="font-medium">{viewPaymentDialog.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(viewPaymentDialog.status)}>
                    {viewPaymentDialog.status}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="font-medium">{viewPaymentDialog.type}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="font-medium">{viewPaymentDialog.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold text-foreground">
                  ₱{viewPaymentDialog.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-medium">
                  {new Date(viewPaymentDialog.date).toLocaleDateString('en-PH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Manila'
                  })}
                </p>
              </div>

              {viewPaymentDialog.paymentMethod && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <p className="font-medium">{viewPaymentDialog.paymentMethod}</p>
                </div>
              )}

              {viewPaymentDialog.referenceNo && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                  <p className="font-medium font-mono">{viewPaymentDialog.referenceNo}</p>
                </div>
              )}

              {viewPaymentDialog.bookTitle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Related Book</p>
                  <p className="font-medium">{viewPaymentDialog.bookTitle}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewPaymentDialog(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}