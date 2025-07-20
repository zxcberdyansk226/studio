"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrderBookProps {
  coin: 'BTC' | 'ETH' | 'SOL';
}

type Order = [number, number]; // [price, size]

const generateRandomOrders = (count: number, basePrice: number, spread: number): Order[] => {
  return Array.from({ length: count }, () => {
    const price = basePrice + (Math.random() - 0.5) * spread;
    const size = Math.random() * 10;
    return [price, size];
  }).sort((a, b) => b[0] - a[0]); // Sort descending for bids, ascending for asks
};

const MOCK_PRICES: Record<OrderBookProps['coin'], number> = {
  BTC: 68000,
  ETH: 3500,
  SOL: 150,
};

export default function OrderBook({ coin }: OrderBookProps) {
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);

  useEffect(() => {
    const basePrice = MOCK_PRICES[coin];
    const spread = basePrice * 0.01;

    const updateOrders = () => {
      setBids(generateRandomOrders(10, basePrice - spread / 2, spread));
      setAsks(generateRandomOrders(10, basePrice + spread / 2, spread).sort((a, b) => a[0] - b[0]));
    };

    updateOrders(); // Initial generation
    const intervalId = setInterval(updateOrders, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, [coin]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-green-500">Bid Price</TableHead>
              <TableHead className="text-right">Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids.map(([price, size], i) => (
              <TableRow key={`bid-${i}`}>
                <TableCell className="font-medium text-green-500 p-2">{price.toFixed(2)}</TableCell>
                <TableCell className="text-right p-2">{size.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead className="text-red-500">Ask Price</TableHead>
              <TableHead className="text-right">Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {asks.map(([price, size], i) => (
              <TableRow key={`ask-${i}`}>
                <TableCell className="font-medium text-red-500 p-2">{price.toFixed(2)}</TableCell>
                <TableCell className="text-right p-2">{size.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
