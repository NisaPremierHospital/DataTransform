var config = require('./config');
var patientFields = require('./includes/patientFields');
var patientLeftJoins = require('./includes/patientLeftJoins');
var limits = require('./includes/limits');

var  MongoClient = require('mongodb').MongoClient;

/*
Fields

------

*/
async function qPatientProcedureNote({daterange}) {
  // return new Promise((resolve, reject)=>{
  const  mysql = require('mysql2/promise');
  try{
  const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
  console.log("executing", __filename);
  const [rows, fields] = await connection.execute(
    `SELECT 
    patient_procedure.patient_id AS emr_id,
    \`procedure\`.id AS procedure_id,
    \`procedure\`.name AS procedure_name,
    \`procedure\`.icd_code AS procedure_icd_code,
    \`procedure\`.description AS procedure_description,
    patient_procedure.id AS patient_procedure_id,
    patient_procedure.request_note AS patient_procedure_request_note,
    patient_procedure.closing_text AS patient_procedure_closing_text,
    patient_procedure.theatre_id,
    patient_procedure.surgeon_id,
    patient_procedure.bodypart_id,
    patient_procedure.scheduled_on,
    patient_procedure.scheduled_by,
    patient_procedure.anesthesiologist_id,
    patient_procedure.referral_id,
    patient_procedure.time_started AS patient_procedure_time_started,
    patient_procedure.time_start AS patient_procedure_time_start,
    patient_procedure.time_stop AS patient_procedure_time_stop,
    patient_procedure.encounter_id AS encounter_id,
    CONCAT(staff_directory.firstname, ' ', staff_directory.lastname) AS patient_procedure_requested_by,
    service_centre.name AS service_centre,
    patient_procedure_note.note AS patient_procedure_note,
    patient_procedure_note.note_time AS patient_procedure_note_time,
    patient_procedure_note.note_type AS patient_procedure_note_type,
    patient_procedure.request_date AS patient_procedure_request_date,
    patient_procedure._status AS patient_procedure_status,
    "procedure note" AS report_type,
    ${patientFields}
    FROM
    patient_procedure
    LEFT JOIN patient_demograph ON patient_demograph.patient_ID = patient_procedure.patient_id
    ${patientLeftJoins}
    LEFT JOIN
    staff_directory ON staff_directory.staffId = patient_procedure.requested_by_id
    LEFT JOIN
    \`procedure\` ON \`procedure\`.id = patient_procedure.procedure_id
    LEFT JOIN 
    patient_procedure_note ON patient_procedure_note.patient_procedure_id = patient_procedure.id
    LEFT JOIN 
    service_centre ON patient_procedure.service_centre_id = service_centre.id
    WHERE patient_procedure.request_date BETWEEN '${daterange.from}' AND '${daterange.to}'
    ORDER BY patient_procedure.request_date ASC
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
//WHERE patient_procedure.patient_id = 2820
module.exports = qPatientProcedureNote

// main();