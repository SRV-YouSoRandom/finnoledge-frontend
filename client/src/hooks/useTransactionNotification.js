import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useTransactionNotification = () => {
  const showTransactionToast = useCallback((type, message, txHash = null) => {
    const toastOptions = {
      duration: 5000,
      position: 'bottom-right',
      style: {
        maxWidth: '400px',
        padding: '16px'
      }
    };

    // Create toast content as a function that returns JSX
    const createToastContent = () => {
      return `
        ${message}
        ${txHash ? `\nTx Hash: ${txHash}` : ''}
      `;
    };

    switch (type) {
      case 'success':
        if (txHash) {
          toast.success(
            `✅ ${message}\n🔗 Tx Hash: ${txHash}`,
            toastOptions
          );
        } else {
          toast.success(`✅ ${message}`, toastOptions);
        }
        break;
      case 'error':
        toast.error(`❌ ${message}`, toastOptions);
        break;
      case 'loading':
        return toast.loading(`⏳ ${message}`, { ...toastOptions, duration: Infinity });
      default:
        toast(`ℹ️ ${message}`, toastOptions);
    }
  }, []);

  const notifyTransactionSubmitted = useCallback((message = 'Transaction submitted successfully') => {
    return showTransactionToast('loading', message);
  }, [showTransactionToast]);

  const notifyTransactionSuccess = useCallback((message = 'Transaction recorded successfully', txHash = null) => {
    showTransactionToast('success', message, txHash);
  }, [showTransactionToast]);

  const notifyTransactionError = useCallback((message = 'Transaction failed') => {
    showTransactionToast('error', message);
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

  return {
    showTransactionToast,
    notifyTransactionSubmitted,
    notifyTransactionSuccess,
    notifyTransactionError,
    extractTxHashFromResponse
  };
};