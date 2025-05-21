import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, User } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Product type
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  category: string | null;
  stock_quantity: number | null;
  track_inventory: boolean;
  tags: string[];
  updated_at: string;
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
  quantity: number;
  price_at_order: number;
  created_at: string;
  product?: Product;
}

// Order type
export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  delivery_address: string;
  notes: string;
  created_at: string;
  updated_at: string;
  delivery?: {
    id: string;
    order_id: string;
    agent_id: string;
    status: 'pending' | 'in_progress' | 'delivered' | 'failed';
    assigned_at: string;
  };
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
  created_at: string;
  updated_at: string;
}

// Data context type
interface DataContextType {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  getOrdersByUserId: (userId: string) => Order[];
  getAssignedOrders: (agentId: string) => Order[];
  getOrderById: (id: string) => Order | undefined;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateDeliveryStatus: (deliveryId: string, status: Delivery['status'], notes?: string) => Promise<void>;
  assignDelivery: (orderId: string, agentId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    refreshData();
  }, []);

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchProducts(), fetchOrders()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []).map(product => ({
        ...product,
        track_inventory: product.track_inventory ?? false,
        tags: product.tags ?? []
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
      toast.error('Failed to fetch products');
    }
  };

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          delivery:deliveries(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(order => ({
        ...order,
        status: order.status as OrderStatus,
        payment_status: order.payment_status as PaymentStatus,
        items: (order.items || []).map(item => ({
          ...item,
          product: {
            ...item.product,
            track_inventory: item.product.track_inventory ?? false,
            tags: item.product.tags ?? []
          }
        })),
        delivery: order.delivery?.[0]
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
      toast.error('Failed to fetch orders');
    }
  };

  // Get product by ID
  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  // Get orders by user ID
  const getOrdersByUserId = (userId: string) => {
    return orders.filter(o => o.customer_id === userId);
  };

  // Get assigned orders for delivery agent
  const getAssignedOrders = (agentId: string) => {
    return orders.filter(o => o.delivery?.agent_id === agentId);
  };

  // Get order by ID
  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  // Add new order
  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get the latest order number
      const { data: latestOrder, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (orderError) throw orderError;

      // Generate new order number
      const lastNumber = latestOrder?.[0]?.id 
        ? parseInt(latestOrder[0].id.replace('APR', '')) 
        : 0;
      const newOrderNumber = `APR${String(lastNumber + 1).padStart(6, '0')}`;

      // Create the order
      const { data: order, error: createError } = await supabase
        .from('orders')
        .insert({
          id: newOrderNumber,
          customer_id: orderData.customer_id,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          status: orderData.status,
          delivery_address: orderData.delivery_address,
          notes: orderData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_order: item.price_at_order,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Refresh orders list
      await fetchOrders();

      // Return the complete order with items
      return {
        ...order,
        items: orderData.items.map(item => ({
          ...item,
          order_id: order.id,
          created_at: new Date().toISOString()
        }))
      };
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Failed to create order');
      return null;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId: string, status: Delivery['status'], notes?: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ 
          status,
          notes,
          delivered_at: status === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', deliveryId);

      if (error) throw error;
      await fetchOrders();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  // Assign delivery to agent
  const assignDelivery = async (orderId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .insert([{
          order_id: orderId,
          agent_id: agentId,
          status: 'pending',
          assigned_at: new Date().toISOString()
        }]);

      if (error) throw error;
      await fetchOrders();
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast.error('Failed to assign delivery');
    }
  };

  // Add new product
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          track_inventory: productData.track_inventory ?? false,
          tags: productData.tags ?? []
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return {
        ...data,
        track_inventory: data.track_inventory ?? false,
        tags: data.tags ?? []
      };
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      console.log('DataContext: Attempting to delete product with ID:', id);
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('DataContext: Product deleted successfully:', data);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        isLoading,
        error,
        getProductById,
        getOrdersByUserId,
        getAssignedOrders,
        getOrderById,
        addOrder,
        updateOrderStatus,
        updateDeliveryStatus,
        assignDelivery,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshData
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
