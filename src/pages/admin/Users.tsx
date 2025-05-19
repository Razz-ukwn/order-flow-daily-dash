
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
import { Search, Users, Mail, Phone } from 'lucide-react';

const UsersPage = () => {
  const { user } = useAuth();
  // Mock users data for demonstration
  const mockUsers = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', active: true, phone: '123-456-7890' },
    { id: '2', name: 'Delivery Agent', email: 'agent@example.com', role: 'delivery_agent', active: true, phone: '234-567-8901' },
    { id: '3', name: 'Customer User', email: 'customer@example.com', role: 'customer', active: true, phone: '345-678-9012' },
    { id: '4', name: 'John Doe', email: 'john@example.com', role: 'customer', active: true, phone: '456-789-0123' },
    { id: '5', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', active: false, phone: '567-890-1234' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);

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
          user.phone.toLowerCase().includes(term)
      );
      setFilteredUsers(results);
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
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
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
                      <div className="flex items-center space-x-2">
                        <Switch checked={user.active} />
                        <span>{user.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
