#CasperJS WP Deploy Script
Set up and configures a WordPress site using the given parameters in the `deployConfig.js` file, using the normal WP setup guide.
Also sets up database using [WP-Migrate-DB-Pro](https://deliciousbrains.com/wp-migrate-db-pro/) plugin, if parameters is given and plugin is available in the WordPress install.

##Requirements
-  [CasperJS](http://capserjs.org) 
-  [WP-Migrate-DB-Pro](https://deliciousbrains.com/wp-migrate-db-pro/) for DB migration to work

##Installation
1. Download `wp_deploy.js` and `deployConfig.js` and put it into the same folder
2. Change the `deployConfig.js` file according to your needs
3. Run the command `casperjs test —includes=deployConfig.js wp_deploy.js`
4. Lean back take a cup of coffee while CasperJS do all the hard work for you :-)

Thanks to the guys behind [CasperJS](http://casperjs.org) for creating such an awesome framework for [PhantomJS](http://phantomjs.org/), and [Deliciousbrains](https://deliciousbrains.com) for creating an easy to use migration tool!