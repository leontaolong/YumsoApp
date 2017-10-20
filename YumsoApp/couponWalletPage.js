'use strict';
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var BTClient = require('react-native-braintree');
var paypalIcon = require('./icons/icon-paypal.png');
var visaIcon = require('./icons/icon-visa.png');
var amexIcon = require('./icons/icon-amex.png');
var masterIcon = require('./icons/icon-mastercard.png');
var discoveryIcon = require('./icons/icon-discover.png');
var plusIcon = require('./icons/icon-add.png');
var backIcon = require('./icons/icon-back.png');
var checkedIcon = require('./icons/icon-checkBox-checked.jpeg');
var uncheckedIcon = require('./icons/icon-checkBox-unchecked.jpeg');
var deleteCardIcon = require('./icons/icon-delete-grey.png');
var Swipeout = require('react-native-swipeout');
var commonAlert = require('./commonModules/commonAlert');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var couponBackgroundImage = require('./icons/coupon-background.png');
var dateRender = require('./commonModules/dateRender');

import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;

var h1 = 28*windowHeight/677;
var h2 = windowHeight/35.5;
var h3 = windowHeight/33.41;
var h4 = windowHeight/47.33;
var h5 = 12;
var b1 = 15*windowHeight/677;
var b2 = 15*windowHeight/677;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  Picker,
  TextInput
} from 'react-native';

class CouponWalletPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        console.log("CouponWalletPage RouteStack" + routeStack);
        let eater = routeStack[routeStack.length-1].passProps.eater;
        
        var isFromShoppingCartPage = routeStack[routeStack.length-1].passProps.isFromShoppingCartPage;
        this.onCouponSelected = routeStack[routeStack.length-1].passProps.onCouponSelected;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:false,
            showNetworkUnavailableScreen:false,
            isFromShoppingCartPage:isFromShoppingCartPage,
            eaterId:eater.eaterId,
            chosenCoupon:'',
            eater:eater
        };
        this.responseHandler = function(response){
            if(response.statusCode==400){
                 Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);              
            }else if (response.statusCode === 401) {
                return AuthService.logOut()
                    .then(() => {
                        delete this.state.eater;
                        this.props.navigator.push({
                            name: 'WelcomePage',
                        });
                    });
            }else{
                 Alert.alert( 'Network or server error', 'Please try again later',[ { text: 'OK' }]);   
            }
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchCouponWallet(); 
    }
    
    fetchCouponWallet() {
        if (!this.state.eaterId) {
            this.props.navigator.push({
                name: 'WelcomePage',
            });
        }
        this.setState({showProgress:true});
        return this.client.getWithAuth(config.getCouponWallet+this.state.eaterId)
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode != 202) {
                    this.setState({showProgress:false});
                    return this.responseHandler(res);
                }
                let couponList = res.data.couponWallet;
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(couponList),couponList:couponList, showProgress: false, showNetworkUnavailableScreen:false});
            }).catch((err)=>{
                this.setState({showProgress: false,showNetworkUnavailableScreen:true});
                commonAlert.networkError(err);
            });
    }

    renderRow(coupon){         
        var swipeoutBtns = [
            {
                text: 'Remove',
                backgroundColor:'#FF0000',
                onPress:()=>this.onPressRemoveCoupon(coupon),
            }
        ];       

        var isCouponExpired = (coupon.expireAt < new Date().getTime())
        return (
                <Swipeout backgroundColor={'#FFFFFF'} close={true} right={swipeoutBtns}>
                    <TouchableOpacity activeOpacity={0.7} onPress={()=>this.onPressCoupon(coupon.code)} style={[styleCouponWalletPage.oneCouponView,{opacity:isCouponExpired ? 0.5 :1}]}>     
                        <Image  style={styleCouponWalletPage.couponBackgroundImage} source={couponBackgroundImage}>    
                        <View  style={styleCouponWalletPage.oneCouponInfoView}>
                            <View style={styleCouponWalletPage.oneCouponInfoViewLine1}>
                               <Text style={styleCouponWalletPage.oneCouponValueText}>${coupon.value} off</Text>
                               <Text style={styleCouponWalletPage.expiredText}>{ isCouponExpired ? 'Expired' : ''}</Text>
                            </View>
                            <Text style={styleCouponWalletPage.couponCodeDescriptionText}>{coupon.description}</Text>
                        </View>
                        <View style={styleCouponWalletPage.couponCodeExpireDateView}>
                            <Text style={styleCouponWalletPage.couponCodeExpireDateText}>{coupon.code}</Text>
                            <Text style={styleCouponWalletPage.couponCodeExpireDateText}>valid until {dateRender.renderDate1(coupon.expireAt)}</Text>
                        </View>
                        </Image>
                    </TouchableOpacity>
                </Swipeout>
                );
    }
    
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;  
        }
    
        var couponListView = <ListView style={styles.dishListView}
                                dataSource = {this.state.dataSource}
                                renderRow={this.renderRow.bind(this)}
                              />
        var networkUnavailableView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchCouponWallet.bind(this)} />
           couponListView = null;
        }
        
        return (
            <View style={styles.container}>
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
                    <View style={styles.titleViewNew}>
                        <Text style={styles.titleTextNew}>Coupons</Text>
                    </View>
                    <View style={styles.pageSubTitleView}>
                        <Text style={styles.pageSubTitleText}>Add Coupon Code</Text>
                        <View style={styleCouponWalletPage.addCouponCodeButtonView}>
                            <TouchableOpacity  activeOpacity={0.7} onPress={() => this.onPressAddCoupon()}>
                                <Text style={styleCouponWalletPage.addCouponCodeButtonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styleCouponWalletPage.promoCodeInputView}> 
                        <TextInput style={styleCouponWalletPage.promoCodeInput} clearButtonMode={'while-editing'} returnKeyType = {'done'} onChangeText = {(text) => this.setState({ newPromotionCode: text.trim()})} 
                       maxLength={20} autoCorrect={false} autoCapitalize={'characters'} onSubmitEditing={()=>this.onPressAddCoupon()}/>
                    </View>
                    <View style={{height:40*windowHeightRatio}}>
                    </View>
                    <View style={styles.pageSubTitleView}>
                        <Text style={styles.pageSubTitleText}>Existing Coupons</Text>
                    </View>
                    {networkUnavailableView}
                    {couponListView}
                    {loadingSpinnerView}
               </Image>                   
            </View>
        );
    }

    navigateBack() {
        this.props.navigator.pop();
    }
    
    onCardClick(card){
        this.setState({chosenCard:card});
        var _paymentList = JSON.parse(JSON.stringify(this.state.paymentList));
        this.setState({dataSource:this.state.dataSource.cloneWithRows(_paymentList)});
    }

    onPressCoupon(couponCode){
        if(this.onCouponSelected){
           this.onCouponSelected(couponCode);
           this.props.navigator.pop();
        }
    }

    onPressAddCoupon(){
        if(!this.state.newPromotionCode || !this.state.newPromotionCode.trim()){
            Alert.alert( 'Warning', 'Please enter coupon code',[ { text: 'OK' }]);
            return;
        }

        if(this.state.isFromShoppingCartPage){

        }else{
            this.setState({showProgress:true});
            return this.client.postWithAuth(config.registerCoupon, {eaterId: this.state.eaterId, couponCode:this.state.newPromotionCode})
                    .then((res)=>{
                        if (res.statusCode != 200 && res.statusCode != 202) {
                            this.setState({ showProgress: false });
                            return this.responseHandler(res);
                        }
                        this.fetchCouponWallet();                                 
                    }).catch((err)=>{
                        this.setState({showProgress: false});
                        commonAlert.networkError(err);
                    });
        }
    }
    
    onPressRemoveCoupon(coupon){
        this.setState({showProgress:true});
        return this.client.postWithAuth(config.unregisterCoupon, {eaterId: this.state.eaterId, couponCode:coupon.code})
                .then((res)=>{
                    if (res.statusCode != 200 && res.statusCode != 202) {
                        this.setState({ showProgress: false });
                        return this.responseHandler(res);
                    }
                    this.fetchCouponWallet();                                 
                }).catch((err)=>{
                    this.setState({showProgress: false});
                    commonAlert.networkError(err);
                });
    }
}
                        
var styleCouponWalletPage = StyleSheet.create({
    oneCouponView:{
        flex:1,
        flexDirection:'row',
        marginBottom:10*windowHeightRatio,
    },
    checkBoxIconView:{
        flex:0.1,
        flexDirection:'row',
        justifyContent:'flex-start'  
    },
    checkBoxIcon:{
        width:25*windowHeight/667.0,
        height:25*windowHeight/667.0,
        alignSelf:'center',
    },
    paymentMethodInfoView:{
        flex:0.75,
        flexDirection:'row',
        justifyContent:'flex-start',
    },
    removeCouponButton:{
        flex:0.15,
        flexDirection:'row',
        justifyContent:'center',
    },
    paymentMethodInfoText:{
        alignSelf:'center',
        fontSize:windowHeight/47.33,
        color:'#4A4A4A',
    },
    paymentMethodIconView:{
        flex:0.15,
        flexDirection:'row',
        justifyContent:'flex-start'
    },
    deleteCardIconView:{
        flex:0.1,
        justifyContent:'center',
        alignItems:'center',
    },
    deleteCardIcon:{
        width:30*windowHeight/667.0,
        height:30*windowHeight/667.0,
    },
    paymentMethodIcon:{
        width:32*windowHeight/667.0,
        height:20*windowHeight/667.0,
        alignSelf:'center',
    },
    addCardView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        paddingLeft:15*windowHeight/667.0,
        backgroundColor:'#fff',
    },
    addCardTitleView:{
        flex:0.75,
        flexDirection:'row',
        justifyContent:'flex-start',
        backgroundColor:'#FFF'
    },
    addCardTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/51.636,
        color:'#4A4A4A',
    },
    addCardIconView:{
        flex:0.1,
        flexDirection:'row',
        justifyContent:'flex-start',
        backgroundColor:'#fff',
    },
    addCardIcon:{
        width:30*windowHeight/667.0,
        height:30*windowHeight/667.0,
        alignSelf:'center',
    },
    bottomButton:{
      flexDirection:'row',        
      justifyContent: 'center',
      height:windowHeight*0.075,
      width:windowWidth,
    },
    bottomButtonText:{
      color:'#fff',
      fontSize:windowHeight/37.056,
      fontWeight:'bold',
      alignSelf: 'center',
    },
    promoCodeInput:{
        paddingLeft:8*windowWidthRatio,
        fontSize:16,
        color:'#4A4A4A', 
        width:windowWidth - 2 * 20 * windowWidthRatio,   
    },
    promoCodeInputView:{
        height:32,
        flexDirection:'row',
        borderColor:'#F2F2F2',
        backgroundColor:'#F5F5F5',
        borderWidth:0,
        borderRadius:3,
        width:windowWidth - 2 * 20 * windowWidthRatio,
        alignSelf:'center',
        justifyContent:'flex-start',
        marginHorizontal:20 * windowWidthRatio,
    },
    addCouponCodeButtonText:{
        color:'#7BCBBE',
        fontSize: h2,
    },
    addCouponCodeButtonView:{
        justifyContent:'flex-end',
        flexDirection:'row',  
        flex:1,      
    },
    couponBackgroundImage:{
        height:(windowWidth-2*20*windowWidthRatio)*330.0/1005.0,
        width:windowWidth-2*20*windowWidthRatio,
    },
    oneCouponInfoView:{
        paddingHorizontal:25*windowHeightRatio,
        paddingTop:12*windowHeightRatio,
        flexDirection:'column',
        height:70*windowHeightRatio,
    },
    oneCouponValueText:{
        fontSize:h1,
        fontWeight:'bold',
        color:'#FFFFFF',
        backgroundColor:'transparent',
    },
    couponCodeExpireDateView:{
        flex:1,
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:25*windowHeightRatio,
        paddingBottom:12*windowHeightRatio,
    },
    couponCodeExpireDateText:{
        fontSize:h4,
        color:'#FFFFFF',
        backgroundColor:'transparent',
        marginTop:15*windowHeightRatio
    },
    couponCodeDescriptionText:{
        fontSize:h4,
        color:'#FFFFFF',
        backgroundColor:'transparent',
    },
    oneCouponInfoViewLine1:{
        flexDirection:'row',
        justifyContent:'space-between',
    },
    expiredText:{
        fontSize:h4,
        color:'#FFFFFF',
        backgroundColor:'transparent',
    }
});                
                        
module.exports = CouponWalletPage;