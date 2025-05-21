import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, ShoppingCart, Clock, Calendar } from 'lucide-react';
import { 
  format, 
  subDays, 
  startOfDay, 
  endOfDay, 
  isSameDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  isSameMonth
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { orders, products } = useData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  // Get orders for selected date range
  const getOrdersInRange = (start: Date, end: Date) => {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= start && orderDate <= end;
    });
  };

  // Get today's orders
  const todayOrders = getOrdersInRange(
    startOfDay(new Date()),
    endOfDay(new Date())
  );

  // Get yesterday's orders
  const yesterdayOrders = getOrdersInRange(
    startOfDay(subDays(new Date(), 1)),
    endOfDay(subDays(new Date(), 1))
  );

  // Get this month's orders
  const thisMonthOrders = getOrdersInRange(
    startOfMonth(new Date()),
    endOfMonth(new Date())
  );

  // Get previous month's orders
  const previousMonthOrders = getOrdersInRange(
    startOfMonth(subMonths(new Date(), 1)),
    endOfMonth(subMonths(new Date(), 1))
  );

  // Get orders for selected date range
  const selectedRangeOrders = dateRange?.from && dateRange?.to
    ? getOrdersInRange(dateRange.from, dateRange.to)
    : todayOrders;

  // Calculate revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const selectedRangeRevenue = selectedRangeOrders.reduce((sum, order) => sum + order.total_amount, 0);

  // Calculate pending deliveries
  const pendingDeliveries = orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  );

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from) return 'Select date range';
    if (!dateRange?.to) return format(dateRange.from, 'PPP');
    if (isSameDay(dateRange.from, dateRange.to)) {
      return format(dateRange.from, 'PPP');
    }
    return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
  };

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Get month name
  const getMonthName = (date: Date) => {
    return format(date, 'MMMM yyyy');
  };

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

      {/* Date Range Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Date Range</CardTitle>
          <CardDescription>Select a date range to view statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              variant={!dateRange?.from ? "default" : "outline"}
              onClick={() => setDateRange({
                from: startOfDay(new Date()),
                to: endOfDay(new Date())
              })}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateRange({
                from: startOfDay(subDays(new Date(), 1)),
                to: endOfDay(subDays(new Date(), 1))
              })}
            >
              Yesterday
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateRange({
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date())
              })}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateRange({
                from: startOfMonth(subMonths(new Date(), 1)),
                to: endOfMonth(subMonths(new Date(), 1))
              })}
            >
              Previous Month
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedRangeOrders.length}</div>
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-xs text-muted-foreground">
                {todayOrders.length} today
              </p>
              {isSameMonth(dateRange?.from || new Date(), new Date()) && (
                <p className="text-xs text-muted-foreground">
                  {thisMonthOrders.length} this month
                </p>
              )}
              {isSameMonth(dateRange?.from || new Date(), subMonths(new Date(), 1)) && (
                <p className="text-xs text-muted-foreground">
                  {previousMonthOrders.length} previous month
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${selectedRangeRevenue.toFixed(2)}</div>
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-xs text-muted-foreground">
                ${todayRevenue.toFixed(2)} today
              </p>
              {isSameMonth(dateRange?.from || new Date(), new Date()) && (
                <p className="text-xs text-muted-foreground">
                  ${thisMonthRevenue.toFixed(2)} this month
                </p>
              )}
              {isSameMonth(dateRange?.from || new Date(), subMonths(new Date(), 1)) && (
                <p className="text-xs text-muted-foreground">
                  ${previousMonthRevenue.toFixed(2)} previous month
                </p>
              )}
            </div>
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

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Monthly Comparison</CardTitle>
          <CardDescription>Compare this month with the previous month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{getMonthName(new Date())}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{thisMonthOrders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${thisMonthRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{getMonthName(subMonths(new Date(), 1))}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{previousMonthOrders.length}</p>
                  <p className={`text-xs ${calculatePercentageChange(thisMonthOrders.length, previousMonthOrders.length) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculatePercentageChange(thisMonthOrders.length, previousMonthOrders.length).toFixed(1)}% vs previous
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${previousMonthRevenue.toFixed(2)}</p>
                  <p className={`text-xs ${calculatePercentageChange(thisMonthRevenue, previousMonthRevenue) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculatePercentageChange(thisMonthRevenue, previousMonthRevenue).toFixed(1)}% vs previous
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
