// src/components/dashboard/PaymentHistory.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslations } from 'next-intl';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent } from '../ui/card';
import { useMediaQuery } from 'react-responsive';

interface Payment {
  _id: string;
  amount: number;
  paidAmount: number;
  currency: string; // Dodajemy pole currency
  type: 'top_up' | 'order_payment';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  stripeSessionId: string;
  relatedOrder?: {
    _id: string;
    status: string;
  };
  invoice?: {
    id: string;
  };
}

const PaymentHistory: React.FC = () => {
  const t = useTranslations('paymentHistory');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Payment>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState('all');
  const { user } = useAuth();
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null
  );
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const formatPrice = (price: number, currency: string = 'PLN') => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    if (currency.toUpperCase() === 'USD') {
      return new Intl.NumberFormat('en-US', options).format(price);
    } else {
      return new Intl.NumberFormat('pl-PL', options).format(price);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();

        setPayments(data.data);
      } else {
        throw new Error('Błąd pobierania historii płatności');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas ładowania historii płatności.');
      console.error('Błąd:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    if (!payment.stripeSessionId) {
      alert('Brak identyfikatora sesji dla tej płatności.');
      return;
    }

    setDownloadingInvoice(payment._id);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/${payment.stripeSessionId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.invoiceUrl) {
          window.open(data.invoiceUrl, '_blank');
        } else {
          throw new Error(
            data.message || 'Nie udało się pobrać linku do faktury'
          );
        }
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Błąd podczas pobierania linku do faktury'
        );
      }
    } catch (error: unknown) {
      console.error('Błąd podczas pobierania linku do faktury:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas pobierania faktury. Spróbuj ponownie później.'
      );
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleSort = (field: keyof Payment) => {
    setSortField(field);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedPayments = payments
    .filter((payment) => typeFilter === 'all' || payment.type === typeFilter)
    .sort((a, b) => {
      if (a[sortField] === undefined || b[sortField] === undefined) return 0;
      if (a[sortField]! < b[sortField]!)
        return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField]! > b[sortField]!)
        return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredAndSortedPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPaymentStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
            {t('status.completed')}
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            {t('status.pending')}
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
            {t('status.failed')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
            {t('status.unknown')}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const MobilePaymentTable = () => (
    <div className="space-y-4">
      {currentPayments.map((payment) => (
        <Card
          key={payment._id}
          className="dark:bg-gray-800 border dark:border-gray-700"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">
                {new Date(payment.createdAt).toLocaleDateString()}
              </span>
              {renderPaymentStatus(payment.status)}
            </div>

            <div className="mb-2">
              <span className="font-bold">
                {formatPrice(payment.paidAmount, payment.currency)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <Card>
        <CardContent>
          {/*<div className="flex justify-between items-center mb-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-[180px] p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">{t('filter.all')}</option>
                            <option value="top_up">{t('filter.topUp')}</option>
                            <option value="order_payment">{t('filter.order')}</option>
                        </select>
                    </div>*/}

          {isMobile ? (
            <MobilePaymentTable />
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b dark:border-gray-700">
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center"
                      >
                        {t('table.date')}
                        {sortField === 'createdAt' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          ))}
                      </Button>
                    </TableHead>

                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('paidAmount')}
                        className="flex items-center"
                      >
                        {t('table.amount')}
                        {sortField === 'paidAmount' &&
                          (sortDirection === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          ))}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {formatPrice(payment.paidAmount, payment.currency)}
                      </TableCell>

                      <TableCell>
                        {renderPaymentStatus(payment.status)}
                      </TableCell>
                      {/*} <TableCell>
                        {payment.stripeSessionId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment)}
                            disabled={downloadingInvoice === payment._id}
                            className="bg-blue-600 hover:bg-blue-700 text-gray-800 dark:text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                          >
                            {downloadingInvoice === payment._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4 mr-2" />
                            )}
                            {downloadingInvoice === payment._id
                              ? t('invoice.downloading')
                              : t('invoice.download')}
                          </Button>
                        ) : (
                          <span className="text-gray-400">
                            {t('invoice.unavailable')}
                          </span>
                        )}
                      </TableCell>*/}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredAndSortedPayments.length > 0 &&
            Math.ceil(filteredAndSortedPayments.length / paymentsPerPage) >
              1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t('pagination.previous')}
                </Button>
                <span>
                  {t('pagination.page', {
                    current: currentPage,
                    total: Math.ceil(
                      filteredAndSortedPayments.length / paymentsPerPage
                    ),
                  })}
                </span>
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={
                    currentPage ===
                    Math.ceil(
                      filteredAndSortedPayments.length / paymentsPerPage
                    )
                  }
                  variant="outline"
                >
                  {t('pagination.next')}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
