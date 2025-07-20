"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Coins } from 'lucide-react';

interface WalletViewProps {
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
}

const MAX_BALANCE = 100000;
const CLICK_VALUE = 100;

export default function WalletView({ balance, setBalance }: WalletViewProps) {
  const [clickAnimation, setClickAnimation] = useState(false);

  const handleCoinClick = () => {
    setBalance(prev => Math.min(prev + CLICK_VALUE, MAX_BALANCE));
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 150);
  };
  
  const progress = (balance / MAX_BALANCE) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Your Wallet</CardTitle>
          <CardDescription>Click the coin to replenish your balance if you run low.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
            <div className="w-full space-y-2">
                <p className="text-4xl font-bold text-primary">
                    {balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <div className="flex items-center gap-4 justify-center">
                  <Progress value={progress} className="w-full max-w-sm" />
                  <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Max balance from clicks: ${MAX_BALANCE.toLocaleString()}</p>
            </div>
          
          <div className="relative">
            <Button
              onClick={handleCoinClick}
              disabled={balance >= MAX_BALANCE}
              className={`rounded-full h-48 w-48 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-xl transition-transform duration-150 ease-in-out ${clickAnimation ? 'scale-95' : 'scale-100'}`}
              aria-label="Click to get more coins"
            >
              <Coins className="h-24 w-24" />
            </Button>
            {balance >= MAX_BALANCE && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <p className="text-white font-bold text-lg">MAX</p>
              </div>
            )}
          </div>

          <p className="text-lg">Click Value: <span className="font-bold text-accent">${CLICK_VALUE}</span></p>

        </CardContent>
      </Card>
    </div>
  );
}
