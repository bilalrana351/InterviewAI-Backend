import mongoose, { Schema } from 'mongoose';
import { IInterview } from '../types/Interview';

const interviewSchema = new Schema({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true }
});

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);