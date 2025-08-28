// src/context/OrderStatusContext.tsx
'use client'
import React, { createContext, useEffect, useContext, useState } from 'react';

interface OrderStatusContextType {
    isOrderStatusVisible: boolean;
    setIsOrderStatusVisible: (visible: boolean) => void;
}

const OrderStatusContext = createContext<OrderStatusContextType | undefined>(undefined);

// src/context/OrderStatusContext.tsx
export const OrderStatusProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    // Inicjalizacja stanu z sessionStorage
    const [isOrderStatusVisible, setIsOrderStatusVisible] = useState(() => {
        const stored = sessionStorage.getItem('orderStatusVisible');
        return stored === 'true';
    });


    useEffect(() => {
        sessionStorage.setItem('orderStatusVisible', isOrderStatusVisible.toString());
    }, [isOrderStatusVisible]);

    return (
        <OrderStatusContext.Provider value={{ isOrderStatusVisible, setIsOrderStatusVisible }}>
            {children}
        </OrderStatusContext.Provider>
    );
};

export const useOrderStatus = () => {
    const context = useContext(OrderStatusContext);
    if (context === undefined) {
        throw new Error('useOrderStatus must be used within an OrderStatusProvider');
    }
    return context;
};

