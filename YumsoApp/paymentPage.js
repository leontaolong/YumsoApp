var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var BTClient = require('react-native-braintree');

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
        let totalPrice = routeStack[routeStack.length-1].passProps.totalPrice;
        let orderDetail = routeStack[routeStack.length-1].passProps.orderDetail;
        this.state = {
            showProgress:false,
            totalPrice:totalPrice,
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
                <Text>Pay amount: ${this.state.totalPrice}</Text>   
                <TouchableHighlight style={styles.button}
                    onPress={()=>this.confirm()}>
                    <Text style={styles.buttonText}>Place the order</Text>
                </TouchableHighlight>   
                <TouchableHighlight style={styles.button}
                    onPress={()=>this.navigateBackToShoppingCartPage()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableHighlight>      
            </View>
        );
    }
      
    confirm(){
        Alert.alert(
            'Order placement',
            'Ready to place the order? Your total is $'+this.state.totalPrice,
            [
                { text: 'Pay', onPress: () => this.createAnOrder() },              
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }             
            ]
        );    
    }  
    
    createAnOrder(){
         return this.client.postWithAuth(config.createOrderEndpoint, {orderDetail:this.state.orderDetail})
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
        this.create();
        //this.props.navigator.pop();
    }
    
    create(){
        var client = new HttpsClient(config.baseUrl, true);
        client.getWithAuth(config.braintreeTokenEndpoint)
            .then((res) => {
                var clientToken = res.data.clientToken;
                return BTClient.setup(clientToken)
                    .then(() => {
                        // return BTClient.getCardNonce("4111111111111111", "10", "20").then(function(nonce) {
                        // //payment succeeded, pass nonce to server
                        //     console.log(nonce);
                        //     return client.postWithoutAuth(config.braintreeCheckout, { payment_method_nonce: nonce })
                        // })
                        // .catch(function(err) {
                        // //error handling
                        // console.log(err);
                        // });                
                        return BTClient.showPaymentViewController()
                            .then((nonce) => {
                                return client.postWithAuth(config.braintreeCheckout, { payment_method_nonce: nonce })
                            }).catch((err) => {
                                console.log(err);
                            });
                    });
            });
    }
}



module.exports = PaymentPage;

