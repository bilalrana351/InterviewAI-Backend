import mongoose, { Schema } from 'mongoose';
import { ICompany } from '../types/Company';

const companySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String }
});

export const Company = mongoose.model<ICompany>('Company', companySchema);
  