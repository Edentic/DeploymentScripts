casper.test.begin('Setting up WP', function suite(test) {
    casper.start();

    if(TEST_ENV === 'dev') {
        casper.setHttpAuth(DEPLOY_CONFIG.auth.username, DEPLOY_CONFIG.auth.password);
    }

    /**
     * Sets up database
     */
    function setupDB() {
        casper.thenOpen(DEPLOY_CONFIG[TEST_ENV] + 'wp-admin/setup-config.php?step=1', function() {
           test.assertExists('form input[name=dbname]', 'DB setup page loaded');
            casper.fill('form', {
               'dbname' : MYSQL_DB,
               'uname' : MYSQL_USER,
               'pwd' : MYSQL_PASSWORD,
               'dbhost' : MYSQL_HOST,
               'prefix' : DB_PREFIX
            }, true);
        });

        casper.then(function() {
            casper.waitForUrl(DEPLOY_CONFIG[TEST_ENV] + 'wp-admin/setup-config.php?step=2', function() {
               if(casper.exists('body#error-page')) {
                   test.assert(false, 'Installation ready');
               } else {
                   test.assert(true, 'Installation ready');
                   test.assertExists('a.button', 'Install button ready');
                   casper.click('a.button');
               }
            });
        });

        casper.then(function() {
           setupSite();
        });
    }

    /**
     * Setup site config
     */
    function setupSite() {
        casper.then(function() {
            casper.waitForSelector('form#setup', function() {
                test.assert(true, 'Setup site ready!');
                casper.fill('form#setup', {
                    'weblog_title' : SITE_NAME,
                    'user_name' : SITE_USERNAME,
                    'admin_password' : SITE_PASSWORD,
                    'admin_password2' : SITE_PASSWORD,
                    'admin_email' : SITE_EMAIL,
                    'blog_public' : SITE_SEARCH
                }, true);
            }, function() {
                test.assert(false, 'Setup site ready!');
            });
        });

        casper.then(function() {
            casper.waitForSelector('table.install-success', function() {
                test.assert(true, 'Site was correctly setup');

                if(typeof MIGRATE_KEY !== 'undefined' && MIGRATE_KEY.length > 0) {
                    migrateDB();
                }

            }, function() {
                test.assert(false, 'Site was correctly setup');
            });
        });
    }

    /**
     * Migrates database
     */
    function migrateDB() {
        var mediaFileInstalled = false;

        casper.then(function() {
            casper.thenOpen(DEPLOY_CONFIG[TEST_ENV] + 'wp-admin', function() {
                test.assertExists('form#loginform', 'Login form loaded!');
                casper.fill('form#loginform',{
                    'log' : SITE_USERNAME,
                    'pwd' : SITE_PASSWORD
                }, true);
            }, function() {
                test.assertExists('form#loginform', 'Login form loaded!');
            });
        });

        casper.then(function() {
           casper.waitForSelector('body.wp-admin', function() {
              test.assert(true, 'Logged into WP-admin');
           }, function() {
               test.assert(false, 'Logged into WP-admin');
           });
        });

        casper.then(function() {
            casper.thenOpen(DEPLOY_CONFIG[TEST_ENV] + 'wp-admin/plugins.php', function() {
              casper.waitForSelector('tr#wp-migrate-db-pro', function() {
                  test.assertExists('tr#wp-migrate-db-pro', 'WP-Migrate-DB-Pro insalled');
                  test.assertExists('tr#wp-migrate-db-pro span.activate a', 'Activate link exists for WP-DB');
                  casper.click('tr#wp-migrate-db-pro span.activate a');
              }, function() {
                  test.assertExists('tr#wp-migrate-db-pro', 'WP-Migrate-DB-Pro insalled');
              });
            });
        });

        casper.then(function() {
            casper.waitForSelector('p#message.updated', function() {
                test.assertExists('tr#wp-migrate-db-pro div.row-actions span.deactivate', 'WP-Migrate-DB-Pro activated');
            }, function() {
                test.assertExists('tr#wp-migrate-db-pro span.deactivate', 'WP-Migrate-DB-Pro activated');
            });

            casper.waitForSelector('tr#wp-migrate-db-pro-media-files span.activate a', function() {
                mediaFileInstalled = true;
                casper.click('tr#wp-migrate-db-pro-media-files span.activate a');
                test.assert(mediaFileInstalled, 'Media files installed');
            }, function() {

            });
        });

        casper.then(function() {
            if(mediaFileInstalled === true) {
                casper.waitForSelector('p#message.updated', function() {
                    test.assertExists('tr#wp-migrate-db-pro-media-files div.row-actions span.deactivate', 'WP-Migrate-DB-MediaFiles activated');
                }, function() {
                    test.assertExists('tr#wp-migrate-db-pro-media-files div.row-actions span.deactivate', 'WP-Migrate-DB-MediaFiles activated');
                });
            }
        });

        casper.then(function() {
            casper.thenOpen(DEPLOY_CONFIG[TEST_ENV] + 'wp-admin/tools.php?page=wp-migrate-db-pro', function() {
               casper.waitForSelector('form#migrate-form', function() {
                   test.assertExists('form#migrate-form input#pull', 'Migrate form ready');
                   casper.click('form#migrate-form input#pull');

                   test.assert((typeof DEPLOY_CONFIG.dev !== 'undefined'), 'Dev enviroment setup');
                   casper.sendKeys('li.pull-list div.connection-info-wrapper textarea', DEPLOY_CONFIG.dev + '\n' + MIGRATE_KEY);
                   casper.click('li.pull-list div.connection-info-wrapper input[type=submit]');
               }, function() {
                   test.assertExists('form#migrate-form', 'Migrate form ready');
               });
            });
        });

        casper.then(function() {
            casper.waitUntilVisible('li.pull-list div.connection-info-wrapper div.basic-access-auth-wrapper', function() {
                test.assert(true, 'Basic auth needed');
                test.assert((typeof DEPLOY_CONFIG.auth.username !== 'undefined' && typeof DEPLOY_CONFIG.auth.password !== 'undefined'), 'Basic auth provided');
                if(typeof DEPLOY_CONFIG.auth.username !== 'undefined' && typeof DEPLOY_CONFIG.auth.password !== 'undefined') {
                    casper.sendKeys('li.pull-list div.connection-info-wrapper div.basic-access-auth-wrapper input[name=auth_username]', DEPLOY_CONFIG.auth.username);
                    casper.sendKeys('li.pull-list div.connection-info-wrapper div.basic-access-auth-wrapper input[name=auth_password]', DEPLOY_CONFIG.auth.password);
                    test.assert(true, 'Basic auth has been inserted');
                }

                casper.click('li.pull-list div.connection-info-wrapper input[type=submit]');
            });
        });

        casper.then(function() {
            casper.waitForSelector('p.notification-message.error-notice', function() {
                    var msg = casper.getHTML('p.notification-message.error-notice');
                    test.assert(false, 'Migrate DB returns error message: ' + msg);
            }, function() {
                    test.assert(true, 'Migrate DB returns no error message');
            });

            casper.waitUntilVisible('div.step-two', function() {
                test.assert(true, 'Connection established');

                var formData = { };
                formData.save_migration_profile = true;

                if(mediaFileInstalled === true) {
                    formData.media_files = true;
                }

                casper.fill('form', formData);

                if(mediaFileInstalled === true) {
                    test.assertExists('input[name=media_files]:checked', 'Media files has been checked');
                }

                test.assertExists('input[name=save_migration_profile]:checked', 'Migration profile is checked');
            }, function() {
                test.assert(false, 'Connection established');
            });
        });

        casper.then(function() {
            casper.click('input[name=Submit]');
        });

        casper.then(function() {
            casper.waitUntilVisible('div.progress-content', function() {
                test.assert(true, 'Pulling data');

                function onTextChange() {
                    casper.waitForSelectorTextChange('div.progress-info-wrapper div.progress-text', function() {
                        console.log('Migration status: ' + casper.getHTML('div.progress-info-wrapper div.progress-text'));
                        if(casper.exists('div.dashicons-yes') == false) {
                            onTextChange();
                        }
                    }, function() {

                    }, 10000);
                }

                onTextChange();
            }, function() {
                casper.scrollToBottom();
                casper.capture('test.png');
                test.assert(false, 'Pulling data');
            });
        });

        casper.then(function() {
            test.assertExists('div.dashicons-yes', 'Migration completed');
        });


        casper.then(function() {
            casper.thenOpen(DEPLOY_CONFIG[TEST_ENV] + 'wp-admin', function() {
                test.assertExists('form#loginform', 'Login form loaded!');
                casper.fill('form#loginform',{
                    'log' : SITE_USERNAME,
                    'pwd' : SITE_PASSWORD
                }, true);
            }, function() {
                test.assertExists('form#loginform', 'Login form loaded!');
            });
        });

        casper.then(function() {
            casper.thenOpen(DEPLOY_CONFIG[TEST_ENV] + 'wp-admin/options-permalink.php',function() {
                casper.waitForSelector('form[name=form]', function() {
                    test.assertExists('form[name=form]', 'Parmalinks submit button exists');
                    casper.fill('form[name=form]', {
                        'selection' : '/%postname%/'
                    }, true);
                }, function() {
                    test.assertExists('input[name=submit]', 'Parmalinks submit button exists');
                });
            });
        });

        casper.then(function() {
           casper.waitForSelector('#message.updated', function() {
               test.assert(true, 'Permalinks updated');
           }, function() {
               test.assert(false, 'Permalinks updated');
           });
        });

        casper.then(function() {
            casper.waitForSelector('#wp-admin-bar-logout a', function() {
                casper.click('#wp-admin-bar-logout a');
            });
        });

        casper.then(function() {
            casper.waitForSelector('p.message', function() {
                console.log(casper.getHTML('p.message'));
                test.assert(true, 'logout completed');
            }, function() {
                test.assert(false, 'logout completed');
            });
        });
    }

    casper.thenOpen(DEPLOY_CONFIG[TEST_ENV], function() {
            if(casper.exists('body#error-page')) {
                setupDB();
            } else {
                setupSite();
            }
    });

    casper.run(function() {
       test.done();
    });
});