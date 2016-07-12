'use strict'
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var config = require('./config');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  WebView,
  TouchableHighlight,
  AsyncStorage,
  Alert
} from 'react-native';


class TermsPage extends Component {
      
    render() {
        var aboutUsPageUrl = config.baseUrl+"/terms";         
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToSignUpPage()}>
                       <View style={styles.backButtonView}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </View>
                    </TouchableHighlight>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Terms and Privacy</Text>
                    </View>
                    <View style={styles.headerRightView}>            
                    </View>
               </View>
               <WebView
                        automaticallyAdjustContentInsets={false}
                        source={{uri: aboutUsPageUrl}}
                        javaScriptEnabled={true}
                        decelerationRate="normal"
                        startInLoadingState={false}
                        scalesPageToFit={true}/>
           </View>     
        );
    }
    
    navigateBackToSignUpPage(){
        this.props.navigator.pop();
    }
}

var stylTermsPage = StyleSheet.create({
    
});

module.exports = TermsPage;

