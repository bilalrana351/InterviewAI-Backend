import { Document } from "mongoose";
import { ICompany } from "./Company";

export interface IJob extends Document {
  name: string;
  description: string;
  company_id: ICompany['_id'];
}
