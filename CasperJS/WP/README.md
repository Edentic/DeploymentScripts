#CasperJS WP Deploy Script
The script configures a WordPress site using the given parameters in the `deployConfig.js` file, by running the normal WP setup guide.
If the parameters is given and the [WP-Migrate-DB-Pro](https://deliciousbrains.com/wp-migrate-db-pro/) plugin is available in the WordPress installation, it also configures the database using the plugin.

##Requirements
-  [CasperJS](http://casperjs.org) 
-  [WP-Migrate-DB-Pro](https://deliciousbrains.com/wp-migrate-db-pro/) for DB migration to work

##Installation
1. Download `wp_deploy.js` and `deployConfig.js` and put it into the same folder
2. Change the `deployConfig.js` file according to your needs
3. Run the command `casperjs test —includes=deployConfig.js wp_deploy.js`
4. Lean back, take a cup of coffee while CasperJS is doing all the hard work for you :-)

Thanks to the guys behind [CasperJS](http://casperjs.org) for creating such an awesome framework for [PhantomJS](http://phantomjs.org/), and [Deliciousbrains](https://deliciousbrains.com) for creating an easy to use migration tool!