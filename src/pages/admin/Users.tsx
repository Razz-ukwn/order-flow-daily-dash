
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
import { Search, Users, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  phone: string;
  allowOrders?: boolean;
  routeId?: string;
}

const UsersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Extended mock users data with allowOrders and routeId
  const [mockUsers, setMockUsers] = useState<ExtendedUser[]>([
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', active: true, phone: '123-456-7890', allowOrders: true, routeId: 'R001' },
    { id: '2', name: 'Delivery Agent', email: 'agent@example.com', role: 'delivery_agent', active: true, phone: '234-567-8901', allowOrders: false, routeId: 'R002' },
    { id: '3', name: 'Customer User', email: 'customer@example.com', role: 'customer', active: true, phone: '345-678-9012', allowOrders: true, routeId: 'R003' },
    { id: '4', name: 'John Doe', email: 'john@example.com', role: 'customer', active: true, phone: '456-789-0123', allowOrders: true, routeId: 'R004' },
    { id: '5', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', active: false, phone: '567-890-1234', allowOrders: false, routeId: 'R005' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [viewingUser, setViewingUser] = useState<ExtendedUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredUsers(mockUsers);
    } else {
      const results = mockUsers.filter(
        user => 
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term) ||
          user.phone.toLowerCase().includes(term) ||
          (user.routeId?.toLowerCase().includes(term) || false)
      );
      setFilteredUsers(results);
    }
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
    setIsViewDialogOpen(true);
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
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full md:max-w-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">Name</TableHead>
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
                        <Input 
                          value={user.routeId || ''}
                          onChange={(e) => handleRouteIdChange(user.id, e.target.value)}
                          className="h-7 w-20 text-sm py-0"
                          placeholder="Route ID"
                        />
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
              View detailed information about {viewingUser?.name}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p>{viewingUser.routeId || 'Not assigned'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Join Date</h4>
                  <p>April 23, 2023</p>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h4 className="text-md font-semibold mb-2">Recent Activity</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Last login</span>
                    <span className="text-gray-500">Today, 09:42 AM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Orders placed</span>
                    <span className="text-gray-500">12</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Recent order</span>
                    <span className="text-gray-500">May 18, 2023</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
