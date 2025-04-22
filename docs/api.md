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
  "date": "Date (ISO format)"
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
    *   `400 Bad Request` (e.g., `MISSING_REQUIRED_FIELDS`, `INVALID_ID`)
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
      "description": "string (optional)"
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
    *   `400 Bad Request` (e.g., `INVALID_ID`)
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

*   **Description**: Retrieves all interviews for the authenticated user (where they are the interviewee).
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
          "user_id": "60f7a9b0c9a5d2001c8e9e9d",
          "time": "14:00",
          "date": "2023-07-15T00:00:00.000Z"
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
          "user_id": "60f7a9b0c9a5d2001c8e9e9d",
          "time": "10:30",
          "date": "2023-07-20T00:00:00.000Z"
        }
      ]
    }
    ```
*   **Error Response**: `500 Internal Server Error` (e.g., `INTERNAL_SERVER_ERROR`)

### POST /interviews

*   **Description**: Creates a new interview for a job.
*   **Access**: Private (Company Owner or Employee)
*   **Request Body**:
    ```json
    {
      "job_id": "string (required, ObjectId)",
      "user_id": "string (required, ObjectId - the interviewee)",
      "time": "string (required)",
      "date": "string (required, ISO format e.g., YYYY-MM-DD)"
    }
    ```
*   **Success Response**: `201 Created`
    ```json
    {
      "status": "success",
      "data": /* Newly created Interview object with populated job_id (company name) and user_id (name, email) */
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
      "data": /* Updated Interview object with populated job_id (company name) and user_id (name, email) */
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request` (e.g., `INVALID_ID`, `MISSING_UPDATE_FIELDS`)
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