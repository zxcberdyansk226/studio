"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Flame, Star } from 'lucide-react';
import TradingView from '@/components/trading-view';
import WalletView from '@/components/wallet-view';
import TournamentsView from '@/components/tournaments-view';

export type Position = {
  id: number;
  coin: 'BTC' | 'ETH' | 'SOL';
  type: 'Long' | 'Short';
  entryPrice: number;
  size: number;
};

export default function Home() {
  const [balance, setBalance] = useState(10000);
  const [stars, setStars] = useState(5);
  const [positions, setPositions] = useState<Position[]>([]);

  const addPosition = (position: Omit<Position, 'id'>) => {
    setPositions(prev => [...prev, { ...position, id: Date.now() }]);
  };

  const closePosition = (id: number, pnl: number) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    setBalance(prev => prev + pnl);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Flame className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-headline">
            Crypto Futures
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">{balance.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground text-sm">Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-amber-400">{stars}</span>
            <Star className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </header>
      
      <main>
        <Tabs defaultValue="trade" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade">
            <TradingView 
              balance={balance}
              setBalance={setBalance}
              positions={positions} 
              addPosition={addPosition}
              closePosition={closePosition}
            />
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletView balance={balance} setBalance={setBalance} />
          </TabsContent>
          
          <TabsContent value="tournaments">
            <TournamentsView stars={stars} setStars={setStars} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
