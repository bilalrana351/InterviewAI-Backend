import { IUser } from "./User";
import { Document } from "mongoose";

export interface IMember extends Document {
  user: IUser['_id'];
}