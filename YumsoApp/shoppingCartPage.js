var HttpsClient = require('./httpsClient');
var styles = require('./style');

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
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(shoppingCart)),
            showProgress:false,
            shoppingCart:shoppingCart
        };
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
                <Text>{this.state.totalPrice}</Text>
                <View style={{flexDirection:'row', flex:2, alignSelf:'stretch'}}>
                    <TouchableHighlight style={styles.button}
                        onPress={() => this.navigateToPaymentPage() }>
                        <Text style={styles.buttonText}>Checkout</Text>
                    </TouchableHighlight>         
                    <TouchableHighlight style={styles.button}
                        onPress={() => this.navigateBackToDishList() }>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableHighlight> 
                </View>          
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
    
    navigateToPaymentPage(){
        this.props.navigator.push({
            name: 'PaymentPage', 
            passProps:{
                totalPrice: this.state.totalPrice   
            }
        });    
    }
    
    navigateBackToDishList(){
        this.props.navigator.pop();
    }
}

module.exports = ShoppingCartPage;

            // Alert.alert(
            //     'Alert Title',
            //     'My Alert Msg',
            //     [
            //         { text: 'Ask me later', onPress: () => console.log('Ask me later pressed') },
            //         { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            //         { text: 'OK', onPress: () => console.log('OK Pressed') },
            //     ]
            // )