# Contributing to LowCalories Dashboard

Thank you for your interest in contributing to the LowCalories Dashboard! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/lowcalories-dashboard.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use **ES6+** features
- Follow **React best practices**
- Use **functional components** with hooks
- Implement **responsive design** with Tailwind CSS
- Write **clean, readable code** with meaningful variable names

### Component Structure
```jsx
// Component template
import React, { useState, useEffect } from 'react'
import { IconName } from 'lucide-react'

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue)

  useEffect(() => {
    // Side effects
  }, [dependencies])

  const handleFunction = () => {
    // Event handlers
  }

  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  )
}

export default ComponentName
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `CustomerForm.jsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useCustomerData.js`)
- **Utilities**: camelCase (e.g., `apiService.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

### Folder Structure
```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── customers/       # Customer-specific components
│   └── subscriptions/   # Subscription-specific components
├── contexts/            # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
└── store/              # State management
```

## 🔧 Development Workflow

### Branch Naming
- **Feature**: `feature/description-of-feature`
- **Bug Fix**: `fix/description-of-bug`
- **Hotfix**: `hotfix/critical-issue`
- **Documentation**: `docs/update-description`

### Commit Messages
Follow conventional commit format:
```
type(scope): description

Examples:
feat(subscription): add meal plan preview
fix(customer): resolve form validation issue
docs(readme): update installation instructions
style(ui): improve button hover effects
```

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request with:
   - Clear title and description
   - Screenshots for UI changes
   - Test instructions

## 🧪 Testing Guidelines

### Manual Testing
- Test on different screen sizes
- Verify form validations
- Check API integrations
- Test error scenarios

### Code Quality
- Run linting: `npm run lint`
- Fix any ESLint warnings
- Ensure responsive design
- Verify accessibility features

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Document component props with PropTypes or TypeScript
- Include usage examples for reusable components

### README Updates
- Update feature list for new functionality
- Add setup instructions for new dependencies
- Include screenshots for UI changes

## 🎨 UI/UX Guidelines

### Design Principles
- **Consistency**: Use existing design patterns
- **Accessibility**: Ensure ARIA labels and keyboard navigation
- **Responsiveness**: Mobile-first approach
- **Performance**: Optimize for fast loading

### Tailwind CSS Usage
- Use utility classes consistently
- Follow the existing color scheme
- Implement dark mode support
- Use responsive prefixes (sm:, md:, lg:, xl:)

### Component Guidelines
- Keep components small and focused
- Use composition over inheritance
- Implement proper loading states
- Handle error states gracefully

## 🐛 Bug Reports

### Before Submitting
- Check existing issues
- Reproduce the bug
- Test in different browsers
- Gather system information

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 1.0.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives**
Other solutions considered

**Additional Context**
Screenshots, mockups, etc.
```

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Code Review**: Submit PRs for feedback

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to LowCalories Dashboard! 🎉
