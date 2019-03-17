# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Add response object to report callback [David Squier](https://github.com/dsquier)
- Add util.audit() adds an object to an array that is returned upon [David Squier](https://github.com/dsquier)
- Add util.hash() which returns a SHA256 hash using node-object-hash [David Squier](https://github.com/dsquier)

### Changed
- Implement ES6 features and require Node 6.10+ [David Squier](https://github.com/dsquier)
- Modify changelog format to Keep A Changelog

## [0.2.1] - 2016-02-08

### Changed
- Make `util` API self-documenting in sample couchtato.js [Ronan Jouchet](https://github.com/ronjouch)

## [0.2.0] - 2015-06-21

### Added
- Add test-integration to CI build

### Changed
- Change test lib to buster-node + referee
- Set min node engine to >= v0.10.0

## [0.1.6] - 2013-09-02

### Changed
- Upgrade deps to latest, use ranged version deps

## [0.1.5] - 2013-09-02

### Changed
- Improve help output by using bagofcli
- Unit tests no longer generate log file

## [0.1.4] - 2012-09-10

### Changed
- Replace -x option with -q (quiet), which excludes both progress and summary info

## [0.1.3] - 2012-09-10

### Added
- Add -x option to exclude summary report from log output

## [0.1.2] - 2012-08-17

### Changed
- Expose database driver via util.driver, available in task functions

## [0.1.1] - 2012-08-15

### Added
- Add iterate view support

### Changed
- Improve performance by removing unnecessary dataset traversal
- Re-add custom config file support
- Re-add max number of pages support

## [0.1.0] - 2012-07-05

### Changed
- Replace 'c' variable in couchtato.js tasks module with a more descriptive 'util'
- Replace cradle with nano, replace nomnom and Config with bagofholding
- Set min node engine to >= 0.6.0, max node engine to < 0.9.0
- Replace init command with config

### Removed
- Remove -d option, nano as a couchdb driver is fine

## [0.0.5] - 2011-09-20

### Changed
- Change default batch size and page size to 1000

## [0.0.4] - 2011-08-22

### Added
- Add bulk save/remove support

## [0.0.3] - 2011-08-14

### Added
- Add startkey and endkey range support

## [0.0.2] - 2011-06-18

## [0.0.1] - 2011-06-07

### Added
- Initial version

[Unreleased]: https://github.com/cliffano/couchtato/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/cliffano/couchtato/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/cliffano/couchtato/compare/v0.1.6...v0.2.0
[0.1.6]: https://github.com/cliffano/couchtato/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/cliffano/couchtato/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/cliffano/couchtato/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/cliffano/couchtato/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/cliffano/couchtato/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/cliffano/couchtato/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/cliffano/couchtato/compare/v0.0.5...v0.1.0
[0.0.5]: https://github.com/cliffano/couchtato/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/cliffano/couchtato/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/cliffano/couchtato/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/cliffano/couchtato/compare/v0.0.1...v0.0.2
