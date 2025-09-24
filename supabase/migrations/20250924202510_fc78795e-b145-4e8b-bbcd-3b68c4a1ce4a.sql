-- ============================================================================
-- Insert Initial Reference Data for IMS System
-- ============================================================================

-- Document types (required documents for subsidy applications)
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order) 
SELECT * FROM (VALUES
('DOCUMENT_TYPE', 'NATIONAL_ID', 'Nationale verklaring + uittreksel', 'National declaration + extract', 'National declaration and extract documents', 1),
('DOCUMENT_TYPE', 'FAMILY_EXTRACT', 'Gezinsuittreksel', 'Family extract', 'Family extract document', 2),
('DOCUMENT_TYPE', 'ID_COPIES', 'ID kopieën (alle huisgenoten)', 'ID copies (all household members)', 'ID copies for all household members', 3),
('DOCUMENT_TYPE', 'PLOT_MAP', 'Perceelkaart', 'Plot map', 'Property plot map', 4),
('DOCUMENT_TYPE', 'OWNERSHIP_DOCS', 'Eigendom/koopakte/beschikking', 'Ownership/purchase deed/allocation', 'Ownership documentation', 5),
('DOCUMENT_TYPE', 'PERMISSION_LETTER', 'Toestemmingsbrief eigenaar/SVS', 'Permission letter owner/SVS', 'Permission letter from owner or SVS', 6),
('DOCUMENT_TYPE', 'AOV_DECLARATION', 'AOV verklaring', 'AOV declaration', 'AOV pension declaration', 7),
('DOCUMENT_TYPE', 'PENSION_STATEMENT', 'Pensioenverklaring', 'Pension statement', 'Pension statement document', 8),
('DOCUMENT_TYPE', 'MORTGAGE_EXTRACT', 'Hypotheek uittreksel', 'Mortgage extract', 'Mortgage statement extract', 9),
('DOCUMENT_TYPE', 'PAY_SLIP', 'Recente loonstrook', 'Recent pay slip', 'Recent salary pay slip', 10),
('DOCUMENT_TYPE', 'EMPLOYER_DECLARATION', 'Werkgeversverklaring', 'Employer declaration', 'Employer declaration document', 11),
('DOCUMENT_TYPE', 'VILLAGE_DECLARATION', 'Dorpsverklaring / DC-verklaring', 'Village/District declaration', 'Village or district commissioner declaration', 12)
) AS t(category, code, name_nl, name_en, description, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.reference_data rd 
    WHERE rd.category = t.category AND rd.code = t.code
);

-- Districts of Suriname
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order) 
SELECT * FROM (VALUES
('DISTRICT', 'PARAMARIBO', 'Paramaribo', 'Paramaribo', 'Paramaribo district', 1),
('DISTRICT', 'WANICA', 'Wanica', 'Wanica', 'Wanica district', 2),
('DISTRICT', 'NICKERIE', 'Nickerie', 'Nickerie', 'Nickerie district', 3),
('DISTRICT', 'CORONIE', 'Coronie', 'Coronie', 'Coronie district', 4),
('DISTRICT', 'SARAMACCA', 'Saramacca', 'Saramacca', 'Saramacca district', 5),
('DISTRICT', 'COMMEWIJNE', 'Commewijne', 'Commewijne', 'Commewijne district', 6),
('DISTRICT', 'MAROWIJNE', 'Marowijne', 'Marowijne', 'Marowijne district', 7),
('DISTRICT', 'PARA', 'Para', 'Para', 'Para district', 8),
('DISTRICT', 'BROKOPONDO', 'Brokopondo', 'Brokopondo', 'Brokopondo district', 9),
('DISTRICT', 'SIPALIWINI', 'Sipaliwini', 'Sipaliwini', 'Sipaliwini district', 10)
) AS t(category, code, name_nl, name_en, description, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.reference_data rd 
    WHERE rd.category = t.category AND rd.code = t.code
);

-- Employment status options
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order) 
SELECT * FROM (VALUES
('EMPLOYMENT_STATUS', 'EMPLOYED', 'In dienst', 'Employed', 'Currently employed', 1),
('EMPLOYMENT_STATUS', 'SELF_EMPLOYED', 'Zelfstandig ondernemer', 'Self-employed', 'Self-employed business owner', 2),
('EMPLOYMENT_STATUS', 'UNEMPLOYED', 'Werkloos', 'Unemployed', 'Currently unemployed', 3),
('EMPLOYMENT_STATUS', 'RETIRED', 'Gepensioneerd', 'Retired', 'Retired from work', 4),
('EMPLOYMENT_STATUS', 'STUDENT', 'Student', 'Student', 'Full-time student', 5),
('EMPLOYMENT_STATUS', 'DISABLED', 'Arbeidsongeschikt', 'Disabled', 'Unable to work due to disability', 6)
) AS t(category, code, name_nl, name_en, description, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.reference_data rd 
    WHERE rd.category = t.category AND rd.code = t.code
);

-- Marital status options
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order) 
SELECT * FROM (VALUES
('MARITAL_STATUS', 'SINGLE', 'Alleenstaand', 'Single', 'Single/unmarried', 1),
('MARITAL_STATUS', 'MARRIED', 'Getrouwd', 'Married', 'Legally married', 2),
('MARITAL_STATUS', 'DIVORCED', 'Gescheiden', 'Divorced', 'Divorced', 3),
('MARITAL_STATUS', 'WIDOWED', 'Weduwe/weduwnaar', 'Widowed', 'Widow or widower', 4),
('MARITAL_STATUS', 'COHABITING', 'Samenwonend', 'Cohabiting', 'Living together unmarried', 5)
) AS t(category, code, name_nl, name_en, description, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.reference_data rd 
    WHERE rd.category = t.category AND rd.code = t.code
);

-- Photo categories for control visits
INSERT INTO public.reference_data (category, code, name_nl, name_en, description, sort_order) 
SELECT * FROM (VALUES
('PHOTO_CATEGORY', 'EXTERIOR_FRONT', 'Buitenkant voorzijde', 'Exterior front', 'Front view of the property', 1),
('PHOTO_CATEGORY', 'EXTERIOR_BACK', 'Buitenkant achterzijde', 'Exterior back', 'Back view of the property', 2),
('PHOTO_CATEGORY', 'FOUNDATION', 'Fundering', 'Foundation', 'Foundation and structural base', 3),
('PHOTO_CATEGORY', 'ROOF', 'Dak', 'Roof', 'Roof condition and structure', 4),
('PHOTO_CATEGORY', 'INTERIOR_LIVING', 'Binnenkant woonkamer', 'Interior living room', 'Living room interior', 5),
('PHOTO_CATEGORY', 'INTERIOR_KITCHEN', 'Binnenkant keuken', 'Interior kitchen', 'Kitchen interior', 6),
('PHOTO_CATEGORY', 'INTERIOR_BATHROOM', 'Binnenkant badkamer', 'Interior bathroom', 'Bathroom interior', 7),
('PHOTO_CATEGORY', 'UTILITIES', 'Nutsvoorzieningen', 'Utilities', 'Water, electricity, sewerage connections', 8),
('PHOTO_CATEGORY', 'DAMAGE', 'Schade/defecten', 'Damage/defects', 'Visible damage or defects', 9)
) AS t(category, code, name_nl, name_en, description, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.reference_data rd 
    WHERE rd.category = t.category AND rd.code = t.code
);