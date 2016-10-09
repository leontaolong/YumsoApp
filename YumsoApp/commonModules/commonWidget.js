'use strict';

import React, {
    Component,
} from 'react-native';

class CommonWidget {
    getTextLengthLimited(text,lengthLimit){
        if(text.length<=lengthLimit){
           return text;
        }else{
           var shortenedText = text.substr(0,lengthLimit-1);
           var betterShortenedText = shortenedText.substr(0,Math.max(shortenedText.lastIndexOf(' '),shortenedText.lastIndexOf(','),shortenedText.lastIndexOf(';'),shortenedText.lastIndexOf('|')));
           return betterShortenedText ? betterShortenedText + '...' : shortenedText+'...';
        }
    }
}

module.exports = new CommonWidget();