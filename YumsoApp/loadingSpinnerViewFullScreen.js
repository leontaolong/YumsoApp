var styles = require('./style');
import {Bars} from 'react-native-loader';
import React, {
  Component,
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicatorIOS,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class LoadingSpinnerViewFullScreen extends Component {    
    render() {  
        return (
            <View style={loadingSpinnerViewFullScreenStyle.loaderView}>
                <View style={loadingSpinnerViewFullScreenStyle.loaderWrapper}>
                  <Bars size={10} color="#FFCC33" />
                </View>
            </View> 
        );
    }
}

var loadingSpinnerViewFullScreenStyle = StyleSheet.create({
    loaderView:{
      position:'absolute',
      top:0,
      left:0,
      right:0, 
      height:windowHeight,
    },
    loaderWrapper:{
      alignSelf:'center',
      marginTop:windowHeight*(1-0.618)-0.5*70*windowHeight/667,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'#5a5a5a',
      height:70*windowHeight/667,
      width:70*windowHeight/667,
      opacity:0.7,
      borderWidth:0,
      borderRadius:9*windowHeight/667,
    },
    loader:{

    },
});
    
module.exports = LoadingSpinnerViewFullScreen;

