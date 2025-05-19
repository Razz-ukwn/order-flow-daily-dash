
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Clock } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { getOrdersByUserId, products } = useData();
  
  const userOrders = user ? getOrdersByUserId(user.id) : [];
  const pendingOrders = userOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  const recentOrders = userOrders.slice(0, 3); // Get last 3 orders
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's what's happening with your orders today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="bg-purple-400 hover:bg-purple-500">
            <Link to="/products">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Order Now
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {userOrders.filter(o => o.status === 'delivered').length} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders.filter(o => o.status === 'assigned').length} in delivery
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.is_available).length}</div>
            <p className="text-xs text-muted-foreground">From {products.length} total products</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <div>
        <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
        {recentOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentOrders.map(order => (
              <Card key={order.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="text-md">Order #{order.id}</CardTitle>
                  <CardDescription>
                    {new Date(order.order_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`
                      ${order.status === 'delivered' ? 'badge-success' : ''}
                      ${order.status === 'pending' ? 'badge-warning' : ''}
                      ${order.status === 'cancelled' ? 'badge-danger' : ''}
                      ${order.status === 'assigned' || order.status === 'processing' ? 'badge-primary' : ''}
                    `}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment:</span>
                    <span className={`
                      ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}
                    `}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">Items:</p>
                    <ul className="text-sm">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between py-1">
                          <span>{item.product.name} × {item.quantity}</span>
                          <span>${(item.price_at_order * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/orders/${order.id}`}>
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
                <p className="text-muted-foreground mb-4">You don't have any orders yet</p>
                <Button asChild className="bg-purple-400 hover:bg-purple-500">
                  <Link to="/products">Place Your First Order</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {userOrders.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
