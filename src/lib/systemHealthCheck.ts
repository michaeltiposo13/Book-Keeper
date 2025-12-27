// System Health Check - Ensures data consistency across all modules
export function performSystemHealthCheck() {
  console.log("🔍 Performing System Health Check...");
  
  const issues: string[] = [];
  const fixes: string[] = [];

  // 1. Check Users
  const users = JSON.parse(localStorage.getItem('library_users') || "[]");
  console.log(`✓ Found ${users.length} users`);

  // 2. Check and sync borrows with requests
  users.forEach((user: any) => {
    const borrows = JSON.parse(localStorage.getItem(`borrows_${user.id}`) || "[]");
    const payments = JSON.parse(localStorage.getItem(`payments_${user.id}`) || "[]");
    
    // Check for borrows with fines but no payment record
    borrows.forEach((borrow: any) => {
      if (borrow.fine > 0 && borrow.status === "returned") {
        const hasFinePayment = payments.some((p: any) => 
          p.borrowId === borrow.id && p.type === "Late Fee"
        );
        
        if (!hasFinePayment) {
          issues.push(`Missing late fee payment for borrow ${borrow.id} (${user.name})`);
          
          // Auto-fix: Create payment record
          const newPayment = {
            id: `fine-${borrow.id}`,
            borrowId: borrow.id,
            bookTitle: borrow.bookTitle,
            amount: borrow.fine,
            type: "Late Fee",
            description: `Late fee for ${borrow.bookTitle}`,
            status: "Unpaid",
            date: borrow.returnDate || new Date().toISOString(),
            paymentMethod: null,
            referenceNo: null,
          };
          payments.push(newPayment);
          fixes.push(`Created late fee payment for ${borrow.bookTitle}`);
        }
      }
    });
    
    // Save fixed payments
    if (payments.length > 0) {
      localStorage.setItem(`payments_${user.id}`, JSON.stringify(payments));
    }
  });

  // 3. Check book requests consistency
  const bookRequests = JSON.parse(localStorage.getItem('book_requests') || "[]");
  console.log(`✓ Found ${bookRequests.length} book requests`);
  
  // Ensure all requests have corresponding borrows
  bookRequests.forEach((request: any) => {
    const userBorrows = JSON.parse(localStorage.getItem(`borrows_${request.userId}`) || "[]");
    const hasBorrow = userBorrows.some((b: any) => b.id === request.id);
    
    if (!hasBorrow && request.status === "pending") {
      issues.push(`Request ${request.id} has no corresponding borrow entry`);
      
      // Auto-fix: Create borrow entry
      userBorrows.push({
        id: request.id,
        bookId: request.bookId,
        bookTitle: request.bookTitle,
        author: request.author || "Unknown Author",
        borrowDate: null,
        dueDate: null,
        returnDate: null,
        status: "pending",
        fine: 0,
      });
      localStorage.setItem(`borrows_${request.userId}`, JSON.stringify(userBorrows));
      fixes.push(`Created borrow entry for request ${request.id}`);
    }
  });

  // 4. Clean up orphaned data
  users.forEach((user: any) => {
    const borrows = JSON.parse(localStorage.getItem(`borrows_${user.id}`) || "[]");
    
    // Remove pending borrows that don't have a request
    const cleanedBorrows = borrows.filter((borrow: any) => {
      if (borrow.status === "pending") {
        const hasRequest = bookRequests.some((r: any) => r.id === borrow.id);
        if (!hasRequest) {
          issues.push(`Orphaned pending borrow ${borrow.id} for user ${user.name}`);
          fixes.push(`Removed orphaned pending borrow ${borrow.id}`);
          return false;
        }
      }
      return true;
    });
    
    if (cleanedBorrows.length !== borrows.length) {
      localStorage.setItem(`borrows_${user.id}`, JSON.stringify(cleanedBorrows));
    }
  });

  // 5. Validate date formats
  users.forEach((user: any) => {
    const borrows = JSON.parse(localStorage.getItem(`borrows_${user.id}`) || "[]");
    
    borrows.forEach((borrow: any) => {
      if (borrow.borrowDate && isNaN(Date.parse(borrow.borrowDate))) {
        issues.push(`Invalid borrow date for ${borrow.bookTitle}`);
      }
      if (borrow.dueDate && isNaN(Date.parse(borrow.dueDate))) {
        issues.push(`Invalid due date for ${borrow.bookTitle}`);
      }
    });
  });

  // Print Summary
  console.log("\n📊 Health Check Summary:");
  console.log(`Total Users: ${users.length}`);
  console.log(`Total Requests: ${bookRequests.length}`);
  console.log(`Issues Found: ${issues.length}`);
  console.log(`Auto-fixes Applied: ${fixes.length}`);
  
  if (issues.length > 0) {
    console.warn("\n⚠️  Issues:", issues);
  }
  
  if (fixes.length > 0) {
    console.log("\n✅ Fixes Applied:", fixes);
  }
  
  if (issues.length === 0) {
    console.log("\n✨ System is healthy! No issues found.");
  }
  
  return {
    healthy: issues.length === 0,
    issues,
    fixes
  };
}
