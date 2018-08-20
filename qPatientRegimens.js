var config = require('./config');
var patientFields = require('./includes/patientFields');
var patientLeftJoins = require('./includes/patientLeftJoins');
var limits = require('./includes/limits');

var  MongoClient = require('mongodb').MongoClient;

/*
Fields
regimen_drug_name
regimen_drug_generic_name
regimen_description
regimen_weight
regimen_form
regimen_drug_id
regimen_quantity
regimen_request_time
regimen_filled_time
regimen_completed_time
regimen_status
regimen_prescribed_by
regimen_note
hospital_id
encounter_id
regimen_refill_off
regimen_requested_by
*/
async function qPatientRegimens({daterange}) {
  // return new Promise((resolve, reject)=>{
  const  mysql = require('mysql2/promise');
  try{
    const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
    console.log("executing", __filename);
    const [rows, fields] = await connection.execute(
      `SELECT patient_regimens.patient_id AS emr_id, \
      drugs.name AS regimen_drug_name, \
      drug_generics.name AS regimen_drug_generic_name, \
      drug_generics.description AS regimen_description, \
      drug_generics.weight AS regimen_weight, \
      drug_generics.form AS regimen_form, \
      patient_regimens_data.drug_id AS regimen_drug_id, \
      patient_regimens_data.quantity AS regimen_quantity, \
      patient_regimens.when as regimen_request_time, \
      patient_regimens_data.filled_on AS regimen_filled_time, \
      patient_regimens_data.completed_on AS regimen_completed_time, \
      patient_regimens_data.status AS regimen_status, \
      patient_regimens.prescribed_by AS regimen_prescribed_by, \
      patient_regimens.note AS regimen_note, \
      patient_regimens.hospid AS hospital_id, \
      patient_regimens.encounter_id AS encounter_id, \
      patient_regimens.refill_off AS regimen_refill_off, \
      service_centre.name AS service_center, \
      CONCAT(staff_directory.firstname, ' ', staff_directory.lastname) AS regimen_requested_by,
      patient_regimens.when AS creation_date,
      "pharmacy" AS report_type,
      ${patientFields} \
      FROM patient_regimens \
      RIGHT JOIN patient_regimens_data ON patient_regimens.group_code = patient_regimens_data.group_code
      INNER JOIN patient_demograph ON patient_regimens.patient_id = patient_demograph.patient_ID
      LEFT JOIN service_centre ON patient_regimens.service_centre_id = service_centre.id
      LEFT JOIN drugs ON patient_regimens_data.drug_id = drugs.id
      LEFT JOIN drug_generics ON drugs.drug_generic_id = drug_generics.id
      LEFT JOIN staff_directory ON staff_directory.staffId = patient_regimens.requested_by
      ${patientLeftJoins} \
      WHERE patient_regimens.when BETWEEN '${daterange.from}' AND '${daterange.to}' \
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

module.exports = qPatientRegimens

// main();