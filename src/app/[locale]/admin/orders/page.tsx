// src/app/[locale]/admin/orders/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ContentGenerationFlow from '@/components/admin/ContentGenerationFlow';
import Layout from '@/components/layout/Layout';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Paperclip,
  X,
  Send,
  Loader,
} from 'lucide-react';

interface OrderItem {
  _id: string; // DODANE!
  topic: string;
  length: number;
  price: number;
  contentType: string;
  language: string;
  guidelines: string;
  status?: string;
  content?: string;
}

interface FileUpload {
  file: File | null;
  uploading: boolean;
  error: string | null;
}

interface Order {
  _id: string;
  orderNumber: number;
  user: { name: string; email: string };
  items: OrderItem[]; // ZMIENIONE!
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  declaredDeliveryDate: string;
  lastUpdated?: string;
  adminNotes?: string;
  hasUnreadNotifications?: boolean;
  attachments?: {
    [key: string]: any;
  };
  userAttachments?: {
    filename: string;
    url: string;
  }[];
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
  };
  attachments: {
    filename: string;
    url: string;
  }[];
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Order>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [pdfFile, setPdfFile] = useState<FileUpload>({
    file: null,
    uploading: false,
    error: null,
  });
  const [docxFile, setDocxFile] = useState<FileUpload>({
    file: null,
    uploading: false,
    error: null,
  });
  const [imageFile, setImageFile] = useState<FileUpload>({
    file: null,
    uploading: false,
    error: null,
  });
  const [otherFiles, setOtherFiles] = useState<FileUpload[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true); // DODANE!
  const [error, setError] = useState<string | null>(null); // DODANE!

  const { user } = useAuth();

  const fetchComments = async (orderId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.data);
      } else {
        console.error('Błąd pobierania komentarzy');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching orders...'); // Debug

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status); // Debug

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Błąd pobierania zamówień');
      }

      const data = await response.json();
      console.log('Received data:', data); // Debug

      if (data.success && Array.isArray(data.data)) {
        console.log('Orders count:', data.data.length); // Debug
        setOrders(data.data);
      } else {
        console.error('Nieprawidłowy format danych:', data);
        throw new Error('Nieprawidłowy format danych');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania zamówień:', error);
      setError(error instanceof Error ? error.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddFilesClick = () => {
    if (selectedOrder) {
      setIsFileModalOpen(true);
    }
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleCommentSubmit = async (orderId: string) => {
    try {
      const formData = new FormData();
      formData.append('content', newComment);
      commentAttachments.forEach((file) =>
        formData.append('attachments', file)
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments((prevComments) => [...prevComments, data.data]);
        setNewComment('');
        setCommentAttachments([]);
      } else {
        console.error('Błąd dodawania komentarza');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);
    if (validFiles.length + commentAttachments.length > 5) {
      alert('Możesz dodać maksymalnie 5 załączników.');
      return;
    }
    setCommentAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeCommentAttachment = (index: number) => {
    setCommentAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteFile = async (
    orderId: string,
    fileType: string,
    fileIndex: number
  ) => {
    if (!confirm('Czy na pewno chcesz usunąć ten plik?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/attachments/${fileType}/${fileIndex}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        await fetchOrders();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas usuwania pliku');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania pliku:', error);
      alert('Wystąpił błąd podczas usuwania pliku. Spróbuj ponownie.');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredAndSearchedOrders = filteredOrders.filter(
    (order) =>
      order._id.includes(searchTerm) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchComments(orderId);
    }
  };

  useEffect(() => {
    console.log('User effect triggered:', user); // Debug
    if (user && user.role === 'admin') {
      fetchOrders();
    } else if (user && user.role !== 'admin') {
      setError('Brak uprawnień administratora');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const filtered = orders.filter(
      (order) => statusFilter === 'all' || order.status === statusFilter
    );
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredOrders(sorted);
  }, [orders, statusFilter, sortField, sortDirection]);

  const handleStatusChange = async () => {
    if (!selectedOrder) return;
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      if (newStatus === 'zakończone') {
        selectedFiles.forEach((file) => formData.append('files', file));
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${selectedOrder._id}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );
      if (response.ok) {
        await fetchOrders();
        setIsStatusModalOpen(false);
        setSelectedFiles([]);
        alert('Status zamówienia został zaktualizowany pomyślnie.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas aktualizacji statusu');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu:', error);
      let errorMessage = 'Wystąpił nieznany błąd';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(`Wystąpił błąd: ${errorMessage}`);
    }
  };

  const handleFileUpload = async (
    fileType: 'pdf' | 'docx' | 'image' | 'other',
    file: File
  ) => {
    if (!selectedOrder || !file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${selectedOrder._id}/attach`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const data = await response.json();
      if (data.success) {
        await fetchOrders();
        switch (fileType) {
          case 'pdf':
            setPdfFile({ file: null, uploading: false, error: null });
            break;
          case 'docx':
            setDocxFile({ file: null, uploading: false, error: null });
            break;
          case 'image':
            setImageFile({ file: null, uploading: false, error: null });
            break;
          case 'other':
            setOtherFiles((prev) => prev.filter((f) => f.file !== file));
            break;
        }
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error('Błąd podczas przesyłania pliku:', error);
      switch (fileType) {
        case 'pdf':
          setPdfFile((prev) => ({
            ...prev,
            error: 'Błąd podczas przesyłania pliku PDF',
          }));
          break;
        case 'docx':
          setDocxFile((prev) => ({
            ...prev,
            error: 'Błąd podczas przesyłania pliku DOCX',
          }));
          break;
        case 'image':
          setImageFile((prev) => ({
            ...prev,
            error: 'Błąd podczas przesyłania obrazu',
          }));
          break;
        case 'other':
          setOtherFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, error: 'Błąd podczas przesyłania pliku' }
                : f
            )
          );
          break;
      }
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'pdf' | 'docx' | 'image' | 'other'
  ) => {
    const file = event.target.files?.[0] || null;
    switch (fileType) {
      case 'pdf':
        setPdfFile({ file, uploading: false, error: null });
        break;
      case 'docx':
        setDocxFile({ file, uploading: false, error: null });
        break;
      case 'image':
        setImageFile({ file, uploading: false, error: null });
        break;
      case 'other':
        if (file) {
          setOtherFiles((prev) => [
            ...prev,
            { file, uploading: false, error: null },
          ]);
        }
        break;
    }
  };

  const renderFileUploadSection = (
    fileType: 'pdf' | 'docx' | 'image' | 'other',
    label: string
  ) => {
    let fileState: FileUpload;
    let setFileState: React.Dispatch<React.SetStateAction<FileUpload>>;

    switch (fileType) {
      case 'pdf':
        fileState = pdfFile;
        setFileState = setPdfFile;
        break;
      case 'docx':
        fileState = docxFile;
        setFileState = setDocxFile;
        break;
      case 'image':
        fileState = imageFile;
        setFileState = setImageFile;
        break;
      case 'other':
        return (
          <div key={fileType} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 'other')}
              className="w-full p-2 border rounded"
              multiple
            />
            {otherFiles.map((file, index) => (
              <div key={index} className="mt-2 flex items-center">
                <span className="mr-2">{file.file?.name}</span>
                <button
                  onClick={() => handleFileUpload('other', file.file as File)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  disabled={file.uploading}
                >
                  {file.uploading ? 'Przesyłanie...' : 'Prześlij'}
                </button>
                {file.error && (
                  <span className="text-red-500 ml-2">{file.error}</span>
                )}
              </div>
            ))}
          </div>
        );
    }

    return (
      <div key={fileType} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, fileType)}
          accept={
            fileType === 'pdf'
              ? '.pdf'
              : fileType === 'docx'
                ? '.docx'
                : fileType === 'image'
                  ? 'image/*'
                  : undefined
          }
          className="w-full p-2 border rounded mb-2"
        />
        {fileState.file && (
          <div className="flex items-center">
            <span className="mr-2">{fileState.file.name}</span>
            <button
              onClick={() => handleFileUpload(fileType, fileState.file as File)}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
              disabled={fileState.uploading}
            >
              {fileState.uploading ? 'Przesyłanie...' : 'Prześlij'}
            </button>
          </div>
        )}
        {fileState.error && (
          <p className="text-red-500 mt-1">{fileState.error}</p>
        )}
      </div>
    );
  };

  // Obsługa stanów ładowania i błędów
  if (loading) {
    return (
      <Layout title="Zarządzanie Zamówieniami">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Ładowanie zamówień...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Zarządzanie Zamówieniami">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Błąd</p>
                <p>{error}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Spróbuj ponownie
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout title="Zarządzanie Zamówieniami">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Zarządzanie Zamówieniami</h1>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              Brak zamówień do wyświetlenia
            </p>
            <button
              onClick={fetchOrders}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Odśwież
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Zarządzanie Zamówieniami">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Zarządzanie Zamówieniami</h1>
          <button
            onClick={fetchOrders}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Odśwież
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <Search className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Szukaj po ID, nazwie klienta lub email"
              value={searchTerm}
              onChange={handleSearch}
              className="p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <Filter className="text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="oczekujące">Oczekujące</option>
              <option value="w trakcie">W trakcie</option>
              <option value="zakończone">Zakończone</option>
              <option value="anulowane">Anulowane</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="py-2 px-4 border cursor-pointer"
                  onClick={() => handleSort('_id')}
                >
                  ID / Numer zamówienia{' '}
                  {sortField === '_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4 border">Klient</th>
                <th
                  className="py-2 px-4 border cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  Data i godzina{' '}
                  {sortField === 'createdAt' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-2 px-4 border cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status{' '}
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-2 px-4 border cursor-pointer"
                  onClick={() => handleSort('totalPrice')}
                >
                  Cena{' '}
                  {sortField === 'totalPrice' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4 border">Ostatnia aktualizacja</th>
                <th className="py-2 px-4 border">Notatki admina</th>
                <th className="py-2 px-4 border">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSearchedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Brak zamówień spełniających kryteria wyszukiwania
                  </td>
                </tr>
              ) : (
                filteredAndSearchedOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 border">
                        {order._id}
                        <br />
                        <span className="text-sm text-gray-500">
                          #{order._id.slice(-6)}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        {order.user?.name || 'N/A'}
                        <br />
                        <span className="text-sm text-gray-500">
                          {order.user?.email || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        {new Date(order.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        <span
                          className={`px-2 py-1 rounded ${
                            order.status === 'zakończone'
                              ? 'bg-green-200 text-green-800'
                              : order.status === 'w trakcie'
                                ? 'bg-yellow-200 text-yellow-800'
                                : order.status === 'anulowane'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        {order.totalPrice?.toFixed(2) || '0.00'} zł
                      </td>
                      <td className="py-2 px-4 border">
                        {order.lastUpdated
                          ? new Date(order.lastUpdated).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-4 border">
                        {order.adminNotes || 'Brak'}
                      </td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={() => handleEditClick(order)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-1"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => toggleOrderExpansion(order._id)}
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded"
                        >
                          {expandedOrder === order._id ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedOrder === order._id && (
                      <tr>
                        <td colSpan={8} className="py-4 px-4 border bg-gray-50">
                          <h4 className="font-semibold mb-2">
                            Szczegóły zamówienia:
                          </h4>
                          <ul className="space-y-2">
                            {order.items?.map((item, index) => (
                              <li
                                key={item._id || index}
                                className="flex flex-col"
                              >
                                <div>
                                  Temat:{' '}
                                  <span className="font-medium">
                                    {item.topic}
                                  </span>
                                </div>
                                <div className="ml-6 text-sm text-gray-600">
                                  <span>
                                    {item.length} znaków -{' '}
                                    {item.price?.toFixed(2).replace('.', ',') ||
                                      '0,00'}{' '}
                                    zł
                                  </span>
                                  <br />
                                  <span className="bg-gray-200 px-2 py-1 rounded mr-2">
                                    Język: {item.language}
                                  </span>
                                  <span className="bg-gray-200 px-2 py-1 rounded">
                                    Typ: {item.contentType}
                                  </span>
                                  {item.guidelines && (
                                    <div className="mt-2">
                                      <strong>Wytyczne:</strong>
                                      <p className="bg-gray-100 p-2 rounded">
                                        {item.guidelines}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4">
                            <p>
                              <strong>Całkowita cena:</strong>{' '}
                              {order.totalPrice?.toFixed(2).replace('.', ',') ||
                                '0,00'}{' '}
                              zł
                            </p>
                            <p>
                              <strong>Status płatności:</strong>{' '}
                              {order.paymentStatus}
                            </p>
                            <p>
                              <strong>Data utworzenia:</strong>{' '}
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p>
                              <strong>Termin realizacji:</strong>{' '}
                              {new Date(
                                order.declaredDeliveryDate
                              ).toLocaleString()}
                            </p>
                          </div>

                          {/* Reszta istniejącego kodu dla expandedOrder pozostaje bez zmian */}
                          {order.userAttachments &&
                            order.userAttachments.map((attachment, index) => (
                              <div key={index} className="mb-1">
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {attachment.filename}
                                </a>
                              </div>
                            ))}

                          {/* Sekcja z przepływem generowania - POPRAWIONA */}
                          <div className="mt-6">
                            <h4 className="font-semibold mb-2">
                              Przepływ generowania treści:
                            </h4>
                            <div
                              className="bg-white rounded-lg shadow-lg"
                              style={{ height: '600px' }}
                            >
                              {order.items &&
                              order.items.length > 0 &&
                              order.items[0]._id ? (
                                <ContentGenerationFlow
                                  orderId={order._id}
                                  itemId={order.items[0]._id}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  Brak itemów do generowania
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reszta kodu (załączniki, komentarze) pozostaje bez zmian */}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modale pozostają bez zmian */}
        {isEditModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h3 className="text-lg font-medium mb-4">Edytuj zamówienie</h3>
              <div className="mb-4">
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                  Zmień status
                </button>
                <button
                  onClick={handleAddFilesClick}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Dodaj pliki
                </button>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pozostałe modale bez zmian */}
      </div>
    </Layout>
  );
};

export default AdminOrders;
