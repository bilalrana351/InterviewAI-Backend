import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['candidate', 'interviewer'],
      default: 'candidate'
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Add index for email
UserSchema.index({ email: 1 });


/**
 * User model
 */
export const User = mongoose.model('User', UserSchema); 