'use strict';
var config = require('../config');
var dateRender = require('./dateRender');
const gracePeriodLength = config.gracePeriodLength;

import React, {
    Component,
    Alert,
} from 'react-native';

class CommonWidget {
    getTextLengthLimited(text,lengthLimit){
        if(!text || text.length<=lengthLimit){
           return text;
        }else{
           var shortenedText = text.substr(0,lengthLimit-1);
           var betterShortenedText = shortenedText.substr(0,Math.max(shortenedText.lastIndexOf(' '),shortenedText.lastIndexOf(','),shortenedText.lastIndexOf(';'),shortenedText.lastIndexOf('|')));
           return betterShortenedText ? betterShortenedText + '...' : shortenedText+'...';
        }
    }

    alertWhenGracePeriodTimeOut(shoppingCart,scheduleMapping,selectedTime){
        var deliverTimeInMillisec = new Date(selectedTime).getTime();
        var currentTimeInMillisec = new Date().getTime();
        var latestOrderTimeInMillisec = currentTimeInMillisec;
        var dishName = '';
        for(var oneDishId in shoppingCart[selectedTime]){
            if(scheduleMapping[selectedTime][oneDishId].latestOrderTime<latestOrderTimeInMillisec){
               latestOrderTimeInMillisec = scheduleMapping[selectedTime][oneDishId].latestOrderTime;
               dishName = shoppingCart[selectedTime][oneDishId].dish.dishName;
            }
        }

        var gracePeriodInMillisec = 60 * 1000 * gracePeriodLength;
        
        if(currentTimeInMillisec-latestOrderTimeInMillisec>gracePeriodInMillisec){
           var timeFormatted = dateRender.renderTime1(deliverTimeInMillisec-latestOrderTimeInMillisec)
           Alert.alert('Oops! It\'s too late...','Chef requires ' + dishName + ' to be ordered '+ timeFormatted +' before out-for-deliver time. You can remove it or choose a later time.',[{text:'OK'}]);
           return true;
        }
        return false;
    }
}

module.exports = new CommonWidget();