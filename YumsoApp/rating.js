 'use strict';
 var rating1star = require('./icons/icon-1-starview.png');
 var rating2star = require('./icons/icon-2-starview.png');
 var rating3star = require('./icons/icon-3-starview.png');
 var rating4star = require('./icons/icon-4-starview.png');
 var rating5star = require('./icons/icon-5-starview.png');
 
 import Dimensions from 'Dimensions';
 import React, {
    Component,
    View,
    Image,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
 
 class Rating {
    renderRating(rating){
          var ratingIconsView = null;
          switch (rating) {
              case 1:
                  ratingIconsView = <Image source={rating1star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 2:
                  ratingIconsView = <Image source={rating2star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 3:
                  ratingIconsView = <Image source={rating3star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 4:
                  ratingIconsView = <Image source={rating4star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 5:
                  ratingIconsView = <Image source={rating5star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              default:
                  break;
          }
          
          return ratingIconsView;      
    }
     
}
 
module.exports = new Rating();