import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Account {
    pnl: number;
    lastUpdated: Time;
    icpBalance: number;
    cashBalance: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Winner {
    finalPortfolioValue: number;
    winner: Principal;
    profitLoss: number;
    timestamp: Time;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum GameMode {
    monthly = "monthly",
    yearly = "yearly",
    daily = "daily",
    weekly = "weekly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyICP(gameMode: GameMode, amount: number, price: number): Promise<void>;
    createAccount(gameMode: GameMode): Promise<void>;
    getAccount(gameMode: GameMode, user: Principal): Promise<Account | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getICPPrice(): Promise<number>;
    getLeaderboard(gameMode: GameMode): Promise<Array<[Principal, Account]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWinners(gameMode: GameMode): Promise<Array<Winner>>;
    isCallerAdmin(): Promise<boolean>;
    markWinner(gameMode: GameMode, winner: Winner): Promise<void>;
    resetAccount(gameMode: GameMode): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sellICP(gameMode: GameMode, amount: number, price: number): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
