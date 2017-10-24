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
  Alert,
  Linking
} from 'react-native';


class ContactUsPage extends Component {
      
    render() {
        var contactUsPageUrl = config.baseUrl+"/contactus";         
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToChefListPage()}>
                        <View style={styles.backButtonView}>
                            <Image source={backIcon} style={styles.backButtonIcon} />
                        </View>
                    </TouchableHighlight>
                    <View style={styles.titleView}></View>
                    <View style={styles.headerRightView}></View>
               </View>
               <WebView
               automaticallyAdjustContentInsets={false}
               source={{uri: contactUsPageUrl}}
               javaScriptEnabled={true}
               decelerationRate="normal"
               startInLoadingState={false}
               scalesPageToFit={true}/>
           </View>     
        );
    }
    
    openEmailApp(){
        Linking.openURL("mailto:customerservice@yumso.com");
    }

    dialThisNumber(phoneNumber){
        Linking.openURL("tel:"+phoneNumber);
    }

    navigateBackToChefListPage(){
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

