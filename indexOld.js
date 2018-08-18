let qLab = require('./qLab'),
qPatientDiagnosis = require('./qPatientDiagnosis'),
qPatientProcedureNote = require('./qPatientProcedureNote'),
qPatientRegimens = require('./qPatientRegimens'),
qPatientScan = require('./qPatientScan'),
qPatientVisitNotes = require('./qPatientVisitNotes'),
qProcedureNursingTask = require('./qProcedureNursingTask');
var daterange = require('./includes/daterange');

var  async = require('async');
var tasks = [];
var tasks = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month, index, months) => {
    let from = `2017-${month}-01 00:00`,
    to = `2017-${month}-31 23:59`;
    // console.log(from, to);
    
});

function taskGenerator(taskFn, daterange, taskName){
    return function(cb){
        const res =  taskFn({daterange});
        res.then((res)=>{
            console.log(taskName, "returns", res);
            cb(null, true);
        }).catch((err)=>{
            console.log("Error", err);
            cb(err, null);
        });
    }
};
return;
async.series([
     function(cb){
            const res =  qLab({daterange});
            res.then((res)=>{
                console.log("QLab returns", res);
                cb(null, true);
            }).catch((err)=>{
                console.log("Error", err);
                cb(err, null);
            });

    },
     function(cb){

            const res =  qPatientDiagnosis({daterange});
            res.then((res)=>{
                console.log("qPatientDiagnosis returns", res);
                cb(null, true);
            }).catch((err)=>{
                console.log("Error", err);
                cb(err, null);
            });

    },
     function(cb){

            const res =  qPatientProcedureNote({daterange});
            res.then((res)=>{
                console.log("qPatientProcedureNote returns", res);
                cb(null, true);
            }).catch((err)=>{
                cb(err, null);
            });

    },
     function(cb){

            const res =  qPatientRegimens({daterange});
            res.then((res)=>{
                console.log("qPatientRegimens returns", res);
                cb(null, true);
            }).catch((err)=>{
                cb(err, null);
            });

    },
     function(cb){

            const res =  qPatientScan({daterange});
            res.then((res)=>{
                console.log("qPatientScan returns", res);
                cb(null, true);
            }).catch((err)=>{
                cb(err, null);
            });

    },
     function(cb){

            const res =  qPatientVisitNotes({daterange});
            res.then((res)=>{
                console.log("qPatientVisitNotes returns", res);
                cb(null, true);
            }).catch((err)=>{
                cb(err, null);
            });
       
    },
     function(cb){

            const res =  qProcedureNursingTask({daterange});
            res.then((res)=>{
                console.log("qProcedureNursingTask returns", res);
                cb(null, true);
            }).catch((err)=>{
                cb(err, null);
            });
        
    }, function(cb){

        const res =  qVitalSigns({daterange});
        res.then((res)=>{
            console.log("qVitalSigns returns", res);
            cb(null, true);
        }).catch((err)=>{
            cb(err, null);
        });
    
    }],
     function(err, result) {
        console.log("All", result.length, 'tasks complete',{err}, {result});
    });