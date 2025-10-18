/**
 * Form Helper Utilities
 * Provides humanization and grouping for form validation errors
 */

export const humanizeFieldName = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    first_name: 'First Name',
    last_name: 'Last Name',
    national_id: 'National ID Number',
    email: 'Email Address',
    phone: 'Phone Number',
    date_of_birth: 'Date of Birth',
    marital_status: 'Marital Status',
    nationality: 'Nationality',
    spouse_name: 'Spouse/Partner Name',
    spouse_income: 'Spouse/Partner Income',
    address: 'Full Address',
    district: 'District',
    household_size: 'Household Size',
    children_count: 'Number of Children',
    monthly_income: 'Monthly Income',
    employment_status: 'Employment Status',
    employer_name: 'Employer Name',
    property_address: 'Property Address',
    property_district: 'Property District',
    property_type: 'Property Type',
    property_surface_area: 'Surface Area (m²)',
    title_type: 'Title Type',
    ownership_status: 'Ownership Status',
    requested_amount: 'Requested Subsidy Amount',
    reason_for_request: 'Reason for Request',
    special_circumstances: 'Special Circumstances',
    uploaded_documents: 'Required Documents',
  };
  
  return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const groupErrorsByStep = (errors: Record<string, any>): Record<string, string[]> => {
  const step1Fields = [
    'first_name', 'last_name', 'national_id', 'email', 'phone', 'date_of_birth', 
    'marital_status', 'nationality', 'spouse_name', 'spouse_income',
    'address', 'district', 'household_size', 'children_count', 
    'monthly_income', 'employment_status', 'employer_name'
  ];
  const step2Fields = [
    'property_address', 'property_district', 'property_type', 'property_surface_area', 
    'title_type', 'ownership_status', 'requested_amount', 'reason_for_request', 'special_circumstances'
  ];
  const step3Fields = ['uploaded_documents'];
  
  const grouped: Record<string, string[]> = {
    'Step 1 - Applicant Details': [],
    'Step 2 - Property Details': [],
    'Step 3 - Documents': [],
  };
  
  Object.keys(errors).forEach(field => {
    const message = errors[field]?.message;
    if (message) {
      const humanName = humanizeFieldName(field);
      if (step1Fields.includes(field)) {
        grouped['Step 1 - Applicant Details'].push(`${humanName}: ${message}`);
      } else if (step2Fields.includes(field)) {
        grouped['Step 2 - Property Details'].push(`${humanName}: ${message}`);
      } else if (step3Fields.includes(field)) {
        grouped['Step 3 - Documents'].push(`${humanName}: ${message}`);
      }
    }
  });
  
  return grouped;
};
