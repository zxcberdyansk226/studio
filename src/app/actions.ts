'use server';

import type { Position, UserData } from './page';

// This is a mock database. In a real application, you would use a proper database
// like Firestore, PostgreSQL, etc.
const userDatabase: Record<number, UserData> = {};

function getDb(userId: number): UserData {
  if (!userDatabase[userId]) {
    userDatabase[userId] = {
      balance: 10000,
      stars: 5,
      positions: [],
    };
  }
  return userDatabase[userId];
}

export async function getUser(userId: number): Promise<UserData> {
  console.log(`Fetching data for user ${userId}`);
  return getDb(userId);
}

export async function placeOrder(
  userId: number,
  order: Omit<Position, 'id'>
): Promise<UserData> {
  console.log(`Placing order for user ${userId}:`, order);
  const db = getDb(userId);
  if (order.size > db.balance) {
    throw new Error('Insufficient balance');
  }

  const newPosition: Position = {
    ...order,
    id: Date.now(),
  };

  db.balance -= order.size;
  db.positions.push(newPosition);

  console.log(`User ${userId} new state:`, db);
  return db;
}

export async function closePosition(
  userId: number,
  positionId: number,
  pnl: number
): Promise<UserData> {
  console.log(`Closing position ${positionId} for user ${userId} with PNL ${pnl}`);
  const db = getDb(userId);
  const positionIndex = db.positions.findIndex((p) => p.id === positionId);

  if (positionIndex === -1) {
    throw new Error('Position not found');
  }

  db.balance += pnl;
  db.positions.splice(positionIndex, 1);

  console.log(`User ${userId} new state:`, db);
  return db;
}
