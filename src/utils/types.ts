export interface User {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: string;
}
export interface Dealership {
  id: string;
  client_id: string;
  address: string;
  phone: string;
  email: string;
  location: Location;
  created_at: string;
  updated_at: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Client {
  id: string;
  name: string;
  domain: string;
  logo: string;
  favicon: string;
  theme: {
    primary: string;
    secondary: string;
    mode?: 'light' | 'dark';
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  location: {
    lat: number | string;
    lng: number | string;
  };
  dealerships: Dealership[];
}

export interface Vehicle {
  id: string;
  client_id: string;

  // Información básica del vehículo
  brand: Brand;
  brand_id: string;
  model: Model;
  model_id: number;
  year: number;
  price: number;
  discount_percentage?: number; // opcional

  // Características principales
  category:
    | 'SUV'
    | 'Sedan'
    | 'Hatchback'
    | 'Pickup'
    | 'Van'
    | 'Coupe'
    | 'Wagon';
  mileage: number;
  fuel_type: 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric' | 'Gas';
  transmission: 'Manual' | 'Automatic';
  color:
    | 'White'
    | 'Black'
    | 'Silver'
    | 'Gray'
    | 'Red'
    | 'Blue'
    | 'Green'
    | 'Brown'
    | 'Gold'
    | 'Other';

  // Estado
  condition: 'New' | 'Used' | 'Certified Pre-Owned';
  status: 'available' | 'sold' | 'reserved';

  // Multimedia
  main_image: string;
  gallery: string[];
  video_url?: string;

  // Características adicionales
  features: string[];

  // SEO y contenido
  slug: string;
  title: string;
  description: string;

  // Dealership
  dealership_id: string | number;
  dealership: Dealership;

  // Metadatos
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string; // ford
  created_at: string;
  name: string; // ford
}

export interface Model {
  id: number; // 1
  created_at: string;
  brand_id: string; // ford
  brand: Brand;
  name: string; // explorer
}

export interface Customer {
  id: string;
  created_at: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export interface VehicleLike {
  id: string;
  vehicle_id: string;
  vehicle: Vehicle;
  customer_id: string;
  customer: Customer;
  created_at: string;
}

export interface VehicleSale {
  id: string;
  vehicle_id: string;
  vehicle: Vehicle;
  customer_id?: string;
  customer?: Customer;
  sale_date: string;
  sale_price: number;
  payment_method?: string;
}

export interface Mail {
  id: string;
  created_at: string;
  customer_id: string;
  customer: Customer;
  subject: string;
  body: string;
  reason: 'buy' | 'sell' | 'other';
}

// Tipos auxiliares para los filtros
export type VehicleCategory = Vehicle['category'];
export type VehicleFuelType = Vehicle['fuel_type'];
export type VehicleTransmission = Vehicle['transmission'];
export type VehicleColor = Vehicle['color'];
export type VehicleCondition = Vehicle['condition'];
export type VehicleStatus = Vehicle['status'];

// Interfaz para filtros
export interface VehicleFilters {
  brand?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: VehicleCategory;
  maxMileage?: number;
  fuel_type?: VehicleFuelType;
  transmission?: VehicleTransmission;
  color?: VehicleColor;
  condition?: VehicleCondition;
}
