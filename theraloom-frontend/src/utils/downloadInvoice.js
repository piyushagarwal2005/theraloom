import api from '../api/axiosInstance';

/**
 * Downloads a GST tax invoice PDF directly to the user's computer.
 * Uses axios with responseType: 'blob' to fetch from Render backend,
 * then generates a programmatic browser download.
 */
export const downloadInvoice = async (paymentId, invoiceNumber) => {
  if (!paymentId) return false;

  try {
    const response = await api.get(`/payments/${paymentId}/invoice`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `invoice-${invoiceNumber || paymentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    console.warn('[Invoice] Blob download failed, attempting direct tab fallback:', error);
    const isProd =
      typeof window !== 'undefined' &&
      (window.location.hostname.endsWith('github.io') ||
        window.location.hostname.endsWith('vercel.app'));
    const backendOrigin = isProd
      ? 'https://theraloom-api.onrender.com'
      : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    window.open(`${backendOrigin}/api/v1/payments/${paymentId}/invoice`, '_blank');
    return false;
  }
};
