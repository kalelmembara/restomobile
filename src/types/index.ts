export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  icon: string;
  category: string;
  discount?: number;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface User {
  name: string;
  role: 'visitor' | 'employee';
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
}

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  time: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  note?: string;
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'qris';
  status: 'completed' | 'cancelled';
  note?: string;
  customerName?: string;
}

export interface DailySummary {
  totalSales: number;
  transactionCount: number;
  topProduct: string;
}
