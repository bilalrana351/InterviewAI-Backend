import { ICandidate } from "./Candidate";
import { IJob } from "./Job";
import { INTERVIEW_STAGES } from "../constants/interview";
import { Document } from "mongoose";
export interface IInterview extends Document {
  candidate: ICandidate['_id'];
  job: IJob['_id'];
  interviewDate?: Date;
  status: typeof INTERVIEW_STAGES[number];
}