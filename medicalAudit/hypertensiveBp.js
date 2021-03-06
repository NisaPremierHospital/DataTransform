var config = require('../config');
log = require('../utils/Logger');
var  MongoClient = require('mongodb').MongoClient;

async function hypertensiveBp({daterange}) {
    log.info("Running", __filename, "Range: ", daterange);
  try{
      const client = await MongoClient.connect(config.mongodb.dbn, { useNewUrlParser: true });
      const db = client.db(config.mongodb.db);

      const vitalSign = await db.collection('nisa_collection').find({$query: {
        report_type: "vital sign",
        vital_sign_type: "Blood Pressure",
        record_date: {
          $gte: new Date(daterange.from),
          $lt: new Date(daterange.to)
        }
      }, $orderby: {emr_id: 1, record_date: 1} }).toArray();

      // log.info(vitalSign)

      const diagnosis = await db.collection('nisa_collection').find({$query: {
        report_type: "diagnosis",
        diagnoses_code: "I10", //hypertensive
        record_date: {
          $gte: new Date(daterange.from),
          $lt: new Date(daterange.to)
        }
      }, $orderby: {emr_id: 1, record_date: 1} }).toArray();

      // log.info(diagnosis)

      let resulset = [];
      diagnosis.forEach(element => {
        
        const matchingVitalSigns = vitalSign.filter(v => {
          const v_creation_date = new Date(v.creation_date);
          const p_creation_date = new Date(element.creation_date);
          return (
            v.emr_id == element.emr_id &&
            v_creation_date.getDate() === p_creation_date.getDate() &&
            v_creation_date.getFullYear() === p_creation_date.getFullYear() &&
            v_creation_date.getMonth() === p_creation_date.getMonth()
          );
        });

        if(matchingVitalSigns[0]){
          // log.info(element, matchingVitalSigns[0] || {})
          let row = {
            ...element,
            ...matchingVitalSigns[0] || {},
            ...{report_type: "hypertensive bp"}
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

module.exports = hypertensiveBp

// hypertensiveBp();