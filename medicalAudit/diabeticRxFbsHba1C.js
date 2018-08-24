var config = require('../config');
var _ = require('lodash');
log = require('../utils/Logger');
var  MongoClient = require('mongodb').MongoClient;

async function diabeticRxFbsHba1c({daterange}) {
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

      const lab2 = await db.collection('nisa_collection').find({$query: {
        report_type: "lab",
        labtests_config_name: "HBA1C",
        lab_template_data_label: "HBA1C",
        record_date: {
          $gte: new Date(daterange.from),
          $lt: new Date(daterange.to)
        }
      }, $orderby: {emr_id: 1, record_date: 1} }).toArray();

      // log.info(lab2)

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

        const matchingLabs2 = lab2.filter(v => {
            const v_creation_date = new Date(v.creation_date);
            const p_creation_date = new Date(element.creation_date);
            return (
              v.emr_id == element.emr_id &&
              v_creation_date.getDate() === p_creation_date.getDate() &&
              v_creation_date.getFullYear() === p_creation_date.getFullYear() &&
              v_creation_date.getMonth() === p_creation_date.getMonth()
            );
          });
  
          // log.info(matchingLabs2)

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
            ...{report_type: "diabetic rx fbs hba1c"}
          };
          delete row._id;
          let selection = [
            'lab_result_id' , 'labtests_config_name', 'lab_result_data_value',
            'lab_result_approved', 'lab_result_approved_by', 'lab_result_approved_date',
            'lab__patient_labs_status', 'lab_result_patient_lab_id',
            'lab__patient_labs_test_id', 'lab_template_data_reference',
            'lab__patient_labs_test_date', 'lab__patient_labs_patient_id',
            'lab__patient_labs_test_notes','lab_result_abnormal_lab_value', 
            'lab__patient_labs_lab_group_id', 'lab_template_data_lab_method_id',
            'lab__patient_labs_specimen_date', 'lab_template_data_lab_template_id',
            'lab_template_id', 'lab_template_data_label',];
          row = _.omit(row, selection);
          row.hba1c_fbs = [];
          row.labs = [];
          matchingLabs2[0] && row.labs.push(_.pick(matchingLabs2[0], selection));
          matchingLabs[0] && row.labs.push(_.pick(matchingLabs[0], selection));
        if(matchingLabs2[0]){
            row.hba1c_fbs.push(matchingLabs2[0].lab_result_data_value);
        }else{
            row.hba1c_fbs.push("n/a")
        }
        if(matchingLabs[0]){
            row.hba1c_fbs.push(matchingLabs[0].lab_result_data_value);
        }else{
            row.hba1c_fbs.push("n/a")
        }
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

module.exports = diabeticRxFbsHba1c

// diabeticRxFbsHba1c();