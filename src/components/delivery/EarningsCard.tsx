
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

interface EarningsProps {
  agentId: string;
}

const EarningsCard = ({ agentId }: EarningsProps) => {
  const { orders } = useData();
  
  // Get today's start date
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  // Filter today's delivered orders for this agent
  const todaysDeliveredOrders = orders.filter(order => 
    order.delivery?.agent_id === agentId &&
    order.delivery?.status === 'delivered' &&
    new Date(order.order_date) >= todayStart
  );
  
  // Calculate earnings by payment method
  const cashPayments = todaysDeliveredOrders
    .filter(order => order.payment_status === 'paid' && order.payment_method === 'cash')
    .reduce((sum, order) => sum + order.total_amount, 0);
  
  const upiPayments = todaysDeliveredOrders
    .filter(order => order.payment_status === 'paid' && order.payment_method === 'upi')
    .reduce((sum, order) => sum + order.total_amount, 0);
  
  const unpaidAmount = todaysDeliveredOrders
    .filter(order => order.payment_status === 'pending')
    .reduce((sum, order) => sum + order.total_amount, 0);
  
  const totalCollected = cashPayments + upiPayments;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${totalCollected.toFixed(2)}</div>
        <div className="space-y-1 mt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Cash
            </span>
            <span className="font-semibold">${cashPayments.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
              UPI
            </span>
            <span className="font-semibold">${upiPayments.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
              Unpaid
            </span>
            <span className="font-semibold">${unpaidAmount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsCard;
