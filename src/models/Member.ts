import mongoose, { Schema } from 'mongoose';
import { IMember } from '../types/Member';

const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export const Member = mongoose.model<IMember>('Member', memberSchema);
