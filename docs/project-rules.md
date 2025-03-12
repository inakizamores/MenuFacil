# MenúFácil Project Rules

This document outlines the rules, standards, and practices for the MenúFácil project.

## Code Quality & Standards

### TypeScript

- Use TypeScript for all new code
- Avoid using `any` type unless absolutely necessary
- Define interfaces/types for all data structures
- Use proper typing for function parameters and return values
- Enable strict TypeScript configuration options

### React & Next.js

- Use functional components with hooks
- Properly type component props with TypeScript interfaces
- Use Next.js app router and server components where appropriate
- Follow React best practices (avoid excessive re-renders, memoize callbacks, etc.)
- Use Next.js Image component for all images

### Styling

- Use Tailwind CSS for styling components
- Maintain consistent color usage according to theme configuration
- Create reusable component classes for common patterns using `@apply` directives
- Ensure responsive design for all components
- Follow mobile-first approach to CSS

### Naming Conventions

- Use camelCase for variables, functions, and methods
- Use PascalCase for components, interfaces, types, and classes
- Use kebab-case for file names
- Use UPPER_CASE for constants
- Prefix interface names with 'I' (e.g., `IRestaurant`)
- Prefix type names with 'T' (e.g., `TMenuState`)

### File Organization

- Use feature-based folder structure within the `src` directory
- Group related components in the same folder
- Keep components small and focused on a single responsibility
- Use barrel exports (index.ts files) for cleaner imports
- Use absolute imports with `@/` prefix

### API & Data Handling

- Create type-safe API client functions
- Handle API errors consistently
- Implement proper loading and error states in UI
- Use optimistic updates for better UX
- Cache API responses where appropriate

## Git Workflow

### Branching Strategy

- `main` - Production branch (protected)
- `develop` - Development integration branch (protected)
- Feature branches: `feature/feature-name`
- Bug fix branches: `fix/bug-description`
- Release branches: `release/version-number`
- Hotfix branches: `hotfix/issue-description`

### Commit Messages

- Use conventional commit format: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep subject line under 50 characters
- Use imperative mood in the subject line (e.g., "Add" not "Added")
- Provide detailed descriptions in the commit body if necessary

Example:
```
feat(auth): add email verification flow

- Add email verification page
- Implement verification token logic
- Update authentication hooks
```

### Pull Request Process

1. Create a feature branch from `develop`
2. Develop your feature
3. Write or update tests
4. Ensure code quality (linting, type checking)
5. Push branch and create a Pull Request to `develop`
6. Request review from at least one team member
7. Address any feedback
8. Merge to `develop` when approved

### Code Reviews

- Focus on code quality, readability, and maintainability
- Check for potential bugs and edge cases
- Verify proper error handling
- Ensure adherence to project standards
- Be constructive and respectful in feedback
- Approve only when all concerns are addressed

## Testing Standards

### Unit Testing

- Write unit tests for all utility functions and hooks
- Aim for at least 80% code coverage
- Use Jest for unit testing
- Mock external dependencies

### Component Testing

- Test components in isolation
- Verify component renders correctly with different props
- Test component interactions and state changes
- Use React Testing Library for component testing

### Integration Testing

- Write integration tests for key user flows
- Test API integrations with mock services
- Verify data flows through multiple components

### End-to-End Testing

- Implement E2E tests for critical paths
- Test complete user flows from start to finish
- Use Cypress or Playwright for E2E testing

## Documentation

### Code Documentation

- Add JSDoc comments for functions, components, and complex logic
- Document props for React components
- Explain non-obvious code with inline comments
- Keep comments up-to-date when changing code

### Project Documentation

- Maintain README files for each major directory
- Document architectural decisions
- Update API documentation when endpoints change
- Include setup instructions for new developers

## Development Process

### Feature Development

1. Understand requirements fully before starting
2. Plan the implementation approach
3. Create necessary database schema changes
4. Implement backend functionality
5. Develop frontend components
6. Add tests
7. Document the feature

### Bug Fixing

1. Reproduce the bug
2. Write a failing test that demonstrates the bug
3. Fix the bug
4. Verify the test passes
5. Add regression tests if needed

### Code Review Checklist

- Does the code follow project standards?
- Is the code well-tested?
- Are there any security concerns?
- Is error handling implemented properly?
- Is the code optimized for performance?
- Is the code accessible?
- Is the code properly documented?

## Deployment Process

### Backend (Supabase)

1. Apply database migrations
2. Deploy edge functions
3. Set environment variables
4. Run verification tests
5. Monitor for errors

### Frontend (Vercel)

1. Build the application
2. Configure environment variables
3. Deploy to staging environment
4. Run verification tests
5. Promote to production

## Security Practices

- Never commit secrets or API keys to the repository
- Use environment variables for all sensitive information
- Implement proper authentication and authorization
- Validate all user inputs
- Follow OWASP security best practices
- Regularly update dependencies

## Performance Standards

- Optimize component renders
- Lazy load components and routes
- Optimize images and assets
- Implement proper caching strategies
- Monitor and optimize API response times
- Set performance budgets and enforce them

## Accessibility (A11y)

- Follow WCAG 2.1 AA standards
- Use semantic HTML elements
- Provide alternative text for images
- Ensure proper keyboard navigation
- Maintain adequate color contrast
- Test with screen readers

These rules and standards should be followed by all team members working on the MenúFácil project to ensure code quality, maintainability, and a consistent development process. 