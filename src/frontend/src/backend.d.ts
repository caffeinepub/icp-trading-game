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
    totalPortfolioValue: number;
    lastUpdated: Time;
    icpBalance: number;
    cashBalance: number;
    principalId: Principal;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface LedgerTransaction {
    transactionType: TransactionType;
    icpBalanceAfter: number;
    timestamp: Time;
    price: number;
    cashBalanceAfter: number;
    icpAmount: number;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum TransactionType {
    buy = "buy",
    sell = "sell"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyICP(amount: number): Promise<void>;
    getBalance(): Promise<[string, number, number]>;
    getBalanceForUser(user: Principal): Promise<[string, number, number]>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getICPPrice(): Promise<number>;
    getOrCreateAccount(): Promise<Account>;
    getTransactionHistory(): Promise<Array<LedgerTransaction>>;
    getTransactionHistoryForUser(user: Principal): Promise<Array<LedgerTransaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeDefaultGameMode(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(displayName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sellICP(amount: number): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
