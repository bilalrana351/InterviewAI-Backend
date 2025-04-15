import { Document } from "mongoose";
import { ICompany } from "./Company";
export interface IJob extends Document {
  company: ICompany['_id'];
  title: string;
  description: string;
}
