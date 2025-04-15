import mongoose, { Schema } from 'mongoose';
import { ICandidate } from '../types/Candidate';

const candidateSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export const Candidate = mongoose.model<ICandidate>('Candidate', candidateSchema);