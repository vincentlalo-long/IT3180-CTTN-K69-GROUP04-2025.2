# Coding Standards and Best Practices

This document outlines the coding standards for this project. These rules apply to all contributors, including human developers and AI agents, to ensure a high-quality, readable, and maintainable codebase.

## 1. Naming Conventions

### Variables and Functions
- **camelCase:** Always use `camelCase` for variable and function names.
- **Descriptive & Intent-Focused:** Names must clearly describe what the variable holds or what the function does. Avoid generic names like `data`, `info`, or `process`.
- **Self-Documenting:** The name should be enough to understand the purpose without needing a comment.

| Aspect | Rule | Bad Example | Good Example |
| :--- | :--- | :--- | :--- |
| **Variables** | Descriptive noun | `const val = 20;` | `const maximumRetryLimit = 20;` |
| **Booleans** | Use `is`, `has`, `should` | `const valid = true;` | `const isEmailFormatValid = true;` |
| **Functions** | Verb + Noun | `function handle() {}` | `function handleUserRegistration() {}` |

## 2. Logic Encapsulation (Functional Approach)

To keep the code clean and readable, logic should be encapsulated into well-named functions rather than written as complex inline expressions.

### The "Functional If" Rule
Never write complex logic inside `if` statements or other control structures. If a condition requires business logic or multiple comparisons, extract it into a descriptive function.

**❌ Avoid (Complex Inline Logic):**
```typescript
if (user.age >= 18 && user.age <= 60 && user.hasValidLicense && !user.isSuspended) {
    // Logic for eligible drivers
}
```

**✅ Preferred (Encapsulated Logic):**
```typescript
if (isEligibleToDrive(user)) {
    // Intent is immediately clear
}

function isEligibleToDrive(user: User): boolean {
    const isAgeWithinRange = user.age >= 18 && user.age <= 60;
    return isAgeWithinRange && user.hasValidLicense && !user.isSuspended;
}
```

## 3. General Principles

1.  **Single Responsibility:** Each function should do exactly one thing.
2.  **No Magic Numbers:** Use named constants instead of raw numbers in logic.
3.  **Clean Code:** Prioritize readability over "clever" or compact code. If it takes more than 5 seconds to understand a line, it should be refactored.
4.  **DRY (Don't Repeat Yourself):** If you find yourself writing the same logic twice, encapsulate it.

---
*Note: This standard is foundational. When in doubt, prioritize readability and clarity.*
