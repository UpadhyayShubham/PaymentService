import express from "express";

import { pool } from "./db/pool.js"

import { PostgresPaymentUnitOfWork } from "./services/postgres-payment-unit-of-work";

import { PaymentService } from "./services/payment-service.js"

import { PaymentController } from "./controllers/payment-controller";
import { AccountController } from "./controllers/account-controller.js";
import { PaymentQueryController } from "./controllers/payment-query-controller.js"

export function createApp() {
    const app = express();

    app.use(express.json());

    const unitOfWork = new PostgresPaymentUnitOfWork(pool);

    const paymentService = new PaymentService(unitOfWork);

    const paymentController = new PaymentController(paymentService);

    const accountController = new AccountController();

    const paymentQueryController = new PaymentQueryController();

    app.get("/health", (_req, res) => {
        res.json({
            status: "ok",
        });
    });

    app.post("/payments", paymentController.payJob);

    app.get(
        "/accounts/:id/balance",
        accountController.getBalance
    );

    app.get(
        "/jobs/:jobId/payment",
        paymentQueryController.getByJob
    )

    return app;
}
