export type SportCategory =
  | "basketball"
  | "cricket"
  | "football"
  | "tennis"
  | "horse_racing"
  | "casino"
  | "other";

export type MatchStatus = "scheduled" | "in_play" | "completed" | "cancelled";

export type OrderSide = "back" | "lay";

export type OrderStatus = "open" | "partially_filled" | "filled" | "cancelled";

export type TransactionType = "deposit" | "withdrawal" | "bet_lock" | "bet_release" | "settlement" | "bonus";

export type TransactionStatus = "pending" | "approved" | "rejected" | "completed";

export type UserRole = "user" | "admin";

export type CasinoGameSlug = "teen-patti" | "dragon-tiger" | "andar-bahar" | "aviator";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  balance?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface WalletBalance {
  available: number;
  locked: number;
  currency: "INR";
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  referenceId?: string;
  createdAt: string;
  description?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username?: string;
  amount: number;
  upiId: string;
  utrNumber: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  upiId: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  sportType: SportCategory;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName?: string;
  teamA: string;
  teamB: string;
  startTime: string;
  status: MatchStatus;
  sportType: SportCategory;
  score?: MatchScore;
  elapsedMinutes?: number;
  metadata?: string;
}

export interface MatchScore {
  teamA: string;
  teamB: string;
}

export interface PriceLevel {
  price: string;
  size: number;
}

export interface OrderBook {
  matchId: string;
  backs: PriceLevel[];
  lays: PriceLevel[];
}

export interface Order {
  id: string;
  userId: string;
  matchId: string;
  side: OrderSide;
  price: number;
  stake: number;
  filledStake: number;
  status: OrderStatus;
  createdAt: string;
}

export interface BetSelection {
  matchId: string;
  matchTitle: string;
  market: string;
  selectionName: string;
  side: OrderSide;
  odds: number;
  stake: number;
}

export interface BetSlipCalc {
  liability: number;
  netProfit: number;
}

export interface Announcement {
  id: string;
  message: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CasinoGame {
  slug: CasinoGameSlug;
  name: string;
  thumbnailUrl: string;
  iframeUrl?: string;
  description: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
