 'use strict';
 var rating0star = require('./icons/icon-0-starview.png');
 var ratingHalfstar = require('./icons/icon-0.5-starview.png');
var rating1star = require('./icons/icon-1-starview.png');
var rating1Halfstar = require('./icons/icon-1.5-starview.png');
var rating2star = require('./icons/icon-2-starview.png');
var rating2Halfstar = require('./icons/icon-2.5-starview.png');
var rating3star = require('./icons/icon-3-starview.png');
var rating3Halfstar = require('./icons/icon-3.5-starview.png');
var rating4star = require('./icons/icon-4-starview.png');
var rating4Halfstar = require('./icons/icon-4.5-starview.png');
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
          var starNumbers = Math.round(rating/0.5)/2;

          switch (starNumbers) {
              case 0:
                  ratingIconsView = <Image source={rating0star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 0.5:
                  ratingIconsView = <Image source={ratingHalfstar} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 1:
                  ratingIconsView = <Image source={rating1star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 1.5:
                  ratingIconsView = <Image source={rating1Halfstar} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 2:
                  ratingIconsView = <Image source={rating2star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 2.5:
                  ratingIconsView = <Image source={rating2Halfstar} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 3:
                  ratingIconsView = <Image source={rating3star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 3.5:
                  ratingIconsView = <Image source={rating3Halfstar} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 4:
                  ratingIconsView = <Image source={rating4star} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
                  break;
              case 4.5:
                  ratingIconsView = <Image source={rating4Halfstar} style={{ width: 6*windowWidth/32, height: windowWidth/32 }}/>
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