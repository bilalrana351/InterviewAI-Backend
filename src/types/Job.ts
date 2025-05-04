import { Document } from "mongoose";
import { ICompany } from "./Company";

export enum RoundType {
  Coding = "Coding",
  FrameworkSpecific = "FrameworkSpecific",
  SystemDesign = "SystemDesign",
  Behavioural = "Behavioural",
  KnowledgeBased = "KnowledgeBased"
}

export interface Round {
  type: RoundType;
  score?: number;
  remarks?: string;
  status?: string;
}

export interface IJob extends Document {
  name: string;
  description: string;
  role: string;
  framework: string[];
  roundTypes: RoundType[];
  deadline: Date;
  company_id: ICompany['_id'];
}
