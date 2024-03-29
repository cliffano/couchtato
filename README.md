<img align="right" src="https://raw.github.com/cliffano/couchtato/master/avatar.jpg" alt="Avatar"/>

[![Build Status](https://img.shields.io/travis/cliffano/couchtato.svg)](http://travis-ci.org/cliffano/couchtato)
[![Dependencies Status](https://img.shields.io/david/cliffano/couchtato.svg)](http://david-dm.org/cliffano/couchtato)
[![Coverage Status](https://img.shields.io/coveralls/cliffano/couchtato.svg)](https://coveralls.io/r/cliffano/couchtato?branch=master)
[![Published Version](https://img.shields.io/npm/v/couchtato.svg)](http://www.npmjs.com/package/couchtato)
[![npm Badge](https://nodei.co/npm/couchtato.png)](http://npmjs.org/package/couchtato)

Couchtato
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

Hide progress and summary info:

    couchtato iterate -u http://user:pass@host:port/db -q

Configuration
-------------

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
            "hash-doc": function (util, doc) {
                const hash = util.hash(doc);
                util.log('hash:' + hash);
            },
            "audit-object": function (util, doc) {
                util.audit(doc);
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

    # generate a SHA256 hash for a given document, object, or string
    util.hash(doc)

    # add an object to the audit array, which is returned in the
    # callback and can be used for downstream processing
    util.audit(doc)

Report
------

A summary report will be displayed at the end of the run:

    ------------------------
    Retrieved 2601388 documents in 5203 pages
    Processed 10356 saves and 302 removes
    - New data count: 1012
    - Moderated data count: 4578
    - Flagged data count: 88

Summary report can be excluded from the log output by using -q/--quiet option.

FAQ
---

Q: Why am I getting 'exports' is undefined Microsoft JScript runtime error on Windows?

A: Since Couchtato's default config file is called couchtato.js, Windows tried to execute couchtato.js instead of couchtato command, which then resulted in the above error. A workaround to this problem is to rename couchtato.js to config.js, and then use -c/--config-file flag, e.g. `couchtato --config-file config.js iterate --url http://user:pass@host:port/db`.

Q: What is the purpose of `util.audit` and/or the audit array?

A: The audit array is a convenient way to store data while iterating through documents. All objects added via `util.audit()` will be returned in the callback response upon completion. This is a powerful way to chain processing steps via messaging queues, lambda functions, or monitoring tools.

Colophon
--------

[Developer's Guide](https://cliffano.github.io/developers_guide.html#nodejs)

Build reports:

* [Code complexity report](https://cliffano.github.io/couchtato/complexity/plato/index.html)
* [Unit tests report](https://cliffano.github.io/couchtato/test/buster.out)
* [Test coverage report](https://cliffano.github.io/couchtato/coverage/buster-istanbul/lcov-report/lib/index.html)
* [Integration tests report](https://cliffano.github.io/couchtato/test-integration/cmdt.out)
* [API Documentation](https://cliffano.github.io/couchtato/doc/dox-foundation/index.html)

Articles:

* [Couchtato – A CouchDB Document Utility Tool Written In Node.js](http://blog.shinetech.com/2011/06/30/couchtato-a-couchdb-document-utility-tool-written-in-nodejs/)

Related Projects:

* [couchpenter](http://github.com/cliffano/couchpenter) - CouchDB database and document setup tool
