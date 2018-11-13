'use strict';

let fs = require('fs');
let argv = require('minimist')(process.argv.slice(2), {
    string: ['port', 'admin-cli-port', 'admin-cli-pass', 'cloud-provider'],
    boolean: ['debug'],
    alias: {
        p: 'port',
        c: 'cloud-provider'
    },
    default: {
        port: 3000,
        'admin-cli-port': 8080,
        'admin-cli-pass': '',
        'cloud-provider': 'local',
        debug: false
    }
});

if (argv.help){
	console.log(`
Usage: node index.js [options]

Options:
    -p, --port <number> 	Port to bind the server to (default: 3000)
    --admin-cli-port <number> 	Port to bind the admin CLI to (default: 8080)
    --admin-cli-pass <string> 	Password to log-in to the admin CLI (default: none)
    --log-level <logLevel>	Set log level verbosity (default: info)
    -c, --cloud-provider	Cloud provider to use (default: local)
    --debug 	Disable caches and other settings to facilitate debug (default: false)
Log Levels: 
error | debug | info | verbose | debug | silly 
`);
	process.exit(0);
}
let config = {};

// Logging configuration
config.logger = {};
config.logger.level = argv['log-level'] || 'info'; // What level to log at; info, verbose or debug are most useful. Levels are (npm defaults): silly, debug, verbose, info, warn, error.
config.logger.maxFileSize = 1024 * 1024 * 100; // Max file size in bytes of each log file; default 100MB
config.logger.maxFiles = 10; // Max number of log files kept
config.logger.logDirectory = '' // Set this to a full path to a directory - if not set logs will be written to the application directory.

config.port = parseInt(argv.port);
config.admin_cli_port = parseInt(argv['admin-cli-port']);
config.admin_cli_pass = argv['admin-cli-pass'];
config.cloud_provider = argv['cloud-provider'];
config.debug = argv['debug'];

module.exports = config;
