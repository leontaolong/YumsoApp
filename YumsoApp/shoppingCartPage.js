var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
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
                            <Image source={require('./icons/icon-plus.png')} style={styleShoppingCartPage.plusMinusIcon}/>
                        </TouchableHighlight> 
                        <Text style={styleShoppingCartPage.quantityText}>{this.state.shoppingCart[dish.dishId]?this.state.shoppingCart[dish.dishId].quantity:'  '}</Text>          
                        <TouchableHighlight style={styleShoppingCartPage.minusIconView}
                            onPress={()=>this.removeFromShoppingCart(dish)}>                
                            <Image source={require('./icons/icon-minus.png')} style={styleShoppingCartPage.plusMinusIcon}/>
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
      
       return [(<View style={styleShoppingCartPage.totalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.totalPrice}</Text>
                  </View>
               </View>),
               (<View style={styleShoppingCartPage.totalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Tax</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>${this.state.totalPrice*0.095}</Text>
                  </View>
               </View>),
               (<View style={styleShoppingCartPage.totalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Delivery</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>$10</Text>
                  </View>
               </View>),
               (<View style={styleShoppingCartPage.totalView}>
                  <View style={styleShoppingCartPage.priceTitleView}>
                      <Text style={styleShoppingCartPage.priceTitleText}>Promotion Deduction</Text>
                  </View>
                  <View style={styleShoppingCartPage.priceNumberView}>
                      <Text style={styleShoppingCartPage.priceNumberText}>0</Text>
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
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <View style={styles.backButtonView}>
                       <TouchableHighlight onPress={() => this.navigateBackToDishList()}>
                          <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png')} style={styles.backButtonIcon}/>
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
                    renderRow={this.renderRow.bind(this) } 
                    renderFooter={this.renderFooter.bind(this)}/>
               <Text>Deliver time: {this.state.selectedTime}}</Text>
               <TouchableHighlight onPress={() => this.navigateToPaymentPage() }>
               <View style={styleShoppingCartPage.checkOutButtonView}>
                   <Text style={styleShoppingCartPage.checkOutButtonText}>Check Out Now!</Text>
               </View>
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

var styleShoppingCartPage = StyleSheet.create({
    dishListView:{
        flex:1,
        backgroundColor:'#fff',
        flexDirection:'column',
    },
    totalView:{
        flex:1,
        flexDirection:'row',
        paddingHorizontal:10,
        paddingVertical:30,
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
    },
    priceTitleView:{
        flex:1/2.0,
        alignItems:'flex-start',
    },
    priceTitleText:{ 
        fontSize:18,
        fontWeight:'600',
    },
    priceNumberView:{
        flex:1/2.0,
        alignItems:'flex-end',
    },
    priceNumberText:{
        fontSize:22,
        fontWeight:'600',
    },
    oneListingView:{
        backgroundColor:'#FFFFFF',  
        flexDirection:'row',
        flex:1,
    },
    dishPhoto:{
        width:150,
        height:150,
    },
    shoppingCartInfoView:{
        flex:1,
        flexDirection:'column',
        paddingHorizontal:20,
        paddingVertical:10,
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
        fontSize:18,
        fontWeight:'600'
    },
    dishPriceView:{
        flex:0.3,
        alignItems:'flex-end',
    },
    dishPriceText:{
        fontSize:18,
        fontWeight:'600',
        color:'#808080',
    },
    dishDescriptionView:{
        height:80,  
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
        fontSize:22,
        fontWeight:'600',
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
    quantityText:{
        marginTop:5,
        fontSize:16,
        fontWeight:'500',
        color:'#ff9933',
    },
    checkOutButtonView:{
        height:55,
        flex:1,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#ff9933',
        paddingTop:12,
    }, 
    checkOutButtonText:{
        fontSize:22,
        fontWeight:'600',
        color:'#fff',   
    },
    bowlIcon:{
        width:30,
        height:30,
    }
});

module.exports = ShoppingCartPage;

