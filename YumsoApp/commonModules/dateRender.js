'use strict';
 
 import React, {
    Component,
} from 'react-native';

 class DateRender {
    //Return as MM/DD/YYYY
    renderDate1(dateInMilliseconds){
       var dateObj = new Date(dateInMilliseconds);
       var year = dateObj.getFullYear().toString();
       var month = dateObj.getMonth() + 1 < 10 ? "0" + (dateObj.getMonth() + 1).toString() : (dateObj.getMonth() + 1).toString();
       var day = dateObj.getDate() < 10 ? "0" + dateObj.getDate().toString() : dateObj.getDate().toString();
       return month + "/" + day + "/" + year;
    }     
    
    //To be implemented MM/DD/YYYY HH:MM AM/PM
}
 
module.exports = new DateRender();