// Swyft Controller Obj ************************************************************************************************
var sController = {
    // Swyft Error Function *********************************************************************************************
    swyftError: function (err) {
        "use strict";
        sUtil.clog("Error :: " + err.message);
        return false;
    },

    // Error Function Callback *****************************************************************************************
    errorCB: function (err) {
        "use strict";
        sUtil.clog("Error processing SQL: " + err.code);
        //sView.jqm.helpers.ldrWidget("hide");
    },

    // Get Random Num Function *****************************************************************************************
    genRandomNum: function () {
        "use strict";
        return Math.floor(Math.random() * 90000) + 10000;
    },

    // Main App Object *************************************************************************************************
    app: {
        // Configuration ***********************************************************************************************
        cfg: {
            usrTblObj: {},
            globalAppVersion: "2.5.12",
            states: {}
        },

        // Main Init Sequence Start ************************************************************************************
        initialize: function () {
            "use strict";
            sController.app.events.pgCheck(function () {
                sController.app.events.bind();
            });
        },

        // Ready Events Obj ********************************************************************************************
        events: {

            params: {
                socket: null,
                spmk: "OUYxQzgwOTktNDY4RC00QTI3LThBRDUtRjJCQUM2MDBEQUQy",
                pg: false,
                pgChk: $.Deferred(),
                jq: $.Deferred(),
                jqm: $.Deferred(),
                dReady: $.Deferred()
            },

            // Bind and Add Event Listeners ****************************************************************************
            bind: function () {
                "use strict";
                // PhoneGap Event Listener *****************************************************************************
                document.addEventListener('deviceready', sController.app.events.deviceready, false);

                // JQ Listener *****************************************************************************************
                if (typeof window.jQuery !== 'undefined') {
                    // jQuery is loaded
                    if (sController.app.events.params.jq.state() !== 'resolved') {
                        sController.app.events.jqReady();
                    }
                } else {
                    $(document).ready(function () {
                        if (sController.app.events.params.jq.state() !== 'resolved') {
                            sController.app.events.jqReady();
                        }
                    });
                }

                // JQM Check *******************************************************************************************
                if (typeof $.mobile !== 'undefined') {
                    if (sController.app.events.params.jqm.state() !== 'resolved') {
                        sController.app.events.jqmReady();
                    }
                } else {
                    $(document).on("pagecreate", function () {
                        if (sController.app.events.params.jqm.state() !== 'resolved') {
                            sController.app.events.jqmReady();
                        }
                    });
                }

                // Start App When all Deferred Objs are Resolved *******************************************************
                $.when(sController.app.events.params.jq, sController.app.events.params.jqm,
                        sController.app.events.params.pgChk)
                    .then(function () {
                        sView.jqm.helpers.ldrWidget("show", "Starting Swyft");
                        if (sController.app.events.params.pg === true) {
                            $.when(sController.app.events.params.dReady).then(function () {
                                sController.app.sysEvents.cfgCheck();
                            });
                        } else {
                            sController.app.sysEvents.cfgCheck();
                        }
                    }
                );
            },

            // JQM Doc Page Init Ready Event ***************************************************************************
            jqmReady: function () {
                "use strict";
                sView.jqm.init(function () {
                    sController.app.events.params.jqm.resolve();
                });
            },

            // JQ Ready Event ******************************************************************************************
            jqReady: function () {
                "use strict";
                sController.app.events.params.jq.resolve();
            },

            // Device Ready Event **************************************************************************************
            deviceready: function () {
                "use strict";
                window.setTimeout(function() {
                                  sController.app.events.params.pg = true;
                                  //alert("Device Ready");
                                  //alert(device);
                                  //alert(device.platform);
                                  if (device.platform === 'iOS') {
                                  //IOS 7 Hide Status Bar
                                  window.StatusBar.overlaysWebView(false);
                                  window.StatusBar.styleLightContent();
                                  window.StatusBar.show();
                                  }
                                  navigator.splashscreen.hide();
                                  sController.app.events.params.dReady.resolve();
                                  }, 500);
               
            },

            // PG Check Event ******************************************************************************************
            pgCheck: function (callback) {
                "use strict";
                function resolve (pgThere) {
                    sController.app.events.params.pg = pgThere;
                    sController.app.events.params.pgChk.resolve();
                    setTimeout(function () {
                        if (typeof callback === "function") {
                            callback();
                        } else {
                            return pgThere;
                        }
                    }, 2);
                }

                if (document.location.protocol === "file:") {
                    this.phoneGapListeners(function () {
                        resolve(true);
                    });
                } else {
                    document.querySelector('#deviceready .pending').className += ' hide';
                    var completeElem = document.querySelector('#deviceready .complete');
                    completeElem.className = completeElem.className.split('hide').join('');
                    resolve(false);
                }
            },

            // Add PG Listeners ****************************************************************************************
            phoneGapListeners: function (callback) {
                "use strict";
                try {
                    // System Event Listeners **************************************************************************
                    window.addEventListener('message', sController.app.sysEvents.receiveMessage, false);
                    window.addEventListener('onmessage', sController.app.sysEvents.receiveMessage, false);
                    // Phonegap Event Listeners
                    document.addEventListener('offline', sController.app.mobileEvents.onOffline, false);
                    document.addEventListener('resume', sController.app.mobileEvents.onResume, false);
                    document.addEventListener('start', sController.app.mobileEvents.onStart, true);
                    document.addEventListener('pause', sController.app.mobileEvents.onPause, false);
                    document.addEventListener('menubutton', sController.app.mobileEvents.menuButton, false);
                    document.addEventListener('backbutton', sController.app.mobileEvents.backKey, false);
                    document.addEventListener('orientationchange', sController.app.mobileEvents.orientChange, false);
                    document.querySelector('#deviceready .pending').className += ' hide';
                    var completeElem = document.querySelector('#deviceready .complete');
                    completeElem.className = completeElem.className.split('hide').join('');
                } catch (e) {
                    sUtil.clog("Error adding PhoneGap Listeners", "init", true);
                } finally {
                    callback();
                }
            },

            // Hide Device Ready Notification **************************************************************************
            hide: function (id) {
                "use strict";
                document.querySelector('#' + id + ' .complete').className += ' hide';
                var completeElem = document.querySelector('#' + id + ' .pending');
                completeElem.className = completeElem.className.split('hide').join('');
            }
        },

        // Mobile Events Obj *******************************************************************************************
        mobileEvents: {
            // PG Orientation Change Event *****************************************************************************
            orientChange: function () {
                "use strict";
                // orint change event
                setTimeout(function () {
                    //alert('O change')
                    //$(window).trigger('resize');
                }, 0);
            },

            // PG on Resume Event **************************************************************************************
            onResume: function () {
                "use strict";
                setTimeout(function () {
                    //alert('onResume');
                }, 0);
            },

            // PG On Resume Event **************************************************************************************
            onOffline: function () {
                "use strict";
                setTimeout(function () {
                    //navigator.notification.alert('The Device Just Went Offline', function() {}, 'Notification', 'Ok');
                }, 0);
            },

            // PG On Offline Event *************************************************************************************
            onPause: function () {
                "use strict";
                setTimeout(function () {
                    //alert('onPause');
                }, 0);
            },

            // PG On Start Event ***************************************************************************************
            onStart: function () {
                "use strict";
                setTimeout(function () {
                    //alert('onStart');
                }, 0);
            },

            // PG BAck Button ******************************************************************************************
            backKey: function (e) {
                "use strict";
                setTimeout(function () {
                    //Back Button event
                    e.preventDefault();
                    sView.utils.confirm('Exit Swyft Mobile?',
                        'Notification',
                        'Yes',
                        'No',
                        function (bi) {
                            var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                            if (bi === tbi) {
                                try {
                                    navigator.app.exitApp();
                                } catch (err) {
                                    sUtil.clog(err, 'error', true);
                                }
                            }
                        }
                    );
                    return false; //prevents default behaviour
                }, 0);
            },

            // PG Menu Button **********************************************************************************************
            menuButton: function (e) {
                "use strict";
                e.preventDefault();
                if (sModel.me.devicePlatform === "Android") {
                    $('#mainP').panel("open");
                }
            }
        },

        // System Events Obj *******************************************************************************************
        sysEvents: {

            // Swyft Init **********************************************************************************************
            sInit: {
                start: function () {
                    "use strict";
                    sController.app.sysEvents.sInit.createTbl.init(false, false);
                    /*if (sController.forms.validate("initForm")) {
                     sView.utils.confirm('This will initialize this device,\nand register it to your user ID.',
                     'Notification',
                     'Let\'s Do It',
                     'No Wait',
                     function (buttonIndex) {
                     var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                     if (buttonIndex === tbi) {
                     sController.app.sysEvents.sInit.createTbl.init(false, false);
                     }
                     });
                     }*/
                },
                // USER TBL Setup **********************************************************************************************
                createTbl: {
                    s4: function () {
                        "use strict";
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    },
                    guid: function () {
                        "use strict";
                        return sController.app.sysEvents.sInit.createTbl.s4() + sController.app.sysEvents.sInit.createTbl.s4() + '-' +
                            sController.app.sysEvents.sInit.createTbl.s4() + '-' + sController.app.sysEvents.sInit.createTbl.s4() + '-' +
                            sController.app.sysEvents.sInit.createTbl.s4() + '-' + sController.app.sysEvents.sInit.createTbl.s4() +
                            sController.app.sysEvents.sInit.createTbl.s4() + sController.app.sysEvents.sInit.createTbl.s4();
                    },
                    init: function (createDBOnly, callback) {
                        "use strict";
                        sView.jqm.helpers.ldrWidget('show', 'Configuring Your Device');
                        var date = new Date(),
                            time = new Date(),
                            model = null,
                            cordova = null,
                            platform = null,
                            uuid = null,
                            version = null,
                            netState = null,
                            lang = null;

                        // Setup Vars ******************************************************************************************
                        if (sController.app.events.params.pg === true) {

                            // PG There ****************************************************************************************
                            sController.app.cfg.states[Connection.UNKNOWN] = 'Unknown connection';
                            sController.app.cfg.states[Connection.ETHERNET] = 'Ethernet connection';
                            sController.app.cfg.states[Connection.WIFI] = 'WiFi connection';
                            sController.app.cfg.states[Connection.CELL_2G] = 'Cell 2G connection';
                            sController.app.cfg.states[Connection.CEL_3G] = 'Cell 3G connection';
                            sController.app.cfg.states[Connection.CELL_4G] = 'Cell 4G connection';
                            sController.app.cfg.states[Connection.CELL] = 'Cell generic connection';
                            sController.app.cfg.states[Connection.NONE] = 'No network connection';

                            netState = sController.app.cfg.states[navigator.connection.type];
                            model = device.model;
                            cordova = device.cordova;
                            platform = device.platform;
                            // PG Way
                            // uuid = device.uuid.replace(/-/g, "");
                            // Swyft Way
                            uuid = sController.app.sysEvents.sInit.createTbl.guid();
                            version = device.version;

                        } else {

                            // PG Not There ************************************************************************************
                            netState = "Ethernet Connection";
                            model = "N/A";
                            cordova = "N/A";
                            platform = "Desktop";
                            uuid = sController.app.sysEvents.sInit.createTbl.guid();
                            version = "N/A";

                        }

                        // Get Lang ********************************************************************************************
                        sModel.getLang(function (l) {
                            lang = l;

                            // Setup Obj ***************************************************************************************
                            sController.app.cfg.usrTblObj = {
                                netState: netState,
                                results: null,
                                deviceName: model,
                                appVersion: sController.app.cfg.globalAppVersion,
                                deviceCordova: cordova,
                                devicePlatform: platform,
                                deviceGps: 'true',
                                deviceUuid: uuid,
                                deviceVersion: version,
                                deviceLat: '0',
                                deviceLng: '0',
                                initialized: 'false',
                                month: date.getMonth() + 1,
                                day: date.getDate(),
                                year: date.getFullYear(),
                                hours: time.getHours(),
                                minutes: (time.getMinutes() < 10) ? "0" + time.getMinutes() : time.getMinutes(),
                                m: (time.getHours() > 11) ? "PM" : "AM",
                                gpsTimestamp: null,
                                userId: $('#txtUIDWS').val().toLowerCase(),
                                initializationKey: $('#txtInitKeyWS').val().toLowerCase(),
                                mobileSiteUrl: null,
                                mobileServicesUrl: null,
                                brandingImageUrl: null,
                                colorScheme: null,
                                clientId: null,
                                clientCode: null,
                                interactionChannel: null,
                                interactionType: null,
                                interactionLocation: null,
                                lang: lang
                            };

                            sController.app.sysEvents.sInit.createTbl.sCreate(function (status) {
                                sController.app.cfg.usrTblObj = {};
                                if (status) {
                                    sUtil.clog('usrTblObj Created');
                                    sModel.setObj(true, function (status) {
                                        if (typeof createDBOnly !== "undefined" && createDBOnly === true &&
                                            typeof callback === "function") {
                                            callback(true);
                                        } else {
                                            sController.app.sysEvents.sInit.stageOne();
                                        }
                                    });
                                } else {
                                    sUtil.clog('User Table Not Created', 'config error', true);
                                    //sView.jqm.helpers.ldrWidget("hide");
                                    if (typeof createDBOnly !== "undefined" && createDBOnly === true &&
                                        typeof callback === "function") {
                                        callback(false);
                                    }
                                }
                            });
                        });
                    },
                    sCreate: function (callback) {
                        "use strict";
                        sUtil.clog('Start Create', 'config');
                        sController.app.sysEvents.sInit.createTbl.exSql(function (status) {
                            callback(status);
                        });
                    },
                    exSql: function (callback) {
                        "use strict";
                        sUtil.clog('Ex SQL', 'config');
                        var db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000),
                            initDate = sController.app.cfg.usrTblObj.month + "/" + sController.app.cfg.usrTblObj.day + "/" +
                                sController.app.cfg.usrTblObj.year,
                            initTime = sController.app.cfg.usrTblObj.hours + ":" + sController.app.cfg.usrTblObj.minutes + " " +
                                sController.app.cfg.usrTblObj.m;

                        db.transaction(
                            // SQL ************************************************
                            function (tx) {
                                tx.executeSql('DROP TABLE IF EXISTS usrCfg');
                                tx.executeSql('CREATE TABLE IF NOT EXISTS usrCfg (' +
                                    'id unique, deviceName, appVersion, devicePlatform, deviceUuid, deviceVersion,  ' +
                                    'deviceCordova, initKey, userId, initialized, dateCreated, timeCreated, dateLastMod, ' +
                                    'timeLastMod, deviceGps, deviceLat, deviceLng, gpsTimestamp, netState, clientId, ' +
                                    'clientCode, mobileSiteUrl, mobileServicesUrl, brandingImageUrl, colorScheme, ' +
                                    'interactionChannel, interactionType, interactionLocation, lang)');

                                tx.executeSql('INSERT INTO usrCfg (id, deviceName, appVersion, devicePlatform, deviceUuid, ' +
                                    'deviceVersion,  deviceCordova,' + 'initKey, userId, initialized, dateCreated, ' +
                                    'timeCreated, dateLastMod, timeLastMod, deviceGps, deviceLat, deviceLng, gpsTimestamp, ' +
                                    'netState, clientId, clientCode, mobileSiteUrl, mobileServicesUrl, brandingImageUrl, ' +
                                    'colorScheme, interactionChannel, interactionType, interactionLocation, lang)' +
                                    'VALUES (1, "' + sController.app.cfg.usrTblObj.deviceName + '", "' +
                                    sController.app.cfg.usrTblObj.appVersion + '", "' +
                                    sController.app.cfg.usrTblObj.devicePlatform + '", "' +
                                    sController.app.cfg.usrTblObj.deviceUuid + '", "' +
                                    sController.app.cfg.usrTblObj.deviceVersion + '","' +
                                    sController.app.cfg.usrTblObj.deviceCordova + '",' + '"' +
                                    sController.app.cfg.usrTblObj.initializationKey + '", "' +
                                    sController.app.cfg.usrTblObj.userId + '", "' +
                                    sController.app.cfg.usrTblObj.initialized + '", "' + initDate + '", "' + initTime + '", "' +
                                    initDate + '", "' + initTime + '", "' +
                                    sController.app.cfg.usrTblObj.deviceGps + '", "' +
                                    sController.app.cfg.usrTblObj.deviceLat + '", "' +
                                    sController.app.cfg.usrTblObj.deviceLng + '", "' +
                                    sController.app.cfg.usrTblObj.gpsTimestamp + '", "' +
                                    sController.app.cfg.usrTblObj.netState + '",' + '"' +
                                    sController.app.cfg.usrTblObj.clientId + '", "' +
                                    sController.app.cfg.usrTblObj.clientCode + '", "' +
                                    sController.app.cfg.usrTblObj.mobileSiteUrl + '", "' +
                                    sController.app.cfg.usrTblObj.mobileServicesUrl + '", "' +
                                    sController.app.cfg.usrTblObj.brandingImageUrl + '", "' +
                                    sController.app.cfg.usrTblObj.colorScheme + '",' + '"' +
                                    sController.app.cfg.usrTblObj.interactionChannel + '",' + '"' +
                                    sController.app.cfg.usrTblObj.interactionType + '",' + '"' +
                                    sController.app.cfg.usrTblObj.interactionLocation + '",' + '"' +
                                    sController.app.cfg.usrTblObj.lang + '")');

                            },
                            // ERR ************************************************
                            function (err) {
                                sUtil.clog(err, 'config error', true);
                                callback(false);
                            },
                            // SUCCESS *********************************************
                            function () {
                                sUtil.clog('USER :: Table Created Successfully', 'Config');
                                callback(true);
                            }
                        );
                    }
                },
                // Stage One ***************************************************************************************************
                stageOne: function () {
                    "use strict";
                    sUtil.clog('Init Stage One');
                    var mobileSiteUrl = null,
                        mobileServicesUrl = null,
                        db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000),
                        brandingImageUrl = null,
                        colorScheme = null,
                        clientId = null,
                        clientCode = null,
                        severity = null,
                        stackTrace = null,
                        transmsg = null,
                        transres = null,
                        auth = null;

                    $.support.cors = true;

                    $.ajax({
                        async: false,
                        crossDomain: true,
                        url: window.atob('aHR0cHM6Ly9tb2JpbGVjZW50cmFsLnN3eWZ0aHViLmNvbS9Td3lmdE1vYmlsZU' +
                            'NlbnRyYWwvQXV0aG9yaXphdGlvbi5hc214L0F1dGhvcml6ZVVzZXIy'),
                        data: {
                            DeviceID: sModel.me.deviceUuid,
                            InitializationKey: $('#txtInitKeyWS').val().toLowerCase(),
                            UserID: $('#txtUIDWS').val().toLowerCase(),
                            AppVersion: sController.app.cfg.globalAppVersion
                        },
                        success: function (xml) {

                            transres = $(xml).find("TransactionSuccess").text();
                            auth = $(xml).find("Authorized").text();
                            severity = $(xml).find("Severity").text();
                            stackTrace = $(xml).find("StackTrace").text();
                            transmsg = $(xml).find("TransactionMessage").text();

                            clientId = $(xml).find("ClientID").text();
                            clientCode = $(xml).find("ClientCode").text().toUpperCase();
                            mobileSiteUrl = $(xml).find("MobileSiteUrl").text();
                            mobileServicesUrl = $(xml).find("MobileServicesUrl").text();
                            brandingImageUrl = $(xml).find("BrandingImageUrl").text();
                            colorScheme = ($(xml).find("ColorScheme").text()) ? $(xml).find("ColorScheme").text() : "none";

                            sUtil.clog('Stage 1 TX Success :: Auth is ' + auth, 'init');

                            if (auth === 'false') {
                                sView.jqm.helpers.ldrWidget("hide");
                                sView.utils.alert('Device Not Initialized!\nWrong User ID or Key!\n\n' +
                                    'Your Device Has NOT Been Initialized!',
                                    'Notification',
                                    'I Understand',
                                    function () {
                                        sController.app.sysEvents.silentResetApp(sModel.me.deviceUuid);
                                    });
                            } else {
                                sUtil.clog('Device Ready to be Initialized', 'init');
                                db.transaction(function (tx) {
                                        tx.executeSql('UPDATE usrCfg SET clientId = "' + clientId + '", ' + 'clientCode = "' +
                                            clientCode + '", mobileSiteUrl = "' + mobileSiteUrl + '", ' +
                                            'mobileServicesUrl = "' + mobileServicesUrl + '", brandingImageUrl = "' +
                                            brandingImageUrl + '", ' + 'colorScheme = "' + colorScheme + '" WHERE id = 1');
                                    },
                                    function (err) {
                                        sUtil.clog('First Init Call Error: ' + err.message, 'init', true);
                                    },
                                    function () {
                                        sModel.setObj(false, function (status) {
                                            if (status) {
                                                sController.app.sysEvents.sInit.stageTwo();
                                            }
                                        });
                                    });

                            }

                        }
                    });
                },
                // Stage Two ***************************************************************************************************
                stageTwo: function () {
                    "use strict";
                    sUtil.clog('Stage Two Start', 'init');
                    $.ajax({
                        async: false,
                        crossDomain: true,
                        url: sModel.me.mobileServicesUrl + '/SubmitMobileDeviceInfo',
                        data: {
                            ScreenWidth: window.innerWidth,
                            DeviceType: sModel.me.devicePlatform,
                            DeviceID: sModel.me.deviceUuid,
                            DeviceOSVersion: sModel.me.deviceVersion,
                            ScreenHeight: window.innerHeight,
                            InteractionID: sModel.me.userId,
                            ClientCode: sModel.me.clientCode
                        },
                        success: function (xml) {
                            var transres = $(xml).find("TransactionSuccess").text();
                            sUtil.clog('Stage 2 TX Success :: transres is ' + transres, 'init');
                            if (transres === 'false') {
                                sView.utils.alert("Could Not Init Device!\nPlease Contact Swyft Support",
                                    'Notification',
                                    'I Understand',
                                    function () {
                                        throw "Init Error";
                                    });
                            } else {
                                sUtil.clog('Second Init Call Succeeded', 'init');
                                sModel.setObj(false, function (status) {
                                    if (status) {
                                        sController.app.sysEvents.sInit.stageThree();
                                    }
                                });
                            }
                        }
                    });
                },
                // Stage Three *************************************************************************************************
                stageThree: function () {
                    "use strict";
                    sUtil.clog('Stage Three Start', 'init');
                    var transres,
                        db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000),
                        interactionChannel,
                        interactionType,
                        interactionLocation,
                        transmsg,
                        severity,
                        stackTrace,
                        siteAccessRestricted,
                        deviceActive;

                    $.ajax({
                        async: false,
                        crossDomain: true,
                        url: sModel.me.mobileServicesUrl + '/MobileAccessRestriction',
                        data: {
                            DeviceID: sModel.me.deviceUuid,
                            InteractionID: sModel.me.userId,
                            ClientCode: sModel.me.clientCode
                        },
                        success: function (xml) {

                            transres = $(xml).find("TransactionSuccess").text();
                            transmsg = $(xml).find("TransactionMessage").text();
                            severity = $(xml).find("Severity").text();
                            stackTrace = $(xml).find("StackTrace").text();

                            siteAccessRestricted = $(xml).find("SiteAccessRestricted").text();
                            deviceActive = $(xml).find("DeviceActive").text();

                            interactionChannel = $(xml).find("InteractionChannel").text().toUpperCase();
                            interactionType = $(xml).find("InteractionType").text();
                            interactionLocation = $(xml).find("InteractionLocation").text();

                            sUtil.clog('Stage 3 TX Success :: transres is ' + transres, 'init');

                            if (transres === 'false') {
                                sView.utils.alert("Could Not Init Device!\nPlease Contact Swyft Support",
                                    'Notification',
                                    'I Understand',
                                    function () {
                                        throw "Init Error";
                                    });
                            } else {
                                db.transaction(function (tx) {
                                        tx.executeSql('UPDATE usrCfg SET interactionChannel = "' + interactionChannel + '", ' +
                                            'interactionType = "' + interactionType + '", interactionLocation = "' +
                                            interactionLocation + '" WHERE id = 1');
                                    },
                                    function (err) {
                                        sUtil.clog(err);
                                        return false;
                                    },
                                    function () {
                                        sUtil.clog('All Done run cfgCheckSuccess', 'init', true);
                                        $('#txtUIDWS').val('');
                                        $('#txtInitKeyWS').val('');
                                        if (sModel.me.platform === 'Android' &&
                                            sController.app.events.params.pg === true) {
                                            try {
                                                window.plugins.Shortcut.CreateShortcut("Swyft",
                                                    function () {
                                                        sUtil.clog('Added icon to Home Screen');
                                                    },
                                                    function () {
                                                        sUtil.clog('Failed adding icon to Home Screen');
                                                    });
                                            } catch (e) {
                                                sUtil.clog("Error");
                                            }
                                        }
                                        sModel.setObj(false, function (status) {
                                            if (status) {
                                                sController.app.sysEvents.cfgCheckSuccess();
                                            } else {
                                                sController.app.sysEvents.silentResetApp(sModel.me.deviceUuid);
                                            }
                                        });
                                    }
                                );
                            }
                        }
                    });
                }
            },

            // Receive Message *****************************************************************************************
            receiveMessage: function (event, srcOrigin) {
                "use strict";
                if (typeof event === "undefined" || !event) {
                    sUtil.clog('REMOTE :: BLOCKED INBOUND REQUEST :: CRITICAL');
                    return;
                }

                var eventSrc = null,
                    splits = null,
                    domain = null,
                    bar = null,
                    data = null,
                    origin = null;

                try {
                    eventSrc = (typeof event.source !== "undefined") ? event.source.location.host : false;
                    origin = (typeof event.origin !== "undefined") ? event.origin :
                        (typeof srcOrigin !== "undefined") ? srcOrigin : false;
                } catch (e) {
                    sUtil.clog('REMOTE :: BLOCKED INBOUND REQUEST 0 :: CRITICAL');
                }

                try {
                    if (origin === "file://") {
                        if (event.data !== "undefined") {
                            try {
                                var tmp = JSON.parse(event.data);
                                if (tmp.sw === "undefined" || tmp.sw !== window.atob("OUYxQzgwOTktNDY4RC00QTI3LThBRDUtRjJCQUM2MDBEQUQy")) {
                                    sUtil.clog('REMOTE :: BLOCKED INBOUND REQUEST 1 :: CRITICAL');
                                    return;
                                }
                            } catch (e) {
                                return;
                            }
                        } else {
                            return;
                        }
                    }
                } catch (e) {
                    sUtil.clog('REMOTE :: BLOCKED INBOUND REQUEST 1 :: CRITICAL');
                }

                try {
                    splits = (eventSrc !== false) ? eventSrc.split('.') : (origin !== false) ? origin.split('.') : false;
                    domain = splits[splits.length - 2];
                    bar = window.atob("OUYxQzgwOTktNDY4RC00QTI3LThBRDUtRjJCQUM2MDBEQUQy");
                    data = (typeof event.data !== "undefined") ? JSON.parse(event.data) : JSON.parse(event);

                } catch (e) {
                    sUtil.clog('REMOTE :: BLOCKED INBOUND REQUEST 2 :: CRITICAL');
                    return;
                }

                if ((domain === "swyfthub" || domain === "swyftmobile") && window.atob(data.sw) === bar) {
                    sUtil.clog("Message Received :: The Action is " + data.action, "remote", false);
                    switch (data.action) {
                        // appCheck ************************************************************************************
                        case "appCheck":
                            //sUtil.clog('REMOTE :: App Check');
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                sw: sController.app.events.params.spmk
                            });
                            break;
                        // openUrl *************************************************************************************
                        case "openUrl":
                            var external = (data.external) ? data.external : false;
                            sUtil.clog('REMOTE :: Opening URL :: External is ' + external);
                            if (data.actionItem.slice(-3) === 'apk') {
                                sView.openInapp(data.actionItem, false, true);
                            } else {
                                sView.openInapp(data.actionItem, false, external);
                            }
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                sw: sController.app.events.params.spmk
                            });
                            break;
                        // getGps **************************************************************************************
                        case "getGps":
                            //sUtil.clog('REMOTE :: Getting GPS');
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                latitude: sModel.me.deviceLat,
                                longitude: sModel.me.deviceLng,
                                gpsTimeStamp: sModel.me.gpsTimestamp,
                                sw: sController.app.events.params.spmk
                            });
                            break;
                        // queryGps ************************************************************************************
                        case "queryGps":
                            //sUtil.clog('REMOTE :: Query GPS');
                            sModel.setGps(true, false, false, function (status) {
                                if (status === true) {
                                    sController.app.sysEvents.postMessage(event, {
                                        result: "success",
                                        action: data.action,
                                        latitude: sModel.me.deviceLat,
                                        longitude: sModel.me.deviceLng,
                                        gpsTimeStamp: sModel.me.gpsTimestamp,
                                        sw: sController.app.events.params.spmk
                                    });
                                } else {
                                    sController.app.sysEvents.postMessage(event, {
                                        result: "fail",
                                        sw: sController.app.events.params.spmk
                                    });
                                }
                            });
                            break;

                        // getPlatform *********************************************************************************
                        case "getPlatform":
                            //sUtil.clog('REMOTE :: Getting Platform');
                            var done = $.Deferred();
                            if (typeof sModel.me.devicePlatform === "undefined") {
                                sModel.setObj(false, function () {
                                    done.resolve();
                                });
                            } else {
                                done.resolve();
                            }
                            $.when(done).then(function () {
                                sController.app.sysEvents.postMessage(event, {
                                    result: "success",
                                    action: data.action,
                                    platform: sModel.me.devicePlatform,
                                    sw: sController.app.events.params.spmk
                                });
                            });
                            break;

                        // getUsrCfg ***********************************************************************************
                        case "getUsrCfg":
                            //sUtil.clog('REMOTE :: Getting usrCfg');
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                obj: sModel.me,
                                sw: sController.app.events.params.spmk
                            });
                            break;

                        // panel ***************************************************************************************
                        case "panel":
                            //sUtil.clog('REMOTE :: Setting Panel State to ' + theData.actionItem);
                            $("#mainP").panel(data.actionItem);
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                sw: sController.app.events.params.spmk
                            });
                            break;

                        // statusbar ***********************************************************************************
                        case "statusbar":
                            //sUtil.clog('REMOTE :: Setting Status Bar to ' + theData.actionItem);
                            if (data.actionItem === 'hide') {
                                StatusBar.hide();
                            } else if (data.actionItem === 'show') {
                                StatusBar.show();
                            }
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                sw: sController.app.events.params.spmk
                            });
                            break;

                        // changePage **********************************************************************************
                        case "changePage":
                            //sUtil.clog('REMOTE :: Change Page :: #' + theData.actionItem);
                            if (data.actionItem === 'info') {
                                sView.changePage("info");
                                setTimeout(function () {
                                    $('#diLastLoc').collapsible("expand");
                                }, 100);
                            } else {
                                sView.changePage(data.actionItem);
                            }
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                sw: sController.app.events.params.spmk
                            });
                            break;

                        // saveInteraction *****************************************************************************
                        case "saveInteraction":
                            //sUtil.clog('REMOTE :: Saving Interaction');
                            if (typeof data.actionItem === "number") {
                                sController.usr.saveInteraction(data.actionItem);
                                sController.app.sysEvents.postMessage(event, {
                                    result: "success",
                                    action: data.action,
                                    sw: sController.app.events.params.spmk
                                });
                            } else {
                                sController.app.sysEvents.postMessage(event, {
                                    result: "fail",
                                    action: data.action,
                                    sw: sController.app.events.params.spmk
                                });
                            }
                            break;

                        // hideLoading *********************************************************************************
                        case "hideLoading":
                            //sUtil.clog('REMOTE :: Hiding Loading Widget');
                            sView.jqm.helpers.ldrWidget('hide');
                            $('.loadingCover').addClass('cssHide').removeClass('cssBlock');
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                sw: sController.app.events.params.spmk
                            });
                            break;

                        // inner Clog  *********************************************************************************
                        case "clog":
                            sUtil.clog('INNER APSX :: ' + data.actionItem);
                            sController.app.sysEvents.postMessage(event, {
                                result: "success",
                                action: data.action,
                                sw: sController.app.events.params.spmk
                            });
                            break;

                        // Menu Data ***********************************************************************************
                        case "menuData":
                            var ac = $('.assignmentsCount'),
                                fc = $('.followUpsCount'),
                                cAss = data.cAssignments,
                                cFup = data.cFollowUps;

                            if (cAss !== '') {
                                ac.html(cAss);
                            } else {
                                ac.css('display', 'none');
                            }

                            if (cFup !== '') {
                                fc.html(cFup);
                            } else {
                                fc.css('display', 'none');
                            }
                    }
                } else {
                    sUtil.clog('REMOTE :: BLOCKED INBOUND REQUEST 3 :: CRITICAL');
                }
            },

            // Post Message ********************************************************************************************
            postMessage: function (event, msg, xdm) {
                "use strict";
                var tryXdm = (typeof xdm === "boolean") ? xdm : false;
                if ((typeof sView.socket !== "undefined" && sView.socket !== null) || tryXdm === true) {
                    //sUtil.clog("Try XDM");
                    try {
                        sView.socket.postMessage(JSON.stringify(msg));
                        sUtil.clog("Sent via XDM Message Socket :: Result was " + msg.result, "Remote", false);
                    } catch (e) {
                        if (typeof event.source !== "undefined" && typeof event.source.postMessage === "function") {
                            event.source.postMessage(JSON.stringify(msg), event.origin);
                            sUtil.clog("Send via HTML PostMessage :: Result was " + msg.result, "Remote", false);
                        } else {
                            sUtil.clog("Post Message Failed", "Remote", false);
                        }
                    }
                } else {
                    //sUtil.clog("Try HTML5 PM");
                    try {
                        event.source.postMessage(JSON.stringify(msg), event.origin);
                        sUtil.clog("Send via HTML PostMessage :: Result was " + msg.result, "Remote", false);
                    } catch (e) {
                        sUtil.clog("Post Message Failed", "Remote", false);
                    }
                }
            },

            // Inner App Message ***************************************************************************************
            innerAppRequest: function (action) {
                "use strict";
                var tryXDM = (sModel.me.platform === "Desktop") ? true : false;
                sController.app.sysEvents.postMessage(false, {
                    action: action,
                    sw: sController.app.events.params.spmk
                }, tryXDM);
            },

            // Get Query String Parameter ******************************************************************************
            getParameterByName: function (name, callback) {
                "use strict";
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                callback(results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ")));
            },

            // Factory Reset App ***************************************************************************************
            resetApp: function () {
                "use strict";
                sView.jqm.helpers.ldrWidget("show", "Resetting App");
                sView.utils.confirm('This will reset Swyft on this device!',
                    'Notification',
                    'Sounds Good',
                    'No Stop',
                    function (bi) {
                        var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                        if (bi === tbi) {
                            sController.app.events.hide('deviceready');
                            var db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000);
                            db.transaction(function (tx) {
                                tx.executeSql('DROP TABLE IF EXISTS usrCfg');
                                tx.executeSql('DROP TABLE IF EXISTS errLog');
                            }, function (err) {
                                sView.jqm.helpers.ldrWidget("hide");
                                sUtil.clog(err);
                            }, function () {
                                sView.utils.alert('Device Has Been Reset!',
                                    'Notification',
                                    'Thanks',
                                    function () {
                                        sView.changePage("welcomeSetup");
                                    });
                            });
                        } else {
                            sView.jqm.helpers.ldrWidget("hide");
                        }
                    });
            },

            // Silent Factory Reset App ********************************************************************************
            silentResetApp: function (d) {
                "use strict";
                if (d !== sModel.me.deviceUuid) {
                    return;
                }
                sController.app.events.hide('deviceready');
                var db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000);
                db.transaction(function (tx) {
                    tx.executeSql('DROP TABLE IF EXISTS usrCfg');
                    tx.executeSql('DROP TABLE IF EXISTS errLog');
                }, function (err) {
                    sUtil.clog(err);
                    sView.changePage("welcomeSetup");
                }, function () {
                    sUtil.clog('Device Silently Reset');
                    sView.changePage("welcomeSetup");
                });

            },

            // cfg Check Success ***************************************************************************************
            cfgCheck: function () {
                "use strict";
                sModel.setObj(true, function () {
                    if (sModel.checkObj()) {
                        sController.app.sysEvents.cfgCheckSuccess();
                    } else {
                        // User Data Model Corrupt *****************************************************************************
                        sUtil.clog('User Data Model Corrupted :: Start "Welcome" Sequence', 'core', false);
                        sView.changePage("welcomeSetup");
                    }
                });
            },

            // cfg Check Success ***************************************************************************************
            cfgCheckSuccess: function () {
                "use strict";
                // User Data Model Passed Validation *******************************************************************
                sView.jqm.helpers.ldrWidget("show", "Getting GPS Location");
                sUtil.clog('User Found', "core", false);
                var done = $.Deferred();

                if (sModel.me.brandingImageUrl !== '' || sModel.me.brandingImageUrl !== null ||
                    sModel.me.brandingImageUrl !== window.atob(
                        'aHR0cHM6Ly9tb2JpbGVkZW1vLnN3eWZ0aHViLmNvbS9tb2JpbGVicmFuZGluZy9zd3lmdG1vYmlsZS5wbmc=')) {

                    //sUtil.clog("Set Custom branding URL", "core", false);
                    //$('.mainLogo').attr('src', sModel.me.brandingImageUrl).trigger('updatelayout');
                    $('.mainLogo').attr('src', sModel.me.brandingImageUrl).enhanceWithin();
                }

                if (sModel.me.appVersion !== sController.app.cfg.globalAppVersion) {

                    var tx = [
                        {
                            objId: "appVersion",
                            val: sController.app.cfg.globalAppVersion
                        }
                    ];

                    sModel.tx(tx, false);
                }

                sModel.setGps(true, true, true, function (x) {
                    if (x) {
                        done.resolve();
                    } else {
                        sUtil.clog('sModel.setGps was false');
                        sView.utils.confirm('Could Not Configure GPS.\n' +
                            'Please Contact Swyft Support',
                            'Notification',
                            'Proceed',
                            'Exit',
                            function (bi) {
                                var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                                if (bi === tbi) {

                                    sView.utils.alert('This Application is designed to work with GPS.\n' +
                                        'Most functions will not work as expected!',
                                        'Warning',
                                        'I Understand',
                                        function () {
                                            sUtil.clog('SWYFT ::WARNING :: Entering With No GPS');
                                            var db = window.openDatabase("usrCfg", "1.0", "User Config", 10000000);
                                            db.transaction(function (tx) {
                                                    tx.executeSql('UPDATE usrCfg SET deviceGps = "false",' +
                                                        'deviceLat  = "0", deviceLng  = "0", ' +
                                                        'gpsTimestamp = "00/00/0000 00:00:00AM" WHERE id = 1');
                                                }, sController.errorCB,
                                                function () {
                                                    done.resolve();
                                                });

                                        }
                                    );
                                } else {
                                    sController.app.sysEvents.closeApp();
                                }
                            }
                        );
                    }
                });

                $.when(done).then(function () {
                    sController.app.sysEvents.startApp();
                });
            },

            // START APP FUNCTION **************************************************************************************
            startApp: function () {
                "use strict";
                sUtil.clog('START APP', "core", false);
                sView.jqm.helpers.ldrWidget("show", "Logging In User");
                $('#txtModel').attr('value', sModel.me.deviceName);
                $('#txtSystem').attr('value', sModel.me.devicePlatform);
                $('#txtVersion').attr('value', sModel.me.deviceVersion);
                $('#txtAppVer').attr('value', sModel.me.appVersion);
                $('#netTypetxt').attr('value', sModel.me.netState);
                $('#gpsStatustxt').attr('value', (sModel.me.deviceGps) ? 'Yes' : ' Nope');
                $('#userIDtxt').attr('value', sModel.me.userId);

                sController.usr.maCheck(function (status, msg) {
                    if (status !== true) {
                        sView.jqm.helpers.ldrWidget("hide");
                        sView.utils.alert(msg + '\nContact Swyft Support',
                            'Notification',
                            'I Understand',
                            function () {
                                sUtil.clog('Login Failed', 'login error', true);
                            });
                    } else {
                        sView.jqm.helpers.ldrWidget("show", "Loading Dashboard");
                        sController.usr.saveInteraction(600, function () {
                            sView.changePage('dash');
                        });
                    }
                }, true);
            },

            //  Close App **********************************************************************************************
            closeApp: function () {
                "use strict";
                sView.jqm.helpers.ldrWidget("hide");
                if (sController.app.events.params.pg === true) {
                    navigator.app.closeApp();
                }
            }
        }
    },

    // FORM Functions **************************************************************************************************
    forms: {
        // Form Global Params ******************************************************************************************
        params: {
            hasSig: false,
            theSig: false
        },

        // Validate Form Function **************************************************************************************
        validate: function (form) {
            "use strict";
            var theForm = form,
                validSubmit = false;

            // Check for Sig
            if ($('.captureSig').length > 0) {
                $('.sigPad').signaturePad({ drawOnly: true, lineTop: 55, validateFields: false });
                sController.forms.params.hasSig = true;
            }
            var len, sigValid, o;
            o = {};
            o.reqFields = [];

            if (sController.forms.params.hasSig === true) {
                sigValid = $('.sigPad').signaturePad().validateForm();
                if (sigValid === true) {
                    sController.forms.params.theSig = true;
                } else {
                    sController.forms.params.theSig = false;
                }
            }
            $('#' + theForm + ' .reqInput').each(function (index, value) {
                var id = value.id;
                var thevalue = value.value;
                var type = value.type;
                var selectedIndex = value.selectedIndex;

                if (selectedIndex >= 0) {
                    type = 'selectList';
                }

                switch (type) {
                    case 'selectList':
                        if (selectedIndex === 0) {
                            var x1 = {
                                id: id,
                                type: 'selectList',
                                value: thevalue
                            };
                            o.reqFields.push(x1);
                        } else {
                            $('select#' + id).parent().attr('data-theme', 'a')
                                .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
                        }
                        break;
                    case 'checkbox':
                        if ($(this).is(":not(:checked)")) {
                            var x2 = {
                                id: id,
                                type: type,
                                value: thevalue
                            };
                            o.reqFields.push(x2);
                        } else {
                            $("label[for='" + id + "'] ").attr('data-theme', 'a')
                                .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
                        }
                        break;
                    case 'text':
                    case 'textarea':
                        if (thevalue === "" || thevalue === "Required" || thevalue === null) {
                            var x3 = {
                                id: id,
                                type: type,
                                value: thevalue
                            };
                            o.reqFields.push(x3);
                        } else {
                            //$('#' + id).css("border", "none");
                            $('input#' + id).parent().removeClass('isReq').addClass('reset');
                            $('input#' + id).removeClass('isReqTxt').attr('onfocus', "").attr('onblur', "");
                            // this is used for the datepicker
                            //$('#' + id).parents('div.ui-input-datebox').css('border', 'none');
                            $('#' + id).parents('div.ui-input-datebox').removeClass('isReq');
                        }
                        break;
                    case 'fieldset':
                        var chkcnt = $('#' + id + ' input[type="checkbox"]').length;
                        var radcnt = $('#' + id + ' input[type="radio"]').length;
                        var gotone = false;

                        if (chkcnt > 0) {
                            $('#' + id + ' input[type="checkbox"]').each(function () {
                                if (value.checked) {
                                    gotone = true;
                                }
                            });

                        } else if (radcnt > 0) {
                            $('#' + id + ' input[type="radio"]').each(function () {
                                if (value.checked) {
                                    gotone = true;
                                }
                            });
                        }

                        if (gotone === false) {
                            var x4 = {
                                id: id,
                                type: type,
                                value: thevalue
                            };
                            o.reqFields.push(x4);

                        } else {
                            // Field Set Reset
                            var getIptId;

                            if (chkcnt > 0) {
                                getIptId = $('#' + id + ' input[type="checkbox"]');

                            } else if (radcnt > 0) {
                                getIptId = $('#' + id + ' input[type="radio"]');
                            }

                            $.each(getIptId, function (v) {
                                var iptId = v.id;
                                $('label[for="' + iptId + '"]').attr('data-theme', 'a')
                                    .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
                            });
                        }
                        break;
                    case 'undefined':
                        break;
                    case '':
                        break;
                }
            });
            // Done looking for items, now process.
            len = o.reqFields.length;

            if (len === 0 && (sController.forms.params.hasSig === false ||
                (sController.forms.params.hasSig === true && sController.forms.params.theSig === true))) {
                validSubmit = true;
            } else {
                //$('.valErrorMsg_' + theForm).show();
                //$('#valErrorMsg_' + theForm).popup("open");

                sView.utils.alert("Please Check All Fields", "Notification", "Will Do", function () {
                    $.each(o.reqFields, function (index, value) {
                        var type = value.type;
                        var id = value.id;

                        switch (type) {
                            case 'fieldset':
                                var chkcnt = $('#' + id + ' input[type="checkbox"]').length;
                                var radcnt = $('#' + id + ' input[type="radio"]').length;
                                var getIptId = 0;
                                if (chkcnt > 0) {
                                    getIptId = $('#' + id + ' input[type="checkbox"]');

                                } else if (radcnt > 0) {
                                    getIptId = $('#' + id + ' input[type="radio"]');
                                }

                                $.each(getIptId, function (v) {
                                    var iptId = v.id;
                                    $('label[for="' + iptId + '"]').attr('data-theme', 'b')
                                        .removeClass("ui-btn-up-a").addClass("ui-btn-up-b");
                                });

                                break;
                            case 'selectList':
                                $('select#' + id).parent().attr('data-theme', 'b')
                                    .removeClass("ui-btn-up-a").addClass("ui-btn-up-b");
                                break;
                            case 'checkbox':
                                $('label[for="' + id + '"] ').attr('data-theme', 'b')
                                    .removeClass("ui-btn-up-a").addClass("ui-btn-up-b");
                                break;
                            case 'textarea':
                            case 'text':
                                $('input#' + id)
                                    .attr('placeholder', '')
                                    .attr('value', 'Required')
                                    .attr('onfocus', "if(this.value === 'Required') {this.value=''}")
                                    .attr('onblur', "if(this.value === ''){this.value ='Required'}")
                                    .addClass('isReq')
                                    .textinput("refresh");
                                // this is used for the datepicker
                                //$('#' + id).parents('div.ui-input-datebox').css('border', '1px solid red');
                                //$('#' + id).parents('div.ui-input-datebox').addClass('isReq');
                                break;
                            case '':
                                break;
                            case 'undefined':
                                break;
                        }
                    });
                });
            }

            if (!validSubmit) {
                return false;
            } else {
                return true;
            }

        },

        // Clear Form Function *****************************************************************************************
        clear: function (form) {
            "use strict";

            $('.valErrorMsg_' + form).css('display', 'none');

            if ($('.captureSig').length > 0) {
                $('.sigPad').signaturePad().clearCanvas();
                $('.error').css('display', 'none');
            }

            $('#' + form + ' .reqInput').each(function (index, value) {
                var id = value.id;
                var type = value.type;
                var selectedIndex = value.selectedIndex;
                if (selectedIndex >= 0) {
                    type = 'selectList';
                }
                switch (type) {
                    case 'fieldset':
                        var chkcnt = $('#' + id + ' input[type="checkbox"]').length;
                        var radcnt = $('#' + id + ' input[type="radio"]').length;

                        if (chkcnt > 0) {
                            $('#' + id + ' input[type="checkbox"]').each(function (v) {
                                var iptId = v.id;
                                var checked = $(this).attr('checked');
                                $('label[for="' + iptId + '"]').attr('data-theme', 'a')
                                    .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");

                                if (checked) {
                                    $(this).attr("checked", false).checkboxradio("refresh");
                                }

                            });

                        } else if (radcnt > 0) {
                            $('#' + id + ' input[type="radio"]').each(function (v) {
                                var iptId = v.id;
                                var checked = $(this).attr('checked');
                                $('label[for="' + iptId + '"]').attr('data-theme', 'a')
                                    .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");

                                if (checked) {
                                    $(this).attr("checked", false).checkboxradio("refresh");
                                }

                            });
                        }

                        break;
                    case 'selectList':
                        if (selectedIndex !== "0" || selectedIndex !== null || selectedIndex !== "") {
                            $('select#' + id).attr("selectedIndex", "0");
                        }
                        $('select#' + id).parent().attr('data-theme', 'a')
                            .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
                        break;
                    case 'checkbox':
                        $('[for=' + id + ']').attr('data-theme', 'a')
                            .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
                        $('#' + id).attr('checked', false).checkboxradio("refresh");
                        break;
                    case 'radio':
                        $('#[for=' + id + ']').attr('data-theme', 'a')
                            .removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
                        $('#' + id + ' input[type="radio":checked]').each(function () {
                            $(this).checked = false;
                        });
                        break;
                    case 'text':
                        if (id === 'txtUIDWS') {
                            $('input#' + id).attr('placeholder', 'User ID');
                        } else if (id === 'txtInitKeyWS') {
                            $('input#' + id).attr('placeholder', 'Initialization Key');
                        } else {
                            $('input#' + id).attr('placeholder', '');
                        }
                        $('input#' + id).parent().addClass('reset').removeClass('isReq');
                        $('input#' + id).val("").css('color', '#ffffff').attr('onfocus', "").attr('onblur', "");
                        break;
                    case 'date':
                        $('#' + id).attr('data-theme', 'a').removeClass("ui-btn-up-b").addClass("ui-btn-up-a")
                            .val("").removeClass('isReq').css('color', '#ffffff');
                        break;
                    case 'undefined':
                        break;
                    case '':
                        break;
                    case 'password':
                    case 'select-multiple':
                    case 'select-one':
                    case 'textarea':
                        $('input#' + id).parent().addClass('reset').removeClass('isReq');
                        $('input#' + id).val("").css('color', '#ffffff').attr('onfocus', "").attr('onblur', "");
                        break;
                }
            });
        }
    },

    // Swyft Usr Obj ***************************************************************************************************
    usr: {
        params: {
            cbHolder: false
        },

        // MA Check ****************************************************************************************************
        maCheck: function (callback, updateInfo) {
            "use strict";
            var siteAccessRestricted = null,
                validCredentials = null,
                deviceActive = null,
                interactionChannel = null,
                interactionType = null,
                interactionLocation = null;

            sUtil.clog(sModel.me.mobileServicesUrl + '/MobileAccessRestriction?deviceid=' + sModel.me.deviceUuid + "&userid=" + sModel.me.userId + "&clientcode=" + sModel.me.clientCode);

            $.ajax({
                crossDomain: true,
                url: sModel.me.mobileServicesUrl + '/MobileAccessRestriction',
                async: false,
                data: {
                    DeviceID: sModel.me.deviceUuid,
                    InteractionID: sModel.me.userId,
                    ClientCode: sModel.me.clientCode
                },
                success: function (xml) {

                    siteAccessRestricted = $(xml).find("SiteAccessRestricted").text();
                    validCredentials = $(xml).find("ValidCredentials").text();
                    deviceActive = $(xml).find("DeviceActive").text();

                    interactionChannel = $(xml).find("InteractionChannel").text();
                    interactionType = $(xml).find("InteractionType").text();
                    interactionLocation = $(xml).find("InteractionLocation").text();

                    var tx = [
                        {
                            objId: "interactionChannel",
                            val: interactionChannel
                        },
                        {
                            objId: "interactionType",
                            val: interactionType
                        },
                        {
                            objId: "interactionLocation",
                            val: interactionLocation
                        }
                    ];

                    sModel.tx(tx, function () {
                        if (deviceActive === 'true' && validCredentials === 'true') {
                            sUtil.clog('ValidCredentials & DeviceActive', 'login', false);
                            sController.usr.sInfoUpdate(function () {
                                callback(true, 'User Logged In');
                            });

                        } else if (validCredentials === 'false') {
                            sUtil.clog('ValidCredentials = false', 'login', false);
                            callback(false, 'Non-Valid Credentials');

                        } else if (deviceActive === 'false') {
                            sUtil.clog('DeviceActive = false', 'login', true);
                            callback(false, 'Device Inactive');

                        } else {
                            sUtil.clog('Unknown Status', 'login', false);
                            callback(false, 'Login Blocked');
                        }
                    });
                },
                error: function (err) {
                    sUtil.clog('User Not Logged In! ' + err.message, 'login error', true);
                    callback(false, 'SWYFT :: Error ' + err.message);
                }
            });
        },

        // Update the Users info in the DB *****************************************************************************
        sInfoUpdate: function (callback) {
            "use strict";

            sUtil.clog('Starting Update Calls', 'sInfo Update', false);

            function done (status) {
                sModel.setObj(false, function (setObjStatus) {
                    if (status === "notAuth") {
                        sView.changePage("loading");
                    } else {
                        sController.usr.sInfoUpdateSwyft();
                    }
                });
            }

            var stepOneDone = $.Deferred;

            sController.usr.params.cbHolder = (typeof callback === "function") ? callback : false;

            $.ajax({
                crossDomain: true,
                url: window.atob('aHR0cHM6Ly9tb2JpbGVjZW50cmFsLnN3eWZ0aHViLmNvbS9Td3lmdE1vYmlsZUNlbnR' +
                    'yYWwvQXV0aG9yaXphdGlvbi5hc214L0F1dGhvcml6ZVVzZXIy'),
                data: {
                    DeviceID: sModel.me.deviceUuid,
                    InitializationKey: sModel.me.initKey,
                    UserID: sModel.me.userId,
                    AppVersion: sController.app.cfg.globalAppVersion
                },
                success: function (xml) {
                    //sUtil.clog('TX :: Success', 'sInfoUpdate', false);
                    if ($(xml).find("Authorized").text() === 'false') {
                        sUtil.clog('DEVICE OR USER NOT AUTHORIZED', 'sInfo Update', true);
                        done("notAuth");

                    } else if ($(xml).find("Authorized").text() === "true") {

                        var tx = [
                            {
                                objId: "appVersion",
                                val: sController.app.cfg.globalAppVersion
                            },
                            {
                                objId: "clientId",
                                val: $(xml).find("ClientID").text()
                            },
                            {
                                objId: "clientCode",
                                val: $(xml).find("ClientCode").text().toUpperCase()
                            },
                            {
                                objId: "mobileServicesUrl",
                                val: $(xml).find("MobileServicesUrl").text()
                            },
                            {
                                objId: "mobileSiteUrl",
                                val: $(xml).find("MobileSiteUrl").text()
                            },
                            {
                                objId: "brandingImageUrl",
                                val: $(xml).find("BrandingImageUrl").text()
                            },
                            {
                                objId: "colorScheme",
                                val: ($(xml).find("colorScheme").text()) ? $(xml).find("colorScheme").text() : 'none'
                            }
                        ];

                        sModel.tx(tx, function (errs, errsArgs) {
                            if (errs) {
                                sUtil.clog('User Info NOT Updated TX Error', 'sInfo Update', true);
                                done(false);
                            } else {
                                //sUtil.clog('User Info Updated, calling sInfoUpdateSwyft', 'sInfoUpdate');
                                done(true);
                            }
                        });

                    } else {
                        sUtil.clog('User Info NOT Updated: Authorized was not True', 'sInfo Update', true);
                        done(false);
                    }

                }
            })
                .error(function () {
                    sUtil.clog('User Info NOT Updated, Call Failed', 'sInfo Update', true);
                    done(false);
                });
        },

        // Update the Users info in Swyft ******************************************************************************
        sInfoUpdateSwyft: function () {
            "use strict";
            //sUtil.clog('Starting Second Update Call', 'sInfoUpdateSWYFT', false);

            var cb = (typeof sController.usr.params.cbHolder === "function") ? sController.usr.params.cbHolder : false;
            sController.usr.params.cbHolder = false;

            $.ajax({
                crossDomain: true,
                url: sModel.me.mobileServicesUrl + '/SubmitMobileDeviceInfo',
                data: {
                    ScreenWidth: window.innerWidth,
                    DeviceType: sModel.me.devicePlatform,
                    DeviceID: sModel.me.deviceUuid,
                    DeviceOSVersion: sModel.me.deviceVersion,
                    ScreenHeight: window.innerHeight,
                    InteractionID: sModel.me.userId,
                    ClientCode: sModel.me.clientCode
                },
                success: function (xml) {
                    if ($(xml).find("TransactionSuccess").text() !== 'true') {
                        sUtil.clog('sInfoUpdateUser NOT Info Updated', 'sInfo Update', false);
                        if (cb !== false) {
                            cb();
                        }
                    } else {
                        sUtil.clog('User Info Updated', 'sInfo Update', false);
                        if (cb !== false) {
                            cb();
                        }
                    }
                }
            });

        },

        // Save Interaction ********************************************************************************************
        saveInteraction: function (iRes, callback) {
            "use strict";
            // CB Function
            function doCallback () {
                if (typeof callback === "function") {
                    callback();
                }
            }

            var done = $.Deferred();

            // ******************************************
            // IRR = InteractionResultReason ***** Always -1
            // IRea =  InteractionReason  ***** Always -1
            // IRes = InteractionResult = Code for Interaction
            //
            // ** CODES *********************************
            // MobileLogin = 600
            // MobileDashboard = 605
            // MobileProspectList = 610
            // MobileProspectsNearMe = 615
            // MobileFollowUps = 620
            // MobileProspectSearch = 625
            // DBSave = 602
            // ******************************************

            if (typeof iRes !== "undefined" && typeof iRes === "number") {

                // Save Interaction Call
                $.ajax({
                    crossDomain: true,
                    url: sModel.me.mobileServicesUrl + '/SaveInteraction3',
                    data: {
                        DeviceID: sModel.me.deviceUuid,
                        InteractionLongitude: sModel.me.deviceLng,
                        InteractionLatitude: sModel.me.deviceLat,
                        InteractionType: sModel.me.interactionType,
                        InteractionChannel: sModel.me.interactionChannel,
                        InteractionID: sModel.me.userId,
                        InteractionLocation: sModel.me.interactionLocation,
                        InteractionResult: iRes,
                        InteractionReason: -1,
                        InteractionResultReason: -1,
                        ClientCode: sModel.me.clientCode
                    },
                    success: function (xml) {
                        if ($(xml).find("TransactionSuccess").text() === 'true') {
                            sUtil.clog('Saved Interaction | Code: ' + iRes, 'save interaction', false);
                        } else {
                            sUtil.clog('Interaction Save FAILED : TransactionSuccess Was not True', 'save interaction',
                                true);
                        }

                        done.resolve();
                    }
                })
                    .error(function () {
                        sUtil.clog('Interaction Save FAILED : AJAX Call Failed', 'save interaction', true);
                        done.resolve();
                    });

            } else {
                // No Code was passed in
                sUtil.clog('Interaction Save FAILED : No Code Passed in', 'save interaction', true);
                done.resolve();
            }

            $.when(done).then(function () {
                doCallback();
            });

        }
    },

    // Swyft Debug Obj *************************************************************************************************
    debug: {
        getStatus: function () {
            "use strict";
            return (window.localStorage.getItem('debug')) ? window.localStorage.getItem('debug') : false;
        },
        getId: function () {
            "use strict";
            return (window.localStorage.getItem('debugId')) ? window.localStorage.getItem('debugId') : false;
        },
        setStatus: function (status, callback) {
            "use strict";
            if (status === true) {
                window.localStorage.setItem('debug', status);
                window.localStorage.setItem('debugId', sController.genRandomNum());
                if (typeof callback === "function") {
                    callback(this.debug.getId());
                }
            } else if (status === false) {
                window.localStorage.removeItem('debugId');
                window.localStorage.removeItem('debug');
            }
        }
    }
};
// Init the App ********************************************************************************************************
sController.app.sysEvents.getParameterByName("init", function (response) {
    "use strict";
    if (typeof response !== "undefined" && response !== false && response !== "false" && response !== null) {
        sController.app.initialize();
    }
});