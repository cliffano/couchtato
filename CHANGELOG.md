### 0.1.7
*

### 0.1.6
* Fix duplicated config command logging
* Upgrade deps to latest, use ranged version deps

### 0.1.5
* Improve help output by using bagofcli
* Unit tests no longer generate log file
* Fix out of memory error due to waiting incorrectly for in-progress bulk updates

### 0.1.4
* Replace -x option with -q (quiet), which excludes both progress and summary info

### 0.1.3
* Add -x option to exclude summary report from log output

### 0.1.2
* Expose database driver via util.driver, available in task functions

### 0.1.1
* Add iterate view support
* Improve performance by removing unnecessary dataset traversal
* Re-add custom config file support
* Re-add max number of pages support

### 0.1.0
* Replace 'c' variable in couchtato.js tasks module with a more descriptive 'util'
* Replace cradle with nano, replace nomnom and Config with bagofholding
* Remove -d option, nano as a couchdb driver is fine
* Set min node engine to >= 0.6.0, max node engine to < 0.9.0 
* Replace init command with config

### 0.0.5
* Fix version flag
* Fix commands-flags association
* Change default batch size and page size to 1000

### 0.0.4
* Add bulk save/remove support

### 0.0.3
* Add startkey and endkey range support

### 0.0.2
* Fix authentication username and password properties
* Fix number of pages command line arg

### 0.0.1
* Initial version

