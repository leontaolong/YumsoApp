 'use strict';
 var ratingIconFilledUrl = require('./icons/Icon-Small.png');
 var ratingIconEmptyUrl = require('./icons/forkhand2.png');
 
 import Dimensions from 'Dimensions';
 import React, {
    Component,
    View,
    Image,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
// 
 class Rating {
    renderRating(rating){
       var ratingIcons = [];
       var maxRating = 5;
       
       for (let i = 0; i < maxRating; i++) {
           if (i < rating) {
             ratingIcons.push(
                 <View key={i} style={{ marginRight: windowWidth / 83.0 }}>
                     <Image source={ratingIconFilledUrl} style={{ width: windowWidth / 32, height: windowWidth / 32 }}/>
                 </View>
             );
           } else {
             ratingIcons.push(
                 <View key={i} style={{ marginRight: windowWidth / 83.0 }}>
                     <Image source={ratingIconEmptyUrl} style={{ width: windowWidth / 32, height: windowWidth / 32 }}/>
                 </View>
             );
           }
       }
       return ratingIcons;       
    }
     
}
 
module.exports = new Rating();