'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var Swiper = require('react-native-swiper')
var shareIcon = require('./icons/icon-share.png');
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
  TextInput,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
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
        this.state = {
            showProgress:true,
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
        if(this.state.like){
          var likeIcon = likedIcon;
        }else{
          var likeIcon = notlikedIcon;
        }
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                        <View style={styles.headerLeftView}>
                             <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={() => this.navigateBackToShop()}>
                                 <Image source={backIcon} style={styles.backButtonIcon}/>
                             </TouchableHighlight>
                         </View>    
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}>{this.state.dish.dishName}</Text>
                         </View>
                         <View style={styles.headerRightView}>
                         </View>
               </View>
               <ScrollView>
                <Swiper showsButtons={false} height={windowHeight*0.4419} horizontal={true} autoplay={true}
                            dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                            activeDot={<View style={{ backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />} >
                            {this.state.dish.pictures.map((picture) => {
                                return (
                                        <Image key={picture} source={{ uri: picture }} style={styleDishPage.oneDishPicture}/>
                                );
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
                        <Text style={styleDishPage.orderStatusText}>
                        {this.state.selectedTime === 'All Schedules' ? '' : (this.state.scheduleMapping[this.state.selectedTime][this.state.dish.dishId].leftQuantity)+' orders left'} 
                        </Text>
                        <Text style={styleDishPage.orderStatusText}>
                        {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][this.state.dish.dishId] ? this.state.shoppingCart[this.state.selectedTime][this.state.dish.dishId].quantity + ' ordered ' : ''} 
                        </Text>
                    </View>
                    <View style={styleDishPage.chooseQuantityView}>
                        <View style={styleDishPage.minusIconView}>
                            <TouchableHighlight underlayColor={'#ECECEC'} onPress={() => this.removeFromShoppingCart(this.state.dish) }>
                                <Image source={minusIcon} style={styleDishPage.plusMinusIcon}/>
                            </TouchableHighlight>
                        </View>
                        <View style={styleDishPage.quantityTextView}>
                            <Text style={styleDishPage.quantityText}>
                            {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][this.state.dish.dishId] ? this.state.shoppingCart[this.state.selectedTime][this.state.dish.dishId].quantity: ' '}
                            </Text>
                        </View>
                        <View style={styleDishPage.plusIconView}>
                            <TouchableHighlight underlayColor={'#ECECEC'} onPress={() => this.addToShoppingCart(this.state.dish) }>
                                <Image source={plusIcon} style={styleDishPage.plusMinusIcon}/>
                            </TouchableHighlight>
                        </View>                        
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
        if(this.state.selectedTime==='All Schedules'){
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
        if(this.state.selectedTime==='All Schedules'){
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
    }
}

var styleDishPage = StyleSheet.create({
    shopPictureView:{
        height: windowHeight*0.4419,
    },
    shopPicture:{
        width: windowWidth,
        height: windowHeight*0.4419,
    },
    shopInfoView:{
        flexDirection:'row',
        height:windowHeight*0.14,
        paddingTop:windowHeight*0.0225,
        paddingBottom:windowHeight*0.02698,
        paddingHorizontal:windowWidth*0.032,
    },
    chefPhotoView:{
        marginRight:windowWidth*0.04, 
    },
    chefPhoto:{
        height:windowWidth*0.16,
        width:windowWidth*0.16,
        borderRadius: 12, 
        borderWidth: 0, 
        overflow: 'hidden',
    },
    shopInfoSection:{
        flex:1,
        flexDirection:'column',
        justifyContent:'space-between',
        height:windowWidth*0.165,        
    },
    shopInfoRow1:{
        flexDirection:'row',
    },
    shopNameView:{
       flex:0.93,
       flexDirection:'row',
       alignItems:'flex-start', 
    }, 
    oneShopNameText:{
       fontSize:windowHeight/37.06,
       fontWeight:'bold',
       color:'#4A4A4A',
    },
    likeIconView:{
       flex:0.07,
       flexDirection:'row',
       alignItems:'flex-end', 
    }, 
    likeIcon:{
        width:windowWidth*0.05,
        height:windowWidth*0.05,
    },
    shopInfoRow2:{
        flexDirection:'row',
    },
    shopRatingView:{
        flex:0.72,
        flexDirection:'row',
        alignItems:'flex-start',
    },
    reviewNumberText:{
        fontSize:windowHeight/51.636,
        color:'#4A4A4A',
        marginLeft:windowWidth*0.0187,
        alignSelf:'center',
    },
    shopInfoRow3:{
        flexDirection:'row',
    },
    labelView:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginRight:windowWidth*0.04,
    },   
    labelIcon:{
        width:windowHeight*0.0264, 
        height:windowHeight*0.0264,
        alignSelf:'center',
    },
    labelText:{
        fontSize:windowHeight/47.33,
        color:'#FFCC33',
        marginLeft:windowWidth/82.8,
        alignSelf:'center',
    },    
    chefDetailView:{
        flexDirection: 'row',
        height:windowHeight*0.065,
        paddingLeft: windowWidth/27.6,
        alignItems:'center',
        borderColor: '#F5F5F5',
        borderTopWidth: 1,
        backgroundColor: '#fff'        
    },
    chefDetailTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    pickupAddressText:{ 
        fontSize: windowHeight/47.33, 
        color: '#A9A9A9'
    },
    pickupAddressIcon:{ 
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    forwardIcon:{
        width: windowHeight*0.06, 
        height: windowHeight*0.06,
    },
    timeSelectorView:{
        flexDirection:'row',
        justifyContent:'center', 
        borderColor:'#D7D7D7',
        borderTopWidth:windowHeight*0.007,
        height:windowHeight*0.10,
    },
    openHourTitle:{
        alignSelf:'center',
        fontSize:windowHeight/35.5,
        color:'#4A4A4A',
        marginRight:windowWidth*0.015625,
    },
    modalPicker:{
        alignSelf:'center',
        borderColor:'#FFCC33',
    },
    openHoursText:{

    },
    footerView:{ 
        flexDirection:'row', 
        height:windowHeight*0.075, 
        backgroundColor:'#FFCC33',
    },
    checkoutButtonView:{
        width:windowWidth*0.3,
        flexDirection:'row',
        alignItems:'flex-end',
    },
    checkoutButtonWrapper:{ 
        height: windowHeight*0.044, 
        width: windowWidth*0.27, 
        flexDirection:'row',
        alignSelf:'center',
        borderRadius:6,
        borderWidth:1.5,
        borderColor:'#fff',
        justifyContent:'center',
    },
    checkoutButton:{
        color:'#fff',
        fontSize:windowHeight/47.33,
        fontWeight:'600',
        alignSelf:'center',
    },
    shoppingCartTimeView:{
        width:windowWidth*0.7,
        alignItems:'flex-start',
        flexDirection:'row',
        alignSelf:'center',
    },
    shoppingCartTimePriceText:{
        color:'#fff',
        fontSize:windowHeight/37.8,
        fontWeight:'400',
        justifyContent:'center',
    },
    oneDishInListView:{
        marginBottom:0,
    },
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
    },
    plusIconView:{
    },
    minusIconView:{
    },
    quantityTextView:{
        width:windowHeight*0.0827,
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