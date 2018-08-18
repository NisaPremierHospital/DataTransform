module.exports = 'patient_demograph.fname AS patient_first_name, \
patient_demograph.lname AS patient_last_name, \
patient_demograph.mname AS patient_middle_name, \
patient_demograph.legacy_patient_id AS patient_legacy_number, \
patient_demograph.date_of_birth AS date_of_birth, \
patient_demograph.phonenumber AS phone_number, \
patient_demograph.sex AS sex, \
patient_demograph.title AS patient_title, \
patient_demograph.deceased AS patient_is_deceased, \
patient_demograph.active AS patient_is_active, \
insurance_schemes.scheme_name AS provider_or_scheme, \
patient_demograph.email AS patient_email, \
patient_demograph.nationality AS patient_nationality, \
patient_demograph.occupation AS patient_occupation, \
patient_demograph.work_address AS patient_work_address, \
patient_demograph.address AS patient_address';