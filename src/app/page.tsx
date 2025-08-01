"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Flame, Star, User } from 'lucide-react';
import TradingView from '@/components/trading-view';
import WalletView from '@/components/wallet-view';
import TournamentsView from '@/components/tournaments-view';
import { getUser, placeOrder, closePosition as closePositionAction } from '@/app/actions';

export type Position = {
  id: number;
  coin: 'BTC' | 'ETH' | 'SOL';
  type: 'Long' | 'Short';
  entryPrice: number;
  size: number;
};

export type UserData = {
  balance: number;
  stars: number;
  positions: Position[];
};

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<{ id: number, firstName: string, username?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let tg: any = null;
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      tg = window.Telegram.WebApp;
      tg.ready();
      const initData = tg.initDataUnsafe;
      if (initData && initData.user) {
        const currentUser = {
          id: initData.user.id,
          firstName: initData.user.first_name,
          username: initData.user.username,
        };
        setUser(currentUser);
        fetchUserData(currentUser.id);
      } else {
        // Fallback for development without Telegram
        const devUser = { id: 12345, firstName: 'Dev', username: 'developer' };
        setUser(devUser);
        fetchUserData(devUser.id);
      }
    } else {
       // Fallback for development without Telegram
       const devUser = { id: 12345, firstName: 'Dev', username: 'developer' };
       setUser(devUser);
       fetchUserData(devUser.id);
    }
  }, []);

  const fetchUserData = async (userId: number) => {
    setLoading(true);
    try {
      const data = await getUser(userId);
      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (position: Omit<Position, 'id'>) => {
    if (!user) return;
    try {
      const updatedUserData = await placeOrder(user.id, position);
      setUserData(updatedUserData);
    } catch (error) {
      console.error("Failed to place order", error);
    }
  };

  const handleClosePosition = async (positionId: number, pnl: number) => {
    if (!user) return;
    try {
      const updatedUserData = await closePositionAction(user.id, positionId, pnl);
      setUserData(updatedUserData);
    } catch (error) {
      console.error("Failed to close position", error);
    }
  };

  const updateBalance = (newBalance: number) => {
    if (userData) {
      setUserData({ ...userData, balance: newBalance });
    }
  };
  
  const updateStars = (newStars: number) => {
    if (userData) {
      setUserData({ ...userData, stars: newStars });
    }
  };


  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Flame className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-xl text-muted-foreground">Loading Your Trading Desk...</p>
        </div>
      </div>
    );
  }

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
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user.firstName} {user.username && `(@${user.username})`}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">{userData.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-amber-400">{userData.stars}</span>
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
              balance={userData.balance}
              setBalance={updateBalance}
              positions={userData.positions} 
              addPosition={handlePlaceOrder}
              closePosition={handleClosePosition}
            />
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletView balance={userData.balance} setBalance={updateBalance} />
          </TabsContent>
          
          <TabsContent value="tournaments">
            <TournamentsView stars={userData.stars} setStars={updateStars} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

declare global {
  interface Window {
    Telegram: any;
  }
}
