// src/types/order.ts

export interface OrderItem {
  _id: string;
  topic: string;
  length:
    | 1000
    | 2000
    | 3000
    | 4000
    | 5000
    | 6000
    | 7000
    | 8000
    | 9000
    | 10000
    | 11000
    | 12000
    | 13000
    | 14000
    | 15000
    | 16000
    | 17000
    | 18000
    | 19000
    | 20000
    | 30000;
  price: number;
  contentType: string;
  language: 'pol' | 'eng' | 'ger' | 'ukr' | 'fra' | 'esp' | 'ros' | 'por';
  guidelines: string;
  content?: string;
  keywords?: string[];
  sourceLinks?: string[];
  includeFAQ?: boolean;
  includeTable?: boolean;
  tone?: 'nieformalny' | 'oficjalny' | 'bezosobowy';
  status: 'oczekujące' | 'w trakcie' | 'zakończone';
  searchLanguage?: string;
  progress?: number;
  startTime?: string;
  estimatedCompletionTime?: string;
  hiddenByUser?: boolean;
}

export interface OrderAttachment {
  filename: string;
  url: string;
  uploadDate?: Date; // Dodajemy opcjonalne pole uploadDate
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'oczekujące' | 'w trakcie' | 'zakończone' | 'anulowane';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  declaredDeliveryDate: string;
  hasUnreadNotifications?: boolean;
  attachments?: {
    [key: string]: OrderAttachment | OrderAttachment[];
  };
  completedStatusFiles?: OrderAttachment[];
  userAttachments?: OrderAttachment[];
  currency: 'PLN' | 'USD';
  exchangeRate?: number;
  totalPricePLN: number;
  totalPriceOriginal: number;
}

export interface OrderComment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  attachments: OrderAttachment[];
  isAdminComment: boolean;
}
