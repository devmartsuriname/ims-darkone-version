# IMS Design Guidelines - Darkone Theme Integration

## Core Design Principles

### ⚠️ Critical Rule: NO VISUAL MODIFICATIONS
The IMS will be built using the **existing Darkone theme components exclusively**. No custom styling, layout modifications, or visual changes are permitted. The goal is pixel-perfect consistency with the current admin template.

### Design System Compliance
All IMS components must use:
- Existing Bootstrap 5.3.8 classes and utilities
- Darkone SCSS variables and mixins
- Pre-built component patterns from the theme
- Consistent spacing, typography, and color schemes

## Component Mapping Strategy

### Dashboard Components
**Use**: Existing dashboard components from `src/app/(admin)/dashboards/`
- `Cards.tsx` for application summary cards
- `Chart.tsx` for analytics and reporting
- `User.tsx` for user profile displays
- Bootstrap grid system for responsive layouts

### Form Components
**Use**: Existing form components from `src/components/from/`
- `TextFormInput.tsx` for text inputs
- `PasswordFormInput.tsx` for sensitive fields
- `TextAreaFormInput.tsx` for comments and descriptions
- `DropzoneFormInput.tsx` for file uploads
- `ChoicesFormInput.tsx` for dropdowns and selections

### Table Components
**Use**: GridJS integration from `src/app/(admin)/tables/gridjs/`
- `AllDataTables.tsx` patterns for application lists
- Pre-configured sorting, filtering, and pagination
- Role-based column visibility

### Modal & Overlay Components
**Use**: Bootstrap modal patterns from `src/app/(admin)/base-ui/modals/`
- `AllModals.tsx` for decision workflows
- Offcanvas components for side panels
- Toast notifications for system feedback

## Layout Architecture

### Navigation Integration
**Extend**: `src/assets/data/menu-items.ts`
```typescript
// Add IMS module to existing menu structure
{
  key: 'ims',
  label: 'IMS - Housing',
  isTitle: true
},
{
  key: 'ims-applications',
  label: 'Applications',
  icon: 'solar:home-outline',
  url: '/ims/applications',
  children: [
    { key: 'create-application', label: 'New Application', url: '/ims/applications/create' },
    { key: 'application-list', label: 'Application List', url: '/ims/applications/list' }
  ]
}
```

### Route Structure
**Follow**: Existing route patterns in `src/app/(admin)/`
```
src/app/(admin)/ims/
├── applications/
│   ├── create/page.tsx
│   ├── list/page.tsx
│   └── [id]/page.tsx
├── control/
│   ├── schedule/page.tsx
│   ├── visits/page.tsx
│   └── reports/page.tsx
├── reviews/
│   ├── technical/page.tsx
│   └── social/page.tsx
├── decisions/
│   ├── director/page.tsx
│   └── minister/page.tsx
└── reports/
    ├── analytics/page.tsx
    └── export/page.tsx
```

## Component Design Patterns

### Application Card Layout
**Use**: Card component pattern from `src/app/(admin)/base-ui/cards/`
```tsx
<div className="card">
  <div className="card-header">
    <h5 className="card-title">Application #{application.number}</h5>
    <span className={`badge ${getStatusBadgeClass(application.status)}`}>
      {application.status}
    </span>
  </div>
  <div className="card-body">
    {/* Use existing card body patterns */}
  </div>
</div>
```

### Form Section Layout
**Use**: Form validation patterns from `src/app/(admin)/forms/validation/`
```tsx
<ComponentContainerCard title="Applicant Information">
  <form onSubmit={handleSubmit(onSubmit)}>
    <div className="row">
      <div className="col-md-6">
        <TextFormInput
          name="firstName"
          label="First Name"
          control={control}
          errors={errors}
        />
      </div>
      {/* Follow existing form grid patterns */}
    </div>
  </form>
</ComponentContainerCard>
```

### Data Table Layout
**Use**: GridJS patterns from `src/app/(admin)/tables/gridjs/`
```tsx
<ComponentContainerCard title="Applications">
  <Grid
    data={applications}
    columns={[
      { name: 'Number', id: 'number' },
      { name: 'Applicant', id: 'applicant_name' },
      { name: 'Status', id: 'status' },
      { name: 'Created', id: 'created_at' }
    ]}
    pagination={{ enabled: true, limit: 10 }}
    search={{ enabled: true }}
    sort={{ enabled: true }}
  />
</ComponentContainerCard>
```

### Modal Dialog Layout
**Use**: Modal patterns from `src/app/(admin)/base-ui/modals/`
```tsx
<Modal show={showModal} onHide={handleClose} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Decision Package</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Use existing modal body structure */}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSubmit}>Approve</Button>
  </Modal.Footer>
</Modal>
```

## Responsive Design Requirements

### Mobile-First Approach
**Use**: Bootstrap responsive utilities
- `col-12 col-md-6 col-lg-4` for adaptive grids
- `d-none d-md-block` for progressive disclosure
- `order-*` classes for mobile layout optimization

### Control Department Mobile Interface
**Special Requirements**: Enhanced mobile experience for field work
- Larger touch targets for outdoor use
- Simplified navigation with minimal scrolling
- Camera integration with native file input
- Offline capability indicators

## Color Scheme & Branding

### Status Indicators
**Use**: Existing badge and alert classes
```scss
// Application Status Colors (using Darkone theme variables)
.status-draft { @extend .badge, .bg-secondary; }
.status-review { @extend .badge, .bg-warning; }
.status-approved { @extend .badge, .bg-success; }
.status-rejected { @extend .badge, .bg-danger; }
.status-pending { @extend .badge, .bg-info; }
```

### Priority Indicators
**Use**: Existing alert and button variant classes
- High priority: `bg-danger` or `btn-danger`
- Medium priority: `bg-warning` or `btn-warning`
- Low priority: `bg-info` or `btn-info`

## Icon Strategy

### Icon Library
**Use**: Existing Iconify icon system from `src/components/wrapper/IconifyIcon.tsx`
```tsx
<IconifyIcon icon="solar:home-outline" className="me-2" />
<IconifyIcon icon="solar:document-text-outline" className="me-2" />
<IconifyIcon icon="solar:calendar-outline" className="me-2" />
<IconifyIcon icon="solar:user-check-outline" className="me-2" />
```

### Icon Mapping for IMS
- Applications: `solar:home-outline`
- Documents: `solar:document-text-outline`
- Schedule: `solar:calendar-outline`
- Control: `solar:eye-outline`
- Review: `solar:check-circle-outline`
- Decision: `solar:shield-check-outline`
- Reports: `solar:chart-outline`

## Animation & Transitions

### Loading States
**Use**: Existing spinner components from `src/components/Spinner.tsx`
```tsx
<Spinner size="sm" className="me-2" />
<FallbackLoading />
```

### State Transitions
**Use**: Bootstrap fade and collapse utilities
- Modal transitions: existing modal fade effects
- Content loading: existing card and skeleton patterns
- Form validation: existing validation feedback classes

## Accessibility Requirements

### ARIA Labels
**Follow**: Existing patterns in Darkone components
```tsx
<button
  className="btn btn-primary"
  aria-label="Submit application for review"
  aria-describedby="submit-help-text"
>
  Submit Application
</button>
```

### Keyboard Navigation
**Maintain**: Existing tab order and focus management
- Form navigation: Tab through fields in logical order
- Table navigation: Arrow keys for grid navigation (GridJS)
- Modal focus: Trap focus within modals

### Screen Reader Support
**Use**: Existing semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Form labels and descriptions
- Table headers and captions
- Button and link descriptions

## Performance Guidelines

### Component Lazy Loading
**Follow**: Existing code splitting patterns
```tsx
const ApplicationDetail = lazy(() => import('./components/ApplicationDetail'))
```

### Image Optimization
**Use**: Existing image handling patterns
- Lazy loading for photo galleries
- Responsive image sizing
- WebP format support where available

### Bundle Size Management
**Maintain**: Current optimization strategies
- Tree shaking for unused components
- Code splitting by route
- Minimize third-party dependencies

## Testing Strategy

### Visual Regression Testing
**Ensure**: No visual changes to existing components
- Baseline screenshots of all Darkone components
- Automated visual comparison tests
- Manual QA for responsive behavior

### Component Integration Testing
**Validate**: IMS components work within Darkone framework
- Form validation behavior
- Modal and overlay interactions
- Table sorting and filtering
- Navigation and routing

## Quality Assurance Checklist

### Design System Compliance
- [ ] All components use existing Darkone classes
- [ ] No custom CSS or styling additions
- [ ] Consistent spacing and typography
- [ ] Proper responsive behavior
- [ ] Correct icon usage from Iconify

### Functionality Integration
- [ ] Forms work with existing validation system
- [ ] Tables integrate with GridJS properly
- [ ] Modals follow Bootstrap patterns
- [ ] Navigation extends menu-items correctly
- [ ] Routing follows admin route structure

### Performance Validation
- [ ] No degradation in page load times
- [ ] Proper lazy loading implementation
- [ ] Optimized image handling
- [ ] Bundle size within acceptable limits

### Accessibility Verification
- [ ] Proper ARIA labels and descriptions
- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility maintained
- [ ] Color contrast meets requirements
- [ ] Focus management in modals and forms

## Documentation Requirements

### Component Documentation
**Document**: How each IMS component maps to Darkone patterns
- Component usage examples
- Props and configuration options
- Integration notes and limitations

### Style Guide Adherence
**Verify**: All styling follows Darkone conventions
- Class usage documentation
- Color and spacing references
- Icon usage guidelines
- Responsive behavior notes