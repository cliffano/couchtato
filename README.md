Couchtato
---------

CouchDB documents iterator

Installation
------------

    npm install -g couchtato
    
Usage
-----

Create a sample couchtato.js config file.

    couchtato init
    
Iterate through all documents in a CouchDB database.

    couchtato iterate -u http://user:pass@host:port/db

Use a custom config file name (by default it uses couchtato.js) .

    couchtato iterate -u http://user:pass@host:port/db -f path/to/myfile.js

Display help info.

    couchtato -h

Config
------

Couchtato gives you the flexibility to do anything you want to each document in the database. Anything? Anything!

You only need to specify the task functions in the config file. Each function in exports.conf.tasks will be applied to each document one by one.

    exports.conf = {
        "tasks": {
            "log-all-docs": function (c, doc) {
                console.log(doc);
            },
            "log-by-criteria": function (c, doc) {
                if (doc.title.match(/^The/)) {
                    console.log(doc);
                }
            },
            "update-by-criteria": function (c, doc) {
                if (doc.city === 'rome') {
                    doc.venue = 'san giorgio';
                    c.save(doc);
                }
            },
            "delete-by-criteria": function (c, doc) {
                if (doc.author === 'spam') {
                    c.remove(doc);
                }
            },
            "count-by-field": function (c, doc) {
                // the final count values will be displayed at the end of the run
                c.count(doc.city);
            },
            "anything-you-want": function (c, doc) {
                // you need to implement anythingYouWant function
                anythingYouWant(doc);
            }
        }
    }};

Note that you can also require other modules in the config file if you need to.

The 'c' Variable
----------------

That 'c' in function (c, doc) is a utility variable, it provides you the following convenient functions:

    c.save(doc)
    c.remove(doc)
    c.count(key)

If you need to access the native CouchDB driver used by Couchtato, use

    c.stool.driver()

Report
------

Couchtato displays the log messages on the console and writes to couchtato.log file.

A summary report will be displayed at the end of the run.

    ------------------------------------------------
    Start date: Fri May 27 2011 00:50:10 GMT+1000 (EST)
    Finish date: Fri May 27 2011 00:50:24 GMT+1000 (EST)
    10 successes, 0 errors
    Counts:
        - rome: 732
        - tuscany: 6244
        - florence: 1

Extend
------

By default Couchtato uses cradle as its CouchDB library. If you want to use a different library,
you have to implement an adapter like lib/stool/cradle.js , and make the choice of Stool configurable via command line.

TODO
----

* Pretify sample config file indentation
* Add c.log(doc) util
* Allow view iteration
* Wait for incomplete actions prior to finishing