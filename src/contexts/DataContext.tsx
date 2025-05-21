
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
  updated_at: string;
  category: string | null;
  stock_quantity: number | null;
  track_inventory: boolean;
  tags: string[];
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

// Delivery type - updated to match both database fields and code usage
export interface Delivery {
  id: string;
  order_id: string;
  agent_id: string; // This maps to delivery_agent_id in database
  status: 'pending' | 'in_progress' | 'delivered' | 'failed';
  assigned_at: string; // This is inferred from created_at
  delivered_at?: string; // Same as actual_delivery_time
  notes?: string;
  agent?: User;
  created_at: string;
  updated_at: string;
}

// Order type - adding order_date property for compatibility
export interface Order {
  id: string;
  customer_id: string;
  user_id: string; // For backward compatibility
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  delivery_address: string;
  notes: string;
  created_at: string;
  updated_at: string;
  order_date?: string; // Added for compatibility, maps to created_at
  route?: string; // Added for compatibility in admin pages
  delivery?: Delivery;
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
      
      const productData: Product[] = (data || []).map(product => ({
        ...product,
        category: product.category || null,
        stock_quantity: product.stock_quantity || null,
        track_inventory: Boolean(product.track_inventory),
        tags: Array.isArray(product.tags) ? product.tags : []
      }));
      
      setProducts(productData);
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

      const orderData: Order[] = (data || []).map(order => {
        // Calculate the order_date from created_at for compatibility
        const orderDate = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '';
        
        return {
          ...order,
          customer_id: order.user_id, // Map user_id to customer_id for compatibility
          payment_method: order.payment_method as PaymentMethod,
          notes: order.notes || "",
          status: order.status as OrderStatus,
          payment_status: order.payment_status as PaymentStatus,
          order_date: orderDate, // Add order_date property
          route: '', // Add empty route property
          items: (order.items || []).map(item => ({
            ...item,
            price_at_order: item.price_at_time || 0,
            product: item.product ? {
              ...item.product,
              category: item.product.category || null,
              stock_quantity: item.product.stock_quantity || null,
              track_inventory: Boolean(item.product.track_inventory),
              tags: Array.isArray(item.product.tags) ? item.product.tags : []
            } : undefined
          })),
          delivery: order.delivery?.[0] ? {
            ...order.delivery[0],
            agent_id: order.delivery[0].delivery_agent_id || '',
            assigned_at: order.delivery[0].created_at || new Date().toISOString(),
            status: (order.delivery[0].status || 'pending') as 'pending' | 'in_progress' | 'delivered' | 'failed',
            delivered_at: order.delivery[0].actual_delivery_time,
            notes: order.delivery[0].notes || ''
          } : undefined
        };
      });

      setOrders(orderData);
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
  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> => {
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
          user_id: orderData.customer_id, // Map customer_id to user_id for DB
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
        price_at_time: item.price_at_order, // Map price_at_order to price_at_time for DB
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Refresh orders list
      await fetchOrders();

      // Create a complete order object with the expected shape
      const orderDate = new Date().toISOString().split('T')[0];
      
      const newOrder: Order = {
        ...order,
        customer_id: order.user_id,
        payment_method: order.payment_method as PaymentMethod,
        payment_status: order.payment_status as PaymentStatus,
        status: order.status as OrderStatus,
        notes: order.notes || "",
        order_date: orderDate,
        route: '',
        items: orderData.items.map(item => ({
          ...item,
          order_id: order.id,
          created_at: new Date().toISOString()
        }))
      };
      
      return newOrder;
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
          actual_delivery_time: status === 'delivered' ? new Date().toISOString() : null
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
          delivery_agent_id: agentId, // Use delivery_agent_id instead of agent_id
          status: 'pending',
          assigned_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      await fetchOrders();
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast.error('Failed to assign delivery');
    }
  };

  // Add new product
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          category: productData.category || null,
          stock_quantity: productData.stock_quantity || null,
          track_inventory: Boolean(productData.track_inventory),
          tags: Array.isArray(productData.tags) ? productData.tags : []
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchProducts();
      
      const newProduct: Product = {
        ...data,
        category: data.category || null,
        stock_quantity: data.stock_quantity || null,
        track_inventory: Boolean(data.track_inventory),
        tags: Array.isArray(data.tags) ? data.tags : []
      };
      
      return newProduct;
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
