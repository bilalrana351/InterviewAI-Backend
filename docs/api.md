# API Documentation

This document provides details on the API endpoints for managing Companies, Employees, Jobs, and Interviews.

## Data Models

Below are the data models used throughout the API:

### User Model

```json
{
  "_id": "string (ObjectId)",
  "name": "string",
  "email": "string (unique)"
}
```

### Company Model

```json
{
  "_id": "string (ObjectId)",
  "name": "string",
  "description": "string (optional)",
  "owner_id": "string (ObjectId, references User)"
}
```

### Employee Model

```json
{
  "_id": "string (ObjectId)",
  "company_id": "string (ObjectId, references Company)",
  "user_id": "string (ObjectId, references User)",
  "role": "string"
}
```

### Job Model

```json
{
  "_id": "string (ObjectId)",
  "name": "string",
  "description": "string",
  "role": "string",
  "framework": ["string"],
  "roundTypes": [
    "string (enum: Coding, FrameworkSpecific, SystemDesign, Behavioural, KnowledgeBased)"
  ],
  "deadline": "Date (ISO format)",
  "company_id": "string (ObjectId, references Company)"
}
```

### Interview Model

```json
{
  "_id": "string (ObjectId)",
  "job_id": "string (ObjectId, references Job)",
  "user_id": "string (ObjectId, references User)",
  "time": "string",
  "date": "Date (ISO format)",
  "rounds": [
    {
      "type": "string (enum: Coding, FrameworkSpecific, SystemDesign, Behavioural, KnowledgeBased)",
      "score": "number (optional)",
      "remarks": "string (optional)",
      "status": "string (optional)"
    }
  ]
}
```

### System Design Models

```json
{
  "SystemDesignQuestion": {
    "question": "string",
    "difficulty": "string"
  },
  
  "SystemDesignSubmission": {
    "question": "SystemDesignQuestion",
    "answer": "string",
    "designed_system_image_base64": "string"
  }
}
```

## Authentication

All protected routes require an `Authorization` header with a bearer token:

```
Authorization: Bearer <YOUR_SUPABASE_JWT_TOKEN>
```

The middleware uses the email from the authenticated user (`req.user.email`) to perform database checks.

## Base URL

Assume the base URL for all endpoints is `/api`.

---

## Company Routes (`/companies`)

### GET /companies

*   **Description**: Retrieves companies associated with the authenticated user, including companies they own, are employed at, or are interviewing with.
*   **Access**: Private (Authenticated User)
*   **Returns**: A list of companies with their associated roles:
    *   Each company object includes a `role` field that can be:
        *   `'owner'`: Companies owned by the user
        *   `'employee'`: Companies where the user is an employee
        *   `'interviewing'`: Companies where the user has an interview scheduled
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "60f7a9b0c9a5d2001c8e9e9a",
          "name": "Acme Corp",
          "description": "A company that makes everything",
          "owner_id": "60f7a9b0c9a5d2001c8e9e9b",
          "role": "owner"
        },
        {
          "_id": "60f7a9b0c9a5d2001c8e9e9c",
          "name": "TechCorp",
          "description": "A tech company",
          "owner_id": "60f7a9b0c9a5d2001c8e9e9d",
          "role": "employee"
        },
        {
          "_id": "60f7a9b0c9a5d2001c8e9e9e",
          "name": "StartupInc",
          "description": "A startup company",
          "owner_id": "60f7a9b0c9a5d2001c8e9e9f",
          "role": "interviewing"
        }
      ]
    }
    ```
*   **Error Response**: `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### POST /companies

*   **Description**: Creates a new company with the authenticated user as the owner.
*   **Access**: Private (Authenticated User)
*   **Request Body**:
    ```json
    {
      "name": "string (required)",
      "description": "string (optional)"
    }
    ```
*   **Success Response**: `201 Created`
    ```json
    {
      "status": "success",
      "data": /* Newly created Company object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `MISSING_REQUIRED_FIELDS`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### GET /companies/:id

*   **Description**: Retrieves a specific company if the user is the owner or an employee.
*   **Access**: Private (Company Owner or Employee)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Company object with added 'role' field ('owner' or 'employee') */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `COMPANY_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### PUT /companies/:id

*   **Description**: Updates a specific company. Only the owner can perform this action.
*   **Access**: Private (Company Owner Only)
*   **Request Body**:
    ```json
    {
      "name": "string (optional)",
      "description": "string (optional)"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Updated Company object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `COMPANY_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### DELETE /companies/:id

*   **Description**: Deletes a specific company and all associated data (Employees, Jobs, Interviews). Only the owner can perform this action.
*   **Access**: Private (Company Owner Only)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Company and all associated data successfully deleted"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `COMPANY_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

---

## Employee Routes (`/employees`)

### GET /employees

*   **Description**: Retrieves all employees from all companies owned by the authenticated user.
*   **Access**: Private (Company Owner Only)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "60f7a9b0c9a5d2001c8e9e9a",
          "company_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9b", 
            "name": "Acme Corp"
          },
          "user_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9c",
            "name": "John Doe",
            "email": "john.doe@example.com"
          },
          "role": "HR Manager"
        },
        {
          "_id": "60f7a9b0c9a5d2001c8e9e9d",
          "company_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9b", 
            "name": "Acme Corp"
          },
          "user_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9e",
            "name": "Jane Smith",
            "email": "jane.smith@example.com"
          },
          "role": "Developer"
        }
      ]
    }
    ```
*   **Error Response**: `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### POST /employees

*   **Description**: Creates a new employee record for a company.
*   **Access**: Private (Company Owner Only)
*   **Request Body**:
    ```json
    {
      "company_id": "string (required, ObjectId)",
      "user_id": "string (required, ObjectId)",
      "role": "string (required)"
    }
    ```
*   **Success Response**: `201 Created`
    ```json
    {
      "status": "success",
      "data": /* Newly created Employee object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `MISSING_REQUIRED_FIELDS`, `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `COMPANY_NOT_FOUND`, `USER_NOT_FOUND`)
    *   `409 Conflict` (e.g., `EMPLOYEE_EXISTS`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### GET /employees/:id

*   **Description**: Retrieves a specific employee record.
*   **Access**: Private (Company Owner Only)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Employee object with populated user_id */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `EMPLOYEE_NOT_FOUND`, `COMPANY_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### PUT /employees/:id

*   **Description**: Updates an employee's role.
*   **Access**: Private (Company Owner Only)
*   **Request Body**:
    ```json
    {
      "role": "string (required)"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Updated Employee object with populated user_id */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`, `MISSING_REQUIRED_FIELDS`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `EMPLOYEE_NOT_FOUND`, `COMPANY_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### DELETE /employees/:id

*   **Description**: Removes an employee from a company.
*   **Access**: Private (Company Owner Only)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Employee successfully removed"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `EMPLOYEE_NOT_FOUND`, `COMPANY_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

---

## Job Routes (`/jobs`)

### GET /jobs

*   **Description**: Retrieves jobs associated with the authenticated user (applied for, from owned companies, from companies where employed).
*   **Access**: Private (Authenticated User)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "appliedJobs": [
          {
            "_id": "60f7a9b0c9a5d2001c8e9e9a",
            "name": "Senior Developer",
            "description": "We're looking for a senior developer with 5+ years of experience",
            "company_id": {
              "_id": "60f7a9b0c9a5d2001c8e9e9b",
              "name": "TechCorp",
              "description": "A tech company",
              "owner_id": "60f7a9b0c9a5d2001c8e9e9c"
            }
          }
        ],
        "ownedCompanyJobs": [
          {
            "_id": "60f7a9b0c9a5d2001c8e9e9d",
            "name": "Marketing Specialist",
            "description": "Looking for a marketing specialist for our new product line",
            "company_id": {
              "_id": "60f7a9b0c9a5d2001c8e9e9e",
              "name": "Acme Corp",
              "description": "A company that makes everything",
              "owner_id": "60f7a9b0c9a5d2001c8e9e9f"
            }
          }
        ],
        "employeeCompanyJobs": [
          {
            "_id": "60f7a9b0c9a5d2001c8e9e9g",
            "name": "UX Designer",
            "description": "We need a UX designer for our mobile app",
            "company_id": {
              "_id": "60f7a9b0c9a5d2001c8e9e9h",
              "name": "DesignStudio",
              "description": "A design studio",
              "owner_id": "60f7a9b0c9a5d2001c8e9e9i"
            }
          }
        ]
      }
    }
    ```
*   **Error Response**: `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### POST /jobs

*   **Description**: Creates a new job posting for a company.
*   **Access**: Private (Company Owner or Employee)
*   **Request Body**:
    ```json
    {
      "name": "string (required)",
      "description": "string (required)",
      "role": "string (required)",
      "framework": ["string (required)"],
      "roundTypes": [
        "string (enum: Coding, FrameworkSpecific, SystemDesign, Behavioural, KnowledgeBased)"
      ],
      "deadline": "string (required, ISO format e.g., YYYY-MM-DD)",
      "company_id": "string (required, ObjectId)"
    }
    ```
*   **Success Response**: `201 Created`
    ```json
    {
      "status": "success",
      "data": /* Newly created Job object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `MISSING_REQUIRED_FIELDS`, `INVALID_ID`, `INVALID_DATE_FORMAT`, `INVALID_FORMAT`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `COMPANY_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### GET /jobs/:id

*   **Description**: Retrieves a specific job if the user is the owner/employee of the company or has applied for the job.
*   **Access**: Private (Company Owner, Employee, or Applicant)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Job object with populated company_id and added 'relationship' field ('owner', 'employee', or 'applicant') */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `JOB_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### PUT /jobs/:id

*   **Description**: Updates a specific job posting.
*   **Access**: Private (Company Owner or Employee)
*   **Request Body**:
    ```json
    {
      "name": "string (optional)",
      "description": "string (optional)",
      "role": "string (optional)",
      "framework": ["string (optional)"],
      "roundTypes": [
        "string (enum: Coding, FrameworkSpecific, SystemDesign, Behavioural, KnowledgeBased)"
      ],
      "deadline": "string (optional, ISO format e.g., YYYY-MM-DD)"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Updated Job object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`, `INVALID_DATE_FORMAT`, `INVALID_FORMAT`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `JOB_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### DELETE /jobs/:id

*   **Description**: Deletes a specific job and all associated interviews.
*   **Access**: Private (Company Owner or Employee)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Job successfully deleted along with all associated interviews"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `JOB_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

---

## Interview Routes (`/interviews`)

### GET /interviews

*   **Description**: Retrieves all interviews for the authenticated user - includes both interviews where the user is the interviewee and interviews for companies owned by or employing the user.
*   **Access**: Private (Authenticated User)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "60f7a9b0c9a5d2001c8e9e9a",
          "job_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9b",
            "name": "Senior Developer",
            "description": "We're looking for a senior developer with 5+ years of experience",
            "company_id": {
              "_id": "60f7a9b0c9a5d2001c8e9e9c",
              "name": "TechCorp"
            }
          },
          "user_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9d",
            "name": "John Doe",
            "email": "john.doe@example.com"
          },
          "time": "14:00",
          "date": "2023-07-15T00:00:00.000Z",
          "rounds": [
            {
              "type": "Coding",
              "score": 85,
              "remarks": "Good problem-solving skills",
              "status": "completed"
            },
            {
              "type": "SystemDesign",
              "status": "pending"
            }
          ],
          "role": "interviewee"
        },
        {
          "_id": "60f7a9b0c9a5d2001c8e9e9e",
          "job_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9f",
            "name": "UX Designer",
            "description": "We need a UX designer for our mobile app",
            "company_id": {
              "_id": "60f7a9b0c9a5d2001c8e9e9g",
              "name": "DesignStudio"
            }
          },
          "user_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9h",
            "name": "Jane Smith",
            "email": "jane.smith@example.com"
          },
          "time": "10:30",
          "date": "2023-07-20T00:00:00.000Z",
          "rounds": [
            {
              "type": "Behavioural",
              "status": "pending"
            }
          ],
          "role": "interviewer"
        }
      ]
    }
    ```
*   **Notes**: 
    * Each interview includes a `role` field indicating whether the user is an "interviewee" or "interviewer"
    * "interviewer" means the user is either the owner of or employed by the company conducting the interview
*   **Error Response**: `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### POST /interviews

*   **Description**: Creates a new interview for a job.
*   **Access**: Private (Company Owner or Employee)
*   **Request Body**:
    ```json
    {
      "job_id": "string (required, ObjectId)",
      "user_id": "string (required, ObjectId - the interviewee)"
    }
    ```
*   **Success Response**: `201 Created`
    ```json
    {
      "status": "success",
      "data": /* Newly created Interview object with populated job_id (company name) and complete user_id object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `MISSING_REQUIRED_FIELDS`, `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `JOB_NOT_FOUND`, `USER_NOT_FOUND`)
    *   `409 Conflict` (e.g., `INTERVIEW_EXISTS`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### GET /interviews/:id

*   **Description**: Retrieves a specific interview.
*   **Access**: Private (Company Owner, Employee, or Interviewee)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "_id": "60f7a9b0c9a5d2001c8e9e9a",
        "job_id": {
          "_id": "60f7a9b0c9a5d2001c8e9e9b",
          "name": "Senior Developer",
          "description": "We're looking for a senior developer with 5+ years of experience",
          "company_id": {
            "_id": "60f7a9b0c9a5d2001c8e9e9c",
            "name": "TechCorp",
            "description": "A tech company",
            "owner_id": "60f7a9b0c9a5d2001c8e9e9d"
          }
        },
        "user_id": {
          "_id": "60f7a9b0c9a5d2001c8e9e9e",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "time": "14:00",
        "date": "2023-07-15T00:00:00.000Z",
        "rounds": [
          {
            "type": "Coding",
            "score": 85,
            "remarks": "Good problem-solving skills",
            "status": "completed"
          },
          {
            "type": "SystemDesign",
            "status": "pending"
          }
        ],
        "userRole": "interviewee"
      }
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `INTERVIEW_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### PUT /interviews/:id

*   **Description**: Updates the time and/or date of a specific interview.
*   **Access**: Private (Company Owner or Employee)
*   **Request Body**:
    ```json
    {
      "time": "string (optional)",
      "date": "string (optional, ISO format e.g., YYYY-MM-DD)"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Updated Interview object with populated job_id (company name) and complete user_id object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`, `MISSING_UPDATE_FIELDS`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `INTERVIEW_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### PUT /interviews/:id/rounds

*   **Description**: Updates the rounds data of a specific interview.
*   **Access**: Private (Company Owner or Employee)
*   **Request Body**:
    ```json
    {
      "rounds": [
        {
          "type": "string (enum: Coding, FrameworkSpecific, SystemDesign, Behavioural, KnowledgeBased)",
          "score": "number (optional)",
          "remarks": "string (optional)",
          "status": "string (optional)"
        }
      ]
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": /* Updated Interview object with populated job_id (company name) and complete user_id object */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`, `INVALID_FORMAT`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `INTERVIEW_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### DELETE /interviews/:id

*   **Description**: Deletes a specific interview.
*   **Access**: Private (Company Owner or Employee)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Interview successfully deleted"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED`)
    *   `404 Not Found` (e.g., `INTERVIEW_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

---

## System Design Routes (`/system-design`)

### GET /system-design

*   **Description**: Retrieves a list of system design questions.
*   **Access**: Private (Authenticated User)
*   **Query Parameters**:
    *   `limit`: Number (optional) - Limits the number of questions returned (default: 5)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": [
        {
          "question": "Design a scalable URL shortening service like TinyURL or Bitly.",
          "difficulty": "Medium"
        },
        {
          "question": "Design a distributed file storage system like Google Drive or Dropbox.",
          "difficulty": "Hard"
        }
        // Additional questions based on limit parameter
      ]
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `Limit is greater than the number of questions`)
    *   `500 Internal Server Error` (e.g., `Failed to fetch system design questions`)

### POST /system-design

*   **Description**: Submits a system design solution for evaluation and updates the corresponding interview round with results.
*   **Access**: Private (Authenticated User)
*   **Request Body**:
    ```json
    {
      "interviewId": "string (required, ObjectId referencing Interview)",
      "submissions": [
        {
          "question": {
            "question": "string",
            "difficulty": "string"
          },
          "answer": "string",
          "designed_system_image_base64": "string"
        }
      ]
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "System design submitted and evaluated successfully"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `Invalid interview ID`)
    *   `404 Not Found` (e.g., `Interview not found`, `SystemDesign round not found in this interview`)
    *   `500 Internal Server Error` (e.g., `Failed to process system design submission`)

*   **Process**:
    1. Uploads the system design diagrams to Cloudinary
    2. Sends the submission to the AI service for evaluation
    3. Updates the SystemDesign round of the specified interview with the evaluation score and feedback
    4. Marks the round as completed

---

## User Routes (`/users`)

### GET /users/email/:email

*   **Description**: Retrieves a user by their email address.
*   **Access**: Private (Authenticated User)
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "_id": "60f7a9b0c9a5d2001c8e9e9e",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `MISSING_EMAIL`)
    *   `404 Not Found` (e.g., `USER_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### PUT /users/:id

*   **Description**: Updates a user's details. Users can only update their own profile.
*   **Access**: Private (Authenticated User)
*   **Request Body**:
    ```json
    {
      "name": "string (required)"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "status": "success",
      "data": {
        "_id": "60f7a9b0c9a5d2001c8e9e9e",
        "name": "Updated Name",
        "email": "john.doe@example.com"
      },
      "message": "User details updated successfully"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`, `INVALID_NAME`)
    *   `403 Forbidden` (e.g., `ACCESS_DENIED` - when trying to update another user's profile)
    *   `404 Not Found` (e.g., `USER_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)