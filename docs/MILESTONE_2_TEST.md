# Milestone 2 Testing Checklist - SQLite Implementation

## ✅ Database Tests
- [x] SQLite database connects successfully (using Knex)
- [x] Users table created with migrations
- [x] Password hashing works (bcrypt)
- [x] Unique email constraint works

## ✅ Authentication Tests

### Backend Tests
- [x] Registration creates new user
  - Test: `curl -X POST http://localhost:3001/api/v1/auth/register`
  - Result: Successfully creates user with hashed password
- [x] Registration fails with duplicate email
  - Test: Register same email twice
  - Result: Returns error "User with this email already exists"
- [x] Login works with correct credentials
  - Test: `curl -X POST http://localhost:3001/api/v1/auth/login`
  - Result: Returns JWT token and user data
- [x] Login fails with wrong password
  - Test: Login with incorrect password
  - Result: Returns "Invalid email or password"
- [x] JWT token is returned on login
  - Result: Both access token and refresh token returned
- [x] Token has correct expiry (7 days for access, 30 days for refresh)
  - Verified in JWT payload

### Authorization Tests
- [x] Protected routes require token
  - Test: `curl -X GET http://localhost:3001/api/v1/users/profile`
  - Result: Returns 401 without token
- [x] Invalid token returns 401
  - Test: Use malformed token
  - Result: "Invalid or expired token"
- [x] Valid token allows access
  - Test: `curl -X GET http://localhost:3001/api/v1/users/profile -H "Authorization: Bearer $TOKEN"`
  - Result: Returns user profile data

## ✅ Frontend Tests
- [x] Login form created with validation
- [x] Registration form with all required fields
- [x] Error messages display correctly
- [x] Successful login redirects to courses
- [x] Logout clears stored credentials
- [x] Protected routes redirect to login when not authenticated
- [x] Token persists after page refresh (Zustand persist)
- [x] User info displays in header when logged in

## ✅ Integration Tests
- [x] Frontend successfully calls auth endpoints
- [x] Auth headers are sent with requests
- [x] Token is set in axios after login
- [x] User profile loads after login
- [x] Logout functionality works end-to-end

## 📋 Test Users Created
```bash
npm run create-test-users
```

| Email | Password | Role |
|-------|----------|------|
| student@test.com | password123 | student |
| teacher@test.com | password123 | teacher |
| admin@test.com | password123 | admin |

## 🔧 Implementation Details

### Backend
- JWT authentication using jsonwebtoken
- bcrypt for password hashing
- SQLite database with Knex.js ORM
- Auth middleware for protected routes
- Proper error handling and validation

### Frontend
- Zustand for auth state management
- Axios with auth interceptors
- Protected route components
- Persistent auth storage
- Bilingual login/register forms (EN/FA/PS)

## 🚀 Next Steps
- Implement email verification
- Add password reset functionality
- Implement role-based route protection
- Add user profile editing
- Implement refresh token rotation

## 📸 Testing Evidence
- Auth endpoints tested with curl ✅
- Frontend login/register pages functional ✅
- Protected routes working correctly ✅
- Tokens persisting across page refreshes ✅