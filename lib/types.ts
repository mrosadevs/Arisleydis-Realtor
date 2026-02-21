export type PropertyStatus = "For Sale" | "For Rent" | "Under Contract" | "Sold";

export type Property = {
  id: string;
  slug: string;
  title: string;
  city: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  status: PropertyStatus;
  description: string;
  features: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type PropertyInput = {
  title: string;
  city: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  status: PropertyStatus;
  description: string;
  features: string[];
  images: string[];
};
