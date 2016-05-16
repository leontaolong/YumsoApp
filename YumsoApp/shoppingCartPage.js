var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var MapPage = require('./mapPage');
var plusIcon = require('./icons/icon-plus.png');
var minusIcon = require('./icons/icon-minus.png');
var backIcon = require('./icons/ic_keyboard_arrow_left_48pt_3x.png');
var addPromoCodeIcon = require('./icons/Icon-add.png');
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

class ShoppingCartPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        let shoppingCart = routeStack[routeStack.length-1].passProps.shoppingCart;        
        let selectedTime = routeStack[routeStack.length-1].passProps.selectedTime;        
        this.deliverTimestamp = routeStack[routeStack.length-1].passProps.deliverTimestamp;        
        let chefId = routeStack[routeStack.length-1].passProps.chefId;        
        let eater = routeStack[routeStack.length-1].passProps.eater;        
        let defaultDeliveryAddress = routeStack[routeStack.length-1].passProps.defaultDeliveryAddress;//!=undefined? routeStack[routeStack.length-1].passProps.defaultDeliveryAddress:'';        
        let shopName = routeStack[routeStack.length-1].passProps.shopName;
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(shoppingCart)),
            showProgress:false,
            shoppingCart:shoppingCart,
            selectedTime:selectedTime,
            deliveryAddress: defaultDeliveryAddress,
            chefId:chefId,
            selectDeliveryAddress:false,
            shopName:shopName,
            eater:eater
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
    componentDidMount(){
        this.getTotalPrice();    
    }
    
    renderHeader(){
        return[(<View style={styleShoppingCartPage.chefShopNameView}>
                    <Text style={styleShoppingCartPage.chefShopNameText}>{this.state.shopName}</Text>
                </View>),
               (<View style={styleShoppingCartPage.deliverTimeView}>
                    <Text style={styleShoppingCartPage.deliverTimeText}>To be delivered at {dateRender.renderDate2(this.state.selectedTime)}</Text>
                </View>)
              ]
    }
    
    renderRow(cartItem){
        var dish = cartItem.dish;
        var quantity = cartItem.quantity;
        let imageSrc =require('./ok.jpeg') ;
        if(dish.pictures && dish.pictures!=null && dish.pictures.length!=0){
            imageSrc={uri:dish.pictures[0]};   
        } 
        return (
            <View style={styleShoppingCartPage.oneListingView}>
                <Image source={imageSrc} style={styleShoppingCartPage.dishPhoto}/>
                <View style={styleShoppingCartPage.shoppingCartInfoView}>
                    <View style={styleShoppingCartPage.dishNamePriceView}>
                      <View style={styleShoppingCartPage.dishNameView}>
                        <Text style={styleShoppingCartPage.dishNameText}>{dish.dishName}</Text>
                      </View>
                      <View style={styleShoppingCartPage.dishPriceView}>
                        <Text style={styleShoppingCartPage.dishPriceText}>${dish.price}</Text>   
                      </View>
                    </View> 
                     
                    <View style={styleShoppingCartPage.dishDescriptionView}>
                    </View>
                    
                    <View style={styleShoppingCartPage.quantityTotalPriceView}>
                      <View style={styleShoppingCartPage.quantityView}>
                        <TouchableHighlight style={styleShoppingCartPage.plusIconView}
                            onPress={()=>this.addToShoppingCart(dish)}>
                            <Image source={plusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                        </TouchableHighlight> 
                        <Text style={styleShoppingCartPage.quantityText}>{this.state.shoppingCart[dish.dishId]?this.state.shoppingCart[dish.dishId].quantity:'  '}</Text>          
                        <TouchableHighlight style={styleShoppingCartPage.minusIconView}
                            onPress={()=>this.removeFromShoppingCart(dish)}>                
                            <Image source={minusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                        </TouchableHighlight>
                      </View>
                      <View style={styleShoppingCartPage.totalPriceView}>
                          <Text style={styleShoppingCartPage.totalPriceText}>${dish.price*quantity}</Text>
                      </View>                               
                    </View>  
                                             
                </View>
            </View>
        );
    }
    
    renderFooter(){
      
       return [(<View style={styleShoppingCartPage.subtotalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.totalPrice}</Text>
                  </View>
               </View>),
               (<View style={styleShoppingCartPage.taxView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Tax</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.totalPrice*0.095}</Text>
                  </View>
               </View>),
               (<View style={styleShoppingCartPage.deliveryFeeView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Delivery</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>$10</Text>
                  </View>
               </View>),
               (<View style={styleShoppingCartPage.addressView}>
                  <View style={styleShoppingCartPage.addressTextView}>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined?this.state.deliveryAddress.formatted_address.replace(/,/g, '').split(this.state.deliveryAddress.city)[0]:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined?this.state.deliveryAddress.city:''} {this.state.deliveryAddress!=null?this.state.deliveryAddress.state:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined?this.state.deliveryAddress.postal:''}</Text>
                  </View>
                  <View style={styleShoppingCartPage.addressChangeButtonView}>
                     <TouchableHighlight style={styleShoppingCartPage.addressChangeButtonWrapper} onPress={()=>this.setState({selectDeliveryAddress:true})}>
                        <Text style={styleShoppingCartPage.addressChangeButtonText}>Change Address</Text>
                     </TouchableHighlight>
                  </View>
               </View>),
               (<View style={styleShoppingCartPage.promotionCodeView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Promotion Code</Text>
                  </View>
                  <TouchableHighlight style={styleShoppingCartPage.priceNumberView}>
                      <Image source={addPromoCodeIcon} style={styleShoppingCartPage.addPromoCodeIcon}/>
                  </TouchableHighlight>
               </View>),
               (<View style={styleShoppingCartPage.totalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.totalPriceTitleText}>Total</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.totalPriceNumberText}>${this.state.totalPrice+this.state.totalPrice*0.095+10}</Text>
                  </View>
               </View>)];
    }
    
    render() {
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        }  
        if(this.state.selectDeliveryAddress){
            return(<MapPage onSelectAddress={this.mapDone.bind(this)} onCancel={this.onCancelMap.bind(this)} eater={this.state.eater}/>);   
        }       
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <View style={styles.backButtonView}>
                       <TouchableHighlight onPress={() => this.navigateBackToDishList()}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </TouchableHighlight>
                    </View>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Shopping Cart</Text>
                    </View>
                    <View style={{flex:0.1/3,width:windowWidth/3}}>
                    </View>
               </View>

               <ListView style={styleShoppingCartPage.dishListView}
                    dataSource = {this.state.dataSource}
                    renderHeader={this.renderHeader.bind(this)}
                    renderRow={this.renderRow.bind(this) } 
                    renderFooter={this.renderFooter.bind(this)}/>
                    
               <TouchableHighlight onPress={() => this.navigateToPaymentPage() }>
               <View style={styleShoppingCartPage.checkOutButtonView}>
                   <Text style={styleShoppingCartPage.checkOutButtonText}>Check Out Now !</Text>
               </View>
               </TouchableHighlight>
            </View>
        );
    }
    
    mapDone(address){
         if(address){
             Alert.alert( '', 'Your delivery location is set to '+address.formatted_address,[ { text: 'OK' }]); 
         }
         this.setState({selectDeliveryAddress:false, deliveryAddress:address});
    }
    
   onCancelMap(){
         this.setState({selectDeliveryAddress:false});
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
    
    changeDeliveryAddress(){
        //todo: onSelect address list and assign it to deliveryAddress set State.
        //todo: shall we have a sepreate component for displaying saved addresses?
    }
    
    async navigateToPaymentPage(){
        if(!this.state.deliveryAddress){
            Alert.alert('Warning','You do not have a delivery address',[{ text: 'OK' }]);
            return;
        }
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
            orderDeliverTime: this.deliverTimestamp,
            eaterId: eater.eaterId,
            orderList: orderList,
            shippingAddress: this.state.deliveryAddress,
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

var styleShoppingCartPage = StyleSheet.create({
    chefShopNameView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight/14.72,
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
    },
    chefShopNameText:{
        color:'#ff9933',
        fontSize:windowHeight/36.8,
        fontWeight:'500',
        marginTop:windowHeight/73.6,
    },
    deliverTimeView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight/18.4,
    },
    deliverTimeText:{
        color:'#696969',
        fontSize:windowHeight/49.06,
        marginTop:windowHeight/73.6,
    },
    dishListView:{
        flex:1,
        backgroundColor:'#fff',
        flexDirection:'column',
    },
    subtotalView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        paddingTop:windowHeight/56.6,
        borderWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'center'
    },
    taxView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        paddingTop:windowHeight/56.6,
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'center'
    },
    deliveryFeeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        paddingTop:windowHeight/56.6,
        justifyContent:'center'
    },
    addressView:{
        marginLeft:windowWidth/9,
        flexDirection:'row',
        height:windowHeight/7.36,
        paddingTop:windowHeight/56.6,
        borderTopWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'flex-end'
    },
    promotionCodeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        paddingTop:windowHeight/56.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'center'
    },
    totalView:{
        flexDirection:'row',
        height:windowHeight/10,
        paddingHorizontal:windowWidth/27.6,
        paddingTop:windowHeight/20.0,
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'center'
    },
    totalPriceTitleText:{ 
        fontSize:windowHeight/36.8,
        fontWeight:'500',
    },
    totalPriceNumberText:{
        fontSize:windowHeight/36.66,
        fontWeight:'500',
    },
    addressTextView:{
        flex:0.6,
        flexDirection:'column',
    },
    addressLine:{
        color:'#696969',
        fontSize:windowHeight/49.06,
        marginTop:windowHeight/147.2,
    },
    addressChangeButtonWrapper:{
        width:windowWidth/3.18,
        height:windowWidth/3.18*3.0/13.0,
        borderColor:'#ff9933',
        borderWidth:1,
        borderRadius:6, 
        overflow: 'hidden', 
        marginBottom:windowHeight/24.53,
    },
    addressChangeButtonText:{
        fontSize:windowHeight/49.06,
        color:'#ff9933',
        fontWeight:'400',
        marginTop:windowHeight/147.2,
        alignSelf:'center',
    },
    addressChangeButtonView:{
        flex:0.4,
        flexDirection:'row',
        alignItems:'flex-end',
        marginLeft:3,
    },
    priceTitleView:{
        flex:1/2.0,
        alignItems:'flex-start',
    },
    priceTitleText:{ 
        fontSize:windowHeight/40.89,
        fontWeight:'500',
    },
    priceNumberView:{
        flex:1/2.0,
        alignItems:'flex-end',
    },
    priceNumberText:{
        fontSize:windowHeight/33.45,
        fontWeight:'500',
    },
    oneListingView:{
        backgroundColor:'#FFFFFF',  
        flexDirection:'row',
        flex:1,
    },
    dishPhoto:{
        width:windowWidth/2.76,
        height:windowWidth/2.76,
    },
    shoppingCartInfoView:{
        flex:1,
        height:windowWidth/2.76,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingVertical:windowHeight/73.6,
    },
    dishNamePriceView:{
        flex:1,
        flexDirection:'row', 
    },
    dishNameView:{
        flex:0.7,   
        alignItems:'flex-start',     
    },
    dishNameText:{
        fontSize:windowHeight/40.89,
        fontWeight:'500'
    },
    dishPriceView:{
        flex:0.3,
        alignItems:'flex-end',
    },
    dishPriceText:{
        fontSize:windowHeight/40.89,
        fontWeight:'600',
        color:'#808080',
    },
    dishDescriptionView:{
        height:windowHeight/10,  
    },
    quantityTotalPriceView:{
        flex:1,
        flexDirection:'row', 
    },
    quantityView:{
        flex:0.6,
        flexDirection:'row', 
        alignItems:'flex-start',
    },
    totalPriceView:{
        flex:0.4,
        alignItems:'flex-end',
    },
    totalPriceText:{
        fontSize:windowHeight/33.45,
        fontWeight:'500',
    },
    plusMinusIcon:{
        width: windowHeight/27.6, 
        height: windowHeight/27.6,
    },
    plusIconView:{
        marginRight:windowWidth/27.6,
    },
    minusIconView:{
        marginLeft:windowWidth/27.6,
    },
    quantityText:{
        marginTop:windowHeight/147.2,
        fontSize:windowHeight/46.0,
        fontWeight:'500',
        color:'#ff9933',
    },
    addPromoCodeIcon:{
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    checkOutButtonView:{
        height:windowHeight/13.38,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#ff9933',
    }, 
    checkOutButtonText:{
        fontSize:windowHeight/30.6,
        fontWeight:'300',
        color:'#fff',
        alignSelf:'center', 
    },
});

module.exports = ShoppingCartPage;

