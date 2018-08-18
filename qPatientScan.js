var config = require('./config');
var patientFields = require('./includes/patientFields');
var patientLeftJoins = require('./includes/patientLeftJoins');
var limits = require('./includes/limits');

var  MongoClient = require('mongodb').MongoClient;

/*
Fields

*/
async function qPatientScan({daterange}) {
  // return new Promise((resolve, reject)=>{
  const  mysql = require('mysql2/promise');
  try{
    const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
    console.log("executing", __filename);
    const [rows, fields] = await connection.execute(
      `SELECT patient_scan.patient_id AS emr_id,
      scan.name AS radiology_scan_name,
      patient_scan.request_note AS radiology_request_note,
      patient_scan.request_date AS radiology_request_date,
      patient_scan.approved AS radiology_is_approved,
      patient_scan.approved_date AS radiology_approved_date,
      patient_scan.status AS radiology_status,
      patient_scan.cancelled AS radiology_cancelled,
      patient_scan.cancel_date AS radio_cancel_date,
      patient_scan.encounter_id AS encounter_id,
      service_centre.name AS service_centre,
      "imaging" AS report_type,
      ${patientFields}
      FROM patient_scan
      LEFT JOIN scan ON patient_scan.scan_ids = scan.id
      INNER JOIN patient_demograph ON patient_scan.patient_id = patient_demograph.patient_ID
      LEFT JOIN service_centre ON patient_scan.service_centre_id = service_centre.id
      ${patientLeftJoins}
      WHERE patient_scan.request_date BETWEEN '${daterange.from}' AND '${daterange.to}'
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

module.exports = qPatientScan

// main();