-- Populate reference data for IMS Housing Subsidy System

-- Document Types (12 required documents)
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('DOCUMENT_TYPE', 'NATIONALE_VERKLARING', 'Nationale verklaring + uittreksel', 'National declaration + extract', 'Official national identity declaration and extract', 1, true),
('DOCUMENT_TYPE', 'GEZINSUITTREKSEL', 'Gezinsuittreksel', 'Family extract', 'Official family composition document', 2, true),
('DOCUMENT_TYPE', 'ID_COPIES', 'ID kopieën (alle huisgenoten)', 'ID copies (all household members)', 'Identity document copies for all household members', 3, true),
('DOCUMENT_TYPE', 'PERCEELKAART', 'Perceelkaart', 'Plot map', 'Official property plot map/survey', 4, true),
('DOCUMENT_TYPE', 'EIGENDOM_AKTE', 'Eigendom/koopakte/beschikking', 'Ownership/purchase deed/decision', 'Property ownership documentation', 5, true),
('DOCUMENT_TYPE', 'TOESTEMMINGSBRIEF', 'Toestemmingsbrief eigenaar/SVS', 'Owner/SVS permission letter', 'Permission letter from property owner or SVS', 6, true),
('DOCUMENT_TYPE', 'AOV_VERKLARING', 'AOV verklaring', 'AOV declaration', 'Senior pension declaration document', 7, true),
('DOCUMENT_TYPE', 'PENSIOENVERKLARING', 'Pensioenverklaring', 'Pension statement', 'Official pension statement', 8, true),
('DOCUMENT_TYPE', 'HYPOTHEEK_UITTREKSEL', 'Hypotheek uittreksel', 'Mortgage statement', 'Current mortgage statement/extract', 9, true),
('DOCUMENT_TYPE', 'LOONSTROOK', 'Recente loonstrook', 'Recent pay slip', 'Most recent salary/wage slip', 10, true),
('DOCUMENT_TYPE', 'WERKGEVERSVERKLARING', 'Werkgeversverklaring', 'Employer declaration', 'Official employer statement/declaration', 11, true),
('DOCUMENT_TYPE', 'DORPSVERKLARING', 'Dorpsverklaring / DC-verklaring', 'Village/DC declaration', 'Village or District Commissioner declaration', 12, true);

-- Application States
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('APPLICATION_STATE', 'DRAFT', 'Concept', 'Draft', 'Initial application creation state', 1, true),
('APPLICATION_STATE', 'INTAKE_REVIEW', 'Intake controle', 'Intake review', 'Front office review and validation', 2, true),
('APPLICATION_STATE', 'CONTROL_ASSIGN', 'Controle toewijzing', 'Control assignment', 'Assignment to control department', 3, true),
('APPLICATION_STATE', 'CONTROL_VISIT_SCHEDULED', 'Controle bezoek gepland', 'Control visit scheduled', 'Property inspection visit scheduled', 4, true),
('APPLICATION_STATE', 'CONTROL_IN_PROGRESS', 'Controle lopende', 'Control in progress', 'On-site inspection in progress', 5, true),
('APPLICATION_STATE', 'TECHNICAL_REVIEW', 'Technische beoordeling', 'Technical review', 'Technical assessment and report preparation', 6, true),
('APPLICATION_STATE', 'SOCIAL_REVIEW', 'Sociale beoordeling', 'Social review', 'Social circumstances assessment', 7, true),
('APPLICATION_STATE', 'DIRECTOR_REVIEW', 'Directeur beoordeling', 'Director review', 'DVH Director review and recommendation', 8, true),
('APPLICATION_STATE', 'MINISTER_DECISION', 'Minister beslissing', 'Minister decision', 'Final ministerial decision', 9, true),
('APPLICATION_STATE', 'CLOSURE', 'Afgerond', 'Closure', 'Application completed successfully', 10, true),
('APPLICATION_STATE', 'REJECTED', 'Afgewezen', 'Rejected', 'Application rejected', 11, true),
('APPLICATION_STATE', 'ON_HOLD', 'Opgeschort', 'On hold', 'Application temporarily suspended', 12, true),
('APPLICATION_STATE', 'NEEDS_MORE_INFO', 'Meer informatie nodig', 'Needs more information', 'Additional information required', 13, true);

-- Property Types
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('PROPERTY_TYPE', 'WOODEN_HOUSE', 'Houten woning', 'Wooden house', 'Traditional wooden construction house', 1, true),
('PROPERTY_TYPE', 'CONCRETE_HOUSE', 'Betonnen woning', 'Concrete house', 'Concrete block or poured concrete house', 2, true),
('PROPERTY_TYPE', 'MIXED_CONSTRUCTION', 'Gemengde constructie', 'Mixed construction', 'Combination of materials construction', 3, true),
('PROPERTY_TYPE', 'APARTMENT', 'Appartement', 'Apartment', 'Multi-story residential unit', 4, true),
('PROPERTY_TYPE', 'TRADITIONAL_HUT', 'Traditionele hut', 'Traditional hut', 'Traditional indigenous construction', 5, true);

-- Districts of Suriname
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('DISTRICT', 'PARAMARIBO', 'Paramaribo', 'Paramaribo', 'Capital district', 1, true),
('DISTRICT', 'WANICA', 'Wanica', 'Wanica', 'Wanica district', 2, true),
('DISTRICT', 'NICKERIE', 'Nickerie', 'Nickerie', 'Nickerie district', 3, true),
('DISTRICT', 'CORONIE', 'Coronie', 'Coronie', 'Coronie district', 4, true),
('DISTRICT', 'SARAMACCA', 'Saramacca', 'Saramacca', 'Saramacca district', 5, true),
('DISTRICT', 'COMMEWIJNE', 'Commewijne', 'Commewijne', 'Commewijne district', 6, true),
('DISTRICT', 'MAROWIJNE', 'Marowijne', 'Marowijne', 'Marowijne district', 7, true),
('DISTRICT', 'PARA', 'Para', 'Para', 'Para district', 8, true),
('DISTRICT', 'BROKOPONDO', 'Brokopondo', 'Brokopondo', 'Brokopondo district', 9, true),
('DISTRICT', 'SIPALIWINI', 'Sipaliwini', 'Sipaliwini', 'Sipaliwini district', 10, true);

-- Marital Status
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('MARITAL_STATUS', 'SINGLE', 'Alleenstaand', 'Single', 'Unmarried/single status', 1, true),
('MARITAL_STATUS', 'MARRIED', 'Getrouwd', 'Married', 'Legally married', 2, true),
('MARITAL_STATUS', 'DIVORCED', 'Gescheiden', 'Divorced', 'Legally divorced', 3, true),
('MARITAL_STATUS', 'WIDOWED', 'Weduwe/weduwnaar', 'Widowed', 'Spouse deceased', 4, true),
('MARITAL_STATUS', 'COHABITING', 'Samenwonend', 'Cohabiting', 'Living together unmarried', 5, true),
('MARITAL_STATUS', 'SEPARATED', 'Gescheiden van tafel en bed', 'Separated', 'Legally separated', 6, true);

-- Employment Status
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('EMPLOYMENT_STATUS', 'EMPLOYED_FULLTIME', 'Voltijd werkzaam', 'Full-time employed', 'Working full-time employment', 1, true),
('EMPLOYMENT_STATUS', 'EMPLOYED_PARTTIME', 'Deeltijd werkzaam', 'Part-time employed', 'Working part-time employment', 2, true),
('EMPLOYMENT_STATUS', 'SELF_EMPLOYED', 'Zelfstandige', 'Self-employed', 'Self-employed/freelancer', 3, true),
('EMPLOYMENT_STATUS', 'UNEMPLOYED', 'Werkloos', 'Unemployed', 'Currently unemployed', 4, true),
('EMPLOYMENT_STATUS', 'RETIRED', 'Gepensioneerd', 'Retired', 'Retired from work', 5, true),
('EMPLOYMENT_STATUS', 'STUDENT', 'Student', 'Student', 'Full-time student', 6, true),
('EMPLOYMENT_STATUS', 'DISABLED', 'Arbeidsongeschikt', 'Disabled/unable to work', 'Unable to work due to disability', 7, true),
('EMPLOYMENT_STATUS', 'HOMEMAKER', 'Huisvrouw/huisman', 'Homemaker', 'Full-time homemaker', 8, true);

-- Nationality Options
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('NATIONALITY', 'SURINAMESE', 'Surinaams', 'Surinamese', 'Surinamese citizen', 1, true),
('NATIONALITY', 'DUTCH', 'Nederlands', 'Dutch', 'Dutch citizen', 2, true),
('NATIONALITY', 'GUYANESE', 'Guyaans', 'Guyanese', 'Guyanese citizen', 3, true),
('NATIONALITY', 'BRAZILIAN', 'Braziliaans', 'Brazilian', 'Brazilian citizen', 4, true),
('NATIONALITY', 'FRENCH', 'Frans', 'French', 'French citizen', 5, true),
('NATIONALITY', 'OTHER', 'Andere', 'Other', 'Other nationality', 99, true);

-- Title Types
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('TITLE_TYPE', 'OWNERSHIP_TITLE', 'Eigendomstitel', 'Ownership title', 'Full legal ownership title', 1, true),
('TITLE_TYPE', 'LONG_LEASE', 'Erfpacht', 'Long lease/hereditary lease', 'Long-term hereditary lease arrangement', 2, true),
('TITLE_TYPE', 'GOVERNMENT_ALLOCATION', 'Regeringstoewijzing', 'Government allocation', 'Government allocated land title', 3, true),
('TITLE_TYPE', 'CUSTOMARY_TITLE', 'Gewoonterecht', 'Customary title', 'Traditional/customary land rights', 4, true),
('TITLE_TYPE', 'RENTAL', 'Huur', 'Rental', 'Rental/lease agreement', 5, true);

-- Ownership Status
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('OWNERSHIP_STATUS', 'OWNER', 'Eigenaar', 'Owner', 'Property owner', 1, true),
('OWNERSHIP_STATUS', 'TENANT', 'Huurder', 'Tenant', 'Property tenant', 2, true),
('OWNERSHIP_STATUS', 'FAMILY_MEMBER', 'Familielid', 'Family member', 'Living with family member', 3, true),
('OWNERSHIP_STATUS', 'CARETAKER', 'Beheerder', 'Caretaker', 'Property caretaker', 4, true);

-- Service Types
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('SERVICE_TYPE', 'SUBSIDY', 'Bouwsubsidie', 'Building subsidy', 'Housing construction/renovation subsidy', 1, true),
('SERVICE_TYPE', 'REPAIR_GRANT', 'Reparatiebeurs', 'Repair grant', 'Home repair assistance grant', 2, true),
('SERVICE_TYPE', 'EMERGENCY_HOUSING', 'Noodhuisvesting', 'Emergency housing', 'Emergency housing assistance', 3, true);

-- Priority Levels
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('PRIORITY_LEVEL', 'LOW', 'Laag', 'Low', 'Low priority level', 1, true),
('PRIORITY_LEVEL', 'NORMAL', 'Normaal', 'Normal', 'Normal priority level', 2, true),
('PRIORITY_LEVEL', 'HIGH', 'Hoog', 'High', 'High priority level', 3, true),
('PRIORITY_LEVEL', 'URGENT', 'Urgent', 'Urgent', 'Urgent priority level', 4, true),
('PRIORITY_LEVEL', 'EMERGENCY', 'Noodgeval', 'Emergency', 'Emergency priority level', 5, true);

-- Photo Categories for Control Visits
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('PHOTO_CATEGORY', 'EXTERIOR_FRONT', 'Voorkant exterieur', 'Exterior front', 'Front view of property exterior', 1, true),
('PHOTO_CATEGORY', 'EXTERIOR_BACK', 'Achterkant exterieur', 'Exterior back', 'Back view of property exterior', 2, true),
('PHOTO_CATEGORY', 'EXTERIOR_SIDES', 'Zijkanten exterieur', 'Exterior sides', 'Side views of property exterior', 3, true),
('PHOTO_CATEGORY', 'FOUNDATION', 'Fundering', 'Foundation', 'Foundation condition photos', 4, true),
('PHOTO_CATEGORY', 'ROOF', 'Dak', 'Roof', 'Roof condition photos', 5, true),
('PHOTO_CATEGORY', 'WALLS', 'Muren', 'Walls', 'Wall condition photos', 6, true),
('PHOTO_CATEGORY', 'FLOORS', 'Vloeren', 'Floors', 'Floor condition photos', 7, true),
('PHOTO_CATEGORY', 'WINDOWS_DOORS', 'Ramen en deuren', 'Windows and doors', 'Windows and doors condition', 8, true),
('PHOTO_CATEGORY', 'INTERIOR_LIVING', 'Interieur woonruimte', 'Interior living space', 'Interior living area photos', 9, true),
('PHOTO_CATEGORY', 'INTERIOR_KITCHEN', 'Interieur keuken', 'Interior kitchen', 'Kitchen area photos', 10, true),
('PHOTO_CATEGORY', 'INTERIOR_BATHROOM', 'Interieur badkamer', 'Interior bathroom', 'Bathroom/sanitation photos', 11, true),
('PHOTO_CATEGORY', 'UTILITIES', 'Nutsvoorzieningen', 'Utilities', 'Water, electricity, sewerage connections', 12, true),
('PHOTO_CATEGORY', 'DEFECTS', 'Gebreken', 'Defects', 'Structural defects and issues', 13, true),
('PHOTO_CATEGORY', 'SURROUNDINGS', 'Omgeving', 'Surroundings', 'Property surroundings and access', 14, true);

-- Task Types
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('TASK_TYPE', 'WORKFLOW_STEP', 'Workflow stap', 'Workflow step', 'Automatic workflow step task', 1, true),
('TASK_TYPE', 'DOCUMENT_REVIEW', 'Document controle', 'Document review', 'Document verification task', 2, true),
('TASK_TYPE', 'INSPECTION', 'Inspectie', 'Inspection', 'Property inspection task', 3, true),
('TASK_TYPE', 'REPORT_PREPARATION', 'Rapport voorbereiding', 'Report preparation', 'Report writing and preparation', 4, true),
('TASK_TYPE', 'FOLLOW_UP', 'Follow-up', 'Follow-up', 'Follow-up action required', 5, true),
('TASK_TYPE', 'ADMIN', 'Administratief', 'Administrative', 'Administrative task', 6, true);

-- Verification Status for Documents
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('VERIFICATION_STATUS', 'PENDING', 'In afwachting', 'Pending', 'Awaiting verification', 1, true),
('VERIFICATION_STATUS', 'VERIFIED', 'Geverifieerd', 'Verified', 'Document verified and approved', 2, true),
('VERIFICATION_STATUS', 'REJECTED', 'Afgewezen', 'Rejected', 'Document rejected/invalid', 3, true),
('VERIFICATION_STATUS', 'NEEDS_REVIEW', 'Herziening nodig', 'Needs review', 'Requires additional review', 4, true);

-- Visit Types
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('VISIT_TYPE', 'TECHNICAL_INSPECTION', 'Technische inspectie', 'Technical inspection', 'Technical property assessment', 1, true),
('VISIT_TYPE', 'SOCIAL_ASSESSMENT', 'Sociale beoordeling', 'Social assessment', 'Social circumstances evaluation', 2, true),
('VISIT_TYPE', 'FOLLOW_UP_VISIT', 'Follow-up bezoek', 'Follow-up visit', 'Follow-up inspection visit', 3, true),
('VISIT_TYPE', 'FINAL_INSPECTION', 'Eindinspectie', 'Final inspection', 'Final completion inspection', 4, true);

-- Income Types
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('INCOME_TYPE', 'SALARY', 'Salaris', 'Salary', 'Regular employment salary', 1, true),
('INCOME_TYPE', 'PENSION', 'Pensioen', 'Pension', 'Retirement pension income', 2, true),
('INCOME_TYPE', 'BUSINESS', 'Bedrijfsinkomsten', 'Business income', 'Self-employment/business income', 3, true),
('INCOME_TYPE', 'RENTAL', 'Huurinkomsten', 'Rental income', 'Property rental income', 4, true),
('INCOME_TYPE', 'BENEFITS', 'Uitkeringen', 'Benefits', 'Government benefits/allowances', 5, true),
('INCOME_TYPE', 'OTHER', 'Andere', 'Other', 'Other income sources', 99, true);

-- Weather Conditions (for control visits)
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active) VALUES
('WEATHER_CONDITION', 'SUNNY', 'Zonnig', 'Sunny', 'Clear and sunny weather', 1, true),
('WEATHER_CONDITION', 'CLOUDY', 'Bewolkt', 'Cloudy', 'Cloudy/overcast weather', 2, true),
('WEATHER_CONDITION', 'RAINY', 'Regenachtig', 'Rainy', 'Rainy weather conditions', 3, true),
('WEATHER_CONDITION', 'STORMY', 'Stormachtig', 'Stormy', 'Stormy weather conditions', 4, true);

-- System Configuration
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active, metadata) VALUES
('SYSTEM_CONFIG', 'MAX_PHOTO_COUNT', 'Maximum aantal foto''s', 'Maximum photo count', 'Maximum photos per control visit', 1, true, '{"value": 20, "type": "number"}'),
('SYSTEM_CONFIG', 'MIN_PHOTO_COUNT', 'Minimum aantal foto''s', 'Minimum photo count', 'Minimum photos required for approval', 1, true, '{"value": 5, "type": "number"}'),
('SYSTEM_CONFIG', 'DEFAULT_SLA_HOURS', 'Standaard SLA uren', 'Default SLA hours', 'Default SLA period in hours', 1, true, '{"value": 72, "type": "number"}'),
('SYSTEM_CONFIG', 'MAX_DOCUMENT_SIZE_MB', 'Maximum document grootte MB', 'Maximum document size MB', 'Maximum file size for document uploads', 1, true, '{"value": 50, "type": "number"}'),
('SYSTEM_CONFIG', 'MAX_PHOTO_SIZE_MB', 'Maximum foto grootte MB', 'Maximum photo size MB', 'Maximum file size for photo uploads', 1, true, '{"value": 25, "type": "number"}');

-- Notification Templates
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order, is_active, metadata) VALUES
('NOTIFICATION_TEMPLATE', 'APPLICATION_SUBMITTED', 'Aanvraag ingediend', 'Application submitted', 'Notification when application is submitted', 1, true, '{"subject": "Uw aanvraag is ontvangen", "template": "application_submitted"}'),
('NOTIFICATION_TEMPLATE', 'DOCUMENT_REQUIRED', 'Document vereist', 'Document required', 'Notification for missing documents', 2, true, '{"subject": "Aanvullende documenten nodig", "template": "document_required"}'),
('NOTIFICATION_TEMPLATE', 'VISIT_SCHEDULED', 'Bezoek gepland', 'Visit scheduled', 'Notification when control visit is scheduled', 3, true, '{"subject": "Controle bezoek gepland", "template": "visit_scheduled"}'),
('NOTIFICATION_TEMPLATE', 'APPLICATION_APPROVED', 'Aanvraag goedgekeurd', 'Application approved', 'Notification when application is approved', 4, true, '{"subject": "Uw aanvraag is goedgekeurd", "template": "application_approved"}'),
('NOTIFICATION_TEMPLATE', 'APPLICATION_REJECTED', 'Aanvraag afgewezen', 'Application rejected', 'Notification when application is rejected', 5, true, '{"subject": "Uw aanvraag is afgewezen", "template": "application_rejected"}');

COMMIT;