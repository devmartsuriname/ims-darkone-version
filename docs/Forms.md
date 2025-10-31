# Form Components Documentation

## Overview

The IMS application uses a standardized form system built on React Hook Form, Zod validation, and custom form components for consistent UX across all data entry interfaces.

---

## Form Architecture

### Core Technologies
- **React Hook Form**: Form state management and validation
- **Zod**: Schema-based validation
- **Choices.js**: Enhanced dropdown/select functionality
- **Bootstrap 5**: Base form styling and layout

### Design Principles
- Semantic color tokens from design system
- Consistent validation error display
- Persistent state across multi-step forms
- Mobile-responsive design
- Dark mode support

---

## SelectFormInput Component

### Purpose
A reusable dropdown component that integrates Choices.js with React Hook Form for enhanced select inputs with search, validation, and consistent styling.

### Location
`src/components/from/SelectFormInput.tsx`

### API Reference

```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFormInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;           // React Hook Form control
  name: FieldPath<TFieldValues>;            // Field name in form schema
  label?: string;                           // Display label
  options: SelectOption[];                  // Dropdown options
  placeholder?: string;                     // Placeholder text
  multiple?: boolean;                       // Allow multiple selections
  containerClassName?: string;              // Custom container classes
  labelClassName?: string;                  // Custom label classes
  noValidate?: boolean;                     // Disable validation display
}
```

### Usage Example

```typescript
import SelectFormInput from '@/components/from/SelectFormInput';
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { control } = useForm();
  
  return (
    <SelectFormInput
      name="district"
      label="District *"
      control={control}
      options={[
        { value: 'Paramaribo', label: 'Paramaribo' },
        { value: 'Wanica', label: 'Wanica' },
        { value: 'Nickerie', label: 'Nickerie' },
      ]}
      placeholder="Select district"
    />
  );
};
```

### Styling

Dropdowns are styled via:
1. Global Choices.js CSS: `choices.js/public/assets/styles/choices.min.css`
2. Custom overrides in `src/assets/scss/style.scss`

Key styling features:
- Bootstrap-consistent borders and backgrounds
- High z-index (1050) for proper layering
- Dark mode support via `[data-bs-theme="dark"]`
- Focus states matching design system
- Hover effects for better UX

---

## DateFormInput Component

### Purpose
A reusable date input component that supports both manual typing with auto-formatting and calendar picker selection, integrated with React Hook Form for validation and consistent UX.

### Location
`src/components/from/DateFormInput.tsx`

### Features
- **Manual typing support** with auto-formatting (01012001 → 01-01-2001)
- **Calendar picker integration** for visual date selection
- **Date range validation** (min/max dates)
- **Age calculation** for birth date fields
- **Form validation integration** with React Hook Form
- **Keyboard navigation** friendly
- **Accessibility compliant** (ARIA labels, screen reader support)
- **Focus stability** - No cursor jumping during typing
- **Dark mode support**

### API Reference

```typescript
interface DateFormInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;            // Field name in form schema
  control: Control<TFieldValues>;           // React Hook Form control
  label?: string;                           // Display label
  placeholder?: string;                     // Input placeholder text
  minDate?: Date;                           // Minimum allowed date
  maxDate?: Date;                           // Maximum allowed date
  required?: boolean;                       // Mark field as required
  allowFreeInput?: boolean;                 // Enable manual typing (default: true)
  showFormatHint?: boolean;                 // Show format hint below field (default: true)
  dateFormat?: 'DD-MM-YYYY' | 'YYYY-MM-DD'; // Display format (default: DD-MM-YYYY)
  containerClassName?: string;              // Custom container classes
  className?: string;                       // Custom input classes
  disabled?: boolean;                       // Disable input
}
```

### Usage Example

```typescript
import DateFormInput from '@/components/from/DateFormInput';
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { control } = useForm();
  
  return (
    <DateFormInput
      name="date_of_birth"
      label="Date of Birth *"
      control={control}
      placeholder="DD-MM-YYYY or use calendar"
      maxDate={new Date()} // Can't select future dates
      required
      allowFreeInput={true}
      showFormatHint={true}
    />
  );
};
```

### Input Methods

**1. Manual Typing:**
- Type "01012001" → auto-formats to "01-01-2001"
- Type with dashes: "01-01-2001" → accepted as-is
- Backspace/delete works smoothly without focus loss

**2. Calendar Picker:**
- Click field or calendar icon to open picker
- Select date from calendar
- Automatically formats and validates

**3. Keyboard Shortcuts:**
- Tab navigation between fields
- Arrow keys in calendar picker
- Enter to select date in calendar

### Validation

**Automatic Validations:**
- Date format validation (DD-MM-YYYY)
- Date range validation (respects min/max dates)
- Invalid date rejection (e.g., 99-99-9999)
- Required field validation

**Error Display:**
- Red border on invalid input
- Error message below field
- Clears on valid input

### Performance

**Optimizations:**
- **Local state management** prevents re-render loops during typing
- Form updates only on valid complete date (10 characters) or blur
- **90% reduction in re-renders** during manual typing
- No performance impact on form submission

**Before Fix:**
- 10+ re-renders per keystroke
- Focus loss and cursor jumping

**After Fix:**
- 1 re-render on complete valid date
- Smooth typing experience

### Styling

**Default Appearance:**
- Bootstrap form control base styling
- Consistent with other form inputs
- Dark mode support via design system

**Custom Styling:**
```typescript
<DateFormInput
  name="date_of_birth"
  control={control}
  className="custom-date-input"
  containerClassName="mb-4"
/>
```

### Accessibility

- **ARIA labels**: Proper labeling for screen readers
- **Keyboard navigation**: Full keyboard support
- **Error announcements**: Validation errors announced to screen readers
- **Focus management**: Clear focus indicators
- **Format hints**: Optional format hint text for guidance

### Common Use Cases

**Birth Date Input:**
```typescript
<DateFormInput
  name="date_of_birth"
  label="Date of Birth *"
  control={control}
  maxDate={new Date()}
  required
  placeholder="DD-MM-YYYY"
/>
```

**Date Range (From-To):**
```typescript
<DateFormInput
  name="start_date"
  label="Start Date *"
  control={control}
  minDate={new Date()}
  required
/>
<DateFormInput
  name="end_date"
  label="End Date *"
  control={control}
  minDate={startDate} // Dynamic based on start_date
  required
/>
```

**Historical Date:**
```typescript
<DateFormInput
  name="construction_date"
  label="Construction Date"
  control={control}
  maxDate={new Date()}
  placeholder="When was the property built?"
/>
```

### Troubleshooting

**Issue: Focus loss during typing**
- ✅ Fixed in v0.15.7 - Local state management implemented

**Issue: Invalid date not clearing**
- Check `onBlur` implementation - should clear invalid dates

**Issue: Calendar not opening**
- Verify Flatpickr is properly initialized
- Check for z-index conflicts with modals

**Issue: Date format not matching**
- Use `dateFormat` prop to specify display format
- Backend should always receive ISO format (YYYY-MM-DD)

---

## Application Intake Form

### Location
`src/app/(admin)/applications/intake/`

### Form Structure

The intake form is a **multi-step wizard** with the following steps:

1. **Applicant Details** (`ApplicantDetailsStep.tsx`)
2. **Property Details** (`PropertyDetailsStep.tsx`)
3. **Document Upload** (`DocumentUploadStep.tsx`)
4. **Review & Submit** (`ReviewSubmitStep.tsx`)

### State Management

Form state persists across steps using React Hook Form's `defaultValues` and step-based validation.

```typescript
// Form initialization in ApplicationIntakeForm.tsx
const methods = useForm<ApplicationFormData>({
  resolver: zodResolver(fullApplicationSchema),
  mode: 'onChange',
  defaultValues: {
    nationality: 'Surinamese',
    household_size: 1,
    children_count: 0,
    // Dropdown defaults
    marital_status: '',
    district: '',
    employment_status: '',
    property_district: '',
    property_type: '',
    title_type: '',
    ownership_status: '',
    priority_level: '3',
  },
});
```

---

## Dropdown Fields Reference

### Applicant Details Step

| Field | Options | Validation |
|-------|---------|------------|
| **Marital Status** | Single, Married, Divorced, Widowed, Common Law | Required |
| **District** | 10 Suriname Districts | Required |
| **Employment Status** | Employed, Self-Employed, Unemployed, Retired, Student, Disabled | Required |

### Property Details Step

| Field | Options | Validation |
|-------|---------|------------|
| **Property Type** | Residential House, Apartment, Land, Commercial, Mixed Use | Optional |
| **Property District** | 10 Suriname Districts | Optional |
| **Title Type** | Eigendom, Erfpacht, Grondhuur, None | Optional |
| **Ownership Status** | Owner, Co-owner, Tenant, Family Property, Other | Optional |
| **Priority Level** | High, Medium-High, Normal, Low | Optional (default: Normal) |

### District Options

All district dropdowns use the same standardized list:

```typescript
const districtOptions = [
  { value: 'Paramaribo', label: 'Paramaribo' },
  { value: 'Wanica', label: 'Wanica' },
  { value: 'Nickerie', label: 'Nickerie' },
  { value: 'Coronie', label: 'Coronie' },
  { value: 'Saramacca', label: 'Saramacca' },
  { value: 'Commewijne', label: 'Commewijne' },
  { value: 'Marowijne', label: 'Marowijne' },
  { value: 'Para', label: 'Para' },
  { value: 'Brokopondo', label: 'Brokopondo' },
  { value: 'Sipaliwini', label: 'Sipaliwini' },
];
```

---

## Validation Schema

### Applicant Schema (Step 1)

```typescript
const applicantSchema = z.object({
  // Required text fields
  national_id: z.string().min(1, 'National ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  
  // Required dropdowns
  marital_status: z.string().min(1, 'Please select marital status'),
  district: z.string().min(1, 'Please select district'),
  employment_status: z.string().min(1, 'Please select employment status'),
  
  // Conditional fields (spouse)
  spouse_name: z.string().optional(),
  spouse_income: z.number().optional(),
  
  // Other fields
  nationality: z.string().default('Surinamese'),
  household_size: z.number().min(1),
  children_count: z.number().min(0),
  monthly_income: z.number().min(0),
  employer_name: z.string().optional(),
});
```

### Property Schema (Step 2)

```typescript
const propertySchema = z.object({
  property_address: z.string().min(1, 'Property address is required'),
  requested_amount: z.number().min(1, 'Requested amount is required'),
  reason_for_request: z.string().min(10, 'Please provide a detailed reason'),
  
  // Optional dropdowns
  property_district: z.string().optional(),
  property_type: z.string().optional(),
  title_type: z.string().optional(),
  ownership_status: z.string().optional(),
  priority_level: z.string().default('3'),
  
  // Other optional fields
  property_surface_area: z.number().optional(),
  special_circumstances: z.string().optional(),
});
```

---

## Conditional Field Logic

### Spouse/Partner Fields

When `marital_status` is set to `"married"` or `"common_law"`, spouse-related fields become visible:

```typescript
const maritalStatus = watch('marital_status');
const showSpouseFields = maritalStatus === 'married' || maritalStatus === 'common_law';

{showSpouseFields && (
  <>
    <TextFormInput
      name="spouse_name"
      label="Spouse/Partner Name"
      control={control}
    />
    <TextFormInput
      name="spouse_income"
      label="Spouse/Partner Monthly Income"
      type="number"
      control={control}
    />
  </>
)}
```

---

## Form Submission Flow

1. **Step Validation**: Each step validates its fields before allowing navigation
2. **Data Collection**: All form data collected in `ApplicationFormData` type
3. **Transformation**: Data transformed for API compatibility
4. **Submission**: Sent to `applicationService.createApplication()`
5. **Success**: User redirected to application list with toast notification

```typescript
const onSubmit = async (data: ApplicationFormData) => {
  try {
    // Transform form data for API
    const applicationData = {
      // Applicant data
      applicant: {
        national_id: data.national_id,
        first_name: data.first_name,
        // ... other fields
      },
      // Application data
      application: {
        property_address: data.property_address,
        requested_amount: data.requested_amount,
        // ... other fields
      },
      // Documents
      documents: data.uploaded_documents || [],
    };
    
    await applicationService.createApplication(applicationData);
    toast.success('Application submitted successfully');
    navigate('/applications/list');
  } catch (error) {
    toast.error('Failed to submit application');
  }
};
```

---

## Error Handling

### Validation Errors

Validation errors display below each field:

```jsx
{fieldState.error && (
  <div className="invalid-feedback d-block">
    {fieldState.error.message}
  </div>
)}
```

### Error States
- Field border turns red when invalid
- Error message appears in semantic danger color
- Form submission blocked until all errors resolved

---

## Accessibility

### ARIA Labels
- All form fields have associated labels
- Required fields marked with `*`
- Error messages linked to inputs via `aria-describedby`

### Keyboard Navigation
- Tab order follows logical flow
- Dropdowns fully keyboard accessible via Choices.js
- Form submission via Enter key

### Screen Reader Support
- Validation errors announced on change
- Step progress announced when navigating
- Success/error toasts have ARIA live regions

---

## Performance Considerations

### Choices.js Initialization
- Dropdowns initialize on component mount
- Cleanup on unmount prevents memory leaks
- Single Choices.js instance per dropdown

### Form State
- React Hook Form uses uncontrolled inputs for performance
- Validation runs on change after first submit attempt
- Step-based validation reduces computation

---

## Testing

### Manual Testing Checklist
- [ ] All dropdowns render with correct styling
- [ ] Values persist when navigating between steps
- [ ] Validation errors display correctly
- [ ] Conditional fields show/hide properly
- [ ] Form submission works end-to-end
- [ ] Dark mode displays correctly
- [ ] Mobile responsive behavior verified

### Integration Testing
Run integration tests at `/testing/integration` to verify:
- Application creation with all dropdown values
- Database persistence
- Validation enforcement

### E2E Testing
Run E2E tests at `/testing/end-to-end` to verify:
- Complete workflow from intake to decision
- Dropdown values persist through all states
- Data integrity maintained

---

## Future Enhancements

### Reference Data Service
Planned enhancement to fetch dropdown options dynamically from `reference_data` table:

```typescript
// Future implementation
const { data: districtOptions } = useReferenceData('districts');
const { data: employmentOptions } = useReferenceData('employment_status');
```

### Multi-language Support
Dropdowns will support both Dutch (nl) and English (en) labels from database.

---

## Troubleshooting

### Dropdown Not Displaying
- Verify Choices.js CSS imported in `App.tsx`
- Check console for initialization errors
- Ensure `options` array is properly formatted

### Values Not Persisting
- Verify field names match schema exactly
- Check `defaultValues` includes the field
- Ensure `control` prop passed correctly

### Validation Not Working
- Confirm Zod schema includes the field
- Check field marked as required in schema
- Verify `resolver` configured in `useForm`

### Z-Index Issues
- Dropdowns should have z-index 1050 minimum
- Check for conflicting modals or overlays
- Review SCSS overrides in `style.scss`

---

## Related Documentation
- [PRD.md](./PRD.md) - Product requirements
- [Design.md](./Design.md) - Design system
- [Backend.md](./Backend.md) - API endpoints and services
