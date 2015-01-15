// SWYFT VIEW OBJECT ***************************************************************************************************
var sView = {
    // Utils ***********************************************************************************************************
    utils: {
        alert: function (text, title, okButtonLbl, callBack) {
            "use strict";
            var ok = (typeof okButtonLbl === "undefined") ? okButtonLbl : 'Ok',
                cleanTitle = (typeof title === "undefined") ? 'Notification' : title,
                msg = (text !== null || text !== '') ? text : 'Alert';

            if (sController.app.events.params.pg === true) {
                navigator.notification.alert(msg, callBack, cleanTitle, ok);
            } else {
                alertify.set({ labels: {
                    ok: ok
                } });
                alertify.alert(msg);
                callBack();
            }
        },
        prompt: function (text, title, okButtonLbl, cancelButtonLbl, defaultValue, callBack) {
            "use strict";
            var ok = (okButtonLbl !== false && okButtonLbl !== null) ? okButtonLbl : 'Ok',
                cancel = (cancelButtonLbl !== false && cancelButtonLbl !== null) ? okButtonLbl : 'Cancel',
                cleanDefaultValue = (defaultValue !== false && defaultValue !== null) ? defaultValue : '',
                cleanTitle = (title !== false && title !== null) ? title : 'Notification',
                options = null;

            if (sModel.me.platform === "iOS") {
                if ((sController.app.events.params.pg === true)) {
                    options = [ok, cancel];
                }
            } else if (sModel.me.platform === "Android") {
                if ((sController.app.events.params.pg === true)) {
                    options = [cancel, ok];
                }
            }

            if (sController.app.events.params.pg === true) {
                navigator.notification.prompt(text, callBack, cleanTitle, options, cleanDefaultValue);

            } else {
                alertify.set({ labels: {
                    ok: ok,
                    cancel: cancel
                } });
                alertify.prompt(text, function (e, str) {
                    // str is the input text
                    if (e) {
                        // user clicked "ok"
                        callBack(true, str);
                    } else {
                        // user clicked "cancel"
                        callBack(false, str);
                    }
                }, cleanDefaultValue);
            }
        },
        confirm: function (text, title, okButtonLbl, cancelButtonLbl, callBack) {
            "use strict";
            var ok = (typeof okButtonLbl !== "undefined" || okButtonLbl !== false) ? okButtonLbl : 'Ok',
                cancel = (typeof cancelButtonLbl !== "undefined" || cancelButtonLbl !== false) ? cancelButtonLbl : 'Cancel',
                cleanTitle = (typeof title !== "undefined" || title !== false) ? title : 'Notification',
                cb = (typeof callBack === "function") ? callBack : false;

            if (cb === false) {
                return;
            } else {

                if (sController.app.events.params.pg === true) {
                    navigator.notification.confirm(text, cb, cleanTitle, [ok, cancel]);
                } else {

                    alertify.set({
                        labels: {
                            ok: ok,
                            cancel: cancel
                        }
                    });

                    alertify.confirm(text, function (e) {
                        if (e) {
                            // user clicked "ok"
                            cb(2);
                        } else {
                            // user clicked "cancel"
                            cb(1);
                        }
                    });
                }
            }
        }
    },

    // Main View Helpers ***********************************************************************************************
    helpers: {
        wideScreen: function () {
            "use strict";
            return (window.innerWidth > 1200 );
        }
    },

    // Main JQM Obj ****************************************************************************************************
    jqm: {
        helpers: {
            pid: function () {
                "use strict";
                return $("body").pagecontainer("getActivePage").attr("id");
            },
            ldrWidget: function (showHide, text) {
                "use strict";
                if (typeof text !== "undefined" && showHide === "show") {
                    $.mobile.loading(showHide, {
                        text: text,
                        textVisible: true
                    });
                } else if (showHide === "hide") {
                    $.mobile.loading(showHide);
                }
            },
            panelShowHide: function () {
                "use strict";
                if (sView.jqm.helpers.pid() !== "loading" && sView.jqm.helpers.pid() !== "welcomeSetup") {
                    if (sView.helpers.wideScreen()) {
                        $("#mainP").panel("open");
                    } else {
                        //$("[data-role='header']").removeClass("ui-panel-page-content-open");
                        $("#mainP").panel("close");
                    }
                } else {
                    $("#mainP").panel("close");
                }
            }
        },

        // Main JQM Init ***********************************************************************************************
        init: function (callback) {
            "use strict";
            sView.jqm.widgets(function () {
                sView.jqm.pageActions(function () {
                    if (window.innerWidth > 1200) {
                        $("mainP").panel("open");
                    }
                    callback();
                });
            });
        },

        // Widget Init *************************************************************************************************
        widgets: function (callback) {
            "use strict";
            // TODO :: Why am I doing this?
            $(".diTextBox").addClass("textBgColor");

            // Init Fixed Global Toolbars ******************************************************************************
            //$( ".mainHeader" ).toolbar({ theme: "a" });

            // Init Fixed Global Panels ********************************************************************************
            $("#mainP").panel({
                theme: "a",
                animate: false,
                display: "reveal",
                open: function (event, ui) {


                    $(".ui-panel-wrapper").addClass("ui-panel-page-content-position-left ui-panel-page-content-display-reveal ui-panel-page-content-open");

                    /*$("body").addClass("ui-panel-page-container-themed ui-panel-page-container-a ui-panel-page-container")


                     $("[data-role=header]").addClass("ui-panel-page-content-position-left " +
                     "ui-panel-page-content-display-reveal");

                     if(sView.helpers.wideScreen()){
                     $(".loadingCover").addClass("ui-panel-page-content-open");
                     }*/
                },
                close: function (event, ui) {

                    $(".ui-panel-wrapper").removeClass("ui-panel-page-content-position-left ui-panel-page-content-display-reveal ui-panel-page-content-open");
                    /*                    $("body").removeClass("ui-panel-page-container-themed ui-panel-page-container-a ui-panel-page-container")

                     $(".ui-panel-wrapper").removeClass("ui-panel-page-content-position-left " +
                     "ui-panel-page-content-display-reveal ui-panel-page-content-open");

                     $("[data-role=header]").removeClass("ui-panel-page-content-position-left " +
                     "ui-panel-page-content-display-reveal");*/
                }

            });

            $("body").on("pagecontainershow", function (event, ui) {
                //sView.jqm.helpers.panelShowHide();
            });

            // Init Fixed Global ULs ***********************************************************************************
            $("#mainMenu").listview({
                create: function (event, ui) {
                    // Done ********************************************************************************************
                    if (typeof callback === "function") {
                        callback();
                    }
                }
            });
        },

        // Add JQ Page Actions *****************************************************************************************
        pageActions: function (callback) {
            "use strict";
            // MAIN MENU ***********************************************************************************************
            $('.btnMainNav').on('tap', function (e) {
                e.preventDefault();
                $("#mainP").panel("close");
                sView.changePage($(this).attr('data-swyft-page'));
            });

            // MAIN MENU DISPLAY ***************************************************************************************
            $('.mainMenu').on('tap', function (e) {
                e.preventDefault();
                $("#mainP").panel("open");
                sView.jqm.helpers.ldrWidget("hide");
            });

            // Login Button  *******************************************************************************************
            $(".btnLogin").on('tap', function (e) {
                sController.app.sysEvents.cfgCheck();
            });

            // Back Button *********************************************************************************************
            $(".btnBack").on('tap', function (e) {
                window.history.back();
            });

            // FACTORY RESET *******************************************************************************************
            $(".btnFactoryReset").on('tap', function (e) {
                sController.app.sysEvents.resetApp();
            });

            // Google InApp ********************************************************************************************
            $(".googleInApp").on('tap', function (e) {
                e.preventDefault();
                $("#mainP").panel("close");
                sView.openInapp('https://www.google.com/', true, false);
            });

            // Swyft User Voice InApp **********************************************************************************
            $(".swyftUserVoiceInApp").on('tap', function (e) {
                e.preventDefault();
                $("#mainP").panel("close");
                sView.openInapp('https://swyft.uservoice.com/', true, false);
            });

            // Init Device Button **************************************************************************************
            $("#btnInitDevice").on('tap', function (e) {
                sController.app.sysEvents.sInit.start();
            });

            // Init Device Clear Button ********************************************************************************
            $(".clearEntries").on('tap', function (e) {
                sController.forms.clear($(this).attr("data-swyft-form"));
            });

            //  Update Pos Button **************************************************************************************
            $(".btnUpdatePos").on('tap', function (e) {
                e.preventDefault();
                sModel.setGps(true, true, true, function () {
                    sView.changePage(sView.jqm.helpers.pid());
                });
            });

            //  Update Pos Button **************************************************************************************
            $(".btnUpdatePosDiPage").on('tap', function (e) {
                e.preventDefault();
                sModel.setGps(true, true, true, false);
            });

            // MAIN debugBtn *******************************************************************************************
            $('#debugBtn').on('change', function (e) {

                var wait = $.Deferred();

                sView.jqm.helpers.ldrWidget('show', 'Configuring Debug');
                wait.resolve(this.value);

                $.when(wait).then(function (cbVal) {
                    if (cbVal === 'true') {
                        sUtil.clog('Debug :: Turn debug on');
                        sView.utils.confirm('About To Start Debug Mode.\n' +
                            'This will give Swyft the \nability to read diagnostic messages remotely.',
                            'Notification',
                            'Go Ahead',
                            'No Stop',
                            function (bi) {
                                var tbi = (sModel.me.devicePlatform === "Android") ? 1 : 2;
                                if (bi === tbi) {
                                    sController.debug.setStatus(true, function (id) {
                                        setTimeout(function () {
                                            location.reload();
                                        }, 500);
                                        $('#debugId').html(id);
                                    });
                                } else {
                                    sView.jqm.helpers.ldrWidget("hide");
                                    $('#debugId').html('').attr("checked", '').checkboxradio("refresh");
                                }
                            });

                    } else if (cbVal === 'false') {

                        sUtil.clog('Debug :: Turn debug off');
                        $('#debugId').html('').attr("checked", '').checkboxradio("refresh");
                        sController.debug.setStatus(false);
                    } else {
                        sUtil.clog('Debug :: cbVal is ' + cbVal);
                    }
                });

            });

            // Close Panel if screen size is < 1200 on window resize event *********************************************
            $(window).resize(function () {
                sView.jqm.helpers.panelShowHide();

                var x = (sModel.me.platform === "iOS") ? 64 : 48;

                $("#" + sView.jqm.helpers.pid() + " iframe").css("height", (window.innerHeight - x))
                    .css("min-height", (window.innerHeight - x))
                    .css("max-height", (window.innerHeight - x));
            });

            // iFrame Pages Init ***************************************************************************************
            $('body').on('pagecontainerhide', function () {
                if ($("body").pagecontainer("getActivePage").hasClass("iframePage")) {
                    var pageTitle = sView.getPageTitle(sView.jqm.helpers.pid()),
                        loadingMsg = (pageTitle !== false) ? "Loading " + pageTitle : "Loading";
                    sView.jqm.helpers.ldrWidget("show", loadingMsg);
                }
            });

            $('body').on('pagecontainerload', function () {
                if ($("body").pagecontainer("getActivePage").hasClass("iframePage")) {
                    var x = (sModel.me.platform === "iOS") ? 64 : 48;
                    $("#" + sView.jqm.helpers.pid() + "Iframe")
                        .css("height", (window.innerHeight - x))
                        .css("min-height", (window.innerHeight - x))
                        .css("max-height", (window.innerHeight - x));
                }
            });

            /*$( window ).on( "navigate", function( event, data ) {
             console.log( data.state );
             console.log(data);
             });*/

            // Main Panel Before Show **********************************************************************************
            /*$("#mainP").on("panelbeforeopen", function (e) {

             });*/

            // Done ****************************************************************************************************
            if (typeof callback === "function") {
                callback();
            }
        }
    },

    // MAIN Nav functions **********************************************************************************************
    socket: null,
    changePage: function (page) {
        "use strict";
        $('.loadingCover').addClass('cssBlock').removeClass('cssHide');
        this.nav(page, function (target, type) {
            sUtil.clog("The target is " + target + " The type is " + type);
            if (type === 'change') {
                $("body").pagecontainer("change", target);
            } else if (type === 'refresh') {
                var x = (sModel.me.platform === "iOS") ? 64 : 48;
                $(target + "Iframe")
                    .css("height", (window.innerHeight - x))
                    .css("min-height", (window.innerHeight - x))
                    .css("max-height", (window.innerHeight - x));
            }
        });
    },
    nav: function (hash, callback) {
        "use strict";
        var pid = sView.jqm.helpers.pid(),
            loadingMsg = (pid === hash) ? sView.getPageTitle(pid) : sView.getPageTitle(hash);

        if (typeof loadingMsg === "undefined" || loadingMsg === null) {
            loadingMsg = '';
        }

        // TODO: if on a large screen need to check to see if I should close the panel
        /*$("#mainP").panel("close");*/

        if ($('#' + hash).hasClass("iframePage")) {
            // iFrame Page *********************************************************************************************
            if (pid === hash) {
                sView.jqm.helpers.ldrWidget('show', 'Refreshing ' + loadingMsg);
                this.update(pid, hash, 'refresh', function (finalTarget) {
                    callback(finalTarget, 'refresh');
                });
            } else {
                sView.jqm.helpers.ldrWidget('show', 'Loading ' + loadingMsg);
                this.update(pid, hash, 'change', function (finalTarget) {
                    callback(finalTarget, 'change');
                });
            }
        } else {
            // Not an iFrame Page **************************************************************************************
            callback('#' + hash, 'change');
        }
    },
    update: function (pid, targetPageId, type, updateCallback) {
        "use strict";

        var x = (sModel.me.platform === "iOS") ? 64 : 48;

        function doCallback(cbString) {
            if (pid === 'dash') {
                //sController.app.sysEvents.innerAppRequest("menuData");
            }
            updateCallback('#' + cbString);
        }

        if (type === 'refresh') {
            this.buildUrl(pid, function (url, xdmContainerId) {
                if (sModel.me.devicePlatform === "Desktop") {
                    // Remove old iFrame and Callback
                    $("#" + xdmContainerId).empty();
                    sView.socket = new easyXDM.Socket({
                        remote: url,
                        container: document.getElementById(xdmContainerId),
                        onMessage: sController.app.sysEvents.receiveMessage,
                        onReady: function () {
                            doCallback(pid + 'Iframe');
                        }
                    });
                } else {
                    //window.alert("IFRAME Refresh Begin");
                    $('#' + pid + "Iframe")
                        .attr("src", "")
                        .attr("src", url)
                        .css("height", (window.innerHeight - x))
                        .css("min-height", (window.innerHeight - x))
                        .css("max-height", (window.innerHeight - x));
                    //window.alert("IFRAME Refresh End");
                    doCallback(pid + 'Iframe');
                }
            });
        } else if (type === 'change') {
            this.buildUrl(targetPageId, function (url, xdmContainerId) {
                if (sModel.me.devicePlatform === "Desktop") {
                    // Remove old iFrame and Callback
                    $("#" + xdmContainerId).empty();
                    //window.alert("XDM Begin");
                    sView.socket = new easyXDM.Socket({
                        remote: url,
                        container: document.getElementById(xdmContainerId),
                        onMessage: sController.app.sysEvents.receiveMessage,
                        onReady: function () {
                            //window.alert("XDM Complete");
                            doCallback(targetPageId);
                        }
                    });
                } else {
                    //window.alert("IFRAME Load Begin");
                    $('#' + targetPageId + "Iframe")
                        .attr("src", "")
                        .attr("src", url)
                        .css("height", (window.innerHeight - x))
                        .css("min-height", (window.innerHeight - x))
                        .css("max-height", (window.innerHeight - x));
                    //window.alert("IFRAME Load Complete");
                    doCallback(targetPageId);
                }
            });
        }
    },
    buildUrl: function (page, buildCallback) {
        "use strict";
        var url = null, id = null;
        switch (page) {
            case 'dash':
                url = sModel.me.mobileSiteUrl + '/FrontDashboard.aspx?deviceid=' + sModel.me.deviceUuid +
                    '&appversion=' + sModel.me.appVersion + '&currlat=' + sModel.me.deviceLat +
                    '&currlng=' + sModel.me.deviceLng + '&clientcode=' + sModel.me.clientCode +
                    '&userid=' + sModel.me.userId + '&platform=' + sModel.me.devicePlatform +
                    '&lang=' + sModel.me.lang;

                id = "xdmDashFrame";

                break;
            case 'local':
                url = sModel.me.mobileSiteUrl + '/ProspectNearMe.aspx?deviceid=' + sModel.me.deviceUuid +
                    '&location=' + sModel.me.interactionLocation + '&intertype=' + sModel.me.interactionType +
                    '&channel=' + sModel.me.interactionChannel + '&currlat=' + sModel.me.deviceLat +
                    '&currlng=' + sModel.me.deviceLng + '&clientcode=' + sModel.me.clientCode +
                    '&userid=' + sModel.me.userId + '&platform=' + sModel.me.devicePlatform +
                    '&lang=' + sModel.me.lang;

                id = "xdmLocalFrame";

                break;
            case 'followUps':
                url = sModel.me.mobileSiteUrl + '/followUpCalendar.aspx?deviceid=' + sModel.me.deviceUuid +
                    '&location=' + sModel.me.interactionLocation + '&intertype=' + sModel.me.interactionType +
                    '&channel=' + sModel.me.interactionChannel + '&action=followup&currlat=' + sModel.me.deviceLat +
                    '&currlng=' + sModel.me.deviceLng + '&clientcode=' + sModel.me.clientCode +
                    '&userid=' + sModel.me.userId + '&platform=' + sModel.me.devicePlatform +
                    '&lang=' + sModel.me.lang;

                id = "xdmFollowUpFrame";

                break;
            case 'assignments':
                url = sModel.me.mobileSiteUrl + '/prospectList.aspx?deviceid=' + sModel.me.deviceUuid +
                    '&location=' + sModel.me.interactionLocation + '&intertype=' + sModel.me.interactionType +
                    '&channel=' + sModel.me.interactionChannel + '&action=lead&currlat=' + sModel.me.deviceLat +
                    '&currlng=' + sModel.me.deviceLng + '&clientcode=' + sModel.me.clientCode +
                    '&userid=' + sModel.me.userId + '&platform=' + sModel.me.devicePlatform +
                    '&lang=' + sModel.me.lang;

                id = "xdmAssignmentsFrame";

                break;
            case 'products':
                url = sModel.me.mobileSiteUrl + '/ProductList.aspx';

                id = "xdmProductsFrame";

                break;
            case 'add':
                url = sModel.me.mobileSiteUrl + '/AddProspect.aspx?deviceid=' + sModel.me.deviceUuid +
                    '&location=' + sModel.me.interactionLocation + '&intertype=' + sModel.me.interactionType +
                    '&channel=' + sModel.me.interactionChannel + '&currlat=' + sModel.me.deviceLat +
                    '&currlng=' + sModel.me.deviceLng + '&clientcode=' + sModel.me.clientCode +
                    '&userid=' + sModel.me.userId + '&platform=' + sModel.me.devicePlatform +
                    '&lang=' + sModel.me.lang;

                id = "xdmAddFrame";

                break;
            case 'search':
                url = sModel.me.mobileSiteUrl + '/prospectSearch.aspx?deviceid=' + sModel.me.deviceUuid +
                    '&location=' + sModel.me.interactionLocation + '&intertype=' + sModel.me.interactionType +
                    '&channel=' + sModel.me.interactionChannel + '&currlat=' + sModel.me.deviceLat +
                    '&currlng=' + sModel.me.deviceLng + '&clientcode=' + sModel.me.clientCode +
                    '&userid=' + sModel.me.userId + '&platform=' + sModel.me.devicePlatform +
                    '&lang=' + sModel.me.lang;

                id = "xdmSearchFrame";

                break;
        }
        //sUtil.dParams(url);
        buildCallback(url, id);
    },

    // In App Url ******************************************************************************************************
    openInapp: function (url, loc, ext) {
        "use strict";
        sUtil.clog('In inApp');

        // "url" can be "http" or "https" only (so no File)
        // "target" should be "_blank"
        // "loc" is a bool for showing location bar ('no' by default)
        // if "ext" == true open in external browser

        var locBar = (loc === true) ? 'location=yes' : 'location=no',
            mapApp = (sModel.me.devicePlatform === 'iOS') ? 'comgooglemaps://' :
                (sModel.me.devicePlatform === 'Android') ? 'com.google.android.apps.maps' : false,
            isMapUrl = (url.search("//maps.google.com/maps") !== -1),
            appUrl = (typeof url !== "undefined" || typeof url !== null) ? url : false;

        if (ext === true && appUrl !== false) {
            sUtil.clog('Open External URL');
            if (isMapUrl) {
                if (mapApp === false) {
                    sUtil.clog('Not on Mobile Platform');
                    sView.processInApp(appUrl, true, locBar);
                } else {
                    sUtil.clog('On Mobile Platform');
                    window.appAvailability.check(mapApp, function (availability) {
                        sUtil.clog('Found a Map App');
                        // availability is either true or false
                        if (availability) {
                            sUtil.clog('Google Maps is available');
                            if (sModel.me.devicePlatform === "iOS") {
                                appUrl = url.replace('http://maps.google.com/maps', mapApp)
                                    .replace('https://maps.google.com/maps', mapApp);
                            }
                            sView.processInApp(appUrl, true, locBar);

                        } else {
                            sUtil.clog('Google Maps is NOT available');
                            sView.processInApp(appUrl, true, locBar);
                        }
                    }, function (error) {
                            sUtil.clog('Failed to check the availability of Google Maps, ' + error);
                            alert(error);
                                                 
                    });
                }
            } else {
                sView.processInApp(appUrl, true, locBar);
            }

        } else if (appUrl !== false) {
            sUtil.clog('Open in a inAppBrowser');
            sView.processInApp(appUrl, false, locBar);
        }
    },

    processInApp: function (appUrl, ext, locBar) {
        "use strict";

        var externalWindow = (typeof ext !== "undefined" && typeof ext === "boolean") ?
            (ext === true) ? "_system" : "_blank" : "_blank";


        sUtil.clog("The URL is " + appUrl + " :: External Type: " + externalWindow + " :: Show the location bar: " + locBar);

        var inAppWindow = window.open(encodeURI(appUrl), externalWindow, locBar);

        // Load Start
        inAppWindow.addEventListener('loadstart',
            function (event) {
                window.StatusBar.hide();
            }
        );
        // Load Stop
        inAppWindow.addEventListener('loadstop',
            function (event) {
                sUtil.clog("page loaded", "inappbrowser", false);
            }
        );
        // Exit inAppBrowser
        inAppWindow.addEventListener('exit',
            function (event) {
                window.StatusBar.show();
            }
        );

        // Load Error
        inAppWindow.addEventListener('loaderror',
            function (event) {
                sView.utils.alert("Error Loading URL", "Notification", "I Understand", function () {
                    inAppWindow.close();
                });
            }
        );

    },

    // Get Page Title **************************************************************************************************
    getPageTitle: function (pid) {
        "use strict";
        var title;
        switch (pid) {
            case "dash":
                title = "Dashboard";
                break;
            case "local":
                title = "Local Market";
                break;
            case "followUps":
                title = "Appointments";
                break;
            case "assignments":
                title = "Assignments";
                break;
            case "products":
                title = "Info";
                break;
            case "search":
                title = "Search";
                break;
            case "bcScannerResultsPage":
                title = "Scan Results";
                break;
            case "lockPage":
                title = "Lock Page";
                break;
            case "add":
                title = "Add Prospect";
                break;
            default:
                title = false;
                break;
        }
        return title;
    },

    // Make Map ********************************************************************************************************
    makeMap: function (position, callback) {
        "use strict";
        //sUtil.clog('SWYFT MAP :: Let\'s Do It');
        var startMap = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);

        $('#diLattxt').attr('value', position.coords.latitude);
        $('#diLngtxt').attr('value', position.coords.longitude);
        $('#diLatlctxt').attr('value', new Date(position.timestamp));

        //sUtil.clog('SWYFT MAP :: Inputs updated');

        $('#app_map_canvas')
            .gmap({
                'credentials': 'AqiLW9NFwHvrYcx-qJ9JPo-UMMLGq185rCzNI9nNoLQPQ0LvSsG44z-Ab-Ynuaqe',
                'center': startMap,
                'zoom': 15,
                'disableZooming': true,
                'disablePanning': true,
                'disableTouchInput': true,
                'disableUserInput': true,
                'enableClickableLogo': false,
                'enableSearchLogo': false,
                'fixedMapPosition': false,
                'showCopyright': false,
                'showDashboard': false,
                'showMapTypeSelector': false,
                'showScalebar': false,
                'useInertia': false,
                'mapTypeId': Microsoft.Maps.MapTypeId.road,
                'callback': function () {
                    var self = this;

                    self.addMarker({
                        'location': position.coords.latitude + ', ' + position.coords.longitude,
                        'bounds': false

                    });

                    //sUtil.clog('SWYFT MAP :: Marker made and added');
                }
            });

        if (typeof callback === "function") {
            callback('done');
        }
    },

    // Re-Draw MAP *****************************************************************************************************
    reDrawMap: function (position, callback) {
        "use strict";
        sUtil.clog('MAP :: Re-Draw Map :: START');
        var map = $('#app_map_canvas');
        $('#diLattxt').attr('value', position.coords.latitude);
        $('#diLngtxt').attr('value', position.coords.longitude);
        $('#diLatlctxt').attr('value', new Date(position.timestamp));
        map.gmap('clear', 'markers');
        map.gmap('addMarker', {
            id: 'userCurr',
            'location': position.coords.latitude + ', ' + position.coords.longitude,
            'bounds': false,
            'zoom': 15
        });
        sModel.gpsCallbacks.reDraw = false;
        sUtil.clog('Re-Draw :: Callback');
        //sView.jqm.helpers.ldrWidget("hide");
        callback();
    }
};