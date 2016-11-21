'use strict';

import React, {
    Component,
} from 'react-native';

class DateRender {
    //Return as MM/DD/YYYY
    renderDate1(dateInMilliseconds) {
        var dateObj = new Date(dateInMilliseconds);
        var year = dateObj.getFullYear().toString();
        var month = dateObj.getMonth() + 1 < 10 ? "0" + (dateObj.getMonth() + 1).toString() : (dateObj.getMonth() + 1).toString();
        var day = dateObj.getDate() < 10 ? "0" + dateObj.getDate().toString() : dateObj.getDate().toString();
        return month + "/" + day + "/" + year;
    }

    formatTime2String(time) {
        if (time) {
            var d = new Date(time);
            var hh = d.getHours();
            var m = d.getMinutes();
            var dd = "AM";
            var h = hh;
            if (h >= 12) {
                h = hh - 12;
                dd = "PM";
            }
            if (h == 0) {
                h = 12;
            }
            m = m < 10 ? "0" + m : m;
            h = h < 10 ? "0" + h : h;
            return h + ":" + m + " " + dd;
        } else {
            return '';
        }
    }

    formatTime2StringShort(time) {
        if (time) {
            var d = new Date(time);
            var hh = d.getHours();
            var m = d.getMinutes();
            var dd = " AM";
            var h = hh;
            if (h >= 12) {
                h = hh - 12;
                dd = " PM";
            }
            if (h == 0) {
                h = 12;
            }
            m = m < 10 ? "0" + m : m;
            h = h < 10 ? "0" + h : h;
            return h + ":" + m + dd;
        } else {
            return '';
        }
    }

    renderDate2(dateString) {
        var dateInMilliseconds = new Date(dateString).getTime();
        var todayInMillisecond = new Date().setHours(0, 0, 0, 0);
        var tommorrowInMillisecond = todayInMillisecond + 60 * 60 * 24 * 1000;
        var thedayaftertommorrowInMillisecond = tommorrowInMillisecond + 60 * 60 * 24 * 1000;
        if (dateInMilliseconds >= todayInMillisecond && dateInMilliseconds < tommorrowInMillisecond) {
            return 'Today ' + this.formatTime2String(dateString);
        } else if (dateInMilliseconds >= tommorrowInMillisecond && dateInMilliseconds < thedayaftertommorrowInMillisecond) {
            return 'Tomorrow ' + this.formatTime2String(dateString);
        } else {
            return this.renderDate1(dateInMilliseconds) + ' ' + this.formatTime2String(dateString);
        }
        return dateString;
    }

    renderDate3(dateInMilliseconds) {
        var dateObj = new Date(dateInMilliseconds);
        var year = dateObj.getFullYear().toString();
        var month = dateObj.getMonth() + 1 < 10 ? "0" + (dateObj.getMonth() + 1).toString() : (dateObj.getMonth() + 1).toString();
        var day = dateObj.getDate() < 10 ? "0" + dateObj.getDate().toString() : dateObj.getDate().toString();
        return month + "/" + day + "/" + year + " " + this.formatTime2String(dateInMilliseconds);
    }

    renderTime1(timeInMilliseconds) {
        return timeInMilliseconds/(60*1000)<=60 ? timeInMilliseconds/(60*1000)+" min": timeInMilliseconds/(60*60*1000)+" hours";
    }
}

module.exports = new DateRender();