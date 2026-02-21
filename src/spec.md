# Specification

## Summary
**Goal:** Implement a user registration process that collects display names and initializes accounts for new users after Internet Identity authentication.

**Planned changes:**
- Create a registration form component with display name input and validation
- Add backend endpoint to register users with $10,000 starting balance
- Update App.tsx to check for existing accounts and show registration for new users
- Display welcome confirmation with account details after successful registration

**User-visible outcome:** New users will complete a simple registration form after Internet Identity login, entering their display name before accessing the trading application with their $10,000 starting balance. Existing users proceed directly to trading.
