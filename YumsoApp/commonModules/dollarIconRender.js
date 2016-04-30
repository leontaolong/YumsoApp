'use strict';
var dollarIconFilledUrl = require('../icons/ic_dollar_filled_48pt_3x.png');
var dollarIconEmptyUrl = require('../icons/ic_dollar_filled_48pt_3x.png');
 
import Dimensions from 'Dimensions';
import React, {
    Component,
    View,
    Image,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class DollarIcons {
    renderLevel(level){
       var dollarIcons = [];
       var maxLevel = 5;
       
       for (let i = 0; i < maxLevel; i++) {
           if (i < level) {
             dollarIcons.push(
                 <View key={i} style={{ marginRight: windowWidth / 83.0 }}>
                     <Image source={dollarIconFilledUrl} style={{ width: windowWidth / 32, height: windowWidth / 32 }}/>
                 </View>
             );
           } else {
             dollarIcons.push(
                 <View key={i} style={{ marginRight: windowWidth / 83.0 }}>
                     <Image source={dollarIconEmptyUrl} style={{ width: windowWidth / 32, height: windowWidth / 32 }}/>
                 </View>
             );
           }
       }
       return dollarIcons;       
    }
     
}
 
module.exports = new DollarIcons();