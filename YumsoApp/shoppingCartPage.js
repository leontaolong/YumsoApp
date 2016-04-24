var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');

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

class ShoppingCartPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        let shoppingCart = routeStack[routeStack.length-1].passProps.shoppingCart;        
        let selectedTime = routeStack[routeStack.length-1].passProps.selectedTime;        
        let chefId = routeStack[routeStack.length-1].passProps.chefId;        
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(shoppingCart)),
            showProgress:false,
            shoppingCart:shoppingCart,
            selectedTime:selectedTime,
            chefId:chefId
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
    componentDidMount(){
        this.getTotalPrice();    
    }
    
    renderRow(cartItem){
        var dish = cartItem.dish;
        var quantity = cartItem.quantity;
        let imageSrc =require('./ok.jpeg') ;
        if(dish.pictures && dish.pictures!=null && dish.pictures.length!=0){
            imageSrc={uri:dish.pictures[0]};   
        } 
        return (
            <View style={styles.dishListView_dish}>
                <Image source={imageSrc} style={styles.dishListView_dish_pic}/>
                <View >
                    <View>
                        <Text>
                            {dish.dishName}
                        </Text>
                        <Text>
                            {dish.description}
                        </Text>   
                    </View>  
                    <View style={{flexDirection:'row', flex:1}}>
                        <View>
                            <Text>
                                ${dish.price}
                            </Text>
                            <Text>
                                {cartItem.quantity}
                            </Text> 
                        </View>  
                        <TouchableHighlight style={styles.button}
                            onPress={()=>this.addToShoppingCart(dish)}>
                            <Text style={styles.buttonText}>+</Text>
                        </TouchableHighlight>  
                        <Text>{this.state.shoppingCart[dish.dishId]?this.state.shoppingCart[dish.dishId].quantity:'  '}</Text>          
                        <TouchableHighlight style={styles.button}
                            onPress={()=>this.removeFromShoppingCart(dish)}>                
                            <Text style={styles.buttonText}>-</Text>
                        </TouchableHighlight>                                   
                    </View>                           
                </View>           
            </View>
        );
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
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } />
                <Text>Your total is ${this.state.totalPrice}</Text>
                <Text>Deliver time: {this.state.selectedTime}}</Text>
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateToPaymentPage() }>
                    <Text style={styles.buttonText}>Checkout</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToDishList() }>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableHighlight> 
            </View>
        );
    }
    
    addToShoppingCart(dish){
        var total = 0;;
        if(this.state.shoppingCart[dish.dishId]){
            this.state.shoppingCart[dish.dishId].quantity+=1;
        }else{
            this.state.shoppingCart[dish.dishId] = {dish:dish, quantity:1};
        }
        this.getTotalPrice();
    }
    
    removeFromShoppingCart(dish){
        if(this.state.shoppingCart[dish.dishId] && this.state.shoppingCart[dish.dishId].quantity>0){
            this.state.shoppingCart[dish.dishId].quantity-=1;
            if(this.state.shoppingCart[dish.dishId].quantity===0){
                delete this.state.shoppingCart[dish.dishId];
            }
        }    
        this.getTotalPrice();
    }
    
    getTotalPrice(){
        var total = 0;
        for(var cartItemId in this.state.shoppingCart){
            var cartItem = this.state.shoppingCart[cartItemId];
            total+=cartItem.dish.price * cartItem.quantity;
        }
        let dishes = JSON.parse(JSON.stringify(Object.values(this.state.shoppingCart)));
        this.setState({dataSource:this.state.dataSource.cloneWithRows(dishes),totalPrice:total});
    }    
    
    async navigateToPaymentPage(){
        if(!this.state.shoppingCart || Object.keys(this.state.shoppingCart).length==0){
            Alert.alert('Warning','You do not have any item in your shopping cart',[{ text: 'OK' }]);
            return;
        }
        let eater = await AuthService.getEater(); //todo: get eater and 401 jump after call.
        if(!eater){
            this.props.navigator.push({
                name: 'LoginPage'
            });  
            return;
        }
        //todo: Best practise is not to get eater here but cache it somewhere, but have to ensure the cached user is indeed not expired.              
        var orderList ={};
        for(var cartItemKey in this.state.shoppingCart){
            var dishItem=this.state.shoppingCart[cartItemKey];
            orderList[cartItemKey]={quantity:dishItem.quantity, price:dishItem.dish.price};
        }
        var order = {
            chefId: this.state.chefId,
            orderDeliverTime: Date.parse(this.state.selectedTime),//Sun Apr 03 2016 12:00:00
            eaterId: eater.eaterId,
            orderList: orderList,
            shippingAddress: "10715 NE37th Ct, Apt.227 WA, Kirkland 98033",
            subtotal: -1,
            shippingFee: -1,
            totalb4Tax: -1,
            estimateTax: -1,
            rewardPoints: -1,
            grandTotal: this.state.totalPrice,
            paymentMethod: 'American Express',
            notesToChef: 'Please put less salt',
            refundDll: 1459596400618,
        };   
        console.log(order);
        this.props.navigator.push({
            name: 'PaymentPage', 
            passProps:{
                totalPrice: this.state.totalPrice,
                orderDetail: order
            }
        });    
    }
    
    navigateBackToDishList(){
        this.props.navigator.pop();
    }
}

module.exports = ShoppingCartPage;

