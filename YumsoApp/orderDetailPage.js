'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
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

class ShoppingCartPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        let order = routeStack[routeStack.length-1].passProps.order;        
        
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(order.orderList)),
            showProgress:false,
            order:order,
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
    componentDidMount(){
        
    }
    
    renderHeader(){
        return[(<View style={styleShoppingCartPage.chefShopNameView}>
                    <Text style={styleShoppingCartPage.chefShopNameText}>{this.state.order.shopName}</Text>
                </View>),
               (<View style={styleShoppingCartPage.deliverTimeView}>
                    <Text style={styleShoppingCartPage.deliverTimeText}>Delivered at {dateRender.renderDate2(this.state.order.orderDeliverTime)}</Text>
                </View>)]
    }
    
    renderRow(orderItem){
        let imageSrc =require('./ok.jpeg') ;
        if(orderItem.dishDetail && orderItem.dishDetail.pictures && orderItem.dishDetail.pictures.length!=0){
            imageSrc={uri:orderItem.dishDetail.pictures[0]};   
        } 
        return (
            <View key={orderItem.dishDetail.dishId} style={styleShoppingCartPage.oneListingView}>
                <Image source={imageSrc} style={styleShoppingCartPage.dishPhoto}/>
                <View style={styleShoppingCartPage.shoppingCartInfoView}>
                    <View style={styleShoppingCartPage.dishNamePriceView}>
                      <View style={styleShoppingCartPage.dishNameView}>
                        <Text style={styleShoppingCartPage.dishNameText}>{orderItem.dishName}</Text>
                      </View>                      
                    </View> 
                                                             
                    <View style={styleShoppingCartPage.dishIngredientView}>
                       <Text style={styleShoppingCartPage.dishIngredientText}>{orderItem.dishDetail.ingredients}</Text>
                    </View>
                    
                    <Text style={styleShoppingCartPage.dishPriceText}>${orderItem.price}</Text>                                          
                    <Text style={styleShoppingCartPage.dishIngredientText}>Quantity: {orderItem.quantity}</Text>                                        
                </View>
            </View>
        );
    }
    
    renderFooter(){
        return [];
    //    return [(<View style={styleShoppingCartPage.subtotalView}>
    //               <View style={styleShoppingCartPage.priceTitleView}>
    //                   <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
    //               </View>
    //               <View style={styleShoppingCartPage.priceNumberView}>
    //                   <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.subTotal}</Text>
    //               </View>
    //            </View>),
    //            (<View style={styleShoppingCartPage.deliveryFeeView}>
    //               <View style={styleShoppingCartPage.priceTitleView}>
    //                   <Text style={styleShoppingCartPage.priceTitleText}>Delivery</Text>
    //               </View>
    //               <View style={styleShoppingCartPage.priceNumberView}>
    //                   <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.deliveryFee}</Text>
    //               </View>
    //            </View>),
    //            (<View style={styleShoppingCartPage.addressView}>
    //               <View style={styleShoppingCartPage.addressTextView}>
    //                   <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined?this.state.deliveryAddress.formatted_address.replace(/,/g, '').split(this.state.deliveryAddress.city)[0]:''}</Text>
    //                   <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined?this.state.deliveryAddress.city:''} {this.state.deliveryAddress!=null?this.state.deliveryAddress.state:''}</Text>
    //                   <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined?this.state.deliveryAddress.postal:''}</Text>
    //               </View> 
    //            </View>),
    //            (<View style={styleShoppingCartPage.taxView}>
    //               <View style={styleShoppingCartPage.priceTitleView}>
    //                   <Text style={styleShoppingCartPage.priceTitleText}>Tax</Text>
    //               </View>
    //               <View style={styleShoppingCartPage.priceNumberView}>
    //                   <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.tax}</Text>
    //               </View>
    //            </View>),
    //            (<View style={styleShoppingCartPage.totalView}>
    //               <View style={styleShoppingCartPage.priceTitleView}>
    //                   <Text style={styleShoppingCartPage.totalPriceTitleText}>Total</Text>
    //               </View>
    //               <View style={styleShoppingCartPage.priceNumberView}>
    //                   <Text style={styleShoppingCartPage.totalPriceNumberText}>${this.state.quotedOrder.price.grandTotal}</Text>
    //               </View>
    //            </View>)];
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
                       <TouchableHighlight style={styles.backButtonView} underlayColor={'#ECECEC'} onPress={() => this.navigateBackToDishList()}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </TouchableHighlight>
                    </View>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Order Details</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
               </View>

               <ListView style={styleShoppingCartPage.dishListView}
                    dataSource = {this.state.dataSource}
                    renderHeader={this.renderHeader.bind(this)}
                    renderRow={this.renderRow.bind(this) } 
                    renderFooter={this.renderFooter.bind(this)}/>
            </View>
        );
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
        borderTopWidth:1,
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
        height:20,
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
    dishIngredientView:{
        flex:1,
        height:50,  
    },
    dishIngredientText:{
        fontSize:12,
        color:'#9B9B9B',
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
    quantityText:{
        marginTop:windowHeight/147.2,
        fontSize:windowHeight/46.0,
        fontWeight:'500',
        color:'#ff9933',
    },
});

module.exports = ShoppingCartPage;

