import { SystemDesignSubmissionAIRequest, SystemDesignSubmissionAIResponse } from '../types/SystemDesign';
import { AIParseCVRequest, AIParseCVResponse } from '../types/CV';

/**
 * Service for interacting with the AI microservice
 */
export class AIService {
  private baseUrl: string;

  constructor() {
    // Get base URL from environment variable or default to localhost:8000
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    console.log(`AI Service initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Check if the AI service is available
   * @returns Promise<boolean> True if the service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Error checking AI service availability:', error);
      return false;
    }
  }

  /**
   * Evaluate a system design submission
   * @param submissions The system design submissions to evaluate
   * @returns Promise with the evaluation results
   */
  async evaluateSystemDesign(submissions: SystemDesignSubmissionAIRequest[]): Promise<SystemDesignSubmissionAIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/system-design/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissions),
      });

      if (!response.ok) {
        throw new Error(`AI service returned status ${response.status}`);
      }

      // Get the response data
      const responseData = await response.json();
    

      return responseData;
    } catch (error) {
      console.error('Error evaluating system design:', error);
      throw new Error('Failed to evaluate system design with AI service');
    }
  }

  /**
   * Parse a CV using the AI service
   * @param cvUrl URL of the CV to parse
   * @returns Promise with the parsed CV text
   */
  async parseCv(cvUrl: string): Promise<string> {
    try {
      const requestPayload: AIParseCVRequest = {
        cv_url: cvUrl
      };

      console.log("Data coming in", requestPayload);

      const response = await fetch(`${this.baseUrl}/api/cv-parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`AI service returned status ${response.status}`);
      }

      // Get the response data
      const responseData: AIParseCVResponse = await response.json();
      
      if (!responseData.parsed_markdown) {
        throw new Error('AI service did not return parsed text');
      }

      return responseData.parsed_markdown;
    } catch (error) {
      console.error('Error parsing CV:', error);
      throw new Error('Failed to parse CV with AI service');
    }
  }
}

// Export a singleton instance
export const aiService = new AIService(); 