# Authentication API Documentation

This document outlines the authentication API endpoints available in the MenuFacil application.

## Overview

The authentication system in MenuFacil is built on Supabase Auth with custom API routes for handling login, registration, and other authentication-related actions. The API is designed with security and usability in mind, implementing rate limiting, comprehensive error handling, and proper validation.

## API Endpoints

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "restaurant_owner"
  },
  "session": {
    "expires_at": "2023-05-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

* 400 Bad Request: Invalid credentials format
* 401 Unauthorized: Invalid login credentials
* 429 Too Many Requests: Rate limit exceeded
* 500 Internal Server Error: Unexpected error

**Security Features:**
- Rate limiting (5 attempts per minute)
- Input validation using zod schema
- Detailed error logging
- Standardized error responses

### Registration

**Endpoint:** `POST /api/auth/register`

**Description:** Registers a new user and creates their profile

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "New User"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to confirm your account.",
  "confirmationRequired": true,
  "user": {
    "id": "user-uuid",
    "email": "newuser@example.com"
  }
}
```

**Error Responses:**

* 400 Bad Request: Invalid registration data
* 400 Bad Request: Registration failed (email already in use, etc.)
* 429 Too Many Requests: Rate limit exceeded
* 500 Internal Server Error: Unexpected error

**Security Features:**
- Rate limiting (3 attempts per hour)
- IP and email-based rate limiting
- Input validation using zod schema
- Password complexity requirements
- Detailed error logging
- Standardized error responses

## Security Considerations

### Rate Limiting

All authentication endpoints are protected by rate limiting to prevent brute force attacks. The rate limits are:

- Login: 5 attempts per minute
- Registration: 3 attempts per hour
- Password Reset: 3 attempts per 5 minutes

### Error Handling

Errors are handled consistently across all authentication endpoints with:

1. Standardized error format
2. Appropriate HTTP status codes
3. Concealed sensitive information
4. Database logging for security auditing

### Input Validation

All input is validated using zod schemas to ensure:

1. Email format is valid
2. Password meets minimum complexity requirements
3. Required fields are present

## Using the Authentication API

### Client-Side Example

```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Authentication failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### Best Practices

1. Always handle authentication errors gracefully on the client
2. Implement proper client-side validation before making API calls
3. Provide users with meaningful error messages
4. Store authentication tokens securely (HttpOnly cookies)
5. Implement session timeout handling 