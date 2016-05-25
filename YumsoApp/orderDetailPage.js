'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var ratingIconGrey = require('./icons/icon-rating-grey.png');
var ratingIconOrange = require('./icons/icon-rating-orange.png');
var deleteBannerIcon = require('./icons/icon-x.png')
import Dimensions from 'Dimensions';
import {KeyboardAwareListView} from 'react-native-keyboard-aware-scroll-view';

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
            starRating:order.comment? order.comment.starRating : '',
            comment:order.comment? order.comment.eaterComment : '',            
            commentTime:order.comment? order.comment.eaterCommentTime : '',
            showDeliverTimeView:true,
            ratingSucceed:false,
            ratingIcon1:order.comment? (order.comment.starRating && order.comment.starRating>=1 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon2:order.comment? (order.comment.starRating && order.comment.starRating>=2 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon3:order.comment? (order.comment.starRating && order.comment.starRating>=3 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon4:order.comment? (order.comment.starRating && order.comment.starRating>=4 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon5:order.comment? (order.comment.starRating && order.comment.starRating>=5 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
        };
        this.client = new HttpsClient(config.baseUrl, true);
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
        if(this.state.order.comment && this.state.order.comment.starRating){
           var commentBoxView = <View style={styleShoppingCartPage.commentBox}>
                                  <View style={styleShoppingCartPage.ratingView}>
                                      <Image source={this.state.ratingIcon1} style={styleShoppingCartPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon2} style={styleShoppingCartPage.ratingIcon}/>                                    
                                      <Image source={this.state.ratingIcon3} style={styleShoppingCartPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon4} style={styleShoppingCartPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon5} style={styleShoppingCartPage.ratingIcon}/>
                                  </View>
                                  <Text style={styleShoppingCartPage.commentText}>{this.state.order.comment.eaterComment ? this.state.order.comment.eaterComment :'No comment'}</Text>
                               </View>
        }else if(this.state.ratingSucceed){
          var commentBoxView = <View style={styleShoppingCartPage.commentBox}>
                                  <View style={styleShoppingCartPage.ratingView}>
                                      <Image source={this.state.ratingIcon1} style={styleShoppingCartPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon2} style={styleShoppingCartPage.ratingIcon}/>                                    
                                      <Image source={this.state.ratingIcon3} style={styleShoppingCartPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon4} style={styleShoppingCartPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon5} style={styleShoppingCartPage.ratingIcon}/>
                                  </View>
                                  <Text style={styleShoppingCartPage.commentText}>{this.state.comment.trim() ? this.state.comment :'No comment'}</Text>
                               </View>
        }else{
           var commentBoxView = <View style={styleShoppingCartPage.commentBox}>
                                  <View style={styleShoppingCartPage.ratingView}>
                                     <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(1)}>
                                      <Image source={this.state.ratingIcon1} style={styleShoppingCartPage.ratingIcon}/>
                                     </TouchableHighlight>
                                     <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(2)}>
                                      <Image source={this.state.ratingIcon2} style={styleShoppingCartPage.ratingIcon}/>
                                     </TouchableHighlight>
                                     <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(3)}>
                                      <Image source={this.state.ratingIcon3} style={styleShoppingCartPage.ratingIcon}/>
                                     </TouchableHighlight>
                                     <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(4)}>
                                      <Image source={this.state.ratingIcon4} style={styleShoppingCartPage.ratingIcon}/>
                                     </TouchableHighlight>
                                     <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(5)}>
                                      <Image source={this.state.ratingIcon5} style={styleShoppingCartPage.ratingIcon}/>
                                     </TouchableHighlight>
                                  </View>
                                  <TextInput placeholder="Leave your comment here" style={styleShoppingCartPage.commentInput} multiline={true} returnKeyType = {'done'} autoCorrect={false} onChangeText = {(text) => this.setState({ comment: text }) }/>                                     
                                  <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.submitCommentButton} onPress={()=>this.submitComment()}>
                                        <Text style={styleShoppingCartPage.submitCommentButtonText}>Submit</Text>    
                                  </TouchableHighlight>
                               </View>
        }
                
        return commentBoxView;                                                 
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

        if(this.state.showDeliverTimeView){
          var deliverTimeView = (<View style={styleShoppingCartPage.deliverTimeView}>
                                    <Text style={styleShoppingCartPage.deliverTimeText}>Your order is delivered at {dateRender.renderDate2(this.state.order.orderDeliverTime)}</Text>
                                    <TouchableHighlight style={styleShoppingCartPage.deleteBannerIconView} underlayColor={'transparent'} onPress={()=>this.setState({showDeliverTimeView:false})}>
                                       <Image source={deleteBannerIcon} style={styleShoppingCartPage.deleteBannerIcon} />
                                    </TouchableHighlight>
                                 </View>);
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
               {deliverTimeView}
               <KeyboardAwareListView style={styleShoppingCartPage.dishListView}
                    ref={'scroll'}        
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } 
                    renderFooter={this.renderFooter.bind(this)}/>
            </View>
        );
    }
    
    submitComment(){
        var self = this;
        if (!this.state.starRating) {
            Alert.alert('','Please rate the order',[{ text: 'OK' }]);
            return;
        }
        var data = {
            chefId: this.state.order.chefId,
            orderId: this.state.order.orderId,
            eaterId: this.state.order.eaterId,
            commentText: this.state.comment,
            starRating: Number(this.state.starRating)
        };
        return this.client.postWithAuth(config.leaveEaterCommentEndpoint,data)
        .then((res)=>{
            if(res.statusCode===200){
               Alert.alert('Success','Comment is left for this order',[{ text: 'OK' }]);    
            }  
            self.setState({ratingSucceed:true, starRating:data.starRating, comment:data.commentText, eaterCommentTime:new Date().getTime()});     
        });
    }
    
    pressedRatingIcon(rating){
       if(rating>=1){
          this.setState({ratingIcon1:ratingIconOrange});
       }else{
          this.setState({ratingIcon1:ratingIconGrey});
       }

       if(rating>=2){
          this.setState({ratingIcon2:ratingIconOrange});
       }else{
          this.setState({ratingIcon2:ratingIconGrey});
       }

       if(rating>=3){
          this.setState({ratingIcon3:ratingIconOrange});
       }else{
          this.setState({ratingIcon3:ratingIconGrey});
       }

       if(rating>=4){
          this.setState({ratingIcon4:ratingIconOrange});
       }else{
          this.setState({ratingIcon4:ratingIconGrey});
       }

       if(rating>=5){
          this.setState({ratingIcon5:ratingIconOrange});
       }else{
          this.setState({ratingIcon5:ratingIconGrey});
       }

       this.setState({ starRating: rating})
    }   
      
    navigateBackToDishList(){
        this.props.navigator.pop();
    }
    
    _scrollToInput (event, reactNode) {
        this.refs.scroll.scrollToFocusedInput(event, reactNode);
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
        justifyContent:'space-around',
        height:windowHeight*0.0974,
        borderColor:'#F5F5F5',
        borderBottomWidth:windowHeight*0.007,
        backgroundColor:'#FFCC33'
    },
    deliverTimeText:{
        color:'#FFFFFF',
        fontWeight:'bold',
        fontSize:windowHeight/49.06,
        alignSelf:'center',
    },
    deleteBannerIcon:{
       width:windowHeight*0.0528,
       height:windowHeight*0.0528,
    },
    deleteBannerIconView:{
       alignSelf:'center',
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
        borderColor:'#F5F5F5',
        borderBottomWidth:windowHeight*0.007,
    },
    dishPhoto:{
        width:windowWidth*0.344,
        height:windowWidth*0.344,
    },
    shoppingCartInfoView:{
        flex:1,
        height:windowWidth*0.344,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingVertical:windowHeight/73.6,
    },
    dishNamePriceView:{
        height:windowHeight*0.03522,
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
        color:'#F8C84E',
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
    commentBox:{
        alignSelf:'center',
        backgroundColor:'#F5F5F5',
        width:windowWidth*0.93,
        marginTop:24,
    },
    submitCommentButton:{
        backgroundColor:'#FFCC33',
        height:windowHeight*0.058,
        justifyContent:'center',
    },
    submitCommentButtonText:{
        color:'#FFF',
        fontWeight:'bold',
        alignSelf:'center',
    },
    ratingView:{
        height:40,
        justifyContent:'flex-start',
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
        marginHorizontal:10,
    },
    commentInput:{
        height:90, 
        padding:15,
        fontSize:14,       
    },
    commentText:{
        padding:15,
        fontSize:14,
        color:'#A7A7A7',
    },
    ratingIconWrapper:{
        alignSelf:'center',
    },
    ratingIcon:{
        width:35,
        height:35,        
    },
});

module.exports = ShoppingCartPage;

