import mongoose, { Schema } from 'mongoose';
import { IJob, RoundType } from '../types/Job';

const roundSchema = new Schema({
  type: { 
    type: String, 
    enum: Object.values(RoundType),
    required: true
  },
  score: { type: Number, required: false },
  remarks: { type: String, required: false }
}, { _id: false });

const jobSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  role: { type: String, required: true },
  framework: { type: String, required: true },
  rounds: { type: [roundSchema], required: true, default: [] },
  deadline: { type: Date, required: true },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
});

export const Job = mongoose.model<IJob>('Job', jobSchema);
