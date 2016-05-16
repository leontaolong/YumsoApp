'use strict';
 
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
       var dollarIcons = '';       
       for (let i = 0; i < level; i++) {
           dollarIcons +='$';
       }
       return dollarIcons;       
    }
     
}
 
module.exports = new DollarIcons();