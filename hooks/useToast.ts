import { useState } from 'react';

export function useToast() {
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'error' as 'error' | 'success'
    });

    const showToast = (message: string, type: 'error' | 'success' = 'error') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    return { toast, showToast, hideToast };
}