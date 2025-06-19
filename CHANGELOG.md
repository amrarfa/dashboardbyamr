# Changelog

All notable changes to the LowCalories Dashboard project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced calendar view with improved meal name display
- Payment reference input field for billing
- File upload with base64 conversion for invoices
- Comprehensive coupon system with API integration
- Enhanced subscription preview with multiple view modes

### Changed
- Improved calendar cell sizing for better meal visibility
- Enhanced payment types loading with branch context
- Updated invoice structure for sponsor vs regular customers

### Fixed
- Payment types dropdown loading issues
- Subscription type selection display problems
- Calendar meal name truncation issues

## [1.2.0] - 2024-01-15

### Added
- **Billing & Payment System**
  - Dynamic pricing calculation with tax handling
  - Manual discount and coupon support
  - Multiple payment method integration
  - Sponsor subscription support
  - Invoice file upload functionality

- **Enhanced Subscription Workflow**
  - 5-step subscription creation process
  - Real-time form validation
  - Data persistence across steps
  - Plan preview with multiple view modes

### Changed
- Improved form data persistence using React Context
- Enhanced error handling and user feedback
- Updated UI components for better accessibility

### Fixed
- Form data loss during navigation
- Validation issues in subscription forms
- API integration edge cases

## [1.1.0] - 2024-01-01

### Added
- **Subscription Management**
  - Multi-step subscription creation workflow
  - Plan selection and filtering by categories
  - Meal type and delivery day configuration
  - Plan preview with table, card, calendar, and timeline views

- **Customer Management Enhancements**
  - Advanced customer search and filtering
  - Multiple address and phone number support
  - Customer type management (regular/sponsor)

### Changed
- Redesigned subscription creation flow
- Improved customer selection interface
- Enhanced plan preview visualizations

### Fixed
- Customer data validation issues
- Plan filtering performance improvements
- Mobile responsiveness issues

## [1.0.0] - 2023-12-01

### Added
- **Initial Release**
  - Customer management system
  - Basic subscription creation
  - Plan management interface
  - Responsive dashboard layout

- **Core Features**
  - React 18 with Vite build system
  - Tailwind CSS for styling
  - React Router for navigation
  - Zustand for state management

- **UI Components**
  - Reusable form components
  - Data tables with sorting and filtering
  - Modal dialogs and notifications
  - Loading states and error handling

### Technical
- Modern React architecture with hooks
- Component-based design system
- API service layer
- Responsive design implementation

---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
