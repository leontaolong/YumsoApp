var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
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
  ListView,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  PushNotificationIOS,
  Alert
} from 'react-native';

class PaymentPage extends Component {
    constructor(props){
        super(props);
        let routeStack = props.navigator.state.routeStack;
        let orderDetail = routeStack[routeStack.length-1].passProps.orderDetail;
        let eater = routeStack[routeStack.length-1].passProps.eater;
        let shoppingCart = routeStack[routeStack.length-1].passProps.shoppingCart;        
        let selectedTime = routeStack[routeStack.length-1].passProps.selectedTime;
        let scheduleMapping = routeStack[routeStack.length-1].passProps.scheduleMapping;
        this.shoppingCartContext = routeStack[routeStack.length-1].passProps.context;
        this.state = {
            showProgress:false,
            orderDetail:orderDetail,
            eater:eater,
            shoppingCart:shoppingCart,
            selectedTime:selectedTime,
            scheduleMapping:scheduleMapping,
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }

    async componentWillMount(){
        this.registerNotification().then(function (token) {
            return AuthService.updateCacheDeviceToken(token);
        });
    }
    
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;  
        }
        
        if(this.state.paymentOption){
          var selectPaymentMethodView=[(<TouchableOpacity activeOpacity={0.7} key={'selectPaymentbuttonView'} style={stylePaymentPage.selectPaymentbuttonContainer} onPress={()=>this.selectPayment()}>
                                            <View style={stylePaymentPage.selectPaymentbutton}>
                                                <Text style={stylePaymentPage.selectPaymentbuttonText}>Change Payment Method</Text>
                                            </View>
                                        </TouchableOpacity>),
                                       (<View key={'selectedPaymentTextView'} style={stylePaymentPage.selectedPaymentTextView}>
                                            <Text style={stylePaymentPage.selectedPaymentText}>
                                              {this.state.paymentOption.cardType} **** {this.state.paymentOption.last4} has been chosen for this payment
                                            </Text>
                                        </View>)];
        }else{
           var selectPaymentMethodView=[(<TouchableOpacity activeOpacity={0.7} key={'selectPaymentbuttonView'} style={stylePaymentPage.selectPaymentbuttonContainer} onPress={()=>this.selectPayment()}>
                                            <View style={stylePaymentPage.selectPaymentbutton}>
                                                <Text style={stylePaymentPage.selectPaymentbuttonText}>other payment methods</Text>
                                            </View>
                                        </TouchableOpacity> 
                                        )];
        }
        
        var turnOnNotificationTextView = null
        // if(this.state.deviceToken=='No_Device_Token'){
        //    turnOnNotificationTextView = <View style={stylePaymentPage.turnOnNotificationTextView}>
        //                                 <Text style={stylePaymentPage.turnOnNotificationText}>We recommend you turn on notification to receive status update for your order.</Text>
        //                               </View> 
        // }
                
        return (<View style={styles.greyContainer}>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        <View style={styles.transparentHeaderBannerView}>
                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={()=>this.navigateBackToShoppingCartPage()}>
                                <View style={styles.backButtonView}>
                                    <Image source={backIcon} style={styles.backButtonIconsNew}/>
                                </View> 
                            </TouchableHighlight>
                            <View style={styles.titleView}></View>
                            <View style={styles.headerRightView}>
                            </View>
                        </View>
                        <View style={stylePaymentPage.contentTextView}>
                            <Text style={stylePaymentPage.contentTitle}>Payment</Text>
                            <Text style={stylePaymentPage.totalAmountText}>${this.state.orderDetail.price.grandTotal}</Text>
                            <Text style={stylePaymentPage.contentText}>Select a payment method</Text>
                            {turnOnNotificationTextView}
                            <TouchableOpacity activeOpacity={0.7} style={stylePaymentPage.secondaryButtonView} onPress={()=>this.onPressDefaultCreditCard()}>
                                <Text style={styles.secondaryButtonText}>Default Credit Card</Text>
                            </TouchableOpacity>
                            {selectPaymentMethodView}
                            <View style={{flex:1}}>
                            </View>
                        </View>
                    </Image>
                 <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={()=>this.confirm()}>
                    <View style={stylePaymentPage.placeOrderButton}>
                        <Text style={stylePaymentPage.placeOrderButtonText}>Confirm</Text>
                    </View>
                 </TouchableOpacity>
                 {loadingSpinnerView}                 
              </View>);
    }
      
    async confirm(){
        let deviceToken = await AuthService.getDeviceTokenFromCache();
        if(deviceToken){
           this.setState({deviceToken:deviceToken})
        }
        Alert.alert(
            'Place Order',
            'Ready to place the order? Your total is $'+this.state.orderDetail.price.grandTotal,
            [
                { text: 'Pay', onPress: () => this.createAnOrder() },              
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }             
            ]
        );    
    }  
    
    registerNotification() {
        return new Promise((resolve,reject) => {
            PushNotificationIOS.addEventListener('register', function(token){
               if(token){
                  console.log('You are registered and the device token is: ',token);
                  resolve(token);
               }else{
                  console.log('Failed registering, no token');
                  reject(new Error('Failed registering notification service'))
               }  
            });
            PushNotificationIOS.requestPermissions();
        });
    }

    createAnOrder(){
        if(!this.state.paymentOption){
            Alert.alert('Warning','Please select a payment option.',[{ text: 'OK' }]);      
            return; 
        }
        if(commonWidget.alertWhenGracePeriodTimeOut(this.state.shoppingCart,this.state.scheduleMapping,this.state.selectedTime)){
           return;
        }
        console.log('deviceToken will be sent: '+ this.state.deviceToken);
        this.setState({showProgress:true});
        return this.client.postWithAuth(config.createOrderEndpoint, {orderDetail:this.state.orderDetail, paymentOption: this.state.paymentOption, deviceToken:this.state.deviceToken})
         .then((response)=>{
            if(response.statusCode==400){
                 Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);              
            }else if(response.statusCode==401){
               this.setState({showProgress:false});
                return AuthService.logOut()
                    .then(() => {
                        delete this.state.eater;
                        this.props.navigator.push({
                            name: 'LoginPage',//todo: fb cached will signin and redirect back right away.
                            passProps: {
                                callback: function (eater) {
                                    this.setState({ eater: eater });
                                }.bind(this)
                            }
                        });
                    });
            }else if(response.statusCode==200 || response.statusCode==202){
                this.setState({showProgress:false});
                if(response.data.result===true){
                   //Alert.alert('Success','Your Order is placed.',[{ text: 'OK' }]); 
                   this.props.navigator.state.routeStack = [];                  
                   this.props.navigator.push({
                        name: 'OrderConfirmation',
                        passProps:{
                            eater: this.state.eater
                        }
                    }); 
                }else{
                    this.setState({ showProgress: false });
                    console.log(response.data.detail);
                    let detailError = response.data.detail;
                    this.props.navigator.pop();
                    if (detailError.type === 'NoAvailableDishQuantityException') {
                        Alert.alert('Warning', 'Oops, you have one or more dishes that are not available anymore. Please update your shopping cart', [{ text: 'OK' }]);
                        this.shoppingCartContext.handleDishNotAvailable(detailError.deliverTimestamp,  detailError.quantityFact);
                    } else if (detailError.type === 'PaymentException') {
                        Alert.alert('Payment failed', detailError.message, [{ text: 'OK' }]);
                    } else if (detailError.type === 'NoDeliveryRouteFoundException') {
                        Alert.alert('Failed creating order', 'Delivery address is not reachable. ' + detailError.message, [{ text: 'OK' }]);
                    } else {
                        Alert.alert('Failed creating order', 'Please try again later.'[{ text: 'OK' }]);
                    }
                    this.shoppingCartContext.setState({priceIsConfirmed:false});
                }                    
            }else{
                this.setState({showProgress:false});
                commonAlert.networkError(response);          
            }
         }).catch((err)=>{
               this.setState({showProgress: false});
               commonAlert.networkError(err);
         });    
    }
    
    navigateBackToShoppingCartPage(){
        this.props.navigator.pop();
    }

    onPressDefaultCreditCard(){
        Alert.alert('Feature Coming Soon..')
    }

    async selectPayment() {
        let deviceToken = await AuthService.getDeviceTokenFromCache();
        if(deviceToken){
           this.setState({deviceToken:deviceToken})
        }
        this.props.navigator.push({
            name: 'PaymentOptionPage',//todo: fb cached will signin and redirect back right away.
            passProps:{
                eater: this.state.eater,
                isFromCheckOutPage:true,
                onPaymentSelected: function(payment){
                    this.setState({paymentOption:payment});
                }.bind(this)
            }
        });
    }
}

var stylePaymentPage = StyleSheet.create({
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
        marginBottom: windowHeight*0.02,
    },
    totalAmountText:{
      fontSize:52*windowHeight/667.0,
      fontFamily: 'Helvetica-Bold',
      backgroundColor: 'rgba(0,0,0,0)',
      marginVertical:windowHeight*0.0660,      
    },
    turnOnNotificationText:{
      fontSize:16*windowHeight/667.0,
      color:'#4A4A4A',
      fontWeight:'300',
      alignSelf:'center',
      textAlign:'center',
      flex: 1, 
      flexWrap: 'wrap',
      marginTop:5*windowHeight/667,
    },
    turnOnNotificationTextView:{
        width:0.9*windowWidth,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
    },
    selectPaymentbuttonContainer:{
        marginVertical:windowHeight*0.02, 
        borderWidth: 2,        
        borderColor:'#7BCBBE',
    },
    selectPaymentbutton:{
        height:windowHeight*0.075,
        flexDirection:'row',
        justifyContent:'center',
        alignSelf:'center',
        backgroundColor: 'rgba(0,0,0,0)', 
    },
    selectPaymentbuttonText:{
        fontSize:windowHeight/40,
        fontWeight:'bold',
        color:'#7BCBBE',
        alignSelf:'center',
    },
    selectedPaymentTextView:{
      flexDirection:'column',
      width:windowWidth*0.95,
      justifyContent:'flex-start',
      alignItems:'center',
      alignSelf:'center',
      backgroundColor: 'rgba(0,0,0,0)',
    },
    selectedPaymentText:{
      color:'#A0A0A0',
      fontSize:windowHeight/51.636,
      marginTop:windowHeight*0.02,
      textAlign:'center',
    },
    placeOrderButton:{
      flexDirection:'row',        
      justifyContent: 'center',
      height:windowHeight*0.075,
      width:windowWidth,
    },
    placeOrderButtonText:{
      color:'#fff',
      fontSize:windowHeight/37.056,
      fontWeight:'bold',
      alignSelf: 'center',
    },
    secondaryButtonView:{
        flexDirection:'column',
        marginVertical:windowHeight*0.005,
        backgroundColor:'#7BCBBE',
        height:windowHeight*0.075,
        justifyContent:'center',
    },
});

module.exports = PaymentPage;

