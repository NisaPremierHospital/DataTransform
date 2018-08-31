/*

README

from CLI: mongo nisa_main mquery.js

mongoexport  -h localhost:27017 -d nisa_main --collection dpvisits --type=csv --out dpvisits.csv --fields "emr_id,visit_counts"

*/

var cursor = db.nisa_collection.aggregate([
    { $match: {
        report_type: "diabetic rx fbs hba1c",
        record_date: {$gt: new Date(new Date(2017,01,01)*1), $lt: new Date(new Date(2018,01,31)*1)}
    }
    },
    { $group: { _id: "$emr_id", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
]);

if (cursor && cursor.hasNext()) {
    // print('emr_id, visit_counts'); // uncomment to do IO Redirect
    while ( cursor.hasNext() ) {
        var item = cursor.next();
        db.dpvisits.insert({emr_id: item._id, visit_counts: item.count});
        // print('"' + item._id + '",' + item.count); // uncomment to do IO Redirect
    }
}

/*
    Fin
*/