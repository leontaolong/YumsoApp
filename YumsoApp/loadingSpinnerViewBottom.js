var styles = require('./style');

import React, {
  Component,
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicatorIOS,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class LoadingSpinnerViewBottom extends Component {    
    render() {  
        return (
            <View style={loadingSpinnerViewBottomStyle.loaderView}>
                  <ActivityIndicatorIOS animating={true} color={'#4A4A4A'}  size="small"/>
            </View> 
        );
    }
}

var loadingSpinnerViewBottomStyle = StyleSheet.create({
    loaderView:{
      height:50*windowHeight/667,
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center',
    },
});
    
module.exports = LoadingSpinnerViewBottom;

