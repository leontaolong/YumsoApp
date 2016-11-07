'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var Swiper = require('react-native-swiper');
var backIcon = require('./icons/icon-back.png');
var notlikedIcon = require('./icons/icon-unliked-onheader.png')
var likedIcon = require('./icons/icon-liked-onheader.png');
var bowlIcon = require('./icons/icon_bowl.png');
var plusIcon = require('./icons/icon-plus.png');
var minusIcon = require('./icons/icon-minus.png');
import Dimensions from 'Dimensions';

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ListView,
  TouchableHighlight,
  AsyncStorage,
  Alert,
  Picker
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class DishPage extends Component {
    constructor(props){
        super(props);
        let routeStack = this.props.navigator.state.routeStack;
        let dish = routeStack[routeStack.length-1].passProps.dish;
        let shoppingCart = routeStack[routeStack.length-1].passProps.shoppingCart;
        let scheduleMapping = routeStack[routeStack.length-1].passProps.scheduleMapping;
        let selectedTime = routeStack[routeStack.length-1].passProps.selectedTime;
        let totalPrice = routeStack[routeStack.length-1].passProps.totalPrice;
        this.backCallback = routeStack[routeStack.length-1].passProps.backCallback;
        this.state = {
            dish: dish,
            shoppingCart: shoppingCart,
            selectedTime: selectedTime,
            scheduleMapping:scheduleMapping,
            totalPrice: totalPrice
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        //todo: in the future get comments using client
    }

    
    render() {
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                   <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToShop()}>
                      <View style={styles.backButtonView}>
                         <Image source={backIcon} style={styles.backButtonIcon}/>
                      </View>
                   </TouchableHighlight>    
                   <View style={styles.titleView}>
                      <Text style={styles.titleText}>{this.state.dish.dishName}</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View>
               <ScrollView>
                <Swiper showsButtons={false} height={windowHeight*0.4419} horizontal={true} autoplay={true}
                            dot={<View style={styles.dot} />} activeDot={<View style={styles.activeDot} />} >
                            {this.state.dish.pictures.map((picture) => {
                                return <Image key={picture} source={{ uri: picture }} style={styleDishPage.oneDishPicture}/>
                            }) }
                </Swiper>
                <View style={styleDishPage.oneDishNameDiscriptionView}>                  
                        <Text style={styleDishPage.oneDishNameText}>{this.state.dish.dishName}</Text>
                        <Text style={styleDishPage.oneDishIngredientText}>{this.state.dish.ingredients}</Text>
                        <Text style={styleDishPage.oneDishDiscriptionText}>{this.state.dish.description}</Text>
                </View>
                <View style={styleDishPage.priceView}>
                    <View style={styleDishPage.priceTextView}>
                        <Text style={styleDishPage.priceText}>${this.state.dish.price}</Text>
                    </View>
                </View>
                </ScrollView>
            </View>
        );
    }
    
    getTotalPrice(){
        var total = 0;
        var deliverTime = this.state.selectedTime;
        for(var cartItemId in this.state.shoppingCart[deliverTime]){
            var cartItem = this.state.shoppingCart[deliverTime][cartItemId];
            total+=cartItem.dish.price * cartItem.quantity;
        }
        this.setState({shoppingCart:this.state.shoppingCart, totalPrice:total});
    }  
    
   addToShoppingCart(dish){
        if(this.state.selectedTime==='All Dishes'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;  
        }
        if(this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity===0){
            Alert.alert( 'Warning', 'No more available',[ { text: 'OK' }]);
            return;          
        }
        this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity-=1;
        if(!this.state.shoppingCart[this.state.selectedTime]){
            this.state.shoppingCart[this.state.selectedTime] = {};
        }
        if(this.state.shoppingCart[this.state.selectedTime][dish.dishId]){
            this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity+=1;
        }else{
            this.state.shoppingCart[this.state.selectedTime][dish.dishId] = {dish:dish, quantity:1};
        }
        this.getTotalPrice();
    }
    
    removeFromShoppingCart(dish){
        if(this.state.selectedTime==='All Dishes'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;  
        }
        if(!this.state.shoppingCart[this.state.selectedTime]){
            return;
        }   
        if(this.state.shoppingCart[this.state.selectedTime][dish.dishId] && this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity>0){
            this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity-=1;
           this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity+=1;
            if(this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity===0){
                delete this.state.shoppingCart[this.state.selectedTime][dish.dishId];
                if(Object.keys(this.state.shoppingCart[this.state.selectedTime])===0){
                    delete this.state.shoppingCart[this.state.selectedTime];
                }
            }
        } 
        this.getTotalPrice();
    }
    
    navigateBackToShop() {
        this.props.navigator.pop();
        this.backCallback(this.state.totalPrice);
    }
}

var styleDishPage = StyleSheet.create({
    oneDishPicture:{
        width: windowWidth,
        height: windowHeight*0.4419,
    },
    oneDishNameDiscriptionView:{
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: windowWidth*0.07,
        paddingTop: windowHeight*0.03,
        paddingBottom:windowHeight*0.005,
    },
    oneDishNameDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    oneDishNameText:{
        fontSize:windowHeight/35.5,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    oneDishIngredientText:{
        fontSize:windowHeight/40.57,
        color:'#9B9B9B',
        marginTop:windowHeight*0.0088,
        textAlign:'justify', 
    },
    oneDishDiscriptionText:{
        fontSize:windowHeight/47.33,
        color:'#9B9B9B',
        marginTop:windowHeight*0.0088,
        textAlign:'justify',
    },   
    priceView:{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal:windowWidth*0.07,
        paddingVertical:windowHeight*0.0352,
    },
    priceTextView:{
        flex: 0.66,
        flexDirection: 'column',
    },
    chooseQuantityView:{
        flex: 0.34,
        flexDirection: 'row',
        justifyContent:'flex-end',
    },
    plusMinusIcon:{
        width: windowHeight/27.6, 
        height: windowHeight/27.6,
        alignSelf:'center',
    },
    plusIconView:{
        width:windowHeight*0.08,
        height:windowHeight*0.06,
        alignSelf:'center',
    },
    minusIconView:{
        width:windowHeight*0.08,
        height:windowHeight*0.06,
    },
    quantityTextView:{
        width:windowHeight*0.04,
        justifyContent:'flex-start',
        flexDirection:'column',
    },
    quantityText:{
        fontSize:windowHeight/33.41,
        fontWeight:'bold',
        color:'#FFCC33',
        alignSelf:'center',
        marginTop:1,
    },
    priceText:{
        fontSize:windowHeight/31.55,
        fontWeight:'bold',
        color:'#F8C84E',
        marginBottom:8,
    },
    orderStatusText:{
        fontSize:windowHeight/40.57,
        color:'#9B9B9B',
        marginTop:windowHeight*0.0035,
    },
});

module.exports = DishPage;