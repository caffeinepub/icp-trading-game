// Local type definitions for game-related types not exported from backend

export type GameMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const GameMode = {
  daily: 'daily' as GameMode,
  weekly: 'weekly' as GameMode,
  monthly: 'monthly' as GameMode,
  yearly: 'yearly' as GameMode,
};

export interface UserProfile {
  name: string;
}

export interface Account {
  cashBalance: number;
  icpBalance: number;
  pnl: number;
  lastUpdated: bigint;
}

export interface Winner {
  winner: Principal;
  finalPortfolioValue: number;
  profitLoss: number;
  timestamp: bigint;
}

export enum PositionType {
  long_ = 'long',
  short_ = 'short',
}

export interface LeveragedPosition {
  positionType: { __kind__: 'long' } | { __kind__: 'short' };
  leverage: number;
  entryPrice: number;
  amountICP: number;
  margin: number;
  openedAt: bigint;
  isOpen: boolean;
  liquidationPrice: number;
}

export interface LeaderboardEntry {
  player: Principal;
  cashBalance: number;
  icpBalance: number;
  pnl: number;
  totalValue: number;
}

import type { Principal } from '@icp-sdk/core/principal';
