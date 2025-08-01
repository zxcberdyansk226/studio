"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Star, Gift } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ToastAction } from '@/components/ui/toast';


interface TournamentsViewProps {
  stars: number;
  setStars: (stars: number) => void;
}

const tournaments = [
  { id: 1, name: 'Daily Scalp', prize: '1 Month Telegram Premium', entryFee: 5 },
  { id: 2, name: 'Weekly Whale', prize: '3 Months Telegram Premium', entryFee: 20 },
  { id: 3, name: 'BTC Maxi', prize: '$10 Telegram Gift', entryFee: 10 },
];

const leaderboard = [
  { rank: 1, name: 'CryptoKing', pnl: 5430.12 },
  { rank: 2, name: 'You', pnl: 4890.76 },
  { rank: 3, name: 'DiamondHands', pnl: 3120.45 },
  { rank: 4, name: 'MoonShot', pnl: 1050.99 },
];


export default function TournamentsView({ stars, setStars }: TournamentsViewProps) {
    const { toast } = useToast();
    const [joined, setJoined] = useState<number[]>([]);

    const handleJoin = (fee: number, id: number) => {
        if (stars >= fee) {
            const newStars = stars - fee;
            setStars(newStars);
            setJoined(j => [...j, id]);
            toast({ title: "Successfully joined tournament!", description: `Your balance is now ${newStars} stars.` });
        } else {
            toast({ variant: "destructive", title: "Not enough stars!", description: "You need more stars to join this tournament." });
        }
    };

    const handleClaimPrize = () => {
        toast({
            title: "Prize Claimed!",
            description: "Your Telegram Premium has been gifted to your account. Congratulations!",
            action: <ToastAction altText="View Prize"><Gift className="mr-2"/>Awesome!</ToastAction>,
          });
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">Active Tournaments</h2>
        <div className="space-y-4">
          {tournaments.map(t => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle>{t.name}</CardTitle>
                <CardDescription>Prize: <span className="font-semibold text-primary">{t.prize}</span></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Entry Fee: {t.entryFee} Stars</span>
                </div>
              </CardContent>
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={joined.includes(t.id)}>
                      {joined.includes(t.id) ? 'Joined' : 'Join Tournament'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Join "{t.name}" Tournament?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will deduct {t.entryFee} stars from your balance. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleJoin(t.entryFee, t.id)}>Join Now</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Scalp Leaderboard</CardTitle>
          <CardDescription>Top traders by PNL. Tournament ends in 2h 15m.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">PNL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map(player => (
                <TableRow key={player.rank} className={player.name === 'You' ? 'bg-primary/10' : ''}>
                  <TableCell className="font-medium">{player.rank}{player.rank === 1 && <Crown className="inline ml-2 h-4 w-4 text-yellow-400"/>}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className={`text-right font-semibold ${player.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>${player.pnl.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 text-center">
            <p className="font-bold text-lg">Your rank is #2!</p>
            <p className="text-muted-foreground">You're close to the top! Keep trading.</p>
            {/* Simulation of prize claim for a winner */}
            {leaderboard.find(p => p.name === "You" && p.rank === 1) && (
                 <Button onClick={handleClaimPrize} className="mt-4 bg-gradient-to-r from-primary to-accent text-white">
                    <Gift className="mr-2 h-4 w-4"/> Claim Your Prize!
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
