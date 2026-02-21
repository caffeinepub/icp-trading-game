# Specification

## Summary
**Goal:** Fix the user registration verification logic in the ICP purchase flow so registered users can buy ICP without encountering false "user not registered" errors.

**Planned changes:**
- Fix backend buyICP function to correctly validate user registration status
- Update frontend trading panel to properly handle registration check responses
- Ensure registration state persists correctly across user sessions

**User-visible outcome:** Registered users can successfully purchase ICP without seeing incorrect "user not registered" error messages.
