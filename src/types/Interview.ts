import { ICandidate } from "./Candidate";
import { IJob } from "./Job";
import { Document } from "mongoose";
export interface IInterview extends Document {
  candidate: ICandidate['_id'];
  job: IJob['_id'];
  interviewDate?: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
}