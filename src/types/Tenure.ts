import { Document } from "mongoose";
import { IMember } from "./Member";
import { IJob } from "./Job";
import { TENURE_ROLES } from "../constants/tenure";
export interface ITenure extends Document {
  member: IMember['_id'];
  job: IJob['_id'];
  role: typeof TENURE_ROLES[number];
} 