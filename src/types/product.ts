export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  description?: string | null;
  categoryId?: number | null;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
