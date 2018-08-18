var config = require('./config');
var patientFields = require('./includes/patientFields');
var patientLeftJoins = require('./includes/patientLeftJoins');
var limits = require('./includes/limits');

var  MongoClient = require('mongodb').MongoClient;

/*
Fields
consultation_date_of_entry
consultation_diagnoses
consultation_note_type
consultation_reason
*/
async function qPatientVisitNotes({daterange}) {
  // return new Promise((resolve, reject)=>{
  const  mysql = require('mysql2/promise');
  try{
    const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
    console.log("executing", __filename);
    const [rows, fields] = await connection.execute(
      `SELECT patient_visit_notes.patient_ID AS emr_id,
      patient_visit_notes.date_of_entry AS consultation_date_of_entry,
      patient_visit_notes.description AS consultation_diagnoses,
      patient_visit_notes.note_type AS consultation_note_type,
      patient_visit_notes.reason AS consultation_reason,
      patient_visit_notes.encounter_id AS encounter_id,
      CONCAT(staff_directory.firstname, ' ', staff_directory.lastname) AS consultation_doctors_name,
      "consultation" AS report_type,
      ${patientFields}
      FROM patient_visit_notes
      LEFT JOIN patient_demograph ON patient_demograph.patient_ID = patient_visit_notes.patient_ID
      LEFT JOIN staff_directory ON staff_directory.staffId = patient_visit_notes.noted_by
      ${patientLeftJoins}
      WHERE patient_visit_notes.date_of_entry BETWEEN '${daterange.from}' AND '${daterange.to}'
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

module.exports = qPatientVisitNotes

// main();