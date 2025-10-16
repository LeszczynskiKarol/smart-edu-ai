// src/app/[locale]/admin/orders/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  FileText,
  Maximize2,
  Minimize2,
  Save,
  Eye,
  Edit3,
} from 'lucide-react';

interface OrderItem {
  _id: string;
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
  items: OrderItem[];
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
  const [isItemStatusModalOpen, setIsItemStatusModalOpen] = useState(false);
  const [selectedItemForStatus, setSelectedItemForStatus] =
    useState<OrderItem | null>(null);
  const [newItemStatus, setNewItemStatus] = useState('');
  const handleItemStatusChange = async () => {
    if (!selectedOrder || !selectedItemForStatus) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${selectedOrder._id}/items/${selectedItemForStatus._id}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newItemStatus }),
        }
      );

      if (response.ok) {
        await fetchOrders();
        setIsItemStatusModalOpen(false);
        setNewItemStatus('');
        alert('Status itemu został zaktualizowany pomyślnie.');
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Błąd podczas aktualizacji statusu'
        );
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Wystąpił błąd podczas aktualizacji statusu itemu');
    }
  };

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Content Editor States
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [contentMode, setContentMode] = useState<'view' | 'edit'>('view');

  const { user } = useAuth();

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        'Czy na pewno chcesz USUNĄĆ to zamówienie? Ta operacja jest nieodwracalna!'
      )
    )
      return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        await fetchOrders();
        alert('Zamówienie zostało usunięte');
      } else {
        throw new Error('Błąd podczas usuwania');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Nie można usunąć zamówienia');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Błąd pobierania zamówień');
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
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

  // Content Editor Functions
  const handleOpenContentEditor = (
    item: OrderItem,
    mode: 'view' | 'edit' = 'view'
  ) => {
    setSelectedItem(item);
    setEditedContent(item.content || '');
    setContentMode(mode);
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async () => {
    if (!selectedOrder || !selectedItem) return;

    setIsSavingContent(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${selectedOrder._id}/items/${selectedItem._id}/content`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: editedContent }),
        }
      );

      if (response.ok) {
        await fetchOrders();
        alert('Treść zapisana pomyślnie!');
        setIsContentModalOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Błąd podczas zapisywania');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Wystąpił błąd podczas zapisywania treści');
    } finally {
      setIsSavingContent(false);
    }
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
    }
  };

  useEffect(() => {
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {label}
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 'other')}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
              multiple
            />
            {otherFiles.map((file, index) => (
              <div key={index} className="mt-2 flex items-center">
                <span className="mr-2 text-gray-300">{file.file?.name}</span>
                <button
                  onClick={() => handleFileUpload('other', file.file as File)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                  disabled={file.uploading}
                >
                  {file.uploading ? 'Przesyłanie...' : 'Prześlij'}
                </button>
                {file.error && (
                  <span className="text-red-400 ml-2">{file.error}</span>
                )}
              </div>
            ))}
          </div>
        );
    }

    return (
      <div key={fileType} className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
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
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200 mb-2"
        />
        {fileState.file && (
          <div className="flex items-center">
            <span className="mr-2 text-gray-300">{fileState.file.name}</span>
            <button
              onClick={() => handleFileUpload(fileType, fileState.file as File)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
              disabled={fileState.uploading}
            >
              {fileState.uploading ? 'Przesyłanie...' : 'Prześlij'}
            </button>
          </div>
        )}
        {fileState.error && (
          <p className="text-red-400 mt-1">{fileState.error}</p>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Zarządzanie Zamówieniami">
        <div className="container mx-auto px-4 py-20 bg-gray-900 min-h-screen">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400">Ładowanie zamówień...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout title="Zarządzanie Zamówieniami">
        <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                <p className="font-bold">Błąd</p>
                <p>{error}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
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

  // No orders state
  if (orders.length === 0) {
    return (
      <Layout title="Zarządzanie Zamówieniami">
        <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-gray-100">
            Zarządzanie Zamówieniami
          </h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg">
              Brak zamówień do wyświetlenia
            </p>
            <button
              onClick={fetchOrders}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
      <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">
            Zarządzanie Zamówieniami
          </h1>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Odśwież
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <Search className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Szukaj po ID, nazwie klienta lub email"
              value={searchTerm}
              onChange={handleSearch}
              className="p-2 border border-gray-700 rounded bg-gray-800 text-gray-200 placeholder-gray-500"
            />
          </div>
          <div className="flex items-center">
            <Filter className="text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-700 rounded bg-gray-800 text-gray-200"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="oczekujące">Oczekujące</option>
              <option value="w trakcie">W trakcie</option>
              <option value="zakończone">Zakończone</option>
              <option value="anulowane">Anulowane</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700">
                <th
                  className="py-2 px-4 border border-gray-600 cursor-pointer text-gray-200"
                  onClick={() => handleSort('_id')}
                >
                  ID{' '}
                  {sortField === '_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                {/* NOWA KOLUMNA - Tytuł */}
                <th className="py-2 px-4 border border-gray-600 text-gray-200">
                  Tytuł zamówienia
                </th>
                <th className="py-2 px-4 border border-gray-600 text-gray-200">
                  Klient
                </th>
                <th
                  className="py-2 px-4 border border-gray-600 cursor-pointer text-gray-200"
                  onClick={() => handleSort('createdAt')}
                >
                  Data{' '}
                  {sortField === 'createdAt' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-2 px-4 border border-gray-600 cursor-pointer text-gray-200"
                  onClick={() => handleSort('status')}
                >
                  Status{' '}
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-2 px-4 border border-gray-600 cursor-pointer text-gray-200"
                  onClick={() => handleSort('totalPrice')}
                >
                  Cena{' '}
                  {sortField === 'totalPrice' &&
                    (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4 border border-gray-600 text-gray-200">
                  Notatki
                </th>
                <th className="py-2 px-4 border border-gray-600 text-gray-200">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSearchedOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-2 px-4 border border-gray-600 text-gray-300">
                      #{order._id.slice(-6)}
                    </td>
                    {/* NOWA KOLUMNA - Tytuł rozwijaný */}
                    <td className="py-2 px-4 border border-gray-600 text-gray-300">
                      <details className="cursor-pointer">
                        <summary className="text-sm">
                          {order.items?.[0]?.topic?.substring(0, 20) ||
                            'Brak tematu'}
                          {order.items?.[0]?.topic?.length > 20 && '...'}
                        </summary>
                        <div className="mt-2 text-xs bg-gray-900 p-2 rounded">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              • {item.topic}
                            </div>
                          ))}
                        </div>
                      </details>
                    </td>
                    <td className="py-2 px-4 border border-gray-600 text-gray-300">
                      {order.user?.name || 'N/A'}
                      <br />
                      <span className="text-sm text-gray-500">
                        {order.user?.email || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border border-gray-600 text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border border-gray-600">
                      <span
                        className={`px-2 py-1 rounded ${
                          order.status === 'zakończone'
                            ? 'bg-green-900 text-green-200'
                            : order.status === 'w trakcie'
                              ? 'bg-yellow-900 text-yellow-200'
                              : order.status === 'anulowane'
                                ? 'bg-red-900 text-red-200'
                                : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border border-gray-600 text-gray-300">
                      {order.totalPrice?.toFixed(2) || '0.00'} zł
                    </td>
                    <td className="py-2 px-4 border border-gray-600 text-gray-300">
                      {order.adminNotes || 'Brak'}
                    </td>
                    <td className="py-2 px-4 border border-gray-600">
                      <button
                        onClick={() => handleEditClick(order)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded mr-1 mb-1"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded mr-1 mb-1"
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </button>
                      {/* NOWY PRZYCISK - Usuń */}
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded mb-1"
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>

                  {expandedOrder === order._id && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 px-4 border border-gray-600 bg-gray-850"
                      >
                        <h4 className="font-semibold mb-2 text-gray-200">
                          Szczegóły zamówienia:
                        </h4>
                        <ul className="space-y-2">
                          {order.items?.map((item, index) => (
                            <li
                              key={item._id || index}
                              className="flex flex-col bg-gray-800 p-3 rounded"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="text-gray-200">
                                    Temat:{' '}
                                    <span className="font-medium">
                                      {item.topic}
                                    </span>
                                  </div>
                                  <div className="ml-6 text-sm text-gray-400 mt-2">
                                    <span>
                                      {item.length} znaków -{' '}
                                      {item.price
                                        ?.toFixed(2)
                                        .replace('.', ',') || '0,00'}{' '}
                                      zł
                                    </span>
                                    <br />
                                    <span className="bg-gray-700 px-2 py-1 rounded mr-2 inline-block mt-1">
                                      Język: {item.language}
                                    </span>
                                    <span className="bg-gray-700 px-2 py-1 rounded inline-block mt-1">
                                      Typ: {item.contentType}
                                    </span>
                                    {item.guidelines && (
                                      <div className="mt-2">
                                        <strong className="text-gray-300">
                                          Wytyczne:
                                        </strong>
                                        <p className="bg-gray-900 p-2 rounded text-gray-300">
                                          {item.guidelines}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {/* Content Actions */}
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setSelectedItemForStatus(item);
                                      setNewItemStatus(
                                        item.status || 'oczekujące'
                                      );
                                      setIsItemStatusModalOpen(true);
                                    }}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                    title="Zmień status itemu"
                                  >
                                    Status
                                  </button>

                                  {item.content && (
                                    <button
                                      onClick={() =>
                                        handleOpenContentEditor(item, 'view')
                                      }
                                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                      title="Podgląd treści"
                                    >
                                      <Eye size={16} />
                                      Podgląd
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      handleOpenContentEditor(item, 'edit');
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                    title="Edytuj treść"
                                  >
                                    <Edit3 size={16} />
                                    {item.content ? 'Edytuj' : 'Dodaj treść'}
                                  </button>
                                </div>
                              </div>
                              {/* Content Preview */}
                              {item.content && (
                                <div className="mt-3 bg-gray-900 p-2 rounded">
                                  <div className="text-xs text-gray-500 mb-1">
                                    Podgląd treści ({item.content.length}{' '}
                                    znaków)
                                  </div>
                                  <div className="text-sm text-gray-400 line-clamp-2">
                                    {item.content.substring(0, 200)}
                                    {item.content.length > 200 && '...'}
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 text-gray-300">
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
                        </div>

                        {order.userAttachments &&
                          order.userAttachments.length > 0 && (
                            <div className="mt-4">
                              <strong className="text-gray-200">
                                Załączniki użytkownika:
                              </strong>
                              {order.userAttachments.map(
                                (attachment, index) => (
                                  <div key={index} className="mb-1">
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 hover:underline"
                                    >
                                      {attachment.filename}
                                    </a>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Content Editor Modal */}
        {isContentModalOpen && selectedItem && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 ${
              isFullscreen ? 'p-0' : 'p-4'
            }`}
          >
            <div
              className={`bg-gray-800 rounded-lg ${
                isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl max-h-[90vh]'
              } flex flex-col`}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-100">
                    {contentMode === 'view'
                      ? 'Podgląd treści'
                      : 'Edycja treści'}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedItem.topic}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-400 mr-4">
                    Znaków: {editedContent.length} / {selectedItem.length}
                  </div>
                  {contentMode === 'view' ? (
                    <button
                      onClick={() => setContentMode('edit')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Edit3 size={16} />
                      Edytuj
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setContentMode('view')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Eye size={16} />
                        Podgląd
                      </button>
                      <button
                        onClick={handleSaveContent}
                        disabled={isSavingContent}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        <Save size={16} />
                        {isSavingContent ? 'Zapisywanie...' : 'Zapisz'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    {isFullscreen ? (
                      <Minimize2 size={18} />
                    ) : (
                      <Maximize2 size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsContentModalOpen(false);
                      setIsFullscreen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden p-4">
                {contentMode === 'view' ? (
                  <div className="h-full overflow-y-auto bg-gray-900 p-4 rounded border border-gray-700">
                    <div
                      className="prose prose-invert max-w-none text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html:
                          editedContent ||
                          '<p class="text-gray-500">Brak treści</p>',
                      }}
                    />
                  </div>
                ) : (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-full p-4 bg-gray-900 text-gray-200 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                    placeholder="Wpisz treść jako HTML..."
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl border border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-gray-100">
                Edytuj zamówienie
              </h3>
              <div className="mb-4">
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2 transition-colors"
                >
                  Zmień status
                </button>
                <button
                  onClick={handleAddFilesClick}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Dodaj pliki
                </button>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Status Change Modal - DODAJ TO */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-medium mb-4 text-gray-100">
              Zmień status zamówienia
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nowy status:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
              >
                <option value="">Wybierz status</option>
                <option value="oczekujące">Oczekujące</option>
                <option value="w trakcie">W trakcie</option>
                <option value="zakończone">Zakończone</option>
                <option value="anulowane">Anulowane</option>
              </select>
            </div>

            {newStatus === 'zakończone' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Załącz pliki (opcjonalnie):
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(files);
                  }}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-400">
                    Wybrano plików: {selectedFiles.length}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setNewStatus('');
                  setSelectedFiles([]);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleStatusChange}
                disabled={!newStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal - DODAJ TO TEŻ */}
      {isFileModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4 text-gray-100">
              Dodaj pliki do zamówienia
            </h3>

            {renderFileUploadSection('pdf', 'Plik PDF')}
            {renderFileUploadSection('docx', 'Plik DOCX')}
            {renderFileUploadSection('image', 'Obraz')}
            {renderFileUploadSection('other', 'Inne pliki')}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsFileModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Item Status Change Modal */}
      {isItemStatusModalOpen && selectedItemForStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-medium mb-4 text-gray-100">
              Zmień status: {selectedItemForStatus.topic}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nowy status:
              </label>
              <select
                value={newItemStatus}
                onChange={(e) => setNewItemStatus(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
              >
                <option value="oczekujące">Oczekujące</option>
                <option value="w trakcie">W trakcie</option>
                <option value="zakończone">Zakończone</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsItemStatusModalOpen(false);
                  setNewItemStatus('');
                  setSelectedItemForStatus(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleItemStatusChange}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminOrders;
