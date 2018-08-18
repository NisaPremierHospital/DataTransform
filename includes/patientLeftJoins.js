module.exports = '\
LEFT JOIN insurance ON insurance.patient_id = patient_demograph.patient_ID \
LEFT JOIN insurance_schemes ON insurance_schemes.id = insurance.insurance_scheme';