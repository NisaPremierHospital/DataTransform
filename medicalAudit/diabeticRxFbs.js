var config = require('../config');
log = require('../utils/Logger');
var  MongoClient = require('mongodb').MongoClient;

async function diabeticRxFbs({daterange}) {
  log.info("Running", __filename, "Range: ", daterange);
  try{
      const client = await MongoClient.connect(config.mongodb.dbn, { useNewUrlParser: true });
      const db = client.db(config.mongodb.db);
      const pharmacy = await db.collection('nisa_collection').find({$query: {
        report_type: "pharmacy",
        record_date: {
          $gte: new Date(daterange.from),
          $lt: new Date(daterange.to)
        }
      }, $orderby: { emr_id: 1, record_date : 1 } }).toArray();

      // log.info(pharmacy);

      const lab = await db.collection('nisa_collection').find({$query: {
        report_type: "lab",
        labtests_config_name: "FASTING BLOOD SUGAR [FBS]",
        lab_template_data_label: "FASTING BLOOD SUGAR",
        record_date: {
          $gte: new Date(daterange.from),
          $lt: new Date(daterange.to)
        }
      }, $orderby: {emr_id: 1, record_date: 1} }).toArray();

      // log.info(lab)

      const diagnosis = await db.collection('nisa_collection').find({$query: {
        report_type: "diagnosis",
        diagnoses_code: "E11", //mellitus
        record_date: {
          $gte: new Date(daterange.from),
          $lt: new Date(daterange.to)
        }
      }, $orderby: {emr_id: 1, record_date: 1} }).toArray();

      // log.info(diagnosis)

      let resulset = [];
      pharmacy.forEach(element => {
        
        const matchingLabs = lab.filter(v => {
          const v_creation_date = new Date(v.creation_date);
          const p_creation_date = new Date(element.creation_date);
          return (
            v.emr_id == element.emr_id &&
            v_creation_date.getDate() === p_creation_date.getDate() &&
            v_creation_date.getFullYear() === p_creation_date.getFullYear() &&
            v_creation_date.getMonth() === p_creation_date.getMonth()
          );
        });

        // log.info(matchingLabs)

        const matchingDiagnosis = diagnosis.filter(d => {
          const d_creation_date = new Date(d.creation_date);
          const p_creation_date = new Date(element.creation_date);
          return (
            d.emr_id == element.emr_id &&
            d_creation_date.getDate() === p_creation_date.getDate() &&
            d_creation_date.getMonth() === p_creation_date.getMonth() &&
            d_creation_date.getFullYear() === p_creation_date.getFullYear()
          );
        });

        if(matchingDiagnosis[0]){
          // log.info(element, matchingDiagnosis[0] || {}, matchingLabs[0] || {})
          let row = {
            ...element,
            ...matchingDiagnosis[0] || {},
            ...matchingLabs[0] || {},
            ...{report_type: "diabetic rx fbs"}
          };
          delete row._id;
          resulset.push(row);
        }

      });

      if(resulset && !resulset.length){
        log.info("Nothing to copy");
        return true;
      }
      const result = await db.collection('nisa_collection').insertMany(resulset);
      log.info(__filename, "completed succesfuly", result.ops.length, " records");
      // log.info(resulset);

      // client.close();
      return true;
    }catch(err){
      log.error(__filename, {err});
      return false;
    }
}

module.exports = diabeticRxFbs

// diabeticRxFbs();