Couchtato [![http://travis-ci.org/cliffano/couchtato](https://secure.travis-ci.org/cliffano/couchtato.png?branch=master)](http://travis-ci.org/cliffano/couchtato)
---------

Couchtato is a CouchDB database iterator tool.

This is handy when you want to apply a set of JavaScript functions against all documents in a CouchDB database or view, or only some of them by specifying a start and/or an end key(s). On each JavaScript function, you can save a document, remove a document, log a message, or count the documents.

Performance and resource utilisation can be tuned by tweaking how many documents to retrieve per retrieval page, how many documents to update/remove per bulk update, and how many milliseconds interval between page retrievals.

Installation
------------

    npm install -g couchtato
    
Usage
-----

Create sample couchtato.js configuration file:

    couchtato config
    
Iterate through all documents in a CouchDB database:

    couchtato iterate -u http://user:pass@host:port/db

Iterate through all documents in a CouchDB view:

    couchtato iterate -u http://user:pass@host:port/db/design/view

Use custom configuration file:

    couchtato iterate -u http://user:pass@host:port/db -c ../somecouchtato.js

Iterate through documents within a range of IDs:

    couchtato iterate -u http://user:pass@host:port/db -s Astartkey -e Zendkey

Only iterate the first 5 pages where each page contains 1000 documents:

    couchtato iterate -u http://user:pass@host:port/db -n 5 -p 1000
    
Save/remove docs in bulk of 20000 documents at a time:

    couchtato iterate -u http://user:pass@host:port/db -b 20000

Pause for 5 seconds between each page retrieval:

    couchtato iterate -u http://user:pass@host:port/db -i 5000

Hide the summary report:

    couchtato iterate -u http://user:pass@host:port/db -h

Config
------

Specify the task functions in config file. Each function in exports.conf.tasks will be applied to each retrieved document one by one.

    exports.conf = {
        "tasks": {
            "log-all-docs": function (util, doc) {
                util.log(doc);
            },
            "log-by-criteria": function (util, doc) {
                if (doc.title.match(/^The/)) {
                    util.log(doc);
                }
            },
            "update-by-criteria": function (util, doc) {
                if (doc.status === 'new') {
                    doc.owner = 'Bob McFred';
                    util.save(doc);
                }
            },
            "delete-by-criteria": function (util, doc) {
                if (doc.status === 'spam') {
                    util.remove(doc);
                }
            },
            "count-by-field": function (util, doc) {
                util.count(doc.status);
            },
            "whatever": function (util, doc) {
                // you need to implement whatever function
                whatever(doc);
            }
        }
    }};

Database driver is available via util.driver from the task function, it returns nano(url).use(db) :

    exports.conf = {
        "tasks": {
            "use-database-driver": function (util, doc) {
                util.driver.something();
            }
        }
    }};

Note that you can also require other Node.js modules in the config file if you need to.

The util variable
-----------------

That 'util' in function (util, doc) is a utility variable, it provides you with the following convenient functions:

    # save the document back to the database
    util.save(doc)
    
    # remove the document from the database
    util.remove(doc)
    
    # increment a counter associated with a particular key
    # all counters will be displayed in the summary report
    util.count('somekey')
    
    # log a message to both the console and to couchtato.log file
    # if you only want to display a message on the console,
    # simply use good old console.log(message)
    util.log(message)

Report
------

A summary report will be displayed at the end of the run:

    ------------------------
    Retrieved 2601388 documents in 5203 pages
    Processed 10356 saves and 302 removes
    - New data count: 1012
    - Moderated data count: 4578
    - Flagged data count: 88

Summary report can be excluded from the log output by using -x/--exclude-summary option.