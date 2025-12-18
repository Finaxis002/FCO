# Auto Logout Functionality

This document describes the auto logout functionality implemented in the FCA application. The system automatically logs users out after 24 hours of inactivity or 24 hours since login, whichever comes first.

## Features

### 1. **Automatic Session Timeout**
- Users are automatically logged out after exactly 24 hours from their login time
- The timer starts when they successfully log in
- Session timeout works across page refreshes and browser restarts

### 2. **Activity-Based Extension**
- User activity (mouse movement, clicks, keyboard input, scrolling) extends the session
- The 24-hour timer resets with each activity
- This prevents logout during active work sessions

### 3. **Session Validation**
- All protected routes check for valid sessions
- Invalid or expired sessions are automatically redirected to login
- Clean logout removes all authentication data

### 4. **Visual Indicators**
- Optional session timer component shows remaining time
- Warning notifications appear when session is about to expire
- Clean, non-intrusive UI notifications

## Implementation Details

### Core Files

1. **`/src/hooks/useAutoLogout.ts`**
   - Main hook that manages the auto logout logic
   - Sets up activity listeners and timeout management
   - Provides functions to set login time and reset timer

2. **`/src/utils/logout.ts`**
   - Utility functions for logout operations
   - Session validation and time remaining calculations
   - Reusable logout functionality across the app

3. **`/src/components/SessionTimer.tsx`**
   - Optional UI component to show session time remaining
   - Warning notifications for approaching timeouts
   - Customizable thresholds and behavior

### Modified Files

1. **`/src/pages/Login.tsx`**
   - Sets login timestamp on successful authentication
   - Initializes auto logout functionality

2. **`/src/App.tsx`**
   - Includes auto logout hook initialization
   - Ensures logout check on app startup

3. **`/src/components/routes/ProtectedRoute.tsx`**
   - Validates session on route access
   - Handles expired session redirects

4. **`/src/components/Login/getNewAccessToken.tsx`**
   - Updates login time on token refresh
   - Clears session data on refresh failure

## Usage

### Basic Implementation

The auto logout functionality is automatically initialized when the app starts. No additional configuration is required.

```typescript
// Auto logout is active throughout the app
import { useAutoLogout } from '@/hooks/useAutoLogout';

function MyComponent() {
  const { setLoginTime } = useAutoLogout();
  // Component can use setLoginTime if needed
}
```

### Showing Session Timer

To display remaining session time to users:

```typescript
import SessionTimer from '@/components/SessionTimer';

function MyLayout() {
  return (
    <div>
      <SessionTimer 
        showWarning={true}
        warningThreshold={30} // Show warning at 30 minutes remaining
      />
      {/* Your app content */}
    </div>
  );
}
```

### Manual Logout

```typescript
import { logout } from '@/utils/logout';

// Logout with navigation
logout(navigate);

// Logout without navigation (for use in utilities)
logout();
```

### Session Validation

```typescript
import { isSessionExpired, getRemainingSessionTime } from '@/utils/logout';

// Check if session is expired
if (isSessionExpired()) {
  // Handle expired session
}

// Get remaining time in milliseconds
const remainingTime = getRemainingSessionTime();
```

## Configuration

### Timeout Duration

The timeout duration is set to 24 hours by default. To change this:

```typescript
// In useAutoLogout.ts and logout.ts
const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours
```

### Activity Events

The following user activities reset the timer:
- Mouse movements (`mousemove`)
- Mouse clicks (`mousedown`, `click`)
- Keyboard input (`keypress`)
- Touch events (`touchstart`)
- Page scrolling (`scroll`)

### Warning Threshold

The session timer shows warnings when session time falls below the threshold (default: 30 minutes).

## Security Considerations

1. **Client-Side Implementation**: This is a client-side implementation for user experience. For security-critical applications, implement server-side session management.

2. **localStorage Dependencies**: The implementation relies on localStorage for session tracking. Users with disabled localStorage will not have auto logout functionality.

3. **Time Synchronization**: Session timing is based on the client's system clock. System time changes could affect timing accuracy.

## Browser Compatibility

- Modern browsers with localStorage support
- Uses standard Web APIs (addEventListener, setTimeout, etc.)
- No polyfills required for target browsers

## Testing

To test the auto logout functionality:

1. **Login** and note the login time
2. **Wait for timeout** or **simulate timeout** by modifying localStorage
3. **Check redirection** to login page
4. **Test activity reset** by performing actions during the session
5. **Verify clean logout** removes all authentication data

### Testing Shorter Timeouts

For development testing, you can temporarily reduce the timeout:

```typescript
// In useAutoLogout.ts - use for testing only
const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes for testing
```

## Future Enhancements

1. **Server-Side Validation**: Implement server-side session validation
2. **Configurable Timeouts**: User-configurable session timeout periods
3. **Activity Customization**: Configurable activity types that reset timer
4. **Session Warnings**: More sophisticated warning system with extend options
5. **Cross-Tab Coordination**: Coordinate timeout across multiple browser tabs

## Troubleshooting

### Auto Logout Not Working

1. Check if localStorage is enabled in the browser
2. Verify login timestamp is being set
3. Ensure no JavaScript errors in console
4. Check if auto logout hook is initialized in App.tsx

### Session Timer Not Showing

1. Verify SessionTimer component is imported and used
2. Check for CSS conflicts
3. Ensure proper time formatting

### Unexpected Logouts

1. Review activity event listeners
2. Check for system time changes
3. Verify login time is being updated on token refresh
4. Review ProtectedRoute validation logic