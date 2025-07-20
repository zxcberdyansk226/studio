"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import type { Position } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from 'lucide-react';
import OrderBook from './order-book';
import CryptoIcon from './crypto-icon';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

type CryptoAsset = 'BTC' | 'ETH' | 'SOL';

interface TradingViewProps {
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
  positions: Position[];
  addPosition: (position: Omit<Position, 'id'>) => void;
  closePosition: (id: number, pnl: number) => void;
}

const MOCK_PRICES: Record<CryptoAsset, number> = {
  BTC: 68000.00,
  ETH: 3500.00,
  SOL: 150.00,
};

export default function TradingView({ balance, setBalance, positions, addPosition, closePosition }: TradingViewProps) {
  const [selectedCoin, setSelectedCoin] = useState<CryptoAsset>('BTC');
  const [currentPrices, setCurrentPrices] = useState(MOCK_PRICES);
  const [amount, setAmount] = useState('1000');
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrices(prevPrices => ({
        BTC: prevPrices.BTC * (1 + (Math.random() - 0.5) * 0.001),
        ETH: prevPrices.ETH * (1 + (Math.random() - 0.5) * 0.002),
        SOL: prevPrices.SOL * (1 + (Math.random() - 0.5) * 0.005),
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  
  const handlePlaceOrder = (type: 'Long' | 'Short') => {
    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a positive number." });
      return;
    }
    if (tradeAmount > balance) {
        toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough balance for this trade." });
      return;
    }

    addPosition({
      coin: selectedCoin,
      type,
      entryPrice: currentPrices[selectedCoin],
      size: tradeAmount,
    });
    setBalance(prev => prev - tradeAmount);
    toast({ title: "Order Placed", description: `${type} order of ${tradeAmount} on ${selectedCoin} placed successfully.` });
  };

  const getPnl = (position: Position) => {
    const pnl = (currentPrices[position.coin] - position.entryPrice) * (position.size / position.entryPrice);
    return position.type === 'Long' ? pnl : -pnl;
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CryptoIcon coin={selectedCoin} />
                <CardTitle className="font-headline">{selectedCoin}/USD</CardTitle>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${currentPrices[selectedCoin] > MOCK_PRICES[selectedCoin] ? 'text-green-500' : 'text-red-500'}`}>
                    {currentPrices[selectedCoin].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <p className="text-sm text-muted-foreground">24h Change: <span className={currentPrices[selectedCoin] > MOCK_PRICES[selectedCoin] ? 'text-green-500' : 'text-red-500'}>{((currentPrices[selectedCoin] / MOCK_PRICES[selectedCoin] - 1) * 100).toFixed(2)}%</span></p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
              <Image src="https://placehold.co/800x400.png" alt="Price chart" width={800} height={400} className="w-full h-full object-cover rounded-md" data-ai-hint="crypto chart"/>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>Your active futures trades.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>PNL</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.length > 0 ? positions.map(pos => {
                    const pnl = getPnl(pos);
                    return (
                      <TableRow key={pos.id}>
                        <TableCell className="font-medium flex items-center gap-2"><CryptoIcon coin={pos.coin} /> {pos.coin}</TableCell>
                        <TableCell className={pos.type === 'Long' ? 'text-green-500' : 'text-red-500'}>{pos.type}</TableCell>
                        <TableCell>{pos.size.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                        <TableCell>{pos.entryPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                        <TableCell>{currentPrices[pos.coin].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                        <TableCell className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>{pnl.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => closePosition(pos.id, pos.size + pnl)}>Close</Button>
                        </TableCell>
                      </TableRow>
                    )
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No open positions.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="coin-select">Asset</Label>
              <Select value={selectedCoin} onValueChange={(value: CryptoAsset) => setSelectedCoin(value)}>
                <SelectTrigger id="coin-select">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handlePlaceOrder('Long')} className="bg-green-600 hover:bg-green-700 text-white">
                <ArrowUp className="mr-2 h-4 w-4" /> Long
              </Button>
              <Button onClick={() => handlePlaceOrder('Short')} className="bg-red-600 hover:bg-red-700 text-white">
                <ArrowDown className="mr-2 h-4 w-4" /> Short
              </Button>
            </div>
          </CardContent>
        </Card>

        <OrderBook coin={selectedCoin} />
      </div>
    </div>
  );
}
