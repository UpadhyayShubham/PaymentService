import { Job } from "../models/job.js";

export interface JobRepository {
    findById(id: string): Promise<Job | null>;

    markAsPaid(id: string): Promise<void>;
}
