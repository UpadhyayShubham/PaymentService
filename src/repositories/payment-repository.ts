import { Payment } from "../models/payment.js";

export interface PaymentRepository {
    create(
        jobId: string,
        accountId: string,
        amount: bigint,
    ): Promise<Payment>;

    findByJobId(jobId: string): Promise<Payment | null>;
}
