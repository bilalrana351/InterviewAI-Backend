import { Document } from 'mongoose';
import { IUser } from './User';

export interface ICandidate extends Document {
  user: IUser['_id'];
}