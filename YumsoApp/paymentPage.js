var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var commonAlert = require('./commonModules/commonAlert');
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
  Alert
} from 'react-native';

class PaymentPage extends Component {
    constructor(props){
        super(props);
        let routeStack = props.navigator.state.routeStack;
        let orderDetail = routeStack[routeStack.length-1].passProps.orderDetail;
        let eater = routeStack[routeStack.length-1].passProps.eater;
        this.shoppingCartContext = routeStack[routeStack.length-1].passProps.context;
        this.state = {
            showProgress:false,
            orderDetail:orderDetail,
            eater:eater
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }
        
        if(this.state.paymentOption){
          var selectPaymentMethodView=[(<View key={'selectPaymentbuttonView'} style={stylePaymentPage.selectPaymentbuttonView}>
                                            <TouchableHighlight onPress={()=>this.selectPayment()}>
                                            <View style={stylePaymentPage.selectPaymentbutton}>
                                                <Text style={stylePaymentPage.selectPaymentbuttonText}>Change Payment Method</Text>
                                            </View>
                                            </TouchableHighlight> 
                                        </View>),
                                       (<View key={'selectedPaymentTextView'} style={stylePaymentPage.selectedPaymentTextView}>
                                            <Text style={stylePaymentPage.selectedPaymentText}>
                                              {this.state.paymentOption.cardType}*****{this.state.paymentOption.last4} has been chosen for this payment
                                            </Text>
                                        </View>)];
        }else{
           var selectPaymentMethodView=[(<View key={'selectPaymentbuttonView'} style={stylePaymentPage.selectPaymentbuttonView}>
                                            <TouchableHighlight onPress={()=>this.selectPayment()}>
                                            <View style={stylePaymentPage.selectPaymentbutton}>
                                                <Text style={stylePaymentPage.selectPaymentbuttonText}>Select Payment Method</Text>
                                            </View>
                                            </TouchableHighlight> 
                                        </View>)];
        }
                
        return (<View style={styles.greyContainer}>
                  <View style={styles.headerBannerView}>
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={()=>this.navigateBackToShoppingCartPage()}>
                        <View style={styles.backButtonView}>
                           <Image source={backIcon} style={styles.backButtonIcon}/>
                        </View> 
                    </TouchableHighlight>
                    <View style={styles.titleView}>
                        <Text style={styles.titleText}>Check Out</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
                 </View>
                 <View style={stylePaymentPage.totalAmountView}>
                    <Text style={stylePaymentPage.totalAmountTitle}>You total amount is:</Text>
                    <Text style={stylePaymentPage.totalAmountText}>${this.state.orderDetail.price.grandTotal}</Text>   
                 </View>
                 {selectPaymentMethodView}
                 <View style={{flex:1}}>
                 </View>
                 <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={()=>this.confirm()}>
                    <View style={stylePaymentPage.placeOrderButton}>
                        <Text style={stylePaymentPage.placeOrderButtonText}>Place Order</Text>
                    </View>
                 </TouchableOpacity>
                 {loadingSpinnerView}                 
              </View>);
    }
      
    confirm(){
        Alert.alert(
            'Order placement',
            'Ready to place the order? Your total is $'+this.state.orderDetail.price.grandTotal,
            [
                { text: 'Pay', onPress: () => this.createAnOrder() },              
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }             
            ]
        );    
    }  
    
    createAnOrder(){
        if(!this.state.paymentOption){
            Alert.alert('Warning','Please select a payment option.',[{ text: 'OK' }]);      
            return; 
        }
        
        this.setState({showProgress:true});
        return this.client.postWithAuth(config.createOrderEndpoint, {orderDetail:this.state.orderDetail, paymentOption: this.state.paymentOption})
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
            }else if(response.statusCode==200){
                this.setState({showProgress:false});
                if(response.data.result===true){
                    Alert.alert('Success','Your Order is placed.',[{ text: 'OK' }]); 
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
                Alert.alert('Failed creating order','Network or server Error',[{ text: 'OK' }]);            
            }
         }).catch((err)=>{
               this.setState({showProgress: false});
               commonAlert.networkError(err);
         });    
    }
    
    navigateBackToShoppingCartPage(){
        this.props.navigator.pop();
    }

    async selectPayment() {
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
    totalAmountView:{
      height:windowHeight*0.38,
      justifyContent:'center',
      flexDirection:'column',
    },
    totalAmountTitle:{
      fontSize:windowHeight/37.056,
      fontWeight:'300',
      alignSelf:'center',
    },
    totalAmountText:{
      fontSize:windowHeight/10.42,
      fontWeight:'bold',
      alignSelf:'center',
      color:'#404040',
    },
    selectPaymentbuttonView:{
      height:windowHeight*0.075,
      width:windowWidth,
      alignItems:'center',
    },
    selectPaymentbutton:{
      height:windowHeight*0.075,
      width:windowWidth*0.62,
      backgroundColor:'#7BCBBE',
      justifyContent: 'center',
    },
    selectPaymentbuttonText:{
      color:'#fff',
      fontSize:windowHeight/47.64,
      fontWeight:'bold',
      alignSelf:'center',
    },
    selectedPaymentTextView:{
      flexDirection:'column',
      width:windowWidth*0.95,
    },
    selectedPaymentText:{
      color:'#A0A0A0',
      fontSize:windowHeight/51.636,
      marginTop:windowHeight*0.02,
      textAlign:'center',
      alignSelf:'center',
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
});

module.exports = PaymentPage;

