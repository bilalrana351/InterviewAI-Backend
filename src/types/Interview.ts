import { IJob } from "./Job";
import { Document } from "mongoose";
import { IUser } from "./User";

export interface IInterview extends Document {
  job_id: IJob['_id'];
  user_id: IUser['_id'];
  time: string;
  date: Date;
}