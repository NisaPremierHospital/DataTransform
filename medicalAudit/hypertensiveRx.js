var config = require('../config');
log = require('../utils/Logger');
var  MongoClient = require('mongodb').MongoClient;

async function hypertensiveRx({daterange}) {
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
      pharmacy.forEach(element => {

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
          // log.info(element, matchingDiagnosis[0] || {})
          let row = {
            ...element,
            ...matchingDiagnosis[0] || {},
            ...{report_type: "hypertensive rx"}
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

module.exports = hypertensiveRx

// hypertensiveRx();