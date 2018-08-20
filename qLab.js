var config = require('./config');
var patientFields = require('./includes/patientFields');
var patientLeftJoins = require('./includes/patientLeftJoins');
var limits = require('./includes/limits');

var  MongoClient = require('mongodb').MongoClient;

/*
Fields

service_centre
------
lab_template_data_label
lab_result_data_value
lab_template_data_lab_method_id
lab_template_data_reference
lab_template_data_lab_template_id
lab_result_id
lab_template_id
lab_result_patient_lab_id
lab_result_approved
lab_result_abnormal_lab_value
lab_result_approved_by
lab_result_approved_date
lab__patient_labs_patient_id
lab__patient_labs_test_id
lab__patient_labs_specimen_date
lab__patient_labs_lab_group_id
lab__patient_labs_test_date
lab__patient_labs_test_notes
lab__patient_labs_status
labtests_config_name
*/
async function qLab({daterange}) {
  // return new Promise((resolve, reject)=>{
  const  mysql = require('mysql2/promise');
  try{
  const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
  console.log("executing", __filename);
  const [rows, fields] = await connection.execute(
    `SELECT 
    patient_labs.patient_id AS emr_id,
    lab_template_data.label AS lab_template_data_label, 
    lab_result_data.value AS lab_result_data_value, 
    lab_template_data.lab_method_id AS lab_template_data_lab_method_id, 
    lab_template_data.reference AS lab_template_data_reference, 
    lab_template_data.lab_template_id AS lab_template_data_lab_template_id, 
    lab_result.id AS lab_result_id,
    lab_result.lab_template_id AS lab_template_id, 
    lab_result.patient_lab_id AS lab_result_patient_lab_id, 
    lab_result.approved AS lab_result_approved, 
    lab_result.abnormal_lab_value AS lab_result_abnormal_lab_value,
    lab_result.approved_by AS lab_result_approved_by,
    lab_result.approved_date AS lab_result_approved_date,
    patient_labs.patient_id AS lab__patient_labs_patient_id,
    patient_labs.test_id AS lab__patient_labs_test_id,
    patient_labs.specimen_date AS lab__patient_labs_specimen_date,
    patient_labs.lab_group_id AS lab__patient_labs_lab_group_id,
    patient_labs.test_date AS lab__patient_labs_test_date,
    patient_labs.test_notes AS lab__patient_labs_test_notes,
    patient_labs._status AS lab__patient_labs_status,
    labtests_config.name AS labtests_config_name,
    patient_labs.specimen_date AS creation_date,
    "lab" AS report_type,
    ${patientFields}
    FROM lab_result_data
    LEFT JOIN lab_template_data ON lab_template_data.id  = lab_result_data.lab_template_data_id
    LEFT JOIN lab_result ON lab_result.id = lab_result_data.lab_result_id
    LEFT JOIN patient_labs ON patient_labs.id = lab_result.patient_lab_id
    LEFT JOIN patient_demograph ON patient_demograph.patient_ID = patient_labs.patient_id
    JOIN labtests_config ON labtests_config.id = patient_labs.test_id
    ${patientLeftJoins}
    WHERE patient_labs.specimen_date BETWEEN '${daterange.from}' AND '${daterange.to}'
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

module.exports = qLab

// main();