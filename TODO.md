# TODO - Placement Preparation Portal Fixes

## ISSUE 1 - Company Questions Not Appearing in User Dashboard

### Backend Tasks:
- [x] 1. Fix companyController.js - getCompanies() to return actual companies from database
- [x] 2. Add new endpoints in companyRoutes.js for company questions management:
  - GET /api/companies/id/:id - Get company by ID
  - POST /api/companies/:id/questions - Add questions to company
  - PUT /api/companies/:id/questions/:questionId - Update question
  - DELETE /api/companies/:id/questions/:questionId - Delete question

### Frontend Tasks:
- [x] 3. Fix Companies.jsx - fetch companies from API instead of hardcoded list
- [x] 4. Fix AdminCompanyQuestions.jsx - add question management (add/edit/delete questions)

## ISSUE 2 - Daily Quiz Compiler Output Always Shows "No Output"

### Backend Tasks:
- [x] 5. Fix codingController.js - handle both 'input' and 'stdin' fields correctly

### Frontend Tasks:
- [x] 6. Fix DailyChallenge.jsx - fix the output display logic to check stdout, stderr, and compile_output

## Additional Fixes:
- [x] 7. Update api.js - add company question API endpoints

## Summary of Changes Made:

### Backend:
1. **companyController.js**:
   - Modified `getCompanies()` to return companies from database first
   - Added `getCompanyById()` function
   - Added `addCompanyQuestion()`, `updateCompanyQuestion()`, `deleteCompanyQuestion()` functions

2. **companyRoutes.js**:
   - Added new routes for company question management

3. **codingController.js**:
   - Fixed `runCode()` to accept both 'input' and 'stdin' from frontend
   - Improved base64 decoding with error handling

### Frontend:
1. **Companies.jsx**:
   - Removed hardcoded company list
   - Now fetches companies from API
   - Added dynamic company colors

2. **DailyChallenge.jsx**:
   - Fixed output handling to check compile_output, stderr, and stdout in order

3. **api.js**:
   - Added new company question API methods

4. **AdminCompanyQuestions.jsx**:
   - Added "Add Questions" button for each company
   - Added modal for adding/editing/deleting questions
   - Shows existing questions list

