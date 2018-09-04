var  async = require('async'),
assert = require('assert'),
//Nisa Tasks
qEncounter = require('./qEncounter');

var config = require('../config');

var taskFns = [qEncounter];

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
var months = config.months;

for(let j = 0; j < months.length; j++){
    let from = `${config.year}-${months[j]}-01 00:00`,
    to = `${config.year}-${months[j]}-31 23:59`;
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