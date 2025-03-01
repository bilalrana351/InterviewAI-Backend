import chalk from 'chalk';
import { CustomLogger } from './custom-logger';
import { ConfigService } from '../services/config.service';

// Enum for log status types
export enum LogStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

// Logger singleton instance
const logger = new CustomLogger('System');

/**
 * Log a message with status information
 * @param message - The message to log
 * @param status - The status of the log (success, error, info, warning)
 * @param context - Optional context for the log
 * @param data - Optional data to include with the log
 */
export function log(
  message: string, 
  status: LogStatus = LogStatus.INFO, 
  context?: string,
  data?: any
): void {
  // Format message based on status
  const formattedMessage = formatMessage(message, status);
  
  // Use the appropriate logger method based on status
  switch (status) {
    case LogStatus.SUCCESS:
      logger.log({
        message: formattedMessage,
        context: context || 'Success',
        ...(data && { data }),
      });
      break;
    case LogStatus.ERROR:
      logger.error({
        message: formattedMessage,
        context: context || 'Error',
        ...(data && { data }),
      });
      break;
    case LogStatus.WARNING:
      logger.warn({
        message: formattedMessage,
        context: context || 'Warning',
        ...(data && { data }),
      });
      break;
    case LogStatus.INFO:
    default:
      logger.log({
        message: formattedMessage,
        context: context || 'Info',
        ...(data && { data }),
      });
      break;
  }
}

/**
 * Format a message based on its status
 */
function formatMessage(message: string, status: LogStatus): string {
  const timestamp = new Date().toISOString();
  
  let statusSymbol: string;
  let colorFunction: Function;
  
  switch (status) {
    case LogStatus.SUCCESS:
      statusSymbol = '✓';
      colorFunction = chalk.green;
      break;
    case LogStatus.ERROR:
      statusSymbol = '✗';
      colorFunction = chalk.red;
      break;
    case LogStatus.WARNING:
      statusSymbol = '⚠';
      colorFunction = chalk.yellow;
      break;
    case LogStatus.INFO:
    default:
      statusSymbol = 'ℹ';
      colorFunction = chalk.blue;
      break;
  }
  
  return colorFunction(`${statusSymbol} ${message}`);
}

// Export convenience methods
export const logSuccess = (message: string, context?: string, data?: any) => 
  log(message, LogStatus.SUCCESS, context, data);

export const logError = (message: string, context?: string, data?: any) => 
  log(message, LogStatus.ERROR, context, data);

export const logInfo = (message: string, context?: string, data?: any) => 
  log(message, LogStatus.INFO, context, data);

export const logWarning = (message: string, context?: string, data?: any) => 
  log(message, LogStatus.WARNING, context, data);

/**
 * Log all loaded environment variables, masking sensitive values
 * @param config - The environment configuration object
 */
export function logEnvironmentVariables(config: Record<string, any>): void {
  // Get all environment variables
  const environmentVars = config || {};
  const sensitiveKeys = ['password', 'key', 'secret', 'token', 'auth', 'pwd'];
  
  // Get the ConfigService instance to access dotenv parsed variables
  const configService = new ConfigService();
  
  // Get only the variables that were loaded from .env file
  // This is the key change - we only process variables that were explicitly loaded from .env
  const dotEnvVars = configService.getDotEnvVariables();
  
  logInfo('.env Variables Loaded:', 'Environment');
  
  // Create an object to hold processed environment variables
  const processedVars: Record<string, any> = {};
  
  // Process each environment variable from .env
  Object.keys(dotEnvVars).sort().forEach(key => {
    let value = dotEnvVars[key];
    
    // Mask sensitive values
    const isSensitive = sensitiveKeys.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );
    
    if (isSensitive && typeof value === 'string' && value.length > 0) {
      // Show the first and last character, mask the rest
      const firstChar = value.charAt(0);
      const lastChar = value.charAt(value.length - 1);
      const maskedLength = Math.max(value.length - 2, 1);
      value = `${firstChar}${'*'.repeat(maskedLength)}${value.length > 1 ? lastChar : ''}`;
    }
    
    processedVars[key] = value;
  });
  
  // Group variables by common prefixes for better readability
  const groups: Record<string, Record<string, any>> = {};
  const ungrouped: Record<string, any> = {};
  
  Object.keys(processedVars).forEach(key => {
    // Try to find a group for the variable
    const parts = key.split('_');
    if (parts.length > 1) {
      const groupName = parts[0];
      const restOfKey = parts.slice(1).join('_');
      
      if (!groups[groupName]) {
        groups[groupName] = {};
      }
      
      groups[groupName][restOfKey] = processedVars[key];
    } else {
      ungrouped[key] = processedVars[key];
    }
  });
  
  // Log grouped variables
  Object.keys(groups).sort().forEach(groupName => {
    logInfo(`${groupName} Variables:`, 'Environment');
    console.log(chalk.cyan('┌────────────────────────────────────────────────────────┐'));
    Object.keys(groups[groupName]).sort().forEach(key => {
      console.log(chalk.cyan(`│ ${key.padEnd(30)}: ${String(groups[groupName][key]).padEnd(30)} │`));
    });
    console.log(chalk.cyan('└────────────────────────────────────────────────────────┘'));
  });
  
  // Log ungrouped variables
  if (Object.keys(ungrouped).length > 0) {
    logInfo('Other .env Variables:', 'Environment');
    console.log(chalk.cyan('┌────────────────────────────────────────────────────────┐'));
    Object.keys(ungrouped).sort().forEach(key => {
      console.log(chalk.cyan(`│ ${key.padEnd(30)}: ${String(ungrouped[key]).padEnd(30)} │`));
    });
    console.log(chalk.cyan('└────────────────────────────────────────────────────────┘'));
  }
  
  logSuccess(`Loaded ${Object.keys(processedVars).length} variables from .env file`, 'Environment');
}

// Export the CustomLogger class for direct use
export { CustomLogger }; 