var  async = require('async'),
assert = require('assert'),
//Nisa Tasks
qLab = require('./qLab'),
qPatientDiagnosis = require('./qPatientDiagnosis'),
qPatientProcedureNote = require('./qPatientProcedureNote'),
qPatientRegimens = require('./qPatientRegimens'),
qPatientScan = require('./qPatientScan'),
qPatientVisitNotes = require('./qPatientVisitNotes'),
qProcedureNursingTask = require('./qProcedureNursingTask'),
qVitalSigns = require('./qVitalSigns');

var taskFns = [qLab, qPatientDiagnosis, qPatientProcedureNote, qPatientRegimens,
    qPatientScan, qPatientVisitNotes, qProcedureNursingTask, qVitalSigns];

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

var asyncTasks = [];
var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
// var months = ['01', '02', '03', '04', '05', '06'];
for(let j = 0; j < months.length; j++){
    let from = `2017-${months[j]}-01 00:00`,
    to = `2017-${months[j]}-31 23:59`;
    // console.log(from, to);
    let taskName;
    for(let i = 0; i < taskFns.length; i++){
        taskName = taskFns[i].toString();
        taskName = taskName.substr('function '.length);
        taskName = taskName.substr(0, taskName.indexOf('('));
        asyncTasks.push(taskGenerator(taskFns[i], {from, to}, taskName));
    }
};

assert.strictEqual(asyncTasks.length, (months.length * taskFns.length));

async.series(asyncTasks,
    function(err, result) {
    console.log("All", asyncTasks.length, 'tasks complete',{err}, {result});
});