export const MESSAGE = {
  COMMON: { SUCCESS: 'Request completed successfully', UNAUTHORIZED: 'Authentication required', NOT_FOUND: 'Resource not found', INTERNAL_ERROR: 'An unexpected error occurred' },
  AUTH: { REGISTERED: 'User created successfully', LOGGED_IN: 'Login successful', PROFILE: 'Profile fetched successfully', EMAIL_EXISTS: 'Email already exists', INVALID_CREDENTIALS: 'Invalid email or password', PASSWORD_MISMATCH: 'Passwords do not match' },
  FRIEND: { REQUEST_SENT: 'Friend request sent', REQUEST_ACCEPTED: 'Friend request accepted', LIST_FETCHED: 'Friends fetched successfully', USER_NOT_FOUND: 'User ID not found', INVALID_REQUEST: 'Friend request is not valid', ALREADY_FRIENDS: 'Users are already friends' },
  MATCH: { CREATED: 'Match created successfully', JOINED: 'Match joined successfully', FETCHED: 'Match fetched successfully', NOT_FOUND: 'Match not found', FULL: 'Match already has two players', INVALID_MOVE: 'Move is not legal', UPDATED: 'Match updated successfully' },
} as const;
