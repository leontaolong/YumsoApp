'use strict'
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var config = require('./config');
var verifyIcon = require('./icons/icon-verify.png');
var backgroundImage = require('./resourceImages/background@3x.jpg');

import Dimensions from 'Dimensions';
var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Alert
} from 'react-native';


class VerificationPage extends Component {
    constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;        
        this.state = {
            email: routeStack[routeStack.length-1].passProps.email,
        };
    }

    render() {
        return (
            <View style={styles.greyContainer}>
                <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                    <View style={styles.transparentHeaderBannerView}>
                        <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                            <View style={styles.backButtonView}>
                                <Image source={backIcon} style={styles.backButtonIcon}/>
                            </View>
                        </TouchableHighlight>
                        <View style={styles.titleView}></View>
                        <View style={styles.headerRightView}></View>
                    </View>
                    <View style={styleVerificationPage.contentTextView}>
                        <Text style={styleVerificationPage.contentTitle}>Verify Your Account</Text>
                            <Image source={verifyIcon} style={styleVerificationPage.verifyIconView}/>
                        <Text style={styleVerificationPage.contentText}>A confirmation email has been sent to {this.state.email}! Please verify your email before signing up.</Text>
                    </View>
                </Image>
                <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress = {() => this.navigateToLoginPage()}>
                    <Text style={styles.bottomButtonView}>Got it</Text>
                </TouchableOpacity>
           </View>     
        );
    }
    

    navigateBack(){
        this.props.navigator.pop();
    }

    navigateToLoginPage() {
        this.props.navigator.push({
            name: 'LoginPage'
        });    
    }
}

var styleVerificationPage = StyleSheet.create({
    contentTextView:{
        paddingHorizontal:windowWidth/20.7,
    },
    contentTitle:{
        backgroundColor: 'rgba(0,0,0,0)',        
        fontSize:28*windowHeight/677,
        fontWeight:'bold',
    },
    contentText:{
        backgroundColor: 'rgba(0,0,0,0)',
        fontSize:windowHeight/35.5,
        fontWeight:'600',
    },
    verifyIconView: {
        height: 64,
        width: 125,
        marginVertical:windowHeight*0.0560,
    },
});

module.exports = VerificationPage;

