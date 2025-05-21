import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, Clock, Truck, DollarSign, CreditCard, Wallet } from 'lucide-react';
import EarningsCard from '@/components/delivery/EarningsCard';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StockSummary {
  product_id: string;
  product_name: string;
  assigned_quantity: number;
  delivered_quantity: number;
  remaining_quantity: number;
  price: number;
}

interface PaymentSummary {
  cash: number;
  upi: number;
  remaining: number;
  total: number;
}

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { getAssignedOrders, orders } = useData();
  const [assignedOrders, setAssignedOrders] = useState<number>(0);
  const [deliveredOrders, setDeliveredOrders] = useState<number>(0);
  const [remainingOrders, setRemainingOrders] = useState<number>(0);
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    cash: 0,
    upi: 0,
    remaining: 0,
    total: 0
  });

  if (!user) return null;
  
  const assignedOrdersData = getAssignedOrders(user.id);
  
  // Count delivered orders by this agent
  const deliveredOrdersData = orders.filter(
    order => order.delivery?.agent_id === user.id && order.delivery?.status === 'delivered'
  );
  
  // Get today's pending deliveries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayDeliveries = assignedOrdersData.filter(order => 
    new Date(order.created_at) >= todayStart
  );

  useEffect(() => {
    // Fetch assigned stock
    const fetchAssignedStock = async () => {
      const { data: stockData, error: stockError } = await supabase
        .from('assigned_stock')
        .select(`
          *,
          product:products(id, name, price)
        `)
        .eq('agent_id', user.id)
        .eq('status', 'assigned');

      if (stockError) {
        console.error('Error fetching assigned stock:', stockError);
        return;
      }

      // Calculate stock summary
      const summary = stockData.reduce((acc: { [key: string]: StockSummary }, item: any) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product_id: productId,
            product_name: item.product.name,
            assigned_quantity: 0,
            delivered_quantity: 0,
            remaining_quantity: 0,
            price: item.product.price
          };
        }
        acc[productId].assigned_quantity += item.quantity;
        acc[productId].remaining_quantity += item.quantity;
        return acc;
      }, {});

      setStockSummary(Object.values(summary));
    };

    // Calculate order statistics
    const calculateOrderStats = () => {
      const agentOrders = orders.filter(order => order.assigned_agent_id === user.id);
      const assigned = agentOrders.length;
      const delivered = agentOrders.filter(order => order.status === 'delivered').length;
      const remaining = assigned - delivered;

      setAssignedOrders(assigned);
      setDeliveredOrders(delivered);
      setRemainingOrders(remaining);
    };

    // Calculate payment summary
    const calculatePaymentSummary = () => {
      const agentOrders = orders.filter(order => 
        order.assigned_agent_id === user.id && 
        order.status === 'delivered'
      );

      const summary = agentOrders.reduce((acc: PaymentSummary, order) => {
        if (order.payment_status === 'paid') {
          if (order.payment_method === 'cash') {
            acc.cash += order.total_amount;
          } else if (order.payment_method === 'upi') {
            acc.upi += order.total_amount;
          }
        } else {
          acc.remaining += order.total_amount;
        }
        acc.total += order.total_amount;
        return acc;
      }, { cash: 0, upi: 0, remaining: 0, total: 0 });

      setPaymentSummary(summary);
    };

    fetchAssignedStock();
    calculateOrderStats();
    calculatePaymentSummary();
  }, [user, orders]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's your delivery summary.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDeliveries.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayDeliveries.filter(o => 
                o.delivery?.status === 'delivered'
              ).length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrdersData.length}</div>
            <p className="text-xs text-muted-foreground">
              All time deliveries
            </p>
          </CardContent>
        </Card>
        
        {/* Updated component for earnings */}
        <EarningsCard agentId={user.id} />
      </div>
      
      {/* Pending Deliveries */}
      <div>
        <h2 className="text-lg font-medium mb-4">Today's Pending Deliveries</h2>
        {assignedOrdersData.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedOrdersData.map(order => (
              <Card key={order.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="text-md">Delivery #{order.id}</CardTitle>
                  <CardDescription>
                    {new Date(order.order_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`
                      ${order.delivery?.status === 'delivered' ? 'badge-success' : ''}
                      ${order.delivery?.status === 'pending' ? 'badge-warning' : ''}
                      ${order.delivery?.status === 'failed' ? 'badge-danger' : ''}
                      ${order.delivery?.status === 'in_progress' ? 'badge-primary' : ''}
                    `}>
                      {order.delivery?.status === 'in_progress' ? 'In Progress' : 
                        order.delivery?.status.charAt(0).toUpperCase() + order.delivery?.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Items:</span>
                    <span className="font-semibold">{order.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment:</span>
                    <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-medium">Customer:</p>
                    <p className="text-sm">{user?.name || 'Customer'}</p>
                    <p className="text-sm">{user?.address || '123 Example St'}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/delivery/deliveries/${order.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">You don't have any pending deliveries</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-4 text-center">
          <Button className="bg-purple-400 hover:bg-purple-500" asChild>
            <Link to="/delivery/deliveries/today">View All Today's Deliveries</Link>
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockSummary.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell className="text-right">{item.assigned_quantity}</TableCell>
                  <TableCell className="text-right">{item.delivered_quantity}</TableCell>
                  <TableCell className="text-right">{item.remaining_quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    ${(item.price * item.assigned_quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Cash Collection</span>
                </div>
                <span className="text-sm font-bold">${paymentSummary.cash.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">UPI Collection</span>
                </div>
                <span className="text-sm font-bold">${paymentSummary.upi.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Remaining Amount</span>
                </div>
                <span className="text-sm font-bold">${paymentSummary.remaining.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-lg font-medium">Total Amount</span>
              <span className="text-2xl font-bold">${paymentSummary.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryDashboard;
