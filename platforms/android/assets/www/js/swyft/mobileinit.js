//MOBILE INIT ***********************************************************************************************************
$(document).on("mobileinit", function () {
    "use strict";
    $.mobile.defaultPageTransition = 'none';
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
});