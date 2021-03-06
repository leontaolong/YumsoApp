'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var commonAlert = require('./commonModules/commonAlert');
var AuthService = require('./authService');
var ImageCamera = require('./imageCamera');
var MapPage = require('./mapPage');
var backIcon = require('./icons/icon-back.png');
var defaultAvatar = require('./icons/defaultAvatar.jpg');
var uploadPhotoIcon = require('./icons/icon-camera.png');
var uploadPhotoIconPen = require('./icons/pen.png');
var houseIcon = require('./icons/icon-grey-house.png');
var paypalIcon = require('./icons/icon-paypal.png');
var ResetPasswordPage = require('./resetPasswordPage');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var validator = require('validator');
var meOff = require('./icons/me_off.png');
var meOn = require('./icons/me_on.png');

var ordersOff = require('./icons/orders_off.png');
var ordersOn = require('./icons/orders_on.png');

var shopsOff = require('./icons/shops_off.png');
var shopsOn = require('./icons/shops_on.png');

import Dimensions from 'Dimensions';
var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;


var picHeight = 76  * windowHeightRatio;
var editBtnDin = 30 * windowHeightRatio;
var pic50Height = 50* windowHeightRatio;


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

class EaterPage extends Component {
     constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[0].passProps.eater;
        let currentLocation = routeStack[0].passProps.currentLocation;
        let principal = routeStack[0].passProps.principal;
        this.state = {
            eater:eater,
            currentLocation:currentLocation,
            principal:principal,
            showProgress:false,
            edit:false,
            addMoreAddress:false,
            editHomeAddress:false,
            editWorkAddress:false,
            showResetPassword:false,
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

    async componentWillMount() {
        if (!this.state.principal) {
            let principal = await AuthService.getPrincipalInfo();
            this.setState({ principal: principal});
        }
    }

     render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;
        }

        if (this.state.showResetPassword){
             return (<ResetPasswordPage userEmail={this.state.eater.email} navigator = {this.props.navigator} onCancel={this.onCancelPasswordReset.bind(this)}/>)
        }

        if (this.state.edit) {
            var eaterProfile = this.state.eater.eaterProfilePic == null ? defaultAvatar : { uri: this.state.eater.eaterProfilePic };
            var backButtonView = <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'}  onPress = {() => { this.setState({ edit: false })}}>
                                         <View style={styles.backButtonViewsNew}>
                                            <Image source={backIcon} style={styles.backButtonIconsNew}/>
                                         </View>
                                 </TouchableHighlight>
            return (
                <View style={styles.containerNew}>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        <View style={styles.headerBannerViewNew}>
                            {backButtonView}
                            <View style={styles.headerRightView}>
                            </View>
                        </View>

                        <ScrollView ref={'scrollView'}style={{backgroundColor:'transparent'}}>
                            <View style={styleEaterPage.headerViewNew}>
                                <View style={styleEaterPage.titleViewNew2}>
                                    <Text style={styles.titleTextNew}>Profile</Text>
                                </View>
                                <View>
                                    <Image source={eaterProfile} style={styleEaterPage.eaterProfilePicNew}></Image>
                                    <TouchableHighlight style={styleEaterPage.uploadPhotoButtonViewNew} underlayColor={'transparent'} onPress={() => this.uploadPic() }>
                                        <Image source={uploadPhotoIconPen} style={styleEaterPage.uploadPhotoIconNew}/>
                                    </TouchableHighlight>
                                </View>
                            </View>

                            <Text style={styleEaterPage.textFieldTitle}>First Name</Text>
                            <View style={styles.loginInputViewNew}>
                                <TextInput style={styleEaterPage.loginInputNew}  defaultValue={this.state.eater.firstname} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                    maxLength={30} autoCorrect={false} onChangeText = {(text) => this.setState({ firstname: text })}/>
                            </View>

                            <Text style={styleEaterPage.textFieldTitle}>Last Name</Text>
                            <View style={styles.loginInputViewNew}>
                                <TextInput style={styleEaterPage.loginInputNew} defaultValue={this.state.eater.lastname} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                    maxLength={30} autoCorrect={false} onChangeText = {(text) => this.setState({ lastname: text })}/>
                            </View>

                            <Text style={styleEaterPage.textFieldTitle}>Username</Text>
                            <View style={styles.loginInputViewNew}>
                                <TextInput style={styleEaterPage.loginInputNew} defaultValue={this.state.eater.eaterAlias} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                    maxLength={30} autoCorrect={false} onChangeText = {(text) => this.setState({ eaterAlias: text }) }/>
                            </View>

                            <Text style={styleEaterPage.textFieldTitle}>Gender</Text>
                            <View style={styleEaterPage.genderSelectViewNew}>
                                <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleGender('Male') } style={styleEaterPage.oneGenderSelectView}>
                                    <Text style={{ fontSize: h2,fontWeight: "bold" , color: this.renderGenderTextColor('Male'), alignSelf: 'center' }}>Male</Text>
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleGender('Female') } style={styleEaterPage.oneGenderSelectMiddleView}>
                                    <Text style={{ fontSize: h2,fontWeight: "bold" , color: this.renderGenderTextColor('Female'), alignSelf: 'center' }}>Female</Text>
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleGender('Not to tell') } style={styleEaterPage.oneGenderSelectView}>
                                    <Text style={{ fontSize: h2,fontWeight: "bold" , color: this.renderGenderTextColor('Not to tell'), alignSelf: 'center' }}>Not to tell</Text>
                                </TouchableHighlight>
                            </View>

                            <Text style={styleEaterPage.textFieldTitle}>Phone</Text>
                            <View style={styles.loginInputViewNew}>
                                <TextInput style={styleEaterPage.loginInputNew} defaultValue={this.state.eater.phoneNumber} keyboardType = { 'phone-pad'} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                    maxLength={15} onChangeText={(text) => this.setState({ phoneNumber: text })} onFocus={(() => this.onFocusPhoneEmailInput()).bind(this)} onBlur={(() => this.onOffFocusPhoneEmailInput()).bind(this)}/>
                            </View>

                            <Text style={styleEaterPage.textFieldTitle}>Email</Text>
                            <View style={styles.loginInputViewNew}>
                                 <TextInput style={styleEaterPage.loginInputNew} defaultValue={this.state.eater.email} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                    autoCapitalize={'none'} maxLength={40} autoCorrect={false} onChangeText={(text) => this.setState({ email: text })} onFocus={(() => this.onFocusPhoneEmailInput()).bind(this)} onBlur={(() => this.onOffFocusPhoneEmailInput()).bind(this)}/>
                            </View>

                            <TouchableOpacity activeOpacity={0.7} >
                                <Text style={styleEaterPage.textFieldTitle}>{this.state.principal && this.state.principal.identityProvider === 'Yumso' ? `Logged in with Email: ${this.state.eater.email}` : 'Logged in using Facebook'}</Text>
                            </TouchableOpacity>
                            {loadingSpinnerView}
                        </ScrollView>

                        <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress = {this.submit.bind(this)}>
                             <Text style={styleEaterPage.updateButtonText}>Update</Text>
                        </TouchableOpacity>
                    </Image>
                </View>);
         }else{
            var eaterProfile = this.state.eater.eaterProfilePic == null ? defaultAvatar : { uri: this.state.eater.eaterProfilePic };
            var emailView = null;
            if (this.state.eater.email && this.state.principal && this.state.principal.identityProvider !== 'Yumso') {
                emailView = <Text style={styleEaterPage.eaterPageGreyText}>{'Email: ' + this.state.eater.email}</Text>;
            }

            var resetPasswordButton = null;
            if (this.state.eater.email && this.state.principal && this.state.principal.identityProvider === 'Yumso') {
                resetPasswordButton = <Text style={styleEaterPage.eaterPageClickableText} onPress={()=> this.setState({showResetPassword:true})}>Reset Password</Text>
            }

            var photoNumberView = null;
            if (this.state.eater.phoneNumber) {
                photoNumberView = <Text style={styleEaterPage.eaterPageGreyText}>{'Phone: ' + this.state.eater.phoneNumber}</Text>;
            }

            return (<View style={styles.containerNew}>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        <View style={styles.headerBannerViewNew}>
                        </View>
                        <View style={styleEaterPage.menuView}>
                        <View style={styleEaterPage.headerViewNew}>
                            <View style={styleEaterPage.titleViewNew}>
                                <Text style={styles.titleTextNew}>{this.state.eater.firstname} {this.state.eater.lastname}</Text>
                            </View>
                            <View>
                                <Image source={eaterProfile} style={styleEaterPage.eaterProfilePic50New}>
                                </Image>
                            </View>
                        </View>
                        <View style={styleEaterPage.profileBtnListNew}>
                            <TouchableHighlight style={styleEaterPage.profileBtnListNew} underlayColor={'#F5F5F5'} onPress={() => this.onPressEdit()}>
                                <View style={styleEaterPage.headerRightTextButtonView}>
                                    <Text style={styleEaterPage.profileBtnListTextNew}>Profile</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={styleEaterPage.profileBtnListNew}>
                            <TouchableHighlight style={styleEaterPage.profileBtnListNew} underlayColor={'#F5F5F5'} onPress={() => this.goToPaymentOptionPage()}>
                                <View style={styleEaterPage.headerRightTextButtonView}>
                                    <Text style={styleEaterPage.profileBtnListTextNew}>Payment Options</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={styleEaterPage.profileBtnListNew}>
                            <TouchableHighlight style={styleEaterPage.profileBtnListNew} underlayColor={'#F5F5F5'} onPress={() => this.goToAddressBookPage()}>
                                <View style={styleEaterPage.headerRightTextButtonView}>
                                    <Text style={styleEaterPage.profileBtnListTextNew}>Address Book</Text>
                                </View>
                            </TouchableHighlight>
                        </View>

                        <View style={styleEaterPage.profileBtnListNew}>
                            <TouchableHighlight style={styleEaterPage.profileBtnListNew} underlayColor={'#F5F5F5'} onPress={() => this.goToCouponPage()}>
                                <View style={styleEaterPage.headerRightTextButtonView}>
                                    <Text style={styleEaterPage.profileBtnListTextNew}>Coupon</Text>
                                </View>
                            </TouchableHighlight>
                        </View>

                        <View style={styleEaterPage.profileBtnListNew}>
                            <TouchableHighlight style={styleEaterPage.profileBtnListNew} underlayColor={'#F5F5F5'} onPress={() => this.goToInvitePage()}>
                                <View style={styleEaterPage.headerRightTextButtonView}>
                                    <Text style={styleEaterPage.profileBtnListTextNew}>Invite Friends</Text>
                                </View>
                            </TouchableHighlight>
                        </View>

                        <View style={styleEaterPage.profileBtnListNew}>
                            <TouchableHighlight style={styleEaterPage.profileBtnListNew} underlayColor={'#F5F5F5'} onPress={() => this.goToContactUsPage()}>
                                <View style={styleEaterPage.headerRightTextButtonView}>
                                    <Text style={styleEaterPage.profileBtnListTextNew}>Contact Us</Text>
                                </View>
                            </TouchableHighlight>
                        </View>

                        <View style={styleEaterPage.profileBtnListLastNew}>
                            <TouchableHighlight style={styleEaterPage.profileBtnListLastNew} underlayColor={'#F5F5F5'} onPress={() => this.logOut()}>
                                <View style={styleEaterPage.headerRightTextButtonView}>
                                    <Text style={styleEaterPage.profileBtnListTextNew}>Log Out</Text>
                                </View>
                            </TouchableHighlight>
                        </View>

                        </View>
                        <View style = {styles.tabBarNew}>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <TouchableHighlight underlayColor={'#F5F5F5'} onPress={() => this.onPressShopsTabBtn()}>
                                    <View style={styles.tabBarButtonNew}>
                                        <Image source={shopsOff}  style={styles.tabBarButtonImageShop}/>
                                        <View>
                                            <Text style={styles.tabBarButtonTextOffNew}>Shops</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor={'#F5F5F5'} onPress={() => this.onPressOrdersTabBtn()}>
                                    <View style={styles.tabBarButtonNew} >
                                        <Image source={ordersOff}  style={styles.tabBarButtonImageOrder}/>
                                        <View>
                                            <Text style={styles.tabBarButtonTextOffNew}>Orders</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor={'#F5F5F5'}>
                                    <View style={styles.tabBarButtonNew}>
                                        <Image source={meOn}  style={styles.tabBarButtonImageMe}/>
                                        <View>
                                            <Text style={styles.tabBarButtonTextOnNew}>Me</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>
                </Image>
                </View>);
           }
     }

    uploadPic(){
           ImageCamera.PickImage((source)=>{
                this.setState({showProgress:true});
                var photo = {
                    uri: source.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                };
                var request = new XMLHttpRequest();

                var body = new FormData();
                body.append('photo', photo);
                body.append('title', 'A beautiful photo!');

                request.onreadystatechange = (e) => {
                    if (request.readyState !== 4) {
                        return;
                    }

                    if (request.status === 200 || request.status === 202) {
                        this.state.eater.eaterProfilePic = source.uri;
                        this.setState({eater:this.state.eater});
                        console.log('success', request.responseText);
                        //Alert.alert( 'Success', 'Successfully upload your profile picture',[ { text: 'OK' }]);
                    } else {
                        Alert.alert( 'Upload failed', 'Please try again later',[ { text: 'OK' }]);
                    }
                    this.setState({showProgress:false});
                };

                request.open('POST', config.baseUrl+config.eaterPicUploadEndpoint);
                return AsyncStorage.getItem('token').then((token)=>{
                    console.log(token);
                    request.setRequestHeader("Authorization", 'bearer '+token);
                    request.send(body);
                });
           });
    }

    submit(){
        if (!this.state.firstname || !this.state.firstname.trim()) {
            Alert.alert('Error', 'Missing first name or first name is invalid', [{ text: 'OK' }]);
            return;
        }
        if (!this.state.lastname || !this.state.lastname.trim()) {
            Alert.alert('Error', 'Missing last name or last name is invalid', [{ text: 'OK' }]);
            return;
        }
        if (!this.state.eaterAlias) {
            Alert.alert('Error', 'Missing username name. This will be displayed publicly to chef and other users', [{ text: 'OK' }]);
            return;
        }

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
        eater.firstname = this.state.firstname.trim();
        eater.lastname = this.state.lastname.trim();
        eater.eaterAlias = this.state.eaterAlias.trim();
        eater.gender = this.state.gender;
        eater.phoneNumber = this.state.phoneNumber ? this.state.phoneNumber : null;
        eater.email = this.state.email ? this.state.email : null;
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
                    //Alert.alert('Success', 'Successfully updated your profile', [{ text: 'OK' }]);
                    var routeStack = this.props.navigator.state.routeStack;
                    if(routeStack.length >2 && routeStack[routeStack.length-2].name == "LoginPage" && routeStack[routeStack.length-3].name == "ShoppingCartPage"){
                       this.props.navigator.popToRoute(routeStack[routeStack.length-3]);
                       if(this.state.backcallback){
                          this.state.backcallback(eater);
                       }
                       return;
                    }else if(routeStack.length >1 && routeStack[routeStack.length-2].name == "LoginPage"){
                       this.jumpToChefList();
                       return;
                    }
                    this.setState({ eater: this.state.eater, edit: false, showProgress: false });
                    //this.state.callback(this.state.eater);
                }).catch((err)=>{
                    this.setState({showProgress: false});
                    alert(err.message);
                });
        }).catch((err)=>{
            this.setState({showProgress: false});
            commonAlert.networkError(err);
        });
    }

    onFocusPhoneEmailInput(){
        this.refs.scrollView.scrollTo({ x: 0, y: 130*windowHeightRatio, animated: true })
    }

    onOffFocusPhoneEmailInput() {
        this.refs.scrollView.scrollTo({ x: 0, y: 0, animated: true })
    }

    onPressEdit(){
         this.setState({
                                 edit: true,
                                 firstname: this.state.eater.firstname,
                                 lastname: this.state.eater.lastname,
                                 eaterAlias: this.state.eater.eaterAlias,
                                 gender: this.state.eater.gender,
                                 phoneNumber: this.state.eater.phoneNumber,
                                 email:this.state.eater.email,
                                 homeAddress: this.state.eater.homeAddress,
                                 workAddress: this.state.eater.workAddress,
                                 addressList: this.state.eater.addressList
                      })
    }

    onCancelPasswordReset(){
         this.setState({showResetPassword:false});
    }

    renderGenderTextColor(gender){
         if(this.state.gender == gender){
             return '#7bcbbe';
         }else{
             return '#EAEAEA';
         }
    }

    toggleGender(gender){
        if(gender!=this.state.gender){
           this.setState({gender:gender});
        }
    }

    jumpToChefList(){
       this.props.navigator.resetTo({name:'ChefListPage'});
    }

    navigateBack(){
        this.props.navigator.pop();
    }

    onPressShopsTabBtn(){
        this.props.navigator.resetTo({
            name: 'ChefListPage',
        });
    }

    onPressOrdersTabBtn(){
        this.props.navigator.resetTo({
            name: 'OrderPage',
            passProps: {
                eater: this.state.eater,
                principal:this.state.principal,
            }
        });
    }

    goToContactUsPage() {
        this.props.navigator.push({
            name: 'ContactUsPage',
        });
    }

    navigateToAboutPage() {
        this.props.navigator.push({
            name: 'AboutPage',
        });
    }

    goToPaymentOptionPage() {
        this.props.navigator.push({
            name: 'PaymentOptionPage',//todo: fb cached will signin and redirect back right away.
            passProps:{
                eater:this.state.eater
            }
        });
    }

    goToAddressBookPage() {
        this.props.navigator.push({
            name: 'AddressBookPage',
            passProps:{
                eater:this.state.eater,
                currentLocation:this.props.currentLocation,
            }
        });
    }

    goToCouponPage(){
        //Alert.alert('Page Coming Soon...');
        this.props.navigator.push({
            name: 'CouponWalletPage',
            passProps:{
                eater:this.state.eater
            }
        });
    }

    goToInvitePage(){
        this.props.navigator.push({
            name: 'InvitePage',
            passProps:{
                eater:this.state.eater,
            }
        });
    }

    logOut(){
        return AuthService.logOut()
        .then(()=>{
            //this.props.caller.setState({eater:undefined});
            this.props.navigator.push({
                name: 'WelcomePage',
                // passProps:{
                //     callback: this.props.caller.componentDidMount.bind(this.props.caller),
                //     backCallback: this.props.caller.componentDidMount.bind(this.props.caller)
                // }
            });
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

    eaterProfilePicNew:{
        width: picHeight,
        height: picHeight,
        backgroundColor: "#00cc00",
        borderRadius: picHeight/2,
    },

    titleViewNew:{
      width:windowWidth - (40 * windowWidthRatio) - pic50Height,
      height: 78 * windowHeightRatio,
      marginTop: 0,
      marginLeft: 0,
    },

    titleViewNew2:{
      width:windowWidth - (40 * windowWidthRatio) - picHeight,
      height: 78 * windowHeightRatio,
      marginTop: 0,
      marginLeft: 20 * windowWidthRatio,
    },

    uploadPhotoButtonViewNew:{
        position:'absolute',
        right:0,
        bottom:3 * windowHeightRatio,
        shadowOffset:{  width: 2* windowWidthRatio,  height: 3* windowWidthRatio,  },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        borderRadius: editBtnDin/2,
        backgroundColor: "#fff",
        width: editBtnDin,
        height:editBtnDin,
    },

    uploadPhotoIconNew:{
        width:14* windowWidthRatio,
        height:14* windowHeightRatio,
        top: 8* windowHeightRatio,
        left:8* windowWidthRatio,
    },

    eaterProfilePic50New:{
        width: pic50Height,
        height: pic50Height,
        backgroundColor: "#F5F5F5",
        borderRadius: pic50Height/2,
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
      backgroundColor:'transparent',
    },

    menuView: {
        marginTop: 0,
        paddingTop: 0,
        marginLeft: 20 * windowWidthRatio,
        width: windowWidth - 40 * windowWidthRatio,
        flex:1,
        flexDirection: 'column',
        backgroundColor: 'transparent',
    },

    pageSubTitle: {
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        color:'#4A4A4A',
    },

});

module.exports = EaterPage;
