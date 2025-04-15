import mongoose, { Schema } from 'mongoose';
import { ITenure } from '../types/Tenure';
import { TENURE_ROLES } from '../constants/tenure';
const tenureSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  role: { type: String, enum: TENURE_ROLES, required: true }
});

export const Tenure = mongoose.model<ITenure>('Tenure', tenureSchema);
