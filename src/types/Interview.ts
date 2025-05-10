import { IJob, Round } from "./Job";
import { Document } from "mongoose";
import { IUser } from "./User";

export interface IInterview extends Document {
  job_id: IJob['_id'];
  user_id: IUser['_id'];
  rounds: Round[];
  cv_url: string;
  parsed_cv: string;
}