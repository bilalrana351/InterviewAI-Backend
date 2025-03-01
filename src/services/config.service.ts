import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigService {
  private readonly envConfig: Record<string, any>;
  private readonly dotEnvVariables: Record<string, any> = {};

  constructor() {
    // Parse the .env file
    const result = dotenv.config();
    
    // Store all environment variables
    this.envConfig = process.env;
    
    // If .env file was found and parsed successfully
    if (result.parsed) {
      // Store only the variables that were in the .env file
      this.dotEnvVariables = result.parsed;
    } else {
      // Try to manually read .env file to get the variables
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const envLines = envContent.split('\n');
          
          envLines.forEach(line => {
            // Skip comments and empty lines
            if (line.trim() && !line.startsWith('#')) {
              const [key, ...valueParts] = line.split('=');
              if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                // Remove quotes if present
                const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
                this.dotEnvVariables[key.trim()] = cleanValue;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error reading .env file:', error);
      }
    }
  }

  get(key: string): any {
    return this.envConfig[key];
  }

  getAll(): Record<string, any> {
    return this.envConfig;
  }

  /**
   * Get only the variables that were loaded from the .env file
   */
  getDotEnvVariables(): Record<string, any> {
    return this.dotEnvVariables;
  }
} 