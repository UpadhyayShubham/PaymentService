export type PaymentStatus = "pending" | "completed" | "failed";

export interface Payment {
    id: string;
    jobId: string;
    accountId: string;
    amount: bigint;
    status: PaymentStatus;
    createdAt: Date;
};
