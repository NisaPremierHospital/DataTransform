var config = require('../config');
var limits = require('../includes/limits'),
log = require('../utils/Logger');
var  MongoClient = require('mongodb').MongoClient;

/*
Fields
encounter_specialization_id
specialization_billing_code
specialization_staff_type
encounter_department_id
department_title
cost_centre_name
cost_centre_description
cost_centre_analytical_code
encounter_initiator_id
encounter_start_date, 
encounter_follow_up, 
encounter_claimed, 
encounter_open, 
encounter_signed_by,
encounter_signed_on,
encounter_triaged_on,
encounter_triaged_by,
encounter_scheme_id,
encounter_canceled, 
encounter_bill_line_id,
encounter_referral_id 
*/
async function qPatientRegimens({daterange}) {
  const  mysql = require('mysql2/promise');
  try{
    const connection = await mysql.createConnection({host:config.mysql.host, user: config.mysql.user, database: config.mysql.database, password: config.mysql.password});
    log.info("executing", __filename);
    const [rows, fields] = await connection.execute(
      `SELECT
      encounter.id AS encounter_id,
      encounter.patient_id AS emr_id,
      encounter.specialization_id AS encounter_specialization_id, 
      staff_specialization.billing_code AS specialization_billing_code,
      staff_specialization.staff_type AS specialization_staff_type,
      encounter.department_id AS encounter_department_id, 
      departments.name AS department_title,
      cost_centre.name AS cost_centre_name,
      cost_centre.description AS cost_centre_description,
      cost_centre.analytical_code AS cost_centre_analytical_code,
      encounter.initiator_id AS encounter_initiator_id, 
      encounter.start_date AS encounter_start_date, 
      encounter.follow_up AS encounter_follow_up, 
      encounter.claimed AS encounter_claimed, 
      encounter.open AS encounter_open, 
      encounter.signed_by AS encounter_signed_by,
      encounter.signed_on AS encounter_signed_on,
      encounter.triaged_on AS encounter_triaged_on,
      encounter.triaged_by AS encounter_triaged_by,
      encounter.scheme_id As encounter_scheme_id,
      encounter.canceled AS encounter_canceled, 
      encounter.bill_line_id AS encounter_bill_line_id,
      encounter.referral_id AS encounter_referral_id 
      FROM encounter 
      JOIN departments ON departments.id = encounter.department_id
      JOIN cost_centre ON cost_centre.id = departments.cost_centre_id
      JOIN staff_specialization ON staff_specialization.id = encounter.specialization_id
      WHERE encounter.start_date BETWEEN '${daterange.from}' AND '${daterange.to}' \
      ${limits}`);

      log.info("Running", __filename, "Limit: ", limits, "Range: ", daterange);
      log.info(rows.length, " Records Found", " updating mongo collection... Goodluck!");
      connection.end();
      if(rows && !rows.length){
        log.info("Nothing to update");
        return true;
      }
      const client = await MongoClient.connect(config.mongodb.dbn, { useNewUrlParser: true });
      const db = client.db(config.mongodb.db);

      let encounters = JSON.parse(JSON.stringify(rows));
      let updateCounter = 0;
      for(let i = 0; i < encounters.length; i++){
        const filter = {
          emr_id: encounters[i].emr_id,
          encounter_id: encounters[i].encounter_id
        };
        const update = encounters[i];
        console.log({filter}, {update});
        const result = await db.collection('nisa_collection').updateMany(filter, {$set: update});
        if(result.ok){
          updateCounter += result.nModified;
        }
      }
      log.info({updateCounter, nEncounters: encounters.length});
      log.info(__filename, "completed succesfuly", encounters.length, " records");
      client.close();
      return true;
    }catch(err){
      log.info(__filename, {err});
      return false;
    }
}

module.exports = qPatientRegimens