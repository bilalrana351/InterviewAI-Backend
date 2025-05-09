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

---

## Code Submission Routes (`/submissions`)

### POST /submissions

*   **Description**: Submits code for evaluation using Judge0 service. The code is processed asynchronously through a queue system.
*   **Access**: Private (Authenticated User)
*   **Request Body**:
    ```json
    {
      "code": "string (required) - The code to be evaluated",
      "language": "string (required) - Programming language (supported: javascript, python, cpp, java, typescript, csharp, ruby, go, rust, swift)",
      "input": "string (required) - Input to test the code with",
      "output": "string (required) - Expected output"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "submissionId": "string (ObjectId)",
      "message": "Code submitted successfully!"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `MISSING_REQUIRED_FIELDS`)
    *   `500 Internal Server Error` (e.g., `FAILED_TO_SUBMIT_CODE`)

### GET /submissions/:submissionId

*   **Description**: Retrieves the status and results of a code submission.
*   **Access**: Private (Authenticated User)
*   **Request Body**:
    ```json
    {
      "userId": "string (required) - The ID of the user who submitted the code"
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "_id": "string (ObjectId)",
      "code": "string",
      "language": "string",
      "input": "string",
      "output": "string",
      "status": "string (enum: pending, processing, completed, failed)",
      "userId": "string (ObjectId)",
      "result": {
        "stdout": "string | null",
        "stderr": "string | null",
        "status": {
          "id": "number",
          "description": "string"
        },
        "time": "string",
        "memory": "number",
        "isCorrect": "boolean"
      },
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `USER_ID_REQUIRED`)
    *   `404 Not Found` (e.g., `SUBMISSION_NOT_FOUND`)
    *   `500 Internal Server Error` (e.g., `FAILED_TO_FETCH_SUBMISSION`)

## Code Submission System Details

### Supported Languages and IDs

The system supports the following programming languages with their corresponding Judge0 IDs:

```json
{
  "javascript": 63,
  "python": 71,
  "cpp": 54,
  "java": 62,
  "typescript": 74,
  "csharp": 51,
  "ruby": 72,
  "go": 60,
  "rust": 73,
  "swift": 83
}
```

### Submission Status Flow

1. **pending**: Initial state when code is submitted
2. **processing**: Code is being evaluated by Judge0
3. **completed**: Evaluation finished successfully
4. **failed**: Evaluation failed due to an error

### Result Object Structure

The `result` object in the submission response contains:

```json
{
  "stdout": "string | null - Program output",
  "stderr": "string | null - Error output if any",
  "status": {
    "id": "number - Judge0 status code",
    "description": "string - Status description"
  },
  "time": "string - Execution time",
  "memory": "number - Memory usage in bytes",
  "isCorrect": "boolean - Whether output matches expected output"
}
```

### Judge0 Status Codes

Common Judge0 status codes:
- 1: In Queue
- 2: Processing
- 3: Accepted
- 4: Wrong Answer
- 5: Time Limit Exceeded
- 6: Compilation Error
- 7: Runtime Error (SIGSEGV)
- 8: Runtime Error (SIGXFSZ)
- 9: Runtime Error (SIGFPE)
- 10: Runtime Error (SIGABRT)
- 11: Runtime Error (NZEC)
- 12: Runtime Error (Other)
- 13: Internal Error
- 14: Exec Format Error

### Example Usage

1. **Submit Code**:
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "def add(a, b):\n    return a + b",
    "language": "python",
    "input": "5 3",
    "output": "8"
  }'
```

2. **Poll Results**:
```bash
curl -X GET http://localhost:3000/api/submissions/SUBMISSION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "YOUR_USER_ID"
  }'
```

### Best Practices

1. **Polling Strategy**:
   - Start polling after receiving the submissionId
   - Poll every 1-2 seconds
   - Continue polling until status is either "completed" or "failed"
   - Maximum recommended polling duration: 30 seconds

2. **Error Handling**:
   - Check both the HTTP status code and the submission status
   - Handle network errors and retry with exponential backoff
   - Consider the Judge0 status codes for specific error handling

3. **Input/Output Format**:
   - Ensure input matches the expected format in the code
   - Handle multiple test cases by separating them with newlines
   - Consider whitespace and newline characters in output comparison

4. **Resource Management**:
   - Keep code submissions concise
   - Avoid infinite loops or resource-intensive operations
   - Consider time and memory limits of the Judge0 service

### Rate Limiting

The system uses a queue (BullMQ) to manage submissions and prevent overload. Consider implementing client-side rate limiting to avoid overwhelming the system.

### Security Considerations

1. Code submissions are sandboxed by Judge0
2. Each submission is associated with a user ID
3. Users can only access their own submissions
4. Input validation is performed on both client and server side

### Input/Output Handling

The system requires all input and output to be sent as strings, even for numeric values. This is because the Judge0 API expects string values for comparison. Here's how to handle different types of data:

1. **Single Numbers**:
```json
{
  "code": "def add(a, b):\n    return a + b",
  "language": "python",
  "input": "5",  // number as string
  "output": "5"  // number as string
}
```

2. **Multiple Numbers**:
```json
{
  "code": "def add(a, b):\n    return a + b",
  "language": "python",
  "input": "5 3",  // numbers separated by space
  "output": "8"    // result as string
}
```

3. **Arrays or Complex Data**:
```json
{
  "code": "def sum(arr):\n    return sum(arr)",
  "language": "python",
  "input": "1 2 3 4 5",  // numbers as space-separated string
  "output": "15"         // result as string
}
```

#### Important Notes:
1. Always send numbers as strings in the request
2. Your code should parse the input string into numbers if needed
3. Your code should convert the output to a string before returning
4. The comparison will be done on the string representation of the output

#### Common Input/Output Patterns:

1. **Space-separated numbers**:
   - Input: `"1 2 3 4 5"`
   - Output: `"15"`

2. **Newline-separated numbers**:
   - Input: `"1\n2\n3\n4\n5"`
   - Output: `"15"`

3. **Matrix input**:
   - Input: `"1 2 3\n4 5 6\n7 8 9"`
   - Output: `"45"`

4. **Multiple test cases**:
   - Input: `"2\n1 2\n3 4"`
   - Output: `"3\n7"`

#### Best Practices for Input/Output:
1. Always handle string-to-number conversion in your code
2. Consider whitespace and newline characters in output
3. Use consistent formatting for input/output
4. Handle edge cases (empty input, large numbers, etc.)
5. Consider precision for floating-point numbers