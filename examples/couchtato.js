exports.conf = {
  "tasks": {
    "all_docs": function (util, doc) {
      util.log(doc);
      
      // That 'util' in function (util, doc) is a utility variable,
      // it provides you with the following convenient functions:

      // save the document back to the database
      // util.save(doc)

      // remove the document from the database
      // util.remove(doc)

      // increment a counter associated with a particular key
      // all counters will be displayed in the summary report
      // util.count('somekey')

      // log a message to both the console and to couchtato.log file
      // if you only want to display a message on the console,
      // simply use good old console.log(message)
      // util.log(message)
    }
  }
};
