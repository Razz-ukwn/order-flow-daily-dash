import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, User } from './AuthContext';

// Product type
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

// Order status and payment status types
export type OrderStatus = 'pending' | 'processing' | 'assigned' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending';
export type PaymentMethod = 'cash' | 'upi' | 'credit_card' | 'none';

// Order item type
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price_at_order: number;
}

// Order type
export interface Order {
  id: string;
  user_id: string;
  user?: User;
  order_date: string;
  delivery_date?: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  created_at: string;
  items: OrderItem[];
  delivery?: Delivery;
}

// Delivery type
export interface Delivery {
  id: string;
  order_id: string;
  agent_id: string;
  agent?: User;
  assigned_at: string;
  delivered_at?: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'failed';
  notes?: string;
}

// Data context type
interface DataContextType {
  products: Product[];
  orders: Order[];
  getProductById: (id: string) => Product | undefined;
  getOrdersByUserId: (userId: string) => Order[];
  getAssignedOrders: (agentId: string) => Order[];
  getOrderById: (id: string) => Order | undefined;
  addOrder: (order: Omit<Order, 'id' | 'created_at'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateDeliveryStatus: (deliveryId: string, status: Delivery['status'], notes?: string) => void;
  assignDelivery: (orderId: string, agentId: string) => void;
}

// Mock products data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresh Milk',
    description: 'Farm fresh whole milk delivered daily',
    price: 2.99,
    image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    is_available: true,
    created_at: '2023-04-01T08:00:00Z',
  },
  {
    id: '2',
    name: 'Brown Eggs (Dozen)',
    description: 'Free-range brown eggs from local farms',
    price: 4.49,
    image_url: 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05',
    is_available: true,
    created_at: '2023-04-01T08:05:00Z',
  },
  {
    id: '3',
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread',
    price: 3.29,
    image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3',
    is_available: true,
    created_at: '2023-04-01T08:10:00Z',
  },
  {
    id: '4',
    name: 'Organic Apples (5 pack)',
    description: 'Organic apples straight from local orchards',
    price: 5.99,
    image_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce',
    is_available: true,
    created_at: '2023-04-01T08:15:00Z',
  },
  {
    id: '5',
    name: 'Greek Yogurt',
    description: 'Creamy Greek yogurt, plain flavor',
    price: 3.99,
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
    is_available: true,
    created_at: '2023-04-01T08:20:00Z',
  },
  {
    id: '6',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice, no additives',
    price: 4.99,
    image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
    is_available: true,
    created_at: '2023-04-01T08:25:00Z',
  },
];

// Updated initial mock orders with payment methods
const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: '1',
    user_id: '3', // customer
    order_date: '2023-05-15T09:30:00Z',
    delivery_date: '2023-05-15T16:00:00Z',
    total_amount: 12.97,
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'cash',
    created_at: '2023-05-15T09:30:00Z',
    items: [
      {
        id: '101',
        order_id: '1',
        product_id: '1',
        product: MOCK_PRODUCTS[0],
        quantity: 2,
        price_at_order: 2.99,
      },
      {
        id: '102',
        order_id: '1',
        product_id: '3',
        product: MOCK_PRODUCTS[2],
        quantity: 2,
        price_at_order: 3.29,
      },
    ],
    delivery: {
      id: '501',
      order_id: '1',
      agent_id: '2', // delivery agent
      assigned_at: '2023-05-15T10:00:00Z',
      delivered_at: '2023-05-15T16:30:00Z',
      status: 'delivered',
    },
  },
  {
    id: '2',
    user_id: '3', // customer
    order_date: '2023-05-16T10:15:00Z',
    total_amount: 18.97,
    status: 'assigned',
    payment_status: 'pending',
    payment_method: 'none',
    created_at: '2023-05-16T10:15:00Z',
    items: [
      {
        id: '201',
        order_id: '2',
        product_id: '2',
        product: MOCK_PRODUCTS[1],
        quantity: 1,
        price_at_order: 4.49,
      },
      {
        id: '202',
        order_id: '2',
        product_id: '4',
        product: MOCK_PRODUCTS[3],
        quantity: 1,
        price_at_order: 5.99,
      },
      {
        id: '203',
        order_id: '2',
        product_id: '6',
        product: MOCK_PRODUCTS[5],
        quantity: 1,
        price_at_order: 4.99,
      },
    ],
    delivery: {
      id: '502',
      order_id: '2',
      agent_id: '2', // delivery agent
      assigned_at: '2023-05-16T11:00:00Z',
      status: 'in_progress',
    },
  },
  // Add today's orders with different payment methods for demonstration
  {
    id: '3',
    user_id: '4', // customer
    order_date: new Date().toISOString(),
    total_amount: 15.99,
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'cash',
    created_at: new Date().toISOString(),
    items: [
      {
        id: '301',
        order_id: '3',
        product_id: '1',
        product: MOCK_PRODUCTS[0],
        quantity: 2,
        price_at_order: 2.99,
      },
      {
        id: '302',
        order_id: '3',
        product_id: '5',
        product: MOCK_PRODUCTS[4],
        quantity: 2,
        price_at_order: 3.99,
      },
    ],
    delivery: {
      id: '503',
      order_id: '3',
      agent_id: '2', // delivery agent
      assigned_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      delivered_at: new Date().toISOString(),
      status: 'delivered',
    },
  },
  {
    id: '4',
    user_id: '5', // customer
    order_date: new Date().toISOString(),
    total_amount: 23.99,
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'upi',
    created_at: new Date().toISOString(),
    items: [
      {
        id: '401',
        order_id: '4',
        product_id: '3',
        product: MOCK_PRODUCTS[2],
        quantity: 3,
        price_at_order: 3.29,
      },
      {
        id: '402',
        order_id: '4',
        product_id: '6',
        product: MOCK_PRODUCTS[5],
        quantity: 3,
        price_at_order: 4.99,
      },
    ],
    delivery: {
      id: '504',
      order_id: '4',
      agent_id: '2', // delivery agent
      assigned_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      delivered_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      status: 'delivered',
    },
  },
  {
    id: '5',
    user_id: '3', // customer
    order_date: new Date().toISOString(),
    total_amount: 9.98,
    status: 'delivered',
    payment_status: 'pending',
    payment_method: 'none',
    created_at: new Date().toISOString(),
    items: [
      {
        id: '501',
        order_id: '5',
        product_id: '2',
        product: MOCK_PRODUCTS[1],
        quantity: 2,
        price_at_order: 4.49,
      },
    ],
    delivery: {
      id: '505',
      order_id: '5',
      agent_id: '2', // delivery agent
      assigned_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
      delivered_at: new Date(Date.now() - 900000).toISOString(), // 15 min ago
      status: 'delivered',
    },
  },
];

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_MOCK_ORDERS);

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getOrdersByUserId = (userId: string) => {
    return orders.filter(order => order.user_id === userId);
  };

  const getAssignedOrders = (agentId: string) => {
    return orders.filter(order => 
      order.delivery?.agent_id === agentId && 
      (order.delivery.status === 'pending' || order.delivery.status === 'in_progress')
    );
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'created_at'>) => {
    const newOrder: Order = {
      ...orderData,
      id: String(orders.length + 1),
      created_at: new Date().toISOString(),
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const updateDeliveryStatus = (deliveryId: string, status: Delivery['status'], notes?: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.delivery?.id === deliveryId) {
          const updatedDelivery: Delivery = {
            ...order.delivery,
            status,
            notes: notes ?? order.delivery.notes,
            delivered_at: status === 'delivered' ? new Date().toISOString() : order.delivery.delivered_at,
          };
          
          const updatedOrder: Order = {
            ...order,
            status: status === 'delivered' ? 'delivered' : order.status,
            delivery: updatedDelivery,
          };
          
          return updatedOrder;
        }
        return order;
      })
    );
  };

  const assignDelivery = (orderId: string, agentId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const delivery: Delivery = order.delivery
            ? { ...order.delivery, agent_id: agentId, assigned_at: new Date().toISOString() }
            : {
                id: `${500 + orders.length + 1}`,
                order_id: orderId,
                agent_id: agentId,
                assigned_at: new Date().toISOString(),
                status: 'pending',
              };
          
          return {
            ...order,
            status: 'assigned',
            delivery,
          };
        }
        return order;
      })
    );
  };

  return (
    <DataContext.Provider 
      value={{
        products,
        orders,
        getProductById,
        getOrdersByUserId,
        getAssignedOrders,
        getOrderById,
        addOrder,
        updateOrderStatus,
        updateDeliveryStatus,
        assignDelivery,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Hook for using data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
