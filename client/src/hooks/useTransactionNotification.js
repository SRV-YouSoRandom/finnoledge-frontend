// client/src/hooks/useTransactionNotification.js
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useTransactionNotification = () => {
  const showTransactionToast = useCallback((type, message, txHash = null) => {
    const toastOptions = {
      duration: 4000,
      position: 'bottom-right',
      style: {
        maxWidth: '400px',
        padding: '16px'
      }
    };

    switch (type) {
      case 'success':
        if (txHash) {
          return toast.success(
            `✅ ${message}\n🔗 Tx Hash: ${txHash}`,
            toastOptions
          );
        } else {
          return toast.success(`✅ ${message}`, toastOptions);
        }
      case 'error':
        return toast.error(`❌ ${message}`, toastOptions);
      case 'loading':
        return toast.loading(`⏳ ${message}`, { 
          ...toastOptions, 
          duration: Infinity 
        });
      default:
        return toast(`ℹ️ ${message}`, toastOptions);
    }
  }, []);

  const notifyTransactionSubmitted = useCallback((message = 'Transaction submitted successfully') => {
    return showTransactionToast('loading', message);
  }, [showTransactionToast]);

  const notifyTransactionSuccess = useCallback((message = 'Transaction recorded successfully', txHash = null, loadingToastId = null) => {
    // Dismiss the loading toast if provided
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }
    return showTransactionToast('success', message, txHash);
  }, [showTransactionToast]);

  const notifyTransactionError = useCallback((message = 'Transaction failed', loadingToastId = null) => {
    // Dismiss the loading toast if provided
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }
    return showTransactionToast('error', message);
  }, [showTransactionToast]);

  const extractTxHashFromResponse = useCallback((responseText) => {
    // Try to extract transaction hash from CLI response
    try {
      const lines = responseText.split('\n');
      for (const line of lines) {
        if (line.includes('txhash:') || line.includes('hash:')) {
          const match = line.match(/([A-Fa-f0-9]{64})/);
          if (match) {
            return match[1];
          }
        }
      }
    } catch (error) {
      console.log('Could not extract tx hash:', error);
    }
    return null;
  }, []);

  const dismissToast = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  const dismissAllToasts = useCallback(() => {
    toast.dismiss();
  }, []);

  return {
    showTransactionToast,
    notifyTransactionSubmitted,
    notifyTransactionSuccess,
    notifyTransactionError,
    extractTxHashFromResponse,
    dismissToast,
    dismissAllToasts
  };
};