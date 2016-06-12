'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var MapPage = require('./mapPage');
var plusIcon = require('./icons/icon-plus.png');
var minusIcon = require('./icons/icon-minus.png');
var backIcon = require('./icons/icon-back.png');
var addPromoCodeIcon = require('./icons/icon-add.png');
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
        let scheduleMapping = routeStack[routeStack.length-1].passProps.scheduleMapping;        
        this.defaultDeliveryAddress = routeStack[routeStack.length-1].passProps.defaultDeliveryAddress;
        let shopName = routeStack[routeStack.length-1].passProps.shopName;
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(shoppingCart[selectedTime])),
            showProgress:false,
            scheduleMapping: scheduleMapping,           
            shoppingCart:shoppingCart,
            selectedTime:selectedTime,
            deliveryAddress: Object.keys(this.defaultDeliveryAddress).length===0?undefined:this.defaultDeliveryAddress,
            chefId:chefId,
            selectDeliveryAddress:false,
            shopName:shopName,
            eater:eater,
            priceIsConfirmed:false,
            showPromotionCodeInput:false,
            phoneNumber:eater? eater.phoneNumber:undefined,
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
    componentDidMount(){
        this.getTotalPrice();    
    }
    
    renderHeader(){
        return[(<View key={'chefShopNameView'} style={styleShoppingCartPage.chefShopNameView}>
                    <Text style={styleShoppingCartPage.chefShopNameText}>{this.state.shopName}</Text>
                </View>),
               (<View key={'deliverTimeView'} style={styleShoppingCartPage.deliverTimeView}>
                    <Text style={styleShoppingCartPage.deliverTimeText}>To be delivered at {dateRender.renderDate2(this.state.selectedTime)}</Text>
                </View>)
              ]
    }
    
    renderRow(cartItem){
        var dish = cartItem.dish;
        var quantity = cartItem.quantity;
        let imageSrc =require('./icons/dishImageUnavailable.png') ;
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
                     
                    <View style={styleShoppingCartPage.dishIngredientView}>
                       <Text style={styleShoppingCartPage.dishIngredientText}>{this.getTextLengthLimited(dish.ingredients,43)}</Text>
                    </View>
                    
                    <View style={styleShoppingCartPage.quantityTotalPriceView}>
                      <View style={styleShoppingCartPage.quantityView}>
                        <TouchableHighlight style={styleShoppingCartPage.plusIconView} underlayColor={'transparent'}
                            onPress={()=>this.addToShoppingCart(dish)}>
                            <Image source={plusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                        </TouchableHighlight> 
                        <Text style={styleShoppingCartPage.quantityText}>{this.state.shoppingCart[this.state.selectedTime][dish.dishId]?this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity:'  '}</Text>          
                        <TouchableHighlight style={styleShoppingCartPage.minusIconView} underlayColor={'transparent'}
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
       if(!this.state.priceIsConfirmed){
       return [(<View key={'subtotalView'} style={styleShoppingCartPage.subtotalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.totalPrice}</Text>
                  </View>
               </View>),
               (<View key={'addressView'} style={styleShoppingCartPage.addressView}>
                  <View style={styleShoppingCartPage.addressTextView}>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined ? this.state.deliveryAddress.formatted_address.replace(/,/g, '').split(this.state.deliveryAddress.city)[0]:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined ? this.state.deliveryAddress.city:''} {this.state.deliveryAddress!=null?this.state.deliveryAddress.state:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined ? this.state.deliveryAddress.postal:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.apartmentNumber ? 'Apt/Suite# ' + this.state.deliveryAddress.apartmentNumber:''}</Text>
                  </View>
                  <View style={styleShoppingCartPage.addressChangeButtonView}>
                     <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.addressChangeButtonWrapper} onPress={()=>this.setState({selectDeliveryAddress:true})}>
                        <Text style={styleShoppingCartPage.addressChangeButtonText}>{this.state.deliveryAddress==undefined?'Add Address': 'Change Address'}</Text>
                     </TouchableHighlight>
                  </View>
               </View>)];
       }
       
       if(this.state.showPromotionCodeInput){
          var promotionCodeInputView = <View key={'promotionCodeInputView'} style={styleShoppingCartPage.promoCodeInputView}>   
                                         <TextInput style={styleShoppingCartPage.promoCodeInput} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                         onChangeText = {(text) => this.setState({ promotionCode: text }) }/>
                                       </View>;
       }else{
          var promotionCodeInputView =  <TouchableHighlight key={'promotionCodeInputView'} style={styleShoppingCartPage.priceNumberView} underlayColor={'transparent'} onPress={()=>this.setState({showPromotionCodeInput:true})}>
                                           <Image source={addPromoCodeIcon} style={styleShoppingCartPage.addPromoCodeIcon}/>
                                        </TouchableHighlight>;
       }
       
       var promotionDeductionView=null;
       if(this.state.quotedOrder.price.couponValue){
           promotionDeductionView=(<View key={'promotionDeductionView'} style={styleShoppingCartPage.promotionDeductionView}>
                                        <View style={styleShoppingCartPage.priceTitleView}>
                                            <Text style={styleShoppingCartPage.priceTitleText}>Coupon Deduction</Text>
                                        </View>
                                        <View style={styleShoppingCartPage.priceNumberView}>
                                            <Text style={styleShoppingCartPage.priceNumberText}>-${this.state.quotedOrder.price.couponValue}</Text>
                                        </View>
                                   </View>);
       }
        
       return [(<View key={'subtotalView'} style={styleShoppingCartPage.subtotalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.subTotal}</Text>
                  </View>
               </View>),
               promotionDeductionView,
               (<View key={'deliveryFeeView'} style={styleShoppingCartPage.deliveryFeeView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Delivery</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.deliveryFee}</Text>
                  </View>
               </View>),
               (<View key={'addressView'} style={styleShoppingCartPage.addressView}>
                  <View style={styleShoppingCartPage.addressTextView}>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined ? this.state.deliveryAddress.formatted_address.replace(/,/g, '').split(this.state.deliveryAddress.city)[0]:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined ? this.state.deliveryAddress.city:''} {this.state.deliveryAddress!=null?this.state.deliveryAddress.state:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined ? this.state.deliveryAddress.postal:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.apartmentNumber ? 'Apt/Suite# ' + this.state.deliveryAddress.apartmentNumber:''}</Text>
                      <Text style={styleShoppingCartPage.addressLine}>Phone </Text>
                      <View style={styleShoppingCartPage.phoneNumberInputView}>                       
                        <TextInput style={styleShoppingCartPage.phoneNumberInput} placeholder={this.state.eater && this.state.eater.phoneNumber? this.state.eater.phoneNumber:''} placeholderTextColor='#4A4A4A' clearButtonMode={'while-editing'} 
                        returnKeyType = {'done'} keyboardType = { 'phone-pad'} onChangeText = {(text) => this.setState({ phoneNumber: text }) }/> 
                      </View>
                  </View>
                  <View style={styleShoppingCartPage.addressChangeButtonView}>
                     <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.addressChangeButtonWrapper} onPress={()=>this.setState({selectDeliveryAddress:true})}>
                        <Text style={styleShoppingCartPage.addressChangeButtonText}>{this.state.deliveryAddress==undefined?'Add delivery address': 'Change Address'}</Text>
                     </TouchableHighlight>
                  </View>                      
               </View>),
               (<View key={'taxView'} style={styleShoppingCartPage.taxView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Tax</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.tax}</Text>
                  </View>
               </View>),
               (<View key={'promotionCodeView'} style={styleShoppingCartPage.promotionCodeView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Promotion Code</Text>
                  </View>
                 {promotionCodeInputView}
               </View>),
               (<View key={'totalView'} style={styleShoppingCartPage.totalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.totalPriceTitleText}>Total</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.totalPriceNumberText}>${this.state.quotedOrder.price.grandTotal}</Text>
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
            return(<MapPage onSelectAddress={this.mapDone.bind(this)} onCancel={this.onCancelMap.bind(this)} eater={this.state.eater} specificAddressMode={true}/>);   
        }       
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <View style={styles.headerLeftView}>
                       <TouchableHighlight style={styles.backButtonView} underlayColor={'#ECECEC'} onPress={() => this.navigateBackToDishList()}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </TouchableHighlight>
                    </View>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Shopping Cart</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
               </View>

               <ListView style={styleShoppingCartPage.dishListView}
                    dataSource = {this.state.dataSource}
                    renderHeader={this.renderHeader.bind(this)}
                    renderRow={this.renderRow.bind(this) } 
                    renderFooter={this.renderFooter.bind(this)}/>
               <View style={styleShoppingCartPage.bottomButtonView}>
                    <TouchableHighlight onPress={() => this.getPrice() }>
                        <View style={styleShoppingCartPage.getPriceButtonView}>
                            <Text style={styleShoppingCartPage.bottomButtonText}>Get Price</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight onPress={() => this.navigateToPaymentPage() }>
                        <View style={styleShoppingCartPage.checkOutButtonView}>
                            <Text style={styleShoppingCartPage.bottomButtonText}>Pay Now</Text>
                        </View>
                    </TouchableHighlight>
               </View>
            </View>
        );
    }
    
    mapDone(address){
         if(address){
             Alert.alert( '', 'Your delivery location is set to '+address.formatted_address,[ { text: 'OK' }]); 
         }
         if(this.state.deliveryAddress && this.state.deliveryAddress.formatted_address!==address.formatted_address){
             this.setState({priceIsConfirmed:false});
         }
         this.setState({selectDeliveryAddress:false, deliveryAddress:address});
    }
    
    onCancelMap(){
         this.setState({selectDeliveryAddress:false});
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
    
    getTotalPrice(){
        var total = 0;
        var deliverTime = this.state.selectedTime;
        for(var cartItemId in this.state.shoppingCart[deliverTime]){
            var cartItem = this.state.shoppingCart[deliverTime][cartItemId];
            total+=cartItem.dish.price * cartItem.quantity;
        }
        let newShoppingCart = JSON.parse(JSON.stringify(this.state.shoppingCart));
        this.setState({shoppingCart:this.state.shoppingCart, totalPrice:total, priceIsConfirmed:false, dataSource:this.state.dataSource.cloneWithRows(newShoppingCart[this.state.selectedTime])});
    }    
    
    changeDeliveryAddress(){
        //todo: onSelect address list and assign it to deliveryAddress set State.
        //todo: shall we have a sepreate component for displaying saved addresses?
    }
    
    getPrice(){
        if(!this.state.deliveryAddress){
            Alert.alert('Warning','You do not have a delivery address',[{ text: 'OK' }]);
            return;         
        }else{
            let address = this.state.deliveryAddress; //todo: do this or should just make a disapear? which better UX?
            if (address.streetName === 'unknown' || address.streetNumber === 'unknown' || address.city == 'unknown' || address.state == 'unknown' || address.postal == 'unknown') {
                Alert.alert('Warning', 'Pleas set a specific location for delivery. The current address is only approximate', [{ text: 'OK' }]);
                return;
            }            
        }
        if(!this.state.shoppingCart  || !this.state.shoppingCart[this.state.selectedTime] || Object.keys(this.state.shoppingCart[this.state.selectedTime]).length===0){
            Alert.alert('Warning','You do not have any items',[{ text: 'OK' }]);         
            return; 
        }
        this.setState({showProgress:true});
        var orderList = {};
        for (var cartItemKey in this.state.shoppingCart[this.state.selectedTime]) {
            var dishItem = this.state.shoppingCart[this.state.selectedTime][cartItemKey];
            orderList[cartItemKey] = { quantity: dishItem.quantity, price: dishItem.dish.price };
        }
        var orderQuote = {
            chefId: this.state.chefId,
            orderDeliverTime: this.deliverTimestamp,
            orderList: orderList,
            shippingAddress: this.state.deliveryAddress,
            couponCode:this.state.promotionCode,
        }; 
        return this.client.postWithoutAuth(config.priceQuoteEndpoint, {orderDetail:orderQuote})
        .then((response)=>{
            if(response.statusCode==200){
                if(response.data.result===true){
                    console.log(response.data.detail.orderQuote)
                    this.setState({quotedOrder:response.data.detail.orderQuote, priceIsConfirmed:true});
                }else{
                   console.log(response.data.detail);
                   //todo: show user the detail;  response.data.detail.problems; 
                }
            }else{
                console.log(response.data);
                Alert.alert('Warning', 'Price quote failed. Please make sure delivery location is reachable.', [{ text: 'OK' }]);
                //todo: more specific
                this.setState({priceIsConfirmed:false});
            }
            this.setState({showProgress:false});        
        });

    }
    
    async navigateToPaymentPage(){
        if(!this.state.priceIsConfirmed){
            return;
        }
        // if(!this.state.deliveryAddress){
        //     Alert.alert('Warning','You do not have a delivery address',[{ text: 'OK' }]);
        //     return;
        // }
        // if(!this.state.shoppingCart || Object.keys(this.state.shoppingCart).length==0){
        //     Alert.alert('Warning','You do not have any item in your shopping cart',[{ text: 'OK' }]);
        //     return;
        // }
        let eater = this.state.eater;
        if(!eater){
            eater = await AuthService.getEater();
        }
        if (!eater) {
            this.props.navigator.push({
                name: 'LoginPage',
                passProps: {
                    callback: function (eater) {
                        this.setState({ eater: eater });
                    }.bind(this)
                }
            });  
            return;
        }
        
        if(!this.state.phoneNumber){
           this.setState({phoneNumber:eater.phoneNumber});
        }
        //todo: Best practise is not to get eater here but cache it somewhere, but have to ensure the cached user is indeed not expired.              
        if(!this.state.phoneNumber){
            Alert.alert('Warning','Please add a phone number',[{ text: 'OK' }]);
            return;
        }
        var orderList ={};
        for(var cartItemKey in this.state.shoppingCart[this.state.selectedTime]){
            var dishItem=this.state.shoppingCart[this.state.selectedTime][cartItemKey];
            orderList[cartItemKey]={quantity:dishItem.quantity, price:dishItem.dish.price};
        }
        var order = this.state.quotedOrder;
        order.quotedGrandTotal = this.state.quotedOrder.price.grandTotal;
        order.eaterId = eater.eaterId;
        order.notesToChef = 'Please put less salt';
        console.log(order);
        this.props.navigator.push({
            name: 'PaymentPage', 
            passProps:{
                orderDetail: order,
                eater: this.state.eater
            }
        });    
    }
    
    getTextLengthLimited(text,lengthLimit){
        if(text.length<=lengthLimit){
           return text;
        }else{
           var shortenedText = text.substr(0,lengthLimit-1);
           var betterShortenedText = shortenedText.substr(0,Math.max(shortenedText.lastIndexOf(' '),shortenedText.lastIndexOf(','),shortenedText.lastIndexOf(';'),shortenedText.lastIndexOf('|')));
           return betterShortenedText ? betterShortenedText + '...' : shortenedText+'...';
        }
    }
    
    navigateBackToDishList(){
        if(this.state.deliveryAddress){
            for(var key in this.state.deliveryAddress){
                this.defaultDeliveryAddress[key] = this.state.deliveryAddress[key];
            }
        }
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
        color:'#FFCC33',
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
        color:'#4A4A4A',
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
        borderWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'center'
    },
    taxView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderTopWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'center',
    },
    promotionDeductionView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
        justifyContent:'center',
    },
    deliveryFeeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        justifyContent:'center'
    },
    addressView:{
        marginLeft:windowWidth/9,
        flexDirection:'row',
        flex:1,
        paddingVertical:10,
        justifyContent:'flex-end'
    },
    phoneNumberInputView:{
        height:25,
        flexDirection:'row',
        borderColor:'#D7D7D7',
        borderWidth:1,
        borderRadius:5,
        marginTop:windowHeight/147.2,
        width:windowWidth*0.4,
    },
    phoneNumberInput:{
        paddingLeft:7,
        fontSize:14,
        color:'#4A4A4A',
        width:windowWidth*0.4,  
    },
    promoCodeInputView:{
        height:25,
        flexDirection:'row',
        borderColor:'#D7D7D7',
        borderWidth:1,
        borderRadius:5,
        width:windowWidth*0.55,
        alignSelf:'center',
    },
    promoCodeInput:{
        paddingLeft:7,
        fontSize:14,
        color:'#4A4A4A', 
        width:windowWidth*0.55,     
    },
    promotionCodeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
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
        color:'#4A4A4A',
    },
    totalPriceNumberText:{
        fontSize:windowHeight/36.66,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    addressTextView:{
        flex:0.57,
        flexDirection:'column',
    },
    addressLine:{
        color:'#696969',
        fontSize:windowHeight/49.06,
        marginTop:windowHeight/147.2,
    },
    addressChangeButtonWrapper:{
        width:windowWidth*0.34375,
        height:windowWidth*0.34375*3.0/13.0,
        borderColor:'#ffcc33',
        borderWidth:1,
        borderRadius:6, 
        overflow: 'hidden', 
        alignSelf:'flex-start',
        justifyContent:'center',
        marginRight:windowWidth*0.003,
    },
    addressChangeButtonText:{
        fontSize:windowHeight/49.06,
        color:'#ffcc33',
        fontWeight:'500',
        alignSelf:'center',  
    },
    addressChangeButtonView:{
        flex:0.43,
        flexDirection:'row',
        alignItems:'flex-end',     
    },
    priceTitleView:{
        flex:1/2.0,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    priceTitleText:{ 
        fontSize:windowHeight/40.89,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    priceNumberView:{
        flex:1/2.0,
        alignItems:'flex-end',
        alignSelf:'center',
    },
    priceNumberText:{
        fontSize:windowHeight/33.45,
        fontWeight:'500',
        color:'#4A4A4A',
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
        height:20,
        flexDirection:'row', 
    },
    dishNameView:{
        flex:0.7,   
        alignItems:'flex-start',     
    },
    dishNameText:{
        fontSize:windowHeight/40.89,
        fontWeight:'500',
        color:'#4A4A4A'
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
    dishIngredientView:{
        height:windowHeight*0.0968,  
    },
    dishIngredientText:{
        fontSize:windowHeight/47.33,
        color:'#9B9B9B',
    },
    quantityTotalPriceView:{
        flex:1,
        flexDirection:'row', 
    },
    quantityView:{
        flex:0.2,
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
        color:'#4A4A4A'
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
        color:'#ffcc33',
    },
    addPromoCodeIcon:{
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    bottomButtonView:{
        height:windowHeight*0.074,
        flexDirection:'row',        
        backgroundColor:'#FFCC33',
        position:'absolute',
        left: 0, 
        right: 0,
        top:windowHeight-windowHeight*0.074,
    }, 
    getPriceButtonView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#FFCC33',
    },
    checkOutButtonView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#FFCC33',
    }, 
    bottomButtonText:{
        fontSize:windowHeight/30.6,
        fontWeight:'300',
        color:'#fff',
        alignSelf:'center', 
    },
});

module.exports = ShoppingCartPage;

