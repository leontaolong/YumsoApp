'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var commonAlert = require('./commonModules/commonAlert');
var AuthService = require('./authService');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var validator = require('validator');

import Dimensions from 'Dimensions';
var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';

var h1 = 28*windowHeight/677;
var h2 = windowHeight/35.5;
var h3 = windowHeight/33.41;
var h4 = windowHeight/47.33;
var h5 = 12;
var b1 = 15*windowHeight/677;
var b2 = 15*windowHeight/677;

class OnBoardPage extends Component {
     constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length - 1].passProps.eater;
        let principal = routeStack[routeStack.length - 1].passProps.principal;
        this.state = {
            eater:eater,
            principal:principal,
            showProgress:false,
            email:eater.email,
            phoneNumber:eater.phoneNumber,
        };

        this.responseHandler = function (response, msg) {
            if(response.statusCode==400){
               Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);
            }else if (response.statusCode === 401) {
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
                 Alert.alert( 'Network or server error', 'Please try again later',[ { text: 'OK' }]);
            }
        };
        this.client = new HttpsClient(config.baseUrl, true);
     }

     render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;
        }

        return (
                <View style={styles.containerNew}>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        <View style={styles.headerBannerViewNew}>
                            <View style={styles.headerLeftView}>
                            </View>
                            <View style={styles.headerRightView}>
                            </View>
                        </View>
                        
                        <View style={styles.titleViewNew}>
                            <Text style={styles.titleTextNew}>How can we reach you?</Text>
                        </View>

                        <ScrollView style={{backgroundColor:'#fff'}}>
                            
                            <Text style={styleEaterPage.textFieldTitle}>Phone</Text>
                            <View style={styles.loginInputViewNew}>
                                <TextInput style={styleEaterPage.loginInputNew} defaultValue={this.state.phoneNumber} keyboardType = { 'phone-pad'} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                    maxLength={15} onChangeText = {(text) => this.setState({ phoneNumber: text }) }/>
                            </View>
                                <Text style={styleEaterPage.textFieldTitle}>Email</Text>
                                <View style={styles.loginInputViewNew}>
                                    <TextInput style={styleEaterPage.loginInputNew} defaultValue={this.state.email} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                        autoCapitalize={'none'} maxLength={40} autoCorrect={false} onChangeText = {(text) => this.setState({ email: text }) }/>
                                </View>

                                <TouchableOpacity activeOpacity={0.7} >
                                     <Text style={styleEaterPage.textFieldTitle}>{this.state.principal.identityProvider === 'Yumso' ? `Logged in with Email: ${this.state.eater.email}` : 'Logged in using Facebook'}</Text>
                                </TouchableOpacity>
                            {loadingSpinnerView}
                        </ScrollView>

                        <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress = {this.submit.bind(this)}>
                             <Text style={styleEaterPage.updateButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </Image>
                </View>);
     }

    submit(){

        if (!this.state.phoneNumber) {
            Alert.alert('Phone Number Required','', [{ text: 'OK' }]);
            return;
        }

        if (this.state.phoneNumber && !validator.isMobilePhone(this.state.phoneNumber, 'en-US')) {
            Alert.alert('Error', 'Phone number is not valid', [{ text: 'OK' }]);
            return;
        }

        if (!this.state.email) {
            Alert.alert('Error', 'Missing email address.', [{ text: 'OK' }]);
            return;
        }

        if(this.state.email && !validator.isEmail(this.state.email)){
            Alert.alert( 'Error', 'Invalid email.',[ { text: 'OK' }]);
            return;
        }

        var _this = this;
        let eater = {};
        eater.eaterId = this.state.eater.eaterId;
        eater.phoneNumber = this.state.phoneNumber;
        eater.email = this.state.email;
        this.setState({showProgress:true});
        return this.client.postWithAuth(config.eaterUpdateEndpoint, { eater: eater })
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode != 202) {
                    this.setState({ showProgress: false });
                    return this.responseHandler(res);
                }
                for(let prop in eater){
                    this.state.eater[prop] = eater[prop];
                }
                return AuthService.updateCacheEater(this.state.eater)
                .then(() => {
                    this.setState({showProgress: false});
                    if(!this.state.eater.homeAddress){
                        this.navigateToAddressBookPage();
                    }else{
                        this.navigateToChefListPage();
                    }
                }).catch((err)=>{
                    this.setState({showProgress: false});
                    alert(err.message);
                });
        }).catch((err)=>{
            this.setState({showProgress: false});
            commonAlert.networkError(err);
        });
    }

    navigateToAddressBookPage(){
        this.props.navigator.push({
            name: 'AddressBookPage',
            passProps: {
                eater: this.state.eater,
                isOnBoarding:true,
            }
        });
    }

    navigateToChefListPage(){
        this.props.navigator.push({
            name: 'ChefListPage',
        });
    }
}

var styleEaterPage = StyleSheet.create({
    uploadPhotoButtonView:{
        position:'absolute',
        right:windowWidth *0.0157,
        top:windowHeight*0.313,
    },
    uploadPhotoIcon:{
        width:windowHeight*0.06,
        height:windowHeight*0.06,
    },
    eaterProfilePic:{
        width: windowWidth,
        height: windowHeight/2.63,
    },
    eaterPageRowView:{
        flex: 1,
        paddingHorizontal: windowWidth/20.7,
        paddingTop: windowWidth/20.7,
        paddingBottom: windowWidth/41.4,
        borderColor: '#F5F5F5',
        borderTopWidth: 0,
        backgroundColor: '#fff',
    },
    eaterNameText:{
        fontSize:windowHeight/36.8,
        marginBottom:windowHeight/61.3,
    },
    eaterPageGreyText:{
        fontSize: windowHeight/46.0,
        marginBottom: windowWidth/41.4,
        color:'#4A4A4A',
    },
    eaterPageClickableText:{
        fontSize: windowHeight/46.0,
        marginBottom: windowWidth/41.4,
        color:'#FFCC33',
    },
    sectionTitleView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight*0.105,
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    sectionTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/37.05,
        color:'#4A4A4A',
        fontWeight:'400',
    },
    nameInputView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    nameInputTitleView:{
        flex:0.25,
        flexDirection:'row',
        justifyContent:'flex-start',
        marginLeft:windowWidth*0.04,
    },
    nameInputTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/41.6875,
        color:'#9B9B9B',
    },
    nameInputTextView:{
        flex:0.75,
        flexDirection:'row',
        marginRight:windowWidth*0.022,
    },
    nameInputText:{
        flex:1,
        textAlign:'right',
        fontSize:windowHeight/41.6875,
    },
    genderSelectView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    oneGenderSelectView:{
        flex:1/3,
        flexDirection:'row',
        justifyContent:'center',
        height: 50 * windowHeightRatio,
    },
    oneGenderSelectMiddleView:{
        flex:1/3,
        flexDirection:'row',
        justifyContent:'center',
        borderLeftWidth:1,
        borderRightWidth:1,
        borderColor:'#D7D7D7',
        height: 50 * windowHeightRatio,
    },
    oneGenderSelectText:{
        fontSize:windowHeight/44.467,
        color:'#9B9B9B',
        alignSelf:'center',
    },
//***** new
    textFieldTitle: {
      fontSize: b2,
      color: '#979797',
      marginLeft: 0,
      marginLeft: 20 * windowWidthRatio,
      textAlign: "left",
      width: windowWidth-40 * windowWidthRatio,
      marginTop: 12 * windowHeightRatio,
    },

    loginInputNew:{
      width:windowWidth-40 * windowWidthRatio,
      height:34 * windowHeightRatio,
      fontSize:h2,
      fontWeight:'900',
      color: '#4A4A4A',
      borderBottomWidth:1,
      borderColor:'#fff',
      paddingVertical:0,
      textAlign:'left',
      marginLeft: 0,
      paddingBottom: 12 * windowHeightRatio,
    },


    genderSelectViewNew:{
        flex:1,
        flexDirection:'row',
        height:60 * windowHeightRatio,
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
        paddingBottom: 5 * windowHeightRatio,
        marginLeft: 20 * windowWidthRatio,
        marginRight: 20 * windowWidthRatio,
    },

    updateButtonText:{
      color:'#fff',
      fontSize:h2,
      fontWeight:'bold',
      alignSelf:'center',
    },

    headerViewNew: {
      flexDirection:'row',
    },

    uploadPhotoIconNew:{
        width:14* windowWidthRatio,
        height:14* windowHeightRatio,
        top: 8* windowHeightRatio,
        left:8* windowWidthRatio,
    },


    titleView50New:{
      width:windowWidth - 90 * windowWidthRatio,
      height: 58 * windowHeightRatio,
      marginTop: 0,
      marginLeft: 20 * windowWidthRatio,
    },

    profileBtnListNew: {
      height: 64 * windowHeightRatio,
      borderColor: "#EAEAEA",
      borderBottomWidth: 1,

    },

    profileBtnListLastNew: {
      height: 64 * windowHeightRatio,
      borderColor: "#EAEAEA",
      borderBottomWidth: 0,
    },

    profileBtnListTextNew: {
      height: 64 * windowHeightRatio,
      fontWeight: "bold",
      fontSize: h2,
      paddingTop : 17 * windowHeightRatio,
      color: "#4A4A4A",
    },

    scrollView:{
      marginTop: 0,
      paddingTop: 0,
      marginLeft: 20 * windowWidthRatio,
      width: windowWidth - 40 * windowWidthRatio,
      flexDirection:'column',
    },

    pageSubTitle: {
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        color:'#4A4A4A',
    },

});

module.exports = OnBoardPage;
