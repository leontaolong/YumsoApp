var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert
} from 'react-native';

class PaymentPage extends Component {
    constructor(props){
        super(props);
        let routeStack = props.navigator.state.routeStack;
        let orderDetail = routeStack[routeStack.length-1].passProps.orderDetail;
        this.state = {
            showProgress:false,
            orderDetail:orderDetail
        };
        console.log(orderDetail);
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
    render() {
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
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
                                            <Text style={stylePaymentPage.selectedPaymentText}>({this.state.paymentOption.cardType}*****{this.state.paymentOption.last4} has been chosen for this payment)</Text>
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
                
        return (<View style={styles.geryContainer}>
                  <View style={styles.headerBannerView}>
                    <View style={styles.headerLeftView}>
                        <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={()=>this.navigateBackToShoppingCartPage()}>
                        <Image source={backIcon} style={styles.backButtonIcon}/>
                        </TouchableHighlight> 
                    </View>
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
                 <TouchableHighlight style={stylePaymentPage.placeOrderButtonWrapper} onPress={()=>this.confirm()}>
                    <View style={stylePaymentPage.placeOrderButton}>
                        <Text style={stylePaymentPage.placeOrderButtontText}>Place Order</Text>
                    </View>
                 </TouchableHighlight>                 
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
         return this.client.postWithAuth(config.createOrderEndpoint, {orderDetail:this.state.orderDetail, paymentOption: this.state.paymentOption})
         .then((response)=>{
            if(response.statusCode==401){
                this.props.navigator.push({
                    name: 'LoginPage',//todo: fb cached will signin and redirect back right away.
                }); 
                return; //todo: require pass in callback to verify eater is same as loged in user.
            }else if(response.statusCode==200){
                Alert.alert('Success','Your Order is placed.',[{ text: 'OK' }]);  
                this.props.navigator.push({
                    name: 'OrderConfirmation',//todo: fb cached will signin and redirect back right away.
                    //todo: perhaps pass orderId
                });                     
            }else{
                Alert.alert('Fail','Failed creating order',[{ text: 'OK' }]);            
            }
         });   
    }
    
    navigateBackToShoppingCartPage(){
        this.props.navigator.pop();
    }

    async selectPayment() {
        let principal = await AuthService.getPrincipalInfo();//todo: not use authservice.
        if (principal === undefined) {
            this.props.navigator.push({
                name: 'LoginPage',//todo: fb cached will signin and redirect back right away.
            });
            return; //todo: require pass in callback to verify eater is same as loged in user.
        }
        this.props.navigator.push({
            name: 'PaymentOptionPage',//todo: fb cached will signin and redirect back right away.
            passProps:{
                eaterId: principal.userId,
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
      backgroundColor:'#55ACEE',
      justifyContent: 'center',
    },
    selectPaymentbuttonText:{
      color:'#fff',
      fontSize:windowHeight/47.64,
      fontWeight:'bold',
      alignSelf:'center',
    },
    selectedPaymentTextView:{
      flexDirection:'row',
      justifyContent:'center',
    },
    selectedPaymentText:{
      color:'#A0A0A0',
      fontSize:windowHeight/51.636,
      marginTop:windowHeight*0.02,
    },
    placeOrderButtonWrapper:{
      flexDirection:'row',        
      justifyContent: 'center',
      backgroundColor:'#FFCC33',
      position:'absolute',
      left: 0, 
      right: 0,
      top:windowHeight-windowHeight*0.075,
      height:windowHeight*0.075,
      width:windowWidth,
    },
    placeOrderButton:{
      flexDirection:'row',        
      justifyContent: 'center',
      height:windowHeight*0.075,
      width:windowWidth,
    },
    placeOrderButtontText:{
      color:'#fff',
      fontSize:windowHeight/37.056,
      fontWeight:'bold',
      alignSelf: 'center',
    },
});

module.exports = PaymentPage;

