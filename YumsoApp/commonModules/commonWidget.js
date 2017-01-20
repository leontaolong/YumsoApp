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
           var betterShortenedText = shortenedText.substr(0,Math.max(shortenedText.lastIndexOf(' ')-1,shortenedText.lastIndexOf(',')-1,shortenedText.lastIndexOf(';')-1,shortenedText.lastIndexOf('|')-1));
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

    isOrderCommentable(oneOrder){
        if(oneOrder.orderStatus.toLowerCase() == 'delivered' && new Date().getTime()-oneOrder.orderDeliverTime <= 7*24*60*60*1000 && !oneOrder.comment){
           return true;
        }
        return false;
    }

    isOrderPending(oneOrder){
        if(oneOrder.orderStatus.toLowerCase() == 'new' || oneOrder.orderStatus.toLowerCase() == 'delivering'){
           return true;
        }
        return false;
    }
}

module.exports = new CommonWidget();