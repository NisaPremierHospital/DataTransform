Consultation (Diagnosis) - DONE as (qPatientVisitNotes.js)
Diagnoses (Diagnosis) - DONE as (qPatientDiagnosis.js)
Procedure/Theatre - Done as (qPatientProcedureNote)
Procedure/NursingTask - Done as (qProcedureNursingTask)
Vital Signs - DONE as (qVitalSigns.js)
Laboratory - DONE as (qLab.js)
Pharmacy - DONE as (qPatientRegimens.js)
Imaging - DONE as (qPatientScan.js)



1 - HTN Patients (High Blood Pressure) - Blood Pressure - 
    - Doctor's note - Based on Doctor's questions to the patients. genealogy
    - Base-line of BP for HTN patients
2 - Diabetic patients
    - HBA 1C (test) Monitoring
    - FBS (test) Indicator, Query
        - Baseline of Sugar Levels
    - Medication (Pharmacy Report) Peculiar drugs common with diabetic patients



## Delete Mongo Single Instance

```sh
sudo apt-get purge mongodb-clients
sudo apt-get purge mongodb-server
sudo rm -R /var/log/mongodb
```

## Installing Cutting Edge
```sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt-get update

```
