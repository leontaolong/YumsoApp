'use strict'
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var config = require('./config');
var inviteIcon = require('./icons/icon-invite.png');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var HttpsClient = require('./httpsClient');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen');
var commonAlert = require('./commonModules/commonAlert');

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

var h1 = 28 * windowHeight / 677;
var h2 = windowHeight / 35.5;
var h3 = windowHeight / 33.41;
var h4 = windowHeight / 47.33;
var h5 = 12;
var b1 = 15 * windowHeight / 677;
var b2 = 15 * windowHeight / 677;

class InvitePage extends Component {
    constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length - 1].passProps.eater;
        this.state = {
            eater: eater,
            showProgress: false,
        };

        this.responseHandler = function (response, msg) {
            if (response.statusCode == 400) {
                Alert.alert('Warning', response.data, [{ text: 'OK' }]);
            } else if (response.statusCode === 401) {
                return AuthService.logOut()
                    .then(() => {
                        delete this.state.eater;
                        this.props.navigator.push({
                            name: 'WelcomePage',
                            passProps: {
                                callback: function (eater) {
                                    this.setState({ eater: eater });
                                }.bind(this)
                            }
                        });
                    });
            } else {
                Alert.alert('Network or server error', 'Please try again later', [{ text: 'OK' }]);
            }
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }

    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;
        }

        var couponValueForInviter = 3;
        var couponValueForInvitee = 5;

        if (this.state.eater && this.state.eater.couponValueForInviter){
            couponValueForInviter = this.state.eater.couponValueForInviter;
        }

        if (this.state.eater && this.state.eater.couponValueForInvitee) {
            couponValueForInvitee = this.state.eater.couponValueForInvitee;
        }

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
                            <Text style={styleInvitePage.contentText}>Invite your friends to Yumso! Your friend will get ${couponValueForInvitee} off at the first order and then you will have ${couponValueForInviter} coupon !</Text>
                            <Text style={styleInvitePage.inputTitleText}>First Name of Your Friend</Text>
                            <View style={styleInvitePage.emailInputView}>
                                <TextInput style={styleInvitePage.emailInput} autoCapitalize={'none'} clearButtonMode={'while-editing'} returnKeyType={'done'} maxLength={40} autoCorrect={false}
                                onChangeText={(text) => { this._onFocus(); this.setState({ friendFirstname: text }) }} onFocus={(() => this._onFocus()).bind(this)} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} />
                            </View>
                            <Text style={styleInvitePage.inputTitleText}>Email</Text>
                            <View style={styleInvitePage.emailInputView}>
                                <TextInput style={styleInvitePage.emailInput} autoCapitalize={'none'} clearButtonMode={'while-editing'} returnKeyType={'done'} maxLength={40} autoCorrect={false} 
                                onChangeText={(text) => { this._onFocus(); this.setState({ email: text })}} onFocus={(()=>this._onFocus()).bind(this)} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)}/>
                            </View>
                        </ScrollView>
                    </View>
                    {loadingSpinnerView}
                </Image>
                <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress = {() => this.sendInviteEmail() }>
                    <Text style={styles.bottomButtonView}>Invite</Text>
                </TouchableOpacity>
           </View>     
        );
    }


    _onFocus() {
        this.refs.scrollView.scrollTo({ x: 0, y: windowHeight * 0.1, animated: true})
    }

    onKeyBoardDonePressed(){
        this.refs.scrollView.scrollTo({x:0, y:0, animated: true})
    }

    navigateBack(){
        this.props.navigator.pop();
    }

    sendInviteEmail(){
        if (!this.state.friendFirstname || !this.state.friendFirstname.trim()) {
            Alert.alert('Error', 'Please enter your friend\'s first name', [{ text: 'OK' }]);
            return;
        }

        if (!this.state.email || !this.state.email.trim()) {
            Alert.alert('Error', 'Please enter an email', [{ text: 'OK' }]);
            return;
        }

        this.setState({ showProgress: true });
        let reqBody = { 
                        eaterId: this.state.eater.eaterId, 
                        friendFirstname: this.state.friendFirstname, 
                        friendEmail: this.state.email 
                      };
        return this.client.postWithAuth(config.eaterInviteFriendsEndpoint, reqBody)
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode != 202) {
                    this.setState({ showProgress: false });
                    return this.responseHandler(res);
                }
                this.setState({ showProgress: false });
                Alert.alert('Invitation Sent', 'By registering through the link provided in the email, Your friend will get the coupon for his or her first order.', [{ text: 'OK' }])
            }).catch((err) => {
                this.setState({ showProgress: false });
                commonAlert.networkError(err);
            });

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
        fontSize:h2,
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
        fontSize:h2,
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

