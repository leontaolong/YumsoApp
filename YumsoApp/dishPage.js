var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var Swiper = require('react-native-swiper')
var shareIcon = require('./icons/icon-share.png');
var backIcon = require('./icons/icon-back.png');
var notlikedIcon = require('./icons/icon-unliked.png')
var likedIcon = require('./icons/icon-liked.png');
var bowlIcon = require('./icons/icon_bowl.png');
var plusIcon = require('./icons/icon-plus.png');
var minusIcon = require('./icons/icon-minus.png');
import Dimensions from 'Dimensions';

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
  Alert,
  Picker
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class DishPage extends Component {
    constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        var dish = routeStack[routeStack.length-1].passProps.dish;
        var shoppingCart = routeStack[routeStack.length-1].passProps.shoppingCart;
        var selectedTime = routeStack[routeStack.length-1].passProps.selectedTime;
        this.state = {
            showProgress:true,
            dish: dish,
            shoppingCart: shoppingCart,
            selectedTime: selectedTime,
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        //todo: in the future get comments using client
    }

    
    render() {
        if(this.state.like){
          let likeIcon = likedIcon;
        }else{
          let likeIcon = notlikedIcon;
        }
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                        <View style={styles.headerLeftView}>
                             <TouchableHighlight style={styles.backButtonView} onPress={() => this.navigateBackToShop()}>
                                 <Image source={backIcon} style={styles.backButtonIcon}/>
                             </TouchableHighlight>
                         </View>    
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}></Text>
                         </View>
                         <View style={styles.headerRightView}>
                             <View style={styles.likeShareButtonView}>
                                <TouchableHighlight onPress={()=>{this.addToFavorite()}}>
                                   <Image source={likeIcon} style={styles.likeButtonIcon}/>
                                </TouchableHighlight>
                                <TouchableHighlight>
                                   <Image source={shareIcon} style={styles.shareButtonIcon}/>
                               </TouchableHighlight>
                            </View>
                         </View>
               </View>
               <Swiper showsButtons={false} height={windowHeight/2.63} horizontal={true} autoplay={true}
                        dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                        activeDot={<View style={{ backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />} >
                        {this.state.dish.pictures.map((picture) => {
                            return (
                                    <Image key={picture} source={{ uri: picture }} style={styleShopPage.oneDishPicture}/>
                            );
                        }) }
               </Swiper>
               <View style={styleShopPage.oneDishNameDiscriptionView}>
                  <Image source={bowlIcon} style={styleShopPage.bowlIcon}/>
                  <View style={styleShopPage.oneDishNameDiscriptionTextView}>
                     <Text style={styleShopPage.oneDishNameText}>{this.state.dish.dishName}</Text>
                     <Text style={styleShopPage.oneDishDiscriptionText}>{this.state.dish.description}</Text>
                  </View>
               </View>
               <View style={styleShopPage.priceView}>
                  <View style={styleShopPage.priceTextView}>
                    <Text style={styleShopPage.priceText}>${this.state.dish.price}</Text>
                    <Text style={styleShopPage.orderStatusText}>{this.state.selectedTime === 'All Schedules' ? '' : '3 orders left'} 
                      {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][this.state.dish.dishId] ? ' | ' + this.state.shoppingCart[this.state.selectedTime][this.state.dish.dishId].quantity + ' ordered ' : ''} 
                    </Text>
                  </View>
                  <View style={styleShopPage.chooseQuantityView}>
                    <View style={styleShopPage.plusIconView}>
                      <TouchableHighlight onPress={() => this.addToShoppingCart(this.state.dish) }>
                        <Image source={plusIcon} style={styleShopPage.plusMinusIcon}/>
                      </TouchableHighlight>
                    </View>
                     
                    <View style={styleShopPage.minusIconView}>
                      <TouchableHighlight onPress={() => this.removeFromShoppingCart(this.state.dish) }>
                         <Image source={minusIcon} style={styleShopPage.plusMinusIcon}/>
                      </TouchableHighlight>
                    </View>
                  </View>
                </View>
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
            if(this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity===0){
                delete this.state.shoppingCart[this.state.selectedTime][dish.dishId];
                if(Object.keys(this.state.shoppingCart[this.state.selectedTime])===0){
                    delete this.state.shoppingCart[this.state.selectedTime];
                }
            }
        } 
        this.getTotalPrice();
    }
    
    addToFavorite(){
        var _this = this;
        return AuthService.getEater()
        .then((eater)=>{
            if(eater){
                if (!eater.favoriteChefs) eater.favoriteChefs = []; //todo: remove this.
                let isAdd = eater.favoriteChefs.indexOf(_this.state.chefId) === -1
                console.log(isAdd);
                _this.client.postWithAuth(isAdd?config.addFavoriteEndpoint:config.removeFavoriteEndpoint, {
                    info:{ chefId: _this.state.chefId, eaterId: eater.eaterId}
                }).then((res)=>{
                    if(res.statusCode===200){
                        isAdd?eater.favoriteChefs.push(_this.state.chefId):eater.favoriteChefs.splice(eater.favoriteChefs.indexOf(_this.state.chefId), 1);
                        return AuthService.updateCacheEater(eater)
                            .then(()=>{ 
                                _this.setState({like:isAdd});
                                Alert.alert('Success', isAdd?'Added to favorite list':'Removed from favorite list', [{ text: 'OK' }]);                          
                            });
                    }else if(res.statusCode===401){
                        _this.props.navigator.push({
                            name: 'LoginPage',
                            passProps:{
                                callback:(eater)=>{
                                _this.setState({like:eater.favoriteChefs.indexOf(_this.state.chefId) !== -1});                  
                                }  
                            }                
                        });
                    }else{
                        Alert.alert( 'Failed', 'Failed. Please try again later',[ { text: 'OK' }]);   
                    }
                });         
            }else{
                _this.props.navigator.push({
                    name: 'LoginPage',
                    passProps:{
                        callback:(eater)=>{
                           _this.setState({like:eater.favoriteChefs.indexOf(_this.state.chefId) !== -1});                  
                        }
                    }
                });
            }
        });
    }
    
    navigateBackToShop() {
        this.props.navigator.pop();
    }
}

var styleShopPage = StyleSheet.create({
    shopPictureView:{
        height: windowHeight/2.63,
    },
    shopPicture:{
        width: windowWidth,
        height: windowHeight/2.63,
    },
    shopPageTopButtonsView:{ 
        flex: 1, 
        flexDirection: 'row', 
    },
    backButtonView:{ 
        position:'absolute', 
        top: 10, 
        left:0,
    },
    likeButtonIcon:{ 
        width: 30, 
        height: 30,
    },
    shareButtonView:{
        position:'absolute', 
        top: 10, 
        right:10,
    },
    shareButtonIcon:{
        width:  30, 
        height: 30,
    },
    chefNameRow:{
        flexDirection: 'row',
        padding: windowHeight/49,
        alignItems: 'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#f5f5f5',
    },
    chefProfilePicView:{
        borderRadius: 12, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    chefProfilePic:{
        width:windowHeight/10.8,
        height:windowHeight/10.8,
    },
    shopChefNameRatingView:{ 
        paddingLeft: windowWidth/20.7, 
    },
    shopNameText:{ 
        fontSize: windowHeight/36.8, 
        marginBottom: windowHeight/61.3, 
    },
    chefDiscriptionView:{
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        justifyContent:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    chefDiscriptionText:{ 
        fontSize: windowHeight/52.6,
    },
    shopRatingDollarSignView:{ 
        flex: 1, 
        flexDirection: 'row', 
        marginBottom: windowHeight/245.3,
    },
    ratingView:{ 
        flex: 0.5, 
        flexDirection: 'row',
    },
    dollarSignView:{ 
        flex: 0.5, 
        flexDirection: 'row', 
        marginLeft: windowWidth/27.6
    },
    chefNameAreaText:{ 
        fontSize: 16, 
        color: '#696969', 
    },
    shopRadioView:{
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    radioIcon:{ 
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    myStoryTitleText:{ 
        fontSize: windowHeight/46.0, 
        paddingBottom: windowHeight/73.6, 
    },
    shopDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    shopRadioText:{ 
        fontSize: windowHeight/52.6, 
        color: '#A9A9A9',
    },
    pickupAddressView:{
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    pickupAddressTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    pickupAddressText:{ 
        fontSize: windowHeight/52.6, 
        color: '#A9A9A9'
    },
    pickupAddressIcon:{ 
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    timeSelectorView:{
        flex:1, 
        justifyContent:'space-around', 
        padding:50,
    },
    footerView:{ 
        flexDirection:'row', 
        height:windowHeight/13.4, 
        backgroundColor:'#ff9933',
        paddingTop:windowHeight/245.30,
    },
    shoppingCartIconView:{ 
        height: windowHeight/19.37, 
        width: windowWidth/8.28, 
        paddingLeft: windowWidth/20.7, 
        paddingTop: windowHeight/92.0, 
        marginVertical: windowHeight/147.2, 
        backgroundColor: '#fff', 
        flexDirection:'row',
    },
    shoppingCartIcon:{ 
        width: 25, 
        height: 25,
    },
    shoppingCartTimePriceText:{
        color:'#fff',
        marginTop:15,
        marginLeft:13,
        fontSize:15,
    },
    oneDishInListView:{
        marginBottom:0,
        // alignSelf:'stretch',
        // flexDirection:'row',
        // flex:1 ,
    },
    oneDishPicture:{
        width: windowWidth,
        height: windowHeight/2.63,
    },
    oneDishNameDiscriptionView:{
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingTop: windowHeight/73.6,
        paddingBottom:windowHeight/105.1,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    bowlIcon:{
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    oneDishNameDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    forwardIconView:{
        paddingLeft:0,
        paddingVertical:15,
    },
    forwardIcon:{
        width: 20,
        height: 20,
    },
    oneDishNameText:{
        fontSize:14,
        fontWeight:'600',
    },
    oneDishDiscriptionText:{
        fontSize:12,
        color:'#A9A9A9',
        marginTop:5,
    },
    priceView:{
        flex: 1,
        flexDirection: 'row',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 50,
        paddingVertical:20,
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
        marginRight:15,
    },
    minusIconView:{
        marginLeft:15,
    },
    priceText:{
        fontSize:17,
        fontWeight:'bold',
        color:'#ff9933',
    },
    orderStatusText:{
        fontSize:12,
        color:'#A9A9A9',
        marginTop:15,
    },
});

module.exports = DishPage;