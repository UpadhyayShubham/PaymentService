import {
  describe,
  expect,
  it,
} from "vitest";

import { PaymentService } from "../../src/services/payment-service.js";

import {
  FakeAccountRepository,
  FakeJobRepository,
  FakePaymentRepository,
} from "../fakes/fake-repositories.js";

import { FakePaymentUnitOfWork } from "../fakes/fake-payment-unit-of-work.js";

describe("PaymentService", () => {
    it("pays a pending job", async () => {
        const employeeId = crypto.randomUUID();
        const jobId = crypto.randomUUID();
        const accountId = crypto.randomUUID();

        const job = {
            id: jobId,
            employeeId,
            description: "Backend development",
            amount: 25000n,
            status: "pending" as const,
            createdAt: new Date(),
        };

        const account = {
            id: accountId,
            employeeId,
            balance: 100000n,
            createdAt: new Date(),
        };

        const jobs = new FakeJobRepository([job]);
        const accounts = new FakeAccountRepository([account]);
        const payments = new FakePaymentRepository();

        const unitOfWork = new FakePaymentUnitOfWork({
            jobs,
            accounts,
            payments,
        })

        const service = new PaymentService(unitOfWork);

        const payment = await service.payJob(jobId);

        expect(payment.jobId).toBe(jobId);
        expect(payment.accountId).toBe(accountId);
        expect(payment.amount).toBe(25000n);

        expect(account.balance).toBe(75000n);
        expect(job.status).toBe("paid");
    });

    it("throws when job does not exist", async () => {
        const jobs = new FakeJobRepository([]);
        const accounts = new FakeAccountRepository([]);
        const payments = new FakePaymentRepository();

        const unitOfWork = new FakePaymentUnitOfWork({
            jobs,
            accounts,
            payments,
        })

        const service = new PaymentService(unitOfWork);

        await expect(
            service.payJob(crypto.randomUUID())
        ).rejects.toThrow("Job not found");
    });

    it("does not pay an already paid job", async () => {
        const employeeId = crypto.randomUUID();
        const jobId = crypto.randomUUID();

        const job = {
            id: jobId,
            employeeId,
            description: "Backend development",
            amount: 25000n,
            status: "paid" as const,
            createdAt: new Date(),
        };

        const jobs = new FakeJobRepository([job]);
        const accounts = new FakeAccountRepository([]);
        const payments = new FakePaymentRepository();

        const unitOfWork = new FakePaymentUnitOfWork({
            jobs,
            accounts,
            payments,
        });

        const service = new PaymentService(unitOfWork);

        await expect(
            service.payJob(jobId)
        ).rejects.toThrow("Job cannot be paid");
    });


    it("does not pay an already paid job", async () => {
        const employeeId = crypto.randomUUID();
        const jobId = crypto.randomUUID();

        const job = {
            id: jobId,
            employeeId,
            description: "Backend development",
            amount: 25000n,
            status: "pending" as const,
            createdAt: new Date(),
        };

        const jobs = new FakeJobRepository([job]);
        const accounts = new FakeAccountRepository([]);
        const payments = new FakePaymentRepository();

        const unitOfWork = new FakePaymentUnitOfWork({
            jobs,
            accounts,
            payments,
        });

        const service = new PaymentService(unitOfWork);

        await expect(
            service.payJob(jobId)
        ).rejects.toThrow("Account not found");
    });

    it("does not allow payment when balance is insufficient", async () => {
        const employeeId = crypto.randomUUID();
        const jobId = crypto.randomUUID();
        const accountId = crypto.randomUUID();

        const job = {
            id: jobId,
            employeeId,
            description: "Backend development",
            amount: 25000n,
            status: "pending" as const,
            createdAt: new Date(),
        };

        const account = {
            id: accountId,
            employeeId,
            balance: 10000n,
            createdAt: new Date(),
        };

        const jobs = new FakeJobRepository([job]);
        const accounts = new FakeAccountRepository([account]);
        const payments = new FakePaymentRepository();

        const unitOfWork = new FakePaymentUnitOfWork({
            jobs,
            accounts,
            payments,
        });

        const service = new PaymentService(unitOfWork);

        await expect(
            service.payJob(jobId)
        ).rejects.toThrow("Insufficient account balance");

        expect(account.balance).toBe(10000n);
        expect(job.status).toBe("pending");
        expect(payments.payments).toHaveLength(1);
    });
});