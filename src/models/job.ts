export type JobStatus = "pending" | "paid" | "cancelled";

export interface Job {
    id: string;
    employeeId: string;
    description: string;
    amount: bigint;
    status: JobStatus;
    createdAt: Date;
}
