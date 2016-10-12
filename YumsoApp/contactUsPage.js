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
            <View style={styles.container}>
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
                  <Text style={styleContactUsPage.contentText}>If you have any question or concern about using our App, becoming a chef or just want to chat with us, don't hesitate to let us know at</Text>
                  <Text onPress={()=>this.openEmailApp()} style={styleContactUsPage.contentEmail}>customerservice@yumso.com</Text>
               </View>
           </View>     
        );
    }
    
    openEmailApp(){
        Linking.openURL("mailto:customerservice@yumso.com");
    }

    navigateBackToChefListPage(){
        this.props.navigator.pop();
    }
}

var styleContactUsPage = StyleSheet.create({
    contentTextView:{
        paddingTop:30,
        paddingHorizontal:15,
        alignItems:'center',
    },
    contentText:{
        color:'#4A4A4A',
        fontSize:20,
    },
    contentEmail:{
        paddingTop:20,
        color:'#FFCC33',
        fontSize:20,
        alignSelf:"center"
    }
});

module.exports = ContactUsPage;

