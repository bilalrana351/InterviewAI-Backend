import mongoose, { Schema } from 'mongoose';
import { IJob } from '../types/Job';

const jobSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
});

export const Job = mongoose.model<IJob>('Job', jobSchema);
