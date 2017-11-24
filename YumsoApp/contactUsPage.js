'use strict'
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var config = require('./config');
var backgroundImage = require('./resourceImages/background@3x.jpg');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var windowWidthRatio = windowWidth / 375;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  WebView,
  TouchableHighlight,
  AsyncStorage,
  Alert,
  Linking
} from 'react-native';


class ContactUsPage extends Component {
      
    render() {
        var contactUsPageUrl = config.baseUrl+"/contactus";         
        return (
            <View style={styles.containerNew}>
            <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                    <View style={styles.headerBannerViewNew}>
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                        <View style={styles.backButtonViewsNew}>
                            <Image source={backIcon} style={styles.backButtonIconsNew} />
                        </View>
                    </TouchableHighlight>
                    <View style={styles.headerRightView}>
                    </View>
               </View>
               <View style={styles.titleViewNew}>
                   <Text style={styles.titleTextNew}>Contact Us</Text>
               </View>
               <WebView
               style={{marginHorizontal:10*windowWidthRatio, backgroundColor:'transparent'}}
               automaticallyAdjustContentInsets={false}
               source={{uri: contactUsPageUrl}}
               javaScriptEnabled={true}
               decelerationRate="normal"
               startInLoadingState={false}
               scalesPageToFit={true}/>
           </Image>
           </View>     
        );
    }
    
    openEmailApp(){
        Linking.openURL("mailto:customerservice@yumso.com");
    }

    dialThisNumber(phoneNumber){
        Linking.openURL("tel:"+phoneNumber);
    }

    navigateBack(){
        this.props.navigator.pop();
    }
}

var styleContactUsPage = StyleSheet.create({
    contentTextView:{
        paddingTop:windowHeight/25.6,
        paddingHorizontal:15,
        alignItems:'center',
    },
    contentText:{
        color:'#4A4A4A',
        fontSize:18,
        textAlign:'justify',
    },
    contentEmail:{
        paddingTop:5,
        color:'#FFCC33',
        fontSize:18,
        alignSelf:"flex-start"
    },
    contactTitle:{
        paddingTop:15,
        color:'#4A4A4A',
        fontSize:18,
        alignSelf:'flex-start',
    }
});

module.exports = ContactUsPage;

