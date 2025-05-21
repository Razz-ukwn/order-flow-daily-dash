import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, Order, OrderStatus } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Package,
  Search,
  Filter,
  Calendar,
  Edit,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface DeliveryAgent {
  id: string;
  full_name: string;
}

const OrdersPage = () => {
  const { orders, updateOrderStatus, assignDelivery, refreshData } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State variables
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [showPaid, setShowPaid] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [selectedDeliveryAgent, setSelectedDeliveryAgent] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    route: '',
    status: '',
    paymentStatus: ''
  });
  
  // Apply filters whenever orders, search or filters change
  useEffect(() => {
    let result = [...orders];
    
    // Search query filter
    if (searchQuery) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        `customer ${order.user_id}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Payment status filter
    if (!showPaid) {
      result = result.filter(order => order.payment_status !== 'paid');
    }
    
    if (!showPending) {
      result = result.filter(order => order.payment_status !== 'pending');
    }
    
    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter, showPaid, showPending]);
  
  // Get order status color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };
  
  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800';
  };
  
  // Handle view order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  // Handle assign order
  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignOpen(true);
  };
  
  // Assign delivery agent to order
  const handleAssignDelivery = () => {
    if (selectedOrder && selectedDeliveryAgent) {
      assignDelivery(selectedOrder.id, selectedDeliveryAgent);
      toast({
        title: "Order Assigned",
        description: `Order #${selectedOrder.id} has been assigned to Agent ${selectedDeliveryAgent}`,
      });
      setSelectedDeliveryAgent('');
      setIsAssignOpen(false);
    }
  };
  
  // Handle status update
  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast({
      title: "Order Updated",
      description: `Order #${orderId} status updated to ${status}`,
    });
  };
  
  // Handle export orders (mock function)
  const handleExportOrders = () => {
    toast({
      title: "Export Started",
      description: "Your orders are being exported to CSV",
    });
  };
  
  // Fetch delivery agents
  useEffect(() => {
    const fetchDeliveryAgents = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'delivery_agent');

      if (error) {
        console.error('Error fetching delivery agents:', error);
        return;
      }

      setDeliveryAgents(data || []);
    };

    fetchDeliveryAgents();
  }, []);

  // Filter orders based on selected filters
  const filteredOrdersBasedOnFilters = orders.filter(order => {
    if (filters.date && !order.order_date.includes(filters.date)) return false;
    if (filters.route && order.route !== filters.route) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.paymentStatus && order.payment_status !== filters.paymentStatus) return false;
    return true;
  });

  // Handle order selection
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    setSelectedOrders(prev =>
      prev.length === filteredOrdersBasedOnFilters.length
        ? []
        : filteredOrdersBasedOnFilters.map(order => order.id)
    );
  };

  // Handle order assignment
  const handleAssignOrders = async () => {
    if (!selectedDeliveryAgent || selectedOrders.length === 0) {
      toast({
        title: "Error",
        description: "Please select an agent and at least one order",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update orders with assigned agent
      const { error: ordersError } = await supabase
        .from('orders')
        .update({ 
          assigned_agent_id: selectedDeliveryAgent,
          status: 'assigned'
        })
        .in('id', selectedOrders);

      if (ordersError) throw ordersError;

      // Create delivery records
      const deliveries = selectedOrders.map(orderId => ({
        order_id: orderId,
        agent_id: selectedDeliveryAgent,
        status: 'pending',
        assigned_at: new Date().toISOString()
      }));

      const { error: deliveriesError } = await supabase
        .from('deliveries')
        .insert(deliveries);

      if (deliveriesError) throw deliveriesError;

      toast({
        title: "Success",
        description: "Orders assigned successfully"
      });

      setIsAssignDialogOpen(false);
      setSelectedOrders([]);
      setSelectedDeliveryAgent('');
      refreshData();
    } catch (error) {
      console.error('Error assigning orders:', error);
      toast({
        title: "Error",
        description: "Failed to assign orders",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">View and manage all customer orders.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button onClick={handleExportOrders} variant="outline" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select 
                className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="assigned">Assigned</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={showPaid} 
                  onCheckedChange={setShowPaid} 
                  id="paid-filter"
                />
                <label htmlFor="paid-filter" className="text-sm font-medium">Paid</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={showPending} 
                  onCheckedChange={setShowPending} 
                  id="pending-filter"
                />
                <label htmlFor="pending-filter" className="text-sm font-medium">Pending</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Order ID</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium">Customer</TableHead>
              <TableHead className="font-medium">Total</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Payment</TableHead>
              <TableHead className="font-medium">Agent</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrdersBasedOnFilters.length > 0 ? (
              filteredOrdersBasedOnFilters.map((order) => (
                <TableRow key={order.id} className="border-b hover:bg-muted/30">
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>Customer {order.user_id}</TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.delivery ? (
                      `Agent ${order.delivery.agent_id}`
                    ) : (
                      <span className="text-gray-400 text-xs">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </Button>
                      
                      {!order.delivery && order.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => handleAssignOrder(order)}
                          className="bg-purple-400 hover:bg-purple-500 text-white"
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No orders found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order #{selectedOrder.id} Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-6 mt-4">
                {/* Order Info */}
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Order Information</h3>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Date:</span>
                        <span className="text-sm font-medium">{new Date(selectedOrder.order_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Payment:</span>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                          {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total:</span>
                        <span className="text-sm font-medium">${selectedOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Customer Information</h3>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Customer ID:</span>
                        <span className="text-sm font-medium">{selectedOrder.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Name:</span>
                        <span className="text-sm font-medium">Customer {selectedOrder.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Address:</span>
                        <span className="text-sm font-medium">123 Main St</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Info */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Delivery Information</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    {selectedOrder.delivery ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Delivery Agent:</span>
                          <span className="text-sm font-medium">Agent {selectedOrder.delivery.agent_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Assigned At:</span>
                          <span className="text-sm font-medium">{new Date(selectedOrder.delivery.assigned_at).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <span className="text-sm font-medium">{selectedOrder.delivery.status}</span>
                        </div>
                        {selectedOrder.delivery.delivered_at && (
                          <div className="flex justify-between">
                            <span className="text-sm">Delivered At:</span>
                            <span className="text-sm font-medium">{new Date(selectedOrder.delivery.delivered_at).toLocaleString()}</span>
                          </div>
                        )}
                        {selectedOrder.delivery.notes && (
                          <div className="flex justify-between">
                            <span className="text-sm">Notes:</span>
                            <span className="text-sm font-medium">{selectedOrder.delivery.notes}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Not assigned to a delivery agent yet.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order Items */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Order Items</h3>
                  <div className="bg-muted/30 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-medium">Product</TableHead>
                          <TableHead className="font-medium">Price</TableHead>
                          <TableHead className="font-medium">Quantity</TableHead>
                          <TableHead className="font-medium text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell>${item.price_at_order.toFixed(2)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">${(item.price_at_order * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 flex justify-end">
                      <div className="bg-white rounded-md shadow-sm px-4 py-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Total:</span>
                          <span className="text-sm font-bold ml-8">${selectedOrder.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Actions */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Order Actions</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedOrder.id, 'processing');
                          setSelectedOrder({...selectedOrder, status: 'processing'});
                        }}
                        disabled={selectedOrder.status === 'processing'}
                      >
                        Mark as Processing
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedOrder.id, 'delivered');
                          setSelectedOrder({...selectedOrder, status: 'delivered'});
                        }}
                        disabled={selectedOrder.status === 'delivered'}
                      >
                        Mark as Delivered
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedOrder.id, 'cancelled');
                          setSelectedOrder({...selectedOrder, status: 'cancelled'});
                        }}
                        disabled={selectedOrder.status === 'cancelled'}
                        className="text-red-500 hover:text-red-600"
                      >
                        Cancel Order
                      </Button>
                      
                      {!selectedOrder.delivery && (
                        <Button
                          size="sm"
                          className="bg-purple-400 hover:bg-purple-500 text-white"
                          onClick={() => {
                            setIsDetailsOpen(false);
                            setTimeout(() => handleAssignOrder(selectedOrder), 100);
                          }}
                        >
                          Assign to Agent
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Assign Delivery Agent Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Assign Delivery Agent</DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <p className="text-sm mb-4">
                  Assign a delivery agent to order #{selectedOrder.id} 
                  ({new Date(selectedOrder.order_date).toLocaleDateString()})
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Select Delivery Agent</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedDeliveryAgent}
                      onChange={(e) => setSelectedDeliveryAgent(e.target.value)}
                    >
                      <option value="">-- Select Agent --</option>
                      {deliveryAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-400 hover:bg-purple-500 text-white"
                  onClick={handleAssignDelivery}
                  disabled={!selectedDeliveryAgent}
                >
                  Assign Delivery
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Assign Orders Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={selectedOrders.length === 0}
            onClick={() => setIsAssignDialogOpen(true)}
          >
            Assign Orders ({selectedOrders.length})
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Orders to Delivery Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={selectedDeliveryAgent}
              onValueChange={setSelectedDeliveryAgent}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery agent" />
              </SelectTrigger>
              <SelectContent>
                {deliveryAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssignOrders}
              disabled={!selectedDeliveryAgent}
              className="w-full"
            >
              Assign Selected Orders
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
