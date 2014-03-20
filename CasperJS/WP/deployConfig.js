/*
* ::: CONFIG FILE FOR WP DEPLOY :::
*/

var MYSQL_HOST = '';
var MYSQL_USER = '';
var MYSQL_PASSWORD = '';
var MYSQL_DB = '';
var DB_PREFIX = 'wp_';

var SITE_NAME = '';
var SITE_USERNAME = '';
var SITE_PASSWORD = '';
var SITE_EMAIL = '';
var SITE_SEARCH = false;


var MIGRATE_KEY = ""; //Migrate key from connection info on WP-DB-PRO

var TEST_ENV = 'local'; //Enviroment the config is running in

var DEPLOY_CONFIG = {
        local : '', //Local address for WP installation
        dev   : '', //Staging address for WP INstallation
        prod  : '', //Production address for WP installation
        auth  : {username: '', password: '' } //Basic auth used on staging, if required
};