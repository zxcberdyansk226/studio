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
import CryptoIcon from './crypto-icon';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

type CryptoAsset = 'BTC' | 'ETH' | 'SOL';

interface TradingViewProps {
  balance: number;
  setBalance: (balance: number) => void;
  positions: Position[];
  addPosition: (position: Omit<Position, 'id'>) => Promise<void>;
  closePosition: (id: number, pnl: number) => Promise<void>;
}

const MOCK_PRICES: Record<CryptoAsset, number> = {
  BTC: 68000.00,
  ETH: 3500.00,
  SOL: 150.00,
};

const assetToBinanceTicker: Record<CryptoAsset, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
};

export default function TradingView({ balance, setBalance, positions, addPosition, closePosition }: TradingViewProps) {
  const [selectedCoin, setSelectedCoin] = useState<CryptoAsset>('BTC');
  const [currentPrices, setCurrentPrices] = useState(MOCK_PRICES);
  const [amount, setAmount] = useState('1000');
  const { toast } = useToast();
  const [initialPrices, setInitialPrices] = useState(MOCK_PRICES);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const fetchInitialPrices = async () => {
      try {
        const responses = await Promise.all(Object.values(assetToBinanceTicker).map(ticker => 
          fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${ticker}`)
        ));
        const data = await Promise.all(responses.map(res => res.json()));
        
        const newPrices: Partial<Record<CryptoAsset, number>> = {};
        data.forEach(item => {
          const asset = Object.keys(assetToBinanceTicker).find(key => assetToBinanceTicker[key as CryptoAsset] === item.symbol) as CryptoAsset | undefined;
          if (asset) {
            newPrices[asset] = parseFloat(item.price);
          }
        });
        
        const fullPrices = { ...MOCK_PRICES, ...newPrices };
        setCurrentPrices(fullPrices);
        setInitialPrices(fullPrices);
      } catch (error) {
        console.error("Failed to fetch initial prices from Binance", error);
        // Fallback to mock prices
        setCurrentPrices(MOCK_PRICES);
        setInitialPrices(MOCK_PRICES);
      }
    };

    fetchInitialPrices();

    const ws = new WebSocket('wss://stream.binance.com:9443/ws');
    
    ws.onopen = () => {
        const tickers = Object.values(assetToBinanceTicker).map(t => `${t.toLowerCase()}@trade`);
        ws.send(JSON.stringify({
            method: "SUBSCRIBE",
            params: tickers,
            id: 1
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data && data.s && data.p) {
            const asset = Object.keys(assetToBinanceTicker).find(key => assetToBinanceTicker[key as CryptoAsset] === data.s) as CryptoAsset | undefined;
            if (asset) {
                setCurrentPrices(prevPrices => ({
                    ...prevPrices,
                    [asset]: parseFloat(data.p)
                }));
            }
        }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
              method: "UNSUBSCRIBE",
              params: Object.values(assetToBinanceTicker).map(t => `${t.toLowerCase()}@trade`),
              id: 1
          }));
        }
        ws.close();
    };
  }, []);
  
  const handlePlaceOrder = async (type: 'Long' | 'Short') => {
    setIsSubmitting(true);
    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a positive number." });
      setIsSubmitting(false);
      return;
    }
    if (tradeAmount > balance) {
        toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough balance for this trade." });
      setIsSubmitting(false);
      return;
    }

    try {
      await addPosition({
        coin: selectedCoin,
        type,
        entryPrice: currentPrices[selectedCoin],
        size: tradeAmount,
      });
      toast({ title: "Order Placed", description: `${type} order of ${tradeAmount} on ${selectedCoin} placed successfully.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Order Failed", description: "Could not place the order. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePosition = async (position: Position) => {
    const pnl = getPnl(position);
    try {
        await closePosition(position.id, position.size + pnl)
        toast({ title: "Position Closed", description: `You realized a PNL of ${pnl.toFixed(2)}.` });
    } catch (error) {
        toast({ variant: "destructive", title: "Failed to Close", description: "Could not close position. Please try again." });
    }
  }

  const getPnl = (position: Position) => {
    const pnl = (currentPrices[position.coin] - position.entryPrice) * (position.size / position.entryPrice);
    return position.type === 'Long' ? pnl : -pnl;
  };

  const get24hChange = (coin: CryptoAsset) => {
    const current = currentPrices[coin];
    const initial = initialPrices[coin];
    if (initial === 0) return 0;
    return ((current - initial) / initial) * 100;
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
                <p className={`text-2xl font-bold ${currentPrices[selectedCoin] >= initialPrices[selectedCoin] ? 'text-green-500' : 'text-red-500'}`}>
                    {currentPrices[selectedCoin].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <p className="text-sm text-muted-foreground">24h Change: <span className={get24hChange(selectedCoin) >= 0 ? 'text-green-500' : 'text-red-500'}>{get24hChange(selectedCoin).toFixed(2)}%</span></p>
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
                          <Button size="sm" variant="outline" onClick={() => handleClosePosition(pos)}>Close</Button>
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
              <Button onClick={() => handlePlaceOrder('Long')} className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                <ArrowUp className="mr-2 h-4 w-4" /> {isSubmitting ? 'Placing...' : 'Long'}
              </Button>
              <Button onClick={() => handlePlaceOrder('Short')} className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
                <ArrowDown className="mr-2 h-4 w-4" /> {isSubmitting ? 'Placing...' : 'Short'}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
