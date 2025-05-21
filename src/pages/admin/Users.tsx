import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { UserRole, useAuth } from '@/contexts/AuthContext';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search, Users, Mail, Phone, MapPin, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ExtendedUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  phone: string;
  allowOrders?: boolean;
  routeId?: string;
}

interface Filters {
  role: string;
  route: string;
  status: string;
  orders: string;
}

const UsersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Extended mock users data with allowOrders and routeId
  const [mockUsers, setMockUsers] = useState<ExtendedUser[]>([
    { id: '1', user_id: 'AP00001', name: 'Admin User', email: 'admin@example.com', role: 'admin', active: true, phone: '123-456-7890', allowOrders: true, routeId: 'R001' },
    { id: '2', user_id: 'AP00002', name: 'Delivery Agent', email: 'agent@example.com', role: 'delivery_agent', active: true, phone: '234-567-8901', allowOrders: false, routeId: 'R002' },
    { id: '3', user_id: 'AP00003', name: 'Customer User', email: 'customer@example.com', role: 'customer', active: true, phone: '345-678-9012', allowOrders: true, routeId: 'R003' },
    { id: '4', user_id: 'AP00004', name: 'John Doe', email: 'john@example.com', role: 'customer', active: true, phone: '456-789-0123', allowOrders: true, routeId: 'R004' },
    { id: '5', user_id: 'AP00005', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', active: false, phone: '567-890-1234', allowOrders: false, routeId: 'R005' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [viewingUser, setViewingUser] = useState<ExtendedUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    role: 'all',
    route: 'all',
    status: 'all',
    orders: 'all'
  });
  const [editingRouteId, setEditingRouteId] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term);
  };

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      role: 'all',
      route: 'all',
      status: 'all',
      orders: 'all'
    };
    setFilters(clearedFilters);
    applyFilters(searchTerm, clearedFilters);
  };

  const applyFilters = (searchTerm: string, currentFilters: Filters = filters) => {
    let results = mockUsers;
    
    // Apply role filter
    if (currentFilters.role !== 'all') {
      results = results.filter(user => user.role === currentFilters.role);
    }
    
    // Apply route filter
    if (currentFilters.route !== 'all') {
      results = results.filter(user => user.routeId === currentFilters.route);
    }
    
    // Apply status filter
    if (currentFilters.status !== 'all') {
      results = results.filter(user => 
        currentFilters.status === 'active' ? user.active : !user.active
      );
    }
    
    // Apply orders filter
    if (currentFilters.orders !== 'all') {
      results = results.filter(user => 
        currentFilters.orders === 'allowed' ? user.allowOrders : !user.allowOrders
      );
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      results = results.filter(
        user => 
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.role.toLowerCase().includes(searchTerm) ||
          user.phone.toLowerCase().includes(searchTerm) ||
          user.user_id.toLowerCase().includes(searchTerm) ||
          (user.routeId?.toLowerCase().includes(searchTerm) || false)
      );
    }
    
    setFilteredUsers(results);
  };

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    setMockUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, active: !currentStatus } : u
      )
    );
    
    setFilteredUsers(prevFiltered => 
      prevFiltered.map(u => 
        u.id === userId ? { ...u, active: !currentStatus } : u
      )
    );
    
    toast({
      title: `User ${currentStatus ? "deactivated" : "activated"}`,
      description: `User has been ${currentStatus ? "deactivated" : "activated"} successfully.`,
    });
  };

  const handleToggleAllowOrders = (userId: string, currentStatus: boolean) => {
    setMockUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, allowOrders: !currentStatus } : u
      )
    );
    
    setFilteredUsers(prevFiltered => 
      prevFiltered.map(u => 
        u.id === userId ? { ...u, allowOrders: !currentStatus } : u
      )
    );
    
    toast({
      title: `Orders ${currentStatus ? "disabled" : "enabled"}`,
      description: `User can ${currentStatus ? "no longer" : "now"} place orders.`,
    });
  };

  const handleRouteIdChange = (userId: string, newRouteId: string) => {
    setMockUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, routeId: newRouteId } : u
      )
    );
    
    setFilteredUsers(prevFiltered => 
      prevFiltered.map(u => 
        u.id === userId ? { ...u, routeId: newRouteId } : u
      )
    );
  };

  const handleViewUser = (user: ExtendedUser) => {
    setViewingUser(user);
    setEditingRouteId(user.routeId || '');
    setIsViewDialogOpen(true);
  };

  const handleSaveRouteId = () => {
    if (viewingUser) {
      handleRouteIdChange(viewingUser.id, editingRouteId);
      toast({
        title: "Route ID Updated",
        description: "The route ID has been updated successfully.",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin':
        return <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">Admin</span>;
      case 'delivery_agent':
        return <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Delivery Agent</span>;
      case 'customer':
        return <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Customer</span>;
      default:
        return <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">{role}</span>;
    }
  };

  // Get unique routes for filter
  const uniqueRoutes = Array.from(new Set(mockUsers.map(user => user.routeId).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage all users of the system</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Users className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>You have {mockUsers.length} users registered</CardDescription>
          <div className="flex flex-col gap-4 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by ID, name, email, phone..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-48">
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="delivery_agent">Delivery Agent</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filters.route} onValueChange={(value) => handleFilterChange('route', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routes</SelectItem>
                    {uniqueRoutes.map(route => (
                      <SelectItem key={route} value={route}>{route}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filters.orders} onValueChange={(value) => handleFilterChange('orders', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by orders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="allowed">Orders Allowed</SelectItem>
                    <SelectItem value="not-allowed">Orders Not Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="h-10"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">User ID</TableHead>
                  <TableHead className="w-[150px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.user_id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        {user.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        {user.routeId || 'Not assigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={user.active} 
                          onCheckedChange={() => handleToggleActive(user.id, user.active)}
                        />
                        <span>{user.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={user.allowOrders ?? false}
                          onCheckedChange={() => handleToggleAllowOrders(user.id, user.allowOrders ?? false)} 
                        />
                        <span>{user.allowOrders ? "Allowed" : "Not Allowed"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and edit information about {viewingUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {viewingUser && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-700">
                    {viewingUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">User ID</h4>
                  <p>{viewingUser.user_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Name</h4>
                  <p>{viewingUser.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Email</h4>
                  <p>{viewingUser.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Phone</h4>
                  <p>{viewingUser.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Role</h4>
                  <p>{getRoleLabel(viewingUser.role)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Status</h4>
                  <p className={`${viewingUser.active ? 'text-green-600' : 'text-red-600'}`}>
                    {viewingUser.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Allow Orders</h4>
                  <p className={`${viewingUser.allowOrders ? 'text-green-600' : 'text-red-600'}`}>
                    {viewingUser.allowOrders ? 'Allowed' : 'Not Allowed'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Route ID</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRouteId}
                      onChange={(e) => setEditingRouteId(e.target.value)}
                      placeholder="Enter route ID"
                      className="h-8"
                    />
                    <Button 
                      size="sm"
                      onClick={handleSaveRouteId}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
