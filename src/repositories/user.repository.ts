import { BaseRepository } from './base.repository';
import { IUser, User } from '../models/user.model';

/**
 * User repository for handling user-specific data operations
 */
export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<IUser[]> {
    return this.find({ role });
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<IUser[]> {
    return this.find({ isActive: true });
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(userId: string): Promise<IUser | null> {
    return this.updateById(userId, { lastLogin: new Date() });
  }

  /**
   * Search users by name
   */
  async searchByName(query: string): Promise<IUser[]> {
    const searchRegex = new RegExp(query, 'i');
    return this.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository(); 