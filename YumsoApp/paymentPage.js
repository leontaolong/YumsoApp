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
        return (
            <View style={styles.container}>
                <View style={styles.headerBannerView}>
                         <View style={styles.headerLeftView}>
                         <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={()=>this.navigateBackToShoppingCartPage()}>
                             <Image source={backIcon} style={styles.backButtonIcon}/>
                         </TouchableHighlight> 
                         </View>
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}>Check out</Text>
                         </View>
                         <View style={styles.headerRightView}>
                         </View>
               </View>
               <View style={stylePaymentPage.totalAmountView}>
                  <Text style={stylePaymentPage.totalAmountText}>You total amount: ${this.state.orderDetail.price.grandTotal}</Text>   
               </View>
               <View style={{flex:1,flexDirection:'row',justifyContent:'center'}}>
                 <TouchableHighlight style={stylePaymentPage.selectPaymentbutton}
                      onPress={()=>this.selectPayment()}>
                      <Text style={stylePaymentPage.buttonText}>Select Payment</Text>
                 </TouchableHighlight> 
               </View>
               <View style={{flex:1,flexDirection:'row',justifyContent:'center'}}>
                  <TouchableHighlight style={stylePaymentPage.placeOrderButton}
                      onPress={()=>this.confirm()}>
                      <Text style={stylePaymentPage.buttonText}>Place the order</Text>
                  </TouchableHighlight> 
                </View>
                
            </View>
        );
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
      height:windowHeight/3.0,
      justifyContent:'center',
    },
    totalAmountText:{
      fontSize:22,
      fontWeight:'300',
      alignSelf:'center',
    },
    selectPaymentbutton:{
      marginVertical:20,
      height:windowHeight/13.38,
      width:windowWidth*0.9,
      backgroundColor:'#ffcc33',
      justifyContent: 'center',
    },
    placeOrderButton:{
      marginVertical:20,
      height:windowHeight/13.38,
      width:windowWidth*0.9,
      backgroundColor:'#ff9933',
      justifyContent: 'center',
    },
    buttonText:{
      color:'#fff',
      fontSize:windowHeight/30.6,
      fontWeight:'300',
      alignSelf:'center',
    }

});

module.exports = PaymentPage;

