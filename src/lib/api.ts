// src/lib/api.ts
import { Article } from '../types/Article';
import { OrderAttachment, OrderItem } from '../types/order';

export async function getBlogArticles() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles`)
  const data = await response.json()
  if (data.success) {
    return data.data.sort((a: Article, b: Article) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
  return []
}

export async function getCategories() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
  const data = await response.json()
  if (data.success) {
    return ['Wszystkie', ...data.data.map((category: any) => category.name)]
  }
  return ['Wszystkie']
}


export async function createOrder(orderData: {
  orderItems: OrderItem[];
  totalPrice: number;
  appliedDiscount: number;
  declaredDeliveryDate: string;
  userAttachments: OrderAttachment[];
}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Zakładając, że token jest przechowywany w localStorage
    },
    body: JSON.stringify(orderData)
  });
  const data = await response.json();
  if (data.success) {
    return data;
  }
  throw new Error(data.message || 'Wystąpił błąd podczas tworzenia zamówienia');
}

