// Swyft Model Obj ******************************************************************************************************
var sModel = {

    // Main "ME" object ************************************************************************************************
    me: {},

    // Create the sModel.me ********************************************************************************************
    setObj: function (setLang, callback) {
        "use strict";
        var done = $.Deferred(),
            db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000);

        // Query the database ******************************************************************************************
        function queryDB(tx) {
            tx.executeSql('SELECT * FROM usrCfg WHERE id = 1 LIMIT 1', [], querySuccess, errorCB);
        }

        // Success callback ********************************************************************************************
        function querySuccess(tx, results) {
            done.resolve(results.rows.item(0));
        }

        // Transaction error callback **********************************************************************************
        function errorCB(err) {
            done.resolve(false);
        }

        // Transaction callback ****************************************************************************************
        function doCallback(status, lang) {
            if (typeof callback === "function") {
                callback(status, lang);
            }
        }

        // Transaction *************************************************************************************************
        if (setLang === true) {
            sModel.setLang(function () {
                db.transaction(queryDB, errorCB);
            });
        } else {
            db.transaction(queryDB, errorCB);
        }

        // Main loop over usrData **************************************************************************************

        $.when(done).then(function (usrData) {
            if (typeof usrData !== "undefined" && usrData !== false && usrData !== null) {
                sModel.me = usrData;
                setTimeout(function () {
                    doCallback(true, true);
                }, 1);
            } else {
                doCallback(false, false);
            }
        });
    },

    // Check USer Data Model *******************************************************************************************
    checkObj: function () {
        "use strict";
        if (
        // User Data Model Validation ******************************************************************************
            typeof sModel.me.deviceUuid === "undefined" ||
                sModel.me.deviceUuid === null ||
                sModel.me.deviceUuid === "null" ||
                sModel.me.deviceUuid === "" ||
                typeof sModel.me.mobileServicesUrl === "undefined" ||
                sModel.me.mobileServicesUrl === null ||
                sModel.me.mobileServicesUrl === "null" ||
                sModel.me.mobileServicesUrl === "" ||
                typeof sModel.me.mobileSiteUrl === "undefined" ||
                sModel.me.mobileSiteUrl === null ||
                sModel.me.mobileSiteUrl === "null" ||
                sModel.me.mobileSiteUrl === "" ||
                typeof sModel.me.clientCode === "undefined" ||
                sModel.me.clientCode === null ||
                sModel.me.clientCode === "null" ||
                sModel.me.clientCode === "" ||
                typeof sModel.me.clientId === "undefined" ||
                sModel.me.clientId === null ||
                sModel.me.clientId === "null" ||
                sModel.me.clientId === ""
            ) {
            // User Data Model Corrupt *********************************************************************************
            return false;
        } else {
            // User Data Model Passed Validation ***********************************************************************
            return true;
        }

    },

    // Update User Language ********************************************************************************************
    setLang: function (callback) {
        "use strict";
        function doUpdate(lang) {
            var tx = [
                {
                    objId: "lang",
                    val: lang
                }
            ];

            sModel.tx(tx, function (errs, errArgs) {
                callback(errs, errArgs);
            });
        }

        if (sController.app.events.params.pg === true) {
            navigator.globalization.getLocaleName(function (foundLang) {
                sUtil.clog('Language Found :: ' + foundLang.value + ' :: Saving');
                doUpdate(foundLang.value);
            }, function () {
                //sUtil.clog('Setting Default Language  :: en-us');
                doUpdate("en-us");
            });
        } else {
            //sUtil.clog('Setting Default Language  :: en-us');
            doUpdate("en-us");
        }
    },

    // Update User Language ********************************************************************************************
    getLang: function (callback) {
        "use strict";
        var done = $.Deferred();
        if (sController.app.events.params.pg === true) {
            navigator.globalization.getLocaleName(function (foundLang) {
                done.resolve(foundLang.value);
            }, function () {
                done.resolve("en-us");
            });
        } else {
            done.resolve("en-us");
        }
        $.when(done).then(function (lang) {
            callback(lang);
        });
    },

    // Set/Update GPS **************************************************************************************************
    setGps: function (highAccuracy, reDrawMap, showLoading, callback) {
        "use strict";
        sUtil.clog('Starting GPS Update Process..."It\'s a Trap"', 'gps', false);

        sModel.gpsCallbacks.cbHolder = (typeof callback === "function") ? callback : false;
        sModel.gpsCallbacks.reDraw = (typeof reDrawMap !== "undefined" &&
            (reDrawMap === true || reDrawMap === false)) ? reDrawMap : false;
        sModel.gpsCallbacks.showLoading = (typeof showLoading !== "undefined" &&
            (showLoading === true || showLoading === false)) ? showLoading : false;

        if (showLoading) {
            sView.jqm.helpers.ldrWidget('show', 'Finding You');
        }

        // Old Ways
        //var ha = (highAccuracy === false && sModel.me.devicePlatform === 'Android' && sModel.me.deviceVersion <= '2.3') ? true : (sModel.me.devicePlatform === 'Android') ? false : highAccuracy,
        //var ha = (highAccuracy === false && sModel.me.devicePlatform === 'Android' && sModel.me.deviceVersion <= '2.3') ? true : highAccuracy,

        var ha = (highAccuracy === false && sModel.me.devicePlatform === 'Android' && sModel.me.deviceVersion <= '2.3') ?
                true
                : (sModel.me.devicePlatform === 'Desktop') ?
                highAccuracy
                : highAccuracy,
            maxAge =
                (sModel.me.devicePlatform === 'Android') ?
                    (ha === true) ? 15000 : 30000
                    : (sModel.me.devicePlatform === 'iOS') ?
                    (ha === true) ? 15000 : 30000
                    : (sModel.me.devicePlatform === 'Desktop') ?
                    500000
                    : 15000,
            tOut =
                (sModel.me.devicePlatform === 'Android') ?
                    (ha === true) ? 30000 : 10000
                    : (sModel.me.devicePlatform === 'iOS') ?
                    (ha === true) ? 30000 : 10000
                    : (sModel.me.devicePlatform === 'Desktop') ?
                    6000
                    : 10000;

        sUtil.clog('GPS :: High accuracy is going to be :: ' + ha + ' :: The OS is :: ' + sModel.me.devicePlatform +
            ' :: The max age will be :: ' + maxAge + ' :: The Timeout will be :: ' + tOut);

        navigator.geolocation.getCurrentPosition(
            // Success callback
            sModel.gpsCallbacks.success,
            // Fail callback
            sModel.gpsCallbacks.error,
            // Options
            {
                maximumAge: maxAge,
                timeout: tOut,
                enableHighAccuracy: ha
            });

        setTimeout(function() {
            if (sModel.gpsCallbacks.showLoading) {
                sUtil.clog('Failed to get response for "getCurrentPosition"', 'gps', false);
                var err = {
                    code: "TIMEOUT",
                    message: "'getCurrentPosition' failed to respond within the set time frame, " + tOut
                };
                sModel.gpsCallbacks.done(false);
                sModel.gpsCallbacks.error(err);
            }
        }, tOut + 1000);
    },

    // GPS Callbacks ***************************************************************************************************
    gpsCallbacks: {
        reDraw: false,
        cbHolder: false,
        showLoading: false,
        // Success *****************************************************************************************************
        success: function (position) {
            "use strict";
            sUtil.clog("In success CB");
            var tx = [
                {
                    objId: "deviceLat",
                    val: position.coords.latitude
                },
                {
                    objId: "deviceLng",
                    val: position.coords.longitude
                },
                {
                    objId: "gpsTimestamp",
                    val: new Date(position.timestamp)
                },
                {
                    objId: "deviceGps",
                    val: "true"
                }
            ];
            sModel.tx(tx, function (errs, errsArgs) {
                sUtil.clog("in db save cb");
                function doCallback() {
                    sUtil.clog('A gps was call written to db :: ' +
                        'Lat :' + position.coords.latitude +
                        ' Lng: ' + position.coords.longitude +
                        ' Time stamp: ' + new Date(position.timestamp), "gps", false);

                    if (errs) {
                        sUtil.clog('Error writing GPS TX to db', 'gps', true);
                        sModel.gpsCallbacks.done(false);
                    } else {
                        sModel.gpsCallbacks.done(true);
                    }
                }

                if (sModel.gpsCallbacks.reDraw === true) {
                    sView.makeMap(position, function () {
                        doCallback();
                    });
                } else {
                    doCallback();
                }
            });
        },

        // Done ********************************************************************************************************
        done: function (status) {
            "use strict";
            sModel.setObj(false, function () {
                sModel.gpsCallbacks.showLoading = false;
                sModel.gpsCallbacks.reDraw = false;
                sView.jqm.helpers.ldrWidget("hide");

                if (typeof sModel.gpsCallbacks.cbHolder === "function") {
                    var cb = sModel.gpsCallbacks.cbHolder;
                    sModel.gpsCallbacks.cbHolder = null;
                    cb(status);
                } else {
                    sModel.gpsCallbacks.cbHolder = null;
                }
            });
        },

        // Error *******************************************************************************************************
        error: function (err) {
            "use strict";
            sUtil.clog('GPS :: There was an Error getting the GPS');
            if (err.code === "TIMEOUT") {
                sUtil.clog('GPS :: TIMEOUT' + ' :: Msg :: ' + err.message);
                sView.utils.confirm('Cannot access your location, GPS timeout.\nSwyft requires this, retry?',
                    'GPS Timeout',
                    'Retry',
                    'Exit',
                    function (bi) {
                        var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                        if (bi === tbi) {
                            sModel.setGps(true, true, true, sModel.gpsCallbacks.cbHolder);
                        } else {
                            sModel.gpsCallbacks.cbHolder = null;
                            sController.app.sysEvents.closeApp();
                        }
                    }
                );
            } else if (err.code === "PERMISSION_DENIED") {
                sUtil.clog('GPS :: PERMISSION_DENIED' + ' :: Msg :: ' + err.message);
                sView.utils.confirm('You have denied GPS access to Swyft!\nError Code: 1\n' +
                    'Please enable access or contact your ' +
                    'device\'s administrator',
                    'GPS Error',
                    'Retry',
                    'Exit',
                    function (bi) {
                        var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                        if (bi === tbi) {
                            sModel.setGps(true, true, true, sModel.gpsCallbacks.cbHolder);
                        } else {
                            sModel.gpsCallbacks.cbHolder = null;
                            sController.app.sysEvents.closeApp();
                        }
                    }
                );
            } else if (err.code === "POSITION_UNAVAILABLE") {
                sUtil.clog('GPS :: POSITION_UNAVAILABLE' + ' :: Msg :: ' + err.message);
                sView.utils.confirm('Your device has denied Swyft access to the GPS!\nError Code: 2\n' +
                    'Please check your GPS or ' +
                    'contact your device\'s administrator',
                    'GPS Error',
                    'Retry',
                    'Exit',
                    function (bi) {
                        var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                        if (bi === tbi) {
                            sModel.setGps(true, true, true, sModel.gpsCallbacks.cbHolder);
                        } else {
                            sModel.gpsCallbacks.cbHolder = null;
                            sController.app.sysEvents.closeApp();
                        }
                    }
                );
            } else {
                sUtil.clog('GPS :: ERROR_CODE_UNAVAILABLE :: ' + err.code + ' :: Msg :: ' + err.message);
                sView.utils.confirm('There was an Error accessing your GPS!\nPlease check your GPS or ' +
                    'contact your device\'s administrator',
                    'GPS Error',
                    'Retry',
                    'Exit',
                    function (bi) {
                        var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                        if (bi === tbi) {
                            sModel.setGps(true, true, true, sModel.gpsCallbacks.cbHolder);
                        } else {
                            sModel.gpsCallbacks.cbHolder = null;
                            sController.app.sysEvents.closeApp();
                        }
                    }
                );
            }
        },

        // Low Accuracy Error ******************************************************************************************
        errorLowAccuracy: function (err) {
            "use strict";
            setTimeout(function () {
                sView.jqm.helpers.ldrWidget("hide");
            }, 1500);
            //$('.gpsErrIcon').css('display', 'block');

            sUtil.clog('GPS :: gps low accuracy ERROR call failed');

            $('#diLattxt').attr('value', '0');
            $('#diLngtxt').attr('value', '0');
            $('#diLatlctxt').attr('value', '00/00/00 00:00:00');

            sModel.gpsCallbacks.done(false);

            /*navigator.notification.alert(
             'Your GPS position is unavailable!\nReverting to last know loacation.\nPlease check your GPS or ' +
             'contact your device\'s administrator',  // message
             function(){

             },                  // callback to invoke with index of button pressed
             'GPS Error',        // title
             'I Understand'      // buttonLabels
             );

             sUtil.clog('GPS :: GPS LOW ACCURACY ERROR: ' + err.message);


             var db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000);
             sUtil.clog('GPS :: DB VAR SET');

             db.transaction(function(tx) {
             sUtil.clog('GPS :: Executing GPS ERROR Transaction');
             tx.executeSql('UPDATE usrCfg SET ' +
             'deviceGps = "false", ' +
             'deviceLat  = "0", ' +
             'deviceLng  = "0", ' +
             'gpsTimestamp = "00/00/00 00:00:00" ' +
             'WHERE id = 1');
             }, function(err){
             sUtil.clog('GPS :: There was an Error Writing to the DB :: '+err.message);

             }, function(){
             sUtil.clog('GPS :: gps low accuracy ERROR call written to db');

             sModel.setObj(false, function(){

             });

             $('#diLattxt').attr('value', '0');
             $('#diLngtxt').attr('value', '0');
             $('#diLatlctxt').attr('value', '00/00/00 00:00:00');

             });*/
        }
    },

    // Set/Update DB Element *******************************************************************************************
    tx: function (args, callback) {
        "use strict";
        /*
         - What to Pass in example.
         - Each will be processed as a request.
         -----------------------------------------------------
         var exampleArgs = [
         {
         txType: "update",
         objId : "appVersion",
         val : "2.5.9"
         },
         {
         txType: "update",
         objId : "deviceLat",
         val : "78.15384"
         }
         ];
         "exampleArgs" would be the object passed in.
         -----------------------------------------------------
         */

        var done = $.Deferred(),
            currentArg = {},
            errArgs = [],
            doneArgs = [],
            retry = false,
            sql = '',
            db = null;

        // Populate the DB *********************************************************************************************
        function populateDB(tx) {
            db.transaction(
                // Execute TX ******************************************************************************************
                function (tx) {
                    tx.executeSql(
                        'Update usrCfg SET ' + sql + ' WHERE id = 1'
                    );
                },
                // Error ***********************************************************************************************
                function (err) {
                    sUtil.clog('There was an Error Witting to the DB :: ' + err.message);
                    if (err.code === 5) {
                        sController.app.sysEvents.sInit.createTbl.init(true, function () {
                            retry = true;
                        });
                    }
                },
                // Success *********************************************************************************************
                function () {
                });
        }

        // Error Callback **********************************************************************************************
        function errorCB(err) {
            sUtil.clog("Error writing to DB", "tx", true);
            done.resolve();
        }

        // Success Callback ********************************************************************************************
        function successCB() {
            done.resolve();
        }

        // Main Each Loop on the Args **********************************************************************************
        function loopArgs(argsToLoop, callback) {
            // Main Each Loop on the Args **********************************************************************************
            $.each(argsToLoop, function (index) {
                if (typeof this.objId === "undefined" ||
                    typeof this.val === "undefined") {
                    errArgs.push(this);
                } else {
                    sql += '' + this.objId + ' = "' + this.val + '"';
                    if ((index + 1) < argsToLoop.length) {
                        sql += ", ";
                    }
                    doneArgs.push(this);
                }
            });

            callback();
        }

        // If no Args fail
        if (typeof args === "undefined" || !args) {
            done.resolve();
        } else {
            loopArgs(args, function () {
                db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000);
                db.transaction(populateDB, errorCB, successCB);
            });
        }

        // When All Done ***********************************************************************************************
        $.when(done).then(function () {

            if (retry === true) {
                var tmp = errArgs;
                errArgs = [];
                retry = false;
                loopArgs(tmp);
            }

            var errs = (errArgs.length > 0);

            $.each(errArgs, function () {
                sUtil.clog("There was en error updating the item " + this.objId, "db", false);
            });

            sModel.setObj(false, function () {
                //sUtil.clog("Successfully updated " + doneArgs.length + " items", "db", false);
                if (typeof callback === "function") {
                    callback(errs, errArgs);
                }
            });

        });

    }

};