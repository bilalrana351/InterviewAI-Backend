import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

/**
 * Base repository for MongoDB models
 * Implements common CRUD operations
 */
export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return entity.save();
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  /**
   * Find documents by filter
   */
  async find(
    filter: FilterQuery<T> = {},
    projection: any = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    return this.model.find(filter, projection, options).exec();
  }

  /**
   * Find one document by filter
   */
  async findOne(
    filter: FilterQuery<T> = {},
    projection: any = {},
    options: QueryOptions = {}
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  /**
   * Update document by ID
   */
  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  /**
   * Update documents by filter
   */
  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    const result = await this.model.updateMany(filter, update).exec();
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  }

  /**
   * Delete document by ID
   */
  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Delete documents by filter
   */
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount || 0;
  }

  /**
   * Count documents by filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
} 