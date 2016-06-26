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


class AboutPage extends Component {
      
    render() {
        var aboutUsPageUrl = config.baseUrl+"/aboutus";         
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToChefListPage()}>
                       <View style={styles.backButtonView}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </View>
                    </TouchableHighlight>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>About Yumso</Text>
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
    
    navigateBackToChefListPage(){
        this.props.navigator.pop();
    }
}

var styleAboutPage = StyleSheet.create({
    
});

module.exports = AboutPage;

