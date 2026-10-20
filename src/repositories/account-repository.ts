import { Account } from "../models/account";

export interface AccountRepository {
    findById(id: string): Promise<Account | null>;
    findByEmployeeIdForUpdate(employeeId: string): Promise<Account | null>;
    debit(id: string, amount: bigint): Promise<void>;
}