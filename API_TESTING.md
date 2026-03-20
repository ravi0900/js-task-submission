# API Testing Guide

## Mock API Server Endpoints

### Base URL
```
http://localhost:3001
```

### 1. Submit Form Data
**Endpoint:** `POST /api/submit`

**Request:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": 100.50}'
```

**Possible Responses:**

**Success (200):**
```json
{
  "success": true,
  "message": "Submission successful"
}
```

**Temporary Failure (503):**
```json
{
  "error": "Service temporarily unavailable"
}
```

**Duplicate Email (409):**
```json
{
  "error": "Email already submitted"
}
```

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": ["Invalid email format", "Amount must be greater than 0"]
}
```

**Delayed Success (200 after 5-10 seconds):**
```json
{
  "success": true,
  "message": "Submission successful (delayed)"
}
```

### 2. Check Server Status
**Endpoint:** `GET /api/status`

**Request:**
```bash
curl http://localhost:3001/api/status
```

**Response:**
```json
{
  "status": "Server running",
  "recordsCount": 3
}
```

### 3. Reset All Records
**Endpoint:** `POST /api/reset`

**Request:**
```bash
curl -X POST http://localhost:3001/api/reset
```

**Response:**
```json
{
  "message": "Records reset"
}
```

## Validation Rules

### Email Validation
- Must be a valid email format (user@domain.com)
- Required field
- Case insensitive (stored as lowercase)
- Trims whitespace

### Amount Validation
- Must be a number (integer or float)
- Must be greater than 0
- Accepts: `100`, `100.50`, `100.99`, `0.01`
- Rejects: `-100`, `0`, `abc`, `null`, `undefined`, `""`

## Testing Scenarios

### Scenario 1: Valid Submission
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "valid@example.com", "amount": 100.50}'
```

### Scenario 2: Email Validation Tests

**Invalid email format:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "amount": 100.00}'
```

**Missing email:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00}'
```

**Empty email:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "", "amount": 100.00}'
```

**Email with whitespace (should be trimmed):**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "  test@example.com  ", "amount": 100.00}'
```

### Scenario 3: Amount Validation Tests

**Valid integer amount:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": 100}'
```

**Valid float amount:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": 100.99}'
```

**Valid small amount:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": 0.01}'
```

**Negative amount (should fail):**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": -100}'
```

**Zero amount (should fail):**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": 0}'
```

**Non-numeric amount (should fail):**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": "abc"}'
```

**Missing amount (should fail):**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Null amount (should fail):**
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": null}'
```

### Scenario 4: Duplicate Email Tests
```bash
# First submission
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "duplicate@example.com", "amount": 100.00}'

# Second submission with same email (different amount) - should fail
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "duplicate@example.com", "amount": 200.00}'

# Third submission with same email but different case - should fail
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "DUPLICATE@example.com", "amount": 300.00}'
```

### Scenario 5: Multiple Valid Submissions
```bash
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@test.com", "amount": 75.00}'

curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@test.com", "amount": 150.25}'

curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "user3@test.com", "amount": 200}'
```

## Expected Server Logs

### Successful Submission
```
[2024-03-20T12:00:00.000Z] NEW SUBMISSION RECEIVED
   Email: test@example.com
   Amount: 100.50
   Current total submissions: 0
   Random value: 0.2707 (determines response type)
   Response: 200 Success (Immediate approval)
   Record stored: test@example.com with amount 100.5
   Total submissions now: 1
```

### Validation Failed
```
[2024-03-20T12:01:00.000Z] NEW SUBMISSION RECEIVED
   Email: invalid-email
   Amount: abc
   Current total submissions: 0
   VALIDATION FAILED: Invalid email format, Amount must be a number
   Response: 400 Bad Request
```

### Duplicate Email Blocked
```
[2024-03-20T12:02:00.000Z] NEW SUBMISSION RECEIVED
   Email: test@example.com
   Amount: 200.00
   Current total submissions: 1
   DUPLICATE EMAIL BLOCKED: test@example.com was already submitted
   Previous submission: test@example.com-100.5
   Response: 409 Conflict (Email already exists)
```

### Temporary Failure (Triggers Retry)
```
[2024-03-20T12:03:00.000Z] NEW SUBMISSION RECEIVED
   Email: test2@example.com
   Amount: 75.00
   Current total submissions: 1
   Random value: 0.5678 (determines response type)
   Response: 503 Service Unavailable (Triggers retry logic)
   Client should retry automatically
```

## Quick Test Script

Save this as `test_validation.sh` and run it:
```bash
#!/bin/bash

echo "Testing API validation..."

echo "1. Valid submission:"
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "valid@example.com", "amount": 100.50}'

echo -e "\n\n2. Invalid email:"
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "amount": 100.00}'

echo -e "\n\n3. Invalid amount (negative):"
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": -50}'

echo -e "\n\n4. Invalid amount (non-numeric):"
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": "abc"}'

echo -e "\n\n5. Duplicate email:"
curl -X POST http://localhost:3001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "valid@example.com", "amount": 200.00}'

echo -e "\n\n6. Final status:"
curl http://localhost:3001/api/status
```

Make it executable:
```bash
chmod +x test_validation.sh
./test_validation.sh
```

## Data Normalization

The API automatically normalizes data:
- **Email**: Trims whitespace and converts to lowercase
- **Amount**: Converts to float number
- **Storage**: Stores as `email-amount` format internally

Examples:
- Input: `"  TEST@EXAMPLE.COM  "` → Stored: `"test@example.com-100.5"`
- Input: `"100"` → Stored: `"test@example.com-100"`
- Input: `"100.50"` → Stored: `"test@example.com-100.5"`
