import { Book, Star } from "lucide-react";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";

interface BookCardProps {
  title: string;
  author: string;
  image?: string;
  category?: string;
  rating?: number;
  available?: boolean;
  onClick?: () => void;
  bookId?: number;
}

export function BookCard({ title, author, image, category, rating, available = true, onClick, bookId }: BookCardProps) {
  const [coverImage, setCoverImage] = useState<string | null>(image || null);

  useEffect(() => {
    // Check localStorage for custom cover image
    if (bookId) {
      const savedCover = localStorage.getItem(`book_cover_${bookId}`);
      if (savedCover) {
        setCoverImage(savedCover);
      }
    }
  }, [bookId]);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {coverImage ? (
          <ImageWithFallback
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {category && (
          <Badge className="absolute top-2 right-2 bg-white/90 text-foreground border-0">
            {category}
          </Badge>
        )}
        {!available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-red-500 text-white border-0">Unavailable</Badge>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-foreground line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{author}</p>
        {rating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}