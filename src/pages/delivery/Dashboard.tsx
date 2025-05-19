
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, Clock } from 'lucide-react';
import EarningsCard from '@/components/delivery/EarningsCard';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { getAssignedOrders, orders } = useData();
  
  if (!user) return null;
  
  const assignedOrders = getAssignedOrders(user.id);
  
  // Count delivered orders by this agent
  const deliveredOrders = orders.filter(
    order => order.delivery?.agent_id === user.id && order.delivery?.status === 'delivered'
  );
  
  // Get today's pending deliveries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayDeliveries = assignedOrders.filter(order => 
    new Date(order.created_at) >= todayStart
  );
  
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
            <div className="text-2xl font-bold">{deliveredOrders.length}</div>
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
        {assignedOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedOrders.map(order => (
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
    </div>
  );
};

export default DeliveryDashboard;
