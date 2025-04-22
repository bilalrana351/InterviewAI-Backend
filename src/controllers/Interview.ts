import { Response } from 'express';
import { AuthenticatedRequest } from '../types/Requests';
import { Interview } from '../models/Interview';
import { Job } from '../models/Job';
import { Company } from '../models/Company';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import mongoose from 'mongoose';

// GET /api/interviews - Get all interviews for the user
export const getAllInterviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    
    // Find all interviews where the user is the interviewee
    const interviews = await Interview.find({ user_id: userId })
      .populate({
        path: 'job_id',
        populate: {
          path: 'company_id',
          select: 'name'
        }
      })
      .sort({ date: 1 }); // Sort by date, upcoming first
    
    res.status(200).json({
      status: 'success',
      data: interviews
    });
  } catch (error) {
    console.error('Error in getAllInterviews:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve interviews'
    });
  }
};

// POST /api/interviews - Create a new interview (only for company owners or employees)
export const createInterview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { job_id, user_id, time, date } = req.body;
    
    // Validate required fields
    if (!job_id || !user_id || !time || !date) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Job ID, User ID, time, and date are required'
      });
    }
    
    // Check if valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(job_id) || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid job or user ID format'
      });
    }
    
    // Verify job exists
    const job = await Job.findById(job_id).populate('company_id');
    if (!job) {
      return res.status(404).json({
        status: 'error',
        code: 'JOB_NOT_FOUND',
        message: 'Job not found'
      });
    }
    
    // Verify user exists
    const userExists = await User.findById(user_id);
    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    // Get the company ID from the job
    const companyId = job.company_id._id;
    
    // Check if current user is the owner of the company
    const isOwner = job.company_id.owner_id.toString() === userId.toString();
    
    // Check if current user is an employee of the company
    const isEmployee = await Employee.exists({
      company_id: companyId,
      user_id: userId
    });
    
    // If user is neither owner nor employee, deny access
    if (!isOwner && !isEmployee) {
      return res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only company owners or employees can create interviews'
      });
    }
    
    // Check if interview already exists
    const existingInterview = await Interview.findOne({
      job_id,
      user_id,
      date: new Date(date)
    });
    
    if (existingInterview) {
      return res.status(409).json({
        status: 'error',
        code: 'INTERVIEW_EXISTS',
        message: 'An interview already exists for this user and job on the given date'
      });
    }
    
    // Create the interview
    const newInterview = new Interview({
      job_id,
      user_id,
      time,
      date: new Date(date)
    });
    
    await newInterview.save();
    
    // Populate the job and company details for the response
    const populatedInterview = await Interview.findById(newInterview._id)
      .populate({
        path: 'job_id',
        populate: {
          path: 'company_id',
          select: 'name'
        }
      })
      .populate('user_id', 'name email');
    
    res.status(201).json({
      status: 'success',
      data: populatedInterview
    });
  } catch (error) {
    console.error('Error in createInterview:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create interview'
    });
  }
};

// GET /api/interviews/:id - Get an interview by ID (company owners/employees or the interviewee)
export const getInterviewById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { id: interviewId } = req.params;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid interview ID format'
      });
    }
    
    // Find the interview with populated data
    const interview = await Interview.findById(interviewId)
      .populate({
        path: 'job_id',
        populate: {
          path: 'company_id'
        }
      })
      .populate('user_id', 'name email');
    
    if (!interview) {
      return res.status(404).json({
        status: 'error',
        code: 'INTERVIEW_NOT_FOUND',
        message: 'Interview not found'
      });
    }
    
    // Check if the current user is the interviewee
    const isInterviewee = interview.user_id._id.toString() === userId.toString();
    
    // Get the company ID from the job
    const companyId = interview.job_id.company_id._id;
    
    // Check if current user is the owner of the company
    const isOwner = interview.job_id.company_id.owner_id.toString() === userId.toString();
    
    // Check if current user is an employee of the company
    const isEmployee = await Employee.exists({
      company_id: companyId,
      user_id: userId
    });
    
    // If user is neither owner nor employee nor interviewee, deny access
    if (!isOwner && !isEmployee && !isInterviewee) {
      return res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to view this interview'
      });
    }
    
    // Add the user's relationship to the interview data
    const result = {
      ...interview.toObject(),
      userRole: isInterviewee ? 'interviewee' : (isOwner ? 'owner' : 'employee')
    };
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error in getInterviewById:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve interview'
    });
  }
};

// PUT /api/interviews/:id - Update an interview (only for company owners or employees)
export const updateInterview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { id: interviewId } = req.params;
    const { time, date } = req.body;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid interview ID format'
      });
    }
    
    // Find the interview
    const interview = await Interview.findById(interviewId)
      .populate({
        path: 'job_id',
        populate: {
          path: 'company_id'
        }
      });
    
    if (!interview) {
      return res.status(404).json({
        status: 'error',
        code: 'INTERVIEW_NOT_FOUND',
        message: 'Interview not found'
      });
    }
    
    // Get the company ID from the job
    const companyId = interview.job_id.company_id._id;
    
    // Check if current user is the owner of the company
    const isOwner = interview.job_id.company_id.owner_id.toString() === userId.toString();
    
    // Check if current user is an employee of the company
    const isEmployee = await Employee.exists({
      company_id: companyId,
      user_id: userId
    });
    
    // If user is neither owner nor employee, deny access
    if (!isOwner && !isEmployee) {
      return res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only company owners or employees can update interviews'
      });
    }
    
    // Validate at least one field to update
    if (!time && !date) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_UPDATE_FIELDS',
        message: 'At least one field (time or date) is required for update'
      });
    }
    
    // Prepare update object
    const updateData: any = {};
    if (time) updateData.time = time;
    if (date) updateData.date = new Date(date);
    
    // Update the interview
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'job_id',
      populate: {
        path: 'company_id',
        select: 'name'
      }
    })
    .populate('user_id', 'name email');
    
    res.status(200).json({
      status: 'success',
      data: updatedInterview
    });
  } catch (error) {
    console.error('Error in updateInterview:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update interview'
    });
  }
};

// DELETE /api/interviews/:id - Delete an interview (only for company owners or employees)
export const deleteInterview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { id: interviewId } = req.params;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid interview ID format'
      });
    }
    
    // Find the interview
    const interview = await Interview.findById(interviewId)
      .populate({
        path: 'job_id',
        populate: {
          path: 'company_id'
        }
      });
    
    if (!interview) {
      return res.status(404).json({
        status: 'error',
        code: 'INTERVIEW_NOT_FOUND',
        message: 'Interview not found'
      });
    }
    
    // Get the company ID from the job
    const companyId = interview.job_id.company_id._id;
    
    // Check if current user is the owner of the company
    const isOwner = interview.job_id.company_id.owner_id.toString() === userId.toString();
    
    // Check if current user is an employee of the company
    const isEmployee = await Employee.exists({
      company_id: companyId,
      user_id: userId
    });
    
    // If user is neither owner nor employee, deny access
    if (!isOwner && !isEmployee) {
      return res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only company owners or employees can delete interviews'
      });
    }
    
    // Delete the interview
    await Interview.findByIdAndDelete(interviewId);
    
    res.status(200).json({
      status: 'success',
      message: 'Interview successfully deleted'
    });
  } catch (error) {
    console.error('Error in deleteInterview:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete interview'
    });
  }
};
