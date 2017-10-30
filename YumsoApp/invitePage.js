'use strict'
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var config = require('./config');
var inviteIcon = require('./icons/icon-invite.png');
var backgroundImage = require('./resourceImages/background@3x.jpg');

import Dimensions from 'Dimensions';
var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 280 //Todo: get keyboard size programmatically.

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';


class InvitePage extends Component {
    constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length - 1].passProps.eater;
        this.state = {
            eater: eater,
        };
    }

    render() {
        return (
            <View style={styles.greyContainer}>
                <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                    <View style={styles.transparentHeaderBannerView}>
                        <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                            <View style={styles.backButtonView}>
                                <Image source={backIcon} style={styles.backButtonIcon} />
                            </View>
                        </TouchableHighlight>
                        <View style={styles.titleView}></View>
                        <View style={styles.headerRightView}></View>
                    </View>
                    <View style={styleInvitePage.contentTextView}>
                        <ScrollView keyboardShouldPersistTaps={true} ref="scrollView">    
                            <Text style={styleInvitePage.contentTitle}>Invite Friends</Text>
                            <Image source={inviteIcon} style={styleInvitePage.inviteIconView}/>
                            <Text style={styleInvitePage.contentText}>Invite your friends to Yumso! Your friend will have $6 off at first order and then you will have $5 coupon in your next order!</Text>
                            <Text style={styleInvitePage.inputTitleText}>Email</Text>
                            <View style={styleInvitePage.emailInputView}>
                                <TextInput style={styleInvitePage.emailInput} autoCapitalize={'none'} clearButtonMode={'while-editing'} returnKeyType={'done'} maxLength={40} autoCorrect={false} 
                                onChangeText={(text) => { this._onFocus();this.setState({ email: text })}} onFocus={(()=>this._onFocus()).bind(this)} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)}/>
                            </View>
                            <View style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>
                        </ScrollView>
                    </View>
                </Image>
                <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress = {() => this.sendInviteEmail() }>
                    <Text style={styles.bottomButtonView}>Invite</Text>
                </TouchableOpacity>
           </View>     
        );
    }

    _onLayout(event) {
        this.y = event.nativeEvent.layout.y;
    }

    _onFocus() {
        // this.setState({showPasswordRequirment:true});
        let scrollViewLength = this.y;
        let scrollViewBottomToScreenBottom = windowHeight - (scrollViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        this.refs.scrollView.scrollTo({x:0, y:keyboardHeight - scrollViewBottomToScreenBottom, animated: true})
    }

    onKeyBoardDonePressed(){
        this.refs.scrollView.scrollTo({x:0, y:0, animated: true})
    }

    navigateBack(){
        this.props.navigator.pop();
    }

    sendInviteEmail(){
        if (!this.state.email || !this.state.email.trim()) {
            Alert.alert('Error', 'Please enter an email', [{ text: 'OK' }]);
            return;
        }

    }
}

var styleInvitePage = StyleSheet.create({
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
        marginBottom:windowHeight*0.0550,        
    },
    inputTitleText:{
        color: 'grey',
        backgroundColor: 'rgba(0,0,0,0)',        
    },
    emailInputView:{
        borderBottomWidth:1,
        borderColor:'lightgrey',
        marginBottom:windowHeight*0.005,                
    },
    emailInput:{
        width:windowWidth*0.9,
        height:windowHeight*0.06,
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        textAlign:'left',
    },
    inviteIconView: {
        height: 84,
        width: 91,
        marginVertical:windowHeight*0.0550,
    },
});

module.exports = InvitePage;

