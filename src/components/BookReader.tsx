import { useState } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface BookReaderProps {
  book: {
    id: string;
    title: string;
    author: string;
    content: string[];
  };
  onClose: () => void;
}

export function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = book.content.length;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col bg-amber-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-medium">{book.title}</h2>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Book Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                {book.content[currentPage]}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t bg-white p-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>
            
            <Button
              variant="outline"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
