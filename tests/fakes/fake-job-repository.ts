import { Job } from "../../src/models/job.js";
import { JobRepository } from "../../src/repositories/job-repository.js";

// It sits to help the repository test cases to write decoupled tests for the functions interacting with the DB.
export class FakeJobRepository implements JobRepository {
    constructor(private readonly jobs: Job[]) {}

    async findById(id: string): Promise<Job | null> {
        return this.jobs.find((job) => job.id === id) ?? null;
    }

    async markAsPaid(id: string): Promise<void> {
        const job = this.jobs.find((job) => job.id === id);
        if (job) {
            job.status = "paid";
        }
    }
}