Couchtato
---------

Couchtato is a CouchDB database iterator tool.

Overview
--------

Couchtato is a command line tool that iterates all documents in a CouchDB database
and applies a set of JavaScript functions against each document. These functions
are defined in a Couchtato config file, which is basically a simple JavaScript file
in the form of a Node.js module. Couchtato also provides basic convenient functions
for updating, deleting, and counting documents.

Installation
------------

    npm install -g couchtato
    
Usage
-----

Create a sample couchtato.js config file.

    couchtato init
    
Iterate through all documents in a CouchDB database.

    couchtato iterate -u http://user:pass@host:port/db
    
Iterate through documents within a range of IDs.

    couchtato iterate -u http://user:pass@host:port/db -s mystartkey -e myendkey

Only iterate the first 5 pages in the database where each page has 1000 documents.

    couchtato iterate -u http://user:pass@host:port/db -n 5 -p 1000
    
Save/remove docs in bulk of 20000 documents at a time.

    couchtato iterate -u http://user:pass@host:port/db -b 20000

Use a custom config file name (by default it uses couchtato.js) .

    couchtato iterate -u http://user:pass@host:port/db -f path/to/myconfigfile.js

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

Note that you can also require other NodeJS modules in the config file if you need to.

The 'c' Variable
----------------

That 'c' in function (c, doc) is a utility variable, it provides you with the following convenient functions:

    # save the document in database
    c.save(doc)
    
    # remove the document from database
    c.remove(doc)
    
    # increment a counter associated with a particular key
    # the result of all counters will be displayed in the summary report
    c.count(key)
    
    # log a message to both the console and couchtato.log file
    # if you only want to display a message on the console,
    # simply use good ol' console.log(message)
    c.log(message)

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

By default Couchtato uses cradle as its CouchDB driver module. If you want to use a different module,
you have to implement an adapter like lib/stool/cradle.js , e.g. lib/stool/mydriver.js,
then specify the driver module via command line.

    couchtato iterate -u http://user:pass@host:port/db -d mydriver
