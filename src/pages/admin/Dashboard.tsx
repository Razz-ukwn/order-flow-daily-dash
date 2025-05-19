
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, ShoppingCart, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { orders, products } = useData();
  
  // Get today's orders
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => 
    new Date(order.created_at) >= todayStart
  );
  
  // Calculate revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
  
  // Calculate pending deliveries
  const pendingDeliveries = orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here's your business overview.</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button asChild className="bg-purple-400 hover:bg-purple-500">
            <Link to="/admin/orders">
              <Package className="mr-2 h-4 w-4" />
              Manage Orders
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayOrders.length} today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${todayRevenue.toFixed(2)} today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeliveries.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingDeliveries.filter(o => o.status === 'assigned').length} assigned
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
      
      {/* Recent Orders Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Recent Orders</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/orders">View All</Link>
          </Button>
        </div>
        
        <div className="border rounded-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Payment</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="border-t">
                    <td className="p-3 text-sm">#{order.id}</td>
                    <td className="p-3 text-sm">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">Customer {order.user_id}</td>
                    <td className="p-3 text-sm font-medium">${order.total_amount.toFixed(2)}</td>
                    <td className="p-3 text-sm">
                      <span className={`
                        ${order.status === 'delivered' ? 'badge-success' : ''}
                        ${order.status === 'pending' ? 'badge-warning' : ''}
                        ${order.status === 'cancelled' ? 'badge-danger' : ''}
                        ${order.status === 'assigned' || order.status === 'processing' ? 'badge-primary' : ''}
                      `}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`
                        ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}
                      `}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/orders/${order.id}`}>
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-md">Manage Products</CardTitle>
              <CardDescription>
                Add, edit or remove products from your catalog
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/products">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Go to Products
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-md">Manage Users</CardTitle>
              <CardDescription>
                View and manage customer and delivery agent accounts
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Go to Users
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-md">Assign Deliveries</CardTitle>
              <CardDescription>
                Assign pending orders to delivery agents
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/orders?status=pending">
                  <Package className="mr-2 h-4 w-4" />
                  Pending Orders
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
