import { describe, expect, it } from "vitest";

import { FakeJobRepository } from "../fakes/fake-job-repository.js"

describe("FakeJobRepository", () => {
    const repository = new FakeJobRepository([
        {
            id: "job-1",
            employeeId: "employee-1",
            description: "Backend development",
            amount: 25000n,
            status: "pending",
            createdAt: new Date(),
        },
    ]);

    it("finds a job by id", async() => {
        const job = await repository.findById("job-1");

        expect(job).not.toBeNull();
        expect(job?.id).toBe("job-1");
        expect(job?.amount).toBe(25000n);
    });

    it("returns null when job does not exist", async() => {
        const job = await repository.findById(
            "00000000-0000-0000-0000-000000000000"
        );

        expect(job).toBeNull();
    })
});
