import mongoose, { Schema } from 'mongoose';
import { IInterview } from '../types/Interview';
import { INTERVIEW_STAGES } from '../constants/interview';
const interviewSchema = new Schema({
  candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  interviewDate: { type: Date },
  status: { type: String, enum: INTERVIEW_STAGES, default: 'scheduled' }
});

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
  