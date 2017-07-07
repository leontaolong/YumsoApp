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
        return (
            <View style={styles.greyContainer}>
               <View style={styles.headerBannerView}>    
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToChefListPage()}>
                       <View style={styles.backButtonView}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </View>
                    </TouchableHighlight>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Contact Us</Text>
                    </View>
                    <View style={styles.headerRightView}>            
                    </View>
               </View>
               <View style={styleContactUsPage.contentTextView}>
                  <Text style={styleContactUsPage.contentText}>If you have any question or concern about using our App, becoming a chef or just want to chat with us, don't hesitate to let us know.</Text>
                  <Text style={styleContactUsPage.contactTitle}>Phone:</Text>
                  <Text onPress={()=>this.dialThisNumber('2062258636')} style={styleContactUsPage.contentEmail}>(206)225-8636</Text>
                  <Text style={styleContactUsPage.contactTitle}>Email:</Text>
                  <Text onPress={()=>this.openEmailApp()} style={styleContactUsPage.contentEmail}>customerservice@yumso.com</Text>
               </View>
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

