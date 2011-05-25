Couchtato
---------

CouchDB documents iterator

Installation
------------

    npm install couchtato
    
Usage
-----

Create a sample couchtato.js config file.

    couchtato init
    
Iterate through the documents in a CouchDB database.

    couchtato iterate -u http://user:pass@host:port/db

Use a custom config file.

    couchtato iterate -u http://user:pass@host:port/db -f path/to/myfile.js

Display help info.

    couchtato -h

Config
------

You can configure the function to be executed against each document in the config file.



Report
------

TODO
----

* Improve error text display
* Wait for incomplete actions prior to finishing