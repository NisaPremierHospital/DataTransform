var  async = require('async'),
assert = require('assert'),
log = require('../utils/Logger'),
//Nisa Tasks
diabeticRxFbsHba1C = require('./diabeticRxFbsHba1C');
diabeticRxFbs = require('./diabeticRxFbs'),
diabeticRx = require('./diabeticRx'),
diabeticFbs = require('./diabeticFbs'),
hypertensiveRxBp = require('./hypertensiveRxBp'),
hypertensiveBp = require('./hypertensiveBp'),
hypertensiveRx = require('./hypertensiveRx');

var config = require('../config.js');

var taskFns = [diabeticRxFbsHba1C, diabeticRxFbs, diabeticRx, diabeticFbs, hypertensiveRxBp, hypertensiveRx, hypertensiveBp];

function taskGenerator(taskFn, daterange, taskName){
    return function(cb){
        const res =  taskFn({daterange});
        res.then((res)=>{
            log.info(taskName, "returns", res);
            cb(null, true);
        }).catch((err)=>{
            log.error("Error", err);
            cb(err, null);
        });
    }
};

var asyncTasks = [];
var months = config.months;

for(let j = 0; j < months.length; j++){
    let from = `${config.year}-${months[j]}-01 00:00`,
    to = `${config.year}-${months[j]}-31 23:59`;
    // log.info(from, to);
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
    log.info("All", asyncTasks.length, 'tasks complete',{err}, {result});
});