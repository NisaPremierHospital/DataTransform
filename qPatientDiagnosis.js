var config = require('./config');
var patientFields = require('./includes/patientFields');
var patientLeftJoins = require('./includes/patientLeftJoins');
var limits = require('./includes/limits');

var  MongoClient = require('mongodb').MongoClient;
/*
Fields
patient_diagnoses_date_of_entry
patient_diagnoses_diag_type
patient_diagnoses_active
patient_diagnoses_severity
patient_diagnoses_diagnosisNote
patient_diagnoses_diagnosis
patient_diagnoses_status
diagnoses_id
diagnoses_code
diagnoses_type
diagnoses_case
diagnoses_parent_id
diagnoses_oi
*/
async function qPatientDiagnosis({daterange}) {
  // return new Promise((resolve, reject)=>{
    const  mysql = require('mysql2/promise');
    try{
    const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
    console.log("executing", __filename);
    const [rows, fields] = await connection.execute(
      `SELECT patient_diagnoses.patient_ID AS emr_id, 
      date_of_entry AS patient_diagnoses_date_of_entry, 
      \`diag-type\` AS patient_diagnoses_diag_type, 
      encounter_id, 
      patient_diagnoses.active AS patient_diagnoses_active, 
      severity AS patient_diagnoses_severity, 
      diagnosisNote AS patient_diagnoses_diagnosisNote, 
      diagnosis AS patient_diagnoses_diagnosis, 
      _status AS patient_diagnoses_status, 
      diagnoses.id AS diagnoses_id, diagnoses.code AS diagnoses_code, 
      diagnoses.type AS diagnoses_type, diagnoses.case AS diagnoses_case, 
      diagnoses.parent_id AS diagnoses_parent_id, 
      diagnoses.oi AS diagnoses_oi,
      "diagnosis" AS report_type,
      ${patientFields}
      FROM  patient_diagnoses
      LEFT JOIN diagnoses AS diagnoses ON  diagnoses.id = patient_diagnoses.diagnosis
      LEFT JOIN patient_demograph ON patient_demograph.patient_ID = patient_diagnoses.patient_ID
      ${patientLeftJoins}
      WHERE patient_diagnoses.date_of_entry BETWEEN '${daterange.from}' AND '${daterange.to}'
      ${limits}`);
    
    console.log("Running", __filename, "Limit: ", limits, "Range: ", daterange);
    console.log(rows.length, " Records Found", " Copying to mongodb... Goodluck!");
    connection.end();
    if(rows && !rows.length){
      console.log("Nothing to copy");
      return true;
    }
    const client = await MongoClient.connect(config.mongodb.dbn, { useNewUrlParser: true });
    const db = client.db(config.mongodb.db);
    
      const result = await db.collection('nisa_collection').insertMany(JSON.parse(JSON.stringify(rows)));
      console.log(__filename, "completed succesfuly", result.ops.length, " records");
      client.close();
      return true;
    }catch(err){
      console.log(__filename, {err});

      return false;
    }
  // });

}

module.exports = qPatientDiagnosis

// main();