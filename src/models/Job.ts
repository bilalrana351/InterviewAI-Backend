import mongoose, { Schema } from 'mongoose';
import { IJob } from '../types/Job';

const jobSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
});

export const Job = mongoose.model<IJob>('Job', jobSchema);
