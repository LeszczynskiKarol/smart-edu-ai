// src/context/OrderStatusContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface OrderStatusContextType {
    isOrderStatusVisible: boolean;
    setIsOrderStatusVisible: (visible: boolean) => void;
}

const OrderStatusContext = createContext<OrderStatusContextType | undefined>(undefined);

export const OrderStatusProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [isOrderStatusVisible, setIsOrderStatusVisible] = useState(false);

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
