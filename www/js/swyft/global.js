var // Global **********************************************************************************************************
    lineIndent = '--------------------------------------------------------------------------->>> ',
    cMessages = true,

// Main Util Obj ********************************************************************************************************
    sUtil = {
        // Get Current Time **
        currentTime: function () {
            "use strict";
            var date = new Date(),
                hours = date.getHours(),
                minutes = date.getMinutes(),
                amPm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return hours + ':' + minutes + ' ' + amPm;
        },
        // Console.Log Message
        clog: function (message, category, indentLine) {
            "use strict";
            var i = (indentLine === true) ? lineIndent : '';
            if (cMessages === true) {
                if (typeof category !== "undefined") {
                    window.console.log('SWYFT :: APP :: ' + category.toUpperCase() + ' :: ' + sUtil.currentTime() + " " + i + ':: ' + message);
                } else {
                    window.console.log('SWYFT :: APP :: ' + sUtil.currentTime() + " " + i + ':: ' + message);
                }
            }
        },
        dParams: function(url) {
            "use strict";
            if (url) {
                var qstr = url.substring(url.indexOf("?") + 1).replace(/&/g, "\n");
                window.alert(qstr);
            }
        }
    };
