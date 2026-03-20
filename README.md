# Form Submission App

A React web application with intelligent form submission handling, including state management, retry logic, and duplicate prevention.

## Features

- **Form Validation**: Email format and positive amount validation
- **State Management**: Clear UI states (idle, pending, success, error)
- **Duplicate Prevention**: Client-side and server-side duplicate detection
- **Automatic Retry**: Intelligent retry logic for temporary failures
- **Mock API**: Simulates various server response scenarios

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the mock API server:
```bash
npm run server
```

3. In a new terminal, start the React app:
```bash
npm start
```

The app will be available at `http://localhost:3000` and the API server at `http://localhost:3001`.

## State Transitions

The application manages four distinct states:

### 1. **Idle State** (`status: 'idle'`)
- Initial state of the form
- User can input email and amount
- No status message displayed

### 2. **Pending State** (`status: 'pending'`)
- Triggered immediately upon form submission
- Shows loading spinner and "Processing your submission..." message
- Form inputs are disabled
- Displays retry count if retrying

### 3. **Success State** (`status: 'success'`)
- API responds with 200 status
- Shows green success message with checkmark
- Form fields are cleared and re-enabled
- Record is stored in local submitted records

### 4. **Error State** (`status: 'error'`)
- Validation errors, API failures, or duplicate submissions
- Shows red error message with specific error details
- Form remains enabled for user corrections

## Retry Logic

The application implements intelligent retry logic for handling temporary failures:

### Retry Triggers
- HTTP 503 (Service Unavailable) responses
- Network errors (connection timeouts, etc.)
- Maximum of 3 retry attempts

### Retry Strategy
- **Exponential Backoff**: Delay increases with each retry (1s, 2s, 3s)
- **Progress Tracking**: Shows current retry attempt (e.g., "Retry attempt 2/3")
- **Automatic Execution**: No user intervention required
- **Graceful Failure**: After max retries, shows error message

### Retry Flow
```
Submission → API Call
    ↓ (503 or Network Error)
Wait 1s → Retry 1
    ↓ (if still failing)
Wait 2s → Retry 2
    ↓ (if still failing)
Wait 3s → Retry 3
    ↓ (if still failing)
Show Error Message
```

## Duplicate Prevention

### Client-Side Prevention
- **Local Tracking**: Maintains a `Set` of submitted record IDs
- **Record ID Format**: `${email}-${amount}` combination
- **Pre-Submission Check**: Validates against local set before API call
- **Immediate Feedback**: Shows error message without API call

### Server-Side Prevention
- **Server Storage**: Mock API maintains its own record set
- **409 Response**: Returns conflict status for duplicates
- **Double Protection**: Ensures no duplicates even if client-side fails

### Prevention Flow
```
User Submits → Check Local Records
    ↓ (if duplicate)
Show Error Message
    ↓ (if not duplicate)
API Call → Check Server Records
    ↓ (if duplicate)
409 Response + Update Local Records
    ↓ (if not duplicate)
200 Response + Update Records
```

## Mock API Behavior

The mock API server (`server.js`) simulates three response scenarios:

### Response Distribution
- **40% Success (200)**: Immediate successful response
- **30% Temporary Failure (503)**: Triggers retry logic
- **30% Delayed Success (200)**: Responds after 5-10 seconds

### API Endpoints

#### POST `/api/submit`
**Request Body:**
```json
{
  "email": "user@example.com",
  "amount": 100.50
}
```

**Responses:**
- `200 OK`: `{ "success": true, "message": "Submission successful" }`
- `503 Service Unavailable`: `{ "error": "Service temporarily unavailable" }`
- `409 Conflict`: `{ "error": "Duplicate submission" }`

#### GET `/api/status`
Returns server status and record count.

#### POST `/api/reset`
Clears all server records (for testing).

## Technical Implementation

### Key Components

#### State Management
```javascript
const [status, setStatus] = useState('idle');
const [errorMessage, setErrorMessage] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [retryCount, setRetryCount] = useState(0);
const [submittedRecords, setSubmittedRecords] = useState(new Set());
```

#### Retry Logic
```javascript
const submitForm = useCallback(async (retries = 0) => {
  try {
    const response = await fetch(API_URL, options);
    
    if (response.status === 503 && retries < MAX_RETRIES) {
      setTimeout(() => submitForm(retries + 1), RETRY_DELAY * (retries + 1));
    }
  } catch (error) {
    if (retries < MAX_RETRIES) {
      setTimeout(() => submitForm(retries + 1), RETRY_DELAY * (retries + 1));
    }
  }
}, [formData]);
```

#### Duplicate Prevention
```javascript
const recordId = createRecordId(formData.email, formData.amount);
if (submittedRecords.has(recordId)) {
  setStatus('error');
  setErrorMessage('Duplicate submission detected');
  return;
}
```

## Testing Scenarios

### Test Cases to Verify:

1. **Successful Submission**
   - Enter valid email and amount
   - Submit and observe success state

2. **Validation Errors**
   - Invalid email format
   - Negative or zero amount
   - Empty fields

3. **Duplicate Prevention**
   - Submit same email/amount combination twice
   - Verify error message on second attempt

4. **Retry Logic**
   - Multiple submissions to encounter 503 errors
   - Observe retry attempts and exponential backoff
   - Verify max retry limit

5. **Network Error Handling**
   - Stop API server during submission
   - Verify retry attempts for network errors

6. **Delayed Success**
   - Submit and wait for 5-10 second delayed response
   - Verify loading state during delay

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Production Considerations

For production deployment, consider:

1. **API URL Configuration**: Environment-based API endpoint
2. **Error Logging**: Service integration for error tracking
3. **Rate Limiting**: API rate limiting implementation
4. **HTTPS**: Secure API communication
5. **Database**: Persistent storage instead of in-memory Set
