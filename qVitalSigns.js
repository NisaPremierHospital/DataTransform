var config = require('./config');
var patientFields = require('./includes/patientFields');
var patientLeftJoins = require('./includes/patientLeftJoins');
var limits = require('./includes/limits');

var  MongoClient = require('mongodb').MongoClient;

/*
Fields
vital_sign_type
vital_sign_value
vital_sign_unit
vital_sign_min_val
vital_sign_read_date
*/

async function qVitalSigns({daterange}) {
  // return new Promise((resolve, reject)=>{
  const  mysql = require('mysql2/promise');
  try{
    const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
    console.log("executing", __filename);
    const [rows, fields] = await connection.execute(
      `SELECT vital_sign.patient_id AS emr_id, 
      vital.name as vital_sign_type, 
      value AS vital_sign_value, 
      vital.unit AS vital_sign_unit, 
      vital.min_val AS vital_sign_min_val, 
      hospital_id, encounter_id, 
      read_date AS vital_sign_read_date,
      vital_sign.read_date AS creation_date,
      "vital sign" AS report_type,
      ${patientFields}
        FROM vital_sign
      LEFT JOIN vital ON vital.id = vital_sign.type_id
      LEFT JOIN patient_demograph ON patient_demograph.patient_ID = vital_sign.patient_id
      ${patientLeftJoins}
      WHERE vital_sign.read_date BETWEEN '${daterange.from}' AND '${daterange.to}'
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

module.exports = qVitalSigns

// main();