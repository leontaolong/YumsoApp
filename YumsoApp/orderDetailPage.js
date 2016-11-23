'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var ratingIconGrey = require('./icons/icon-rating-grey.png');
var ratingIconOrange = require('./icons/icon-rating-orange.png');
var refreshIcon = require('./icons/icon-refresh-orange.png');
var deleteBannerIcon = require('./icons/icon-x.png');
var defaultDishPic = require('./icons/defaultAvatar.jpg');
var commonAlert = require('./commonModules/commonAlert');
var RefreshableListView = require('react-native-refreshable-listview');
var commonWidget = require('./commonModules/commonWidget');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')

import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 280 //Todo: get keyboard size programmatically.

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
  Linking
} from 'react-native';


class OrderDetailPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        let order = routeStack[routeStack.length-1].passProps.order;        
        let eater = routeStack[routeStack.length-1].passProps.eater;        
        this.callback = routeStack[routeStack.length-1].passProps.callback;
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(order.orderList)),
            showProgress:false,
            order:order,
            orderStatus:order.orderStatus,
            starRating:order.comment? order.comment.starRating : '',
            comment:order.comment? order.comment.eaterComment : '',            
            commentTime:order.comment? order.comment.eaterCommentTime : '',
            showDeliverStatusView:true,
            ratingSucceed:false,
            ratingIcon1:order.comment? (order.comment.starRating && order.comment.starRating>=1 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon2:order.comment? (order.comment.starRating && order.comment.starRating>=2 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon3:order.comment? (order.comment.starRating && order.comment.starRating>=3 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon4:order.comment? (order.comment.starRating && order.comment.starRating>=4 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon5:order.comment? (order.comment.starRating && order.comment.starRating>=5 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
        };
        this.client = new HttpsClient(config.baseUrl, true);
        this.responseHandler = function (response, msg) {
            if(response.statusCode==400){
                 Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);              
            }else if (response.statusCode === 401) {
                return AuthService.logOut()
                    .then(() => {
                        delete this.state.eater;
                        this.props.navigator.push({
                            name: 'LoginPage',
                            passProps: {
                                callback: function (eater) {
                                    this.setState({ eater: eater });
                                }.bind(this)
                            }
                        });
                    });
            } else {
                 Alert.alert( 'Network or server error', 'Please try again later',[ { text: 'OK' }]);   
            }
        };
    }    
    async fetchOrderDetail(){
        this.setState({showProgress: true});
        try{
          var response = await this.client.getWithAuth(config.getOneOrderEndpoint+this.state.order.chefId+'/'+this.state.order.orderId);
          if (response && response.statusCode != 200 && response.statusCode != 202) {
              this.setState({showProgress:false});
              return this.responseHandler(response);
          }
          if (response && response.data && response.data.order){
              this.setState({showProgress:false,showNetworkUnavailableScreen:false});
              this.state.order['orderStatus']=response.data.order.orderStatus;
              this.state.order['orderDeliverTime']=response.data.order.orderDeliverTime;
              this.setState({dataSource:new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2}).cloneWithRows(this.state.order.orderList)});
          }
        }catch(err){
          this.setState({showProgress: false,showNetworkUnavailableScreen:true});
          commonAlert.networkError(err);
          return;
        }
    }
            
    renderRow(orderItem){
        let imageSrc = defaultDishPic;
        if(orderItem.dishDetail && orderItem.dishDetail.pictures && orderItem.dishDetail.pictures.length!=0){
            imageSrc={uri:orderItem.dishDetail.pictures[0]};   
        } 
        return (
            <View key={orderItem.dishDetail.dishId} style={styleOrderDetailPage.oneListingView}>
                <Image source={imageSrc} style={styleOrderDetailPage.dishPhoto}/>
                <View style={styleOrderDetailPage.orderInfoView}>
                    <Text style={styleOrderDetailPage.dishNameText}>{orderItem.dishName}</Text>                             
                    <View style={styleOrderDetailPage.dishIngredientView}>
                       <Text style={styleOrderDetailPage.dishIngredientText}>{commonWidget.getTextLengthLimited(orderItem.dishDetail.ingredients,43)}</Text>
                    </View>                  
                    <Text style={styleOrderDetailPage.dishPriceText}>${orderItem.price}</Text>                                          
                    <Text style={styleOrderDetailPage.dishIngredientText}>Quantity: {orderItem.quantity}</Text>                                        
                </View>
            </View>
        );
    }
    
    renderHeader(){
        //Render 'delivered' status
        var ETAView=null;
        if(this.state.showDeliverStatusView){  
           if(this.state.order.orderStatus.toLowerCase()=='delivered'){
              var deliverTimeView = (<View key={'deliverTimeView'} style={styleOrderDetailPage.deliverTimeView}>
                                        <Text style={styleOrderDetailPage.deliverTimeText}>
                                           Your order was delivered at {dateRender.renderDate2(this.state.order.orderStatusModifiedTime)}
                                        </Text>
                                     </View>);
           }else if(this.state.order.orderStatus.toLowerCase()=='cancelled'){
              var deliverTimeView = (<View key={'deliverTimeView'} style={styleOrderDetailPage.deliverTimeView}>
                                        <Text style={styleOrderDetailPage.deliverTimeText}>Your order has been cancelled</Text>
                                     </View>);
           }else{
                //Render 'Order received' status 
               var currentTime = new Date().getTime();
               if(this.state.order.orderStatus.toLowerCase() == 'new'){
                  var newStatusTextColor = "#FFFFFF";
                  var cookingStatusTextColor = "#b89467";
                  var DeliveringStatusTextColor = "#b89467";
                  if(currentTime > this.state.order.orderDeliverTime - 0.3*60*60*1000){
                     cookingStatusTextColor = "#FFFFFF";
                  }
               }else if(this.state.order.orderStatus.toLowerCase() == 'delivering'){
                  var newStatusTextColor = "#FFFFFF";
                  var cookingStatusTextColor = "#FFFFFF";
                  var DeliveringStatusTextColor = "#FFFFFF";
               }
                
               var deliverTimeView = (<View key={'deliverTimeView'} style={styleOrderDetailPage.deliverStatusView}>
                                            <View style={styleOrderDetailPage.oneStatusView}>
                                                <Text style={{color:newStatusTextColor, fontWeight:'bold',fontSize:windowHeight/51.64, alignSelf:'center',}}>Order</Text>
                                                <Text style={{color:newStatusTextColor, fontWeight:'bold',fontSize:windowHeight/51.64, alignSelf:'center',}}>Received</Text>
                                            </View>
                                            <View style={styleOrderDetailPage.oneStatusView}>
                                                <Text style={{color:cookingStatusTextColor, fontWeight:'bold',fontSize:windowHeight/51.64, alignSelf:'center',}}>---------</Text>
                                            </View>
                                            <View style={styleOrderDetailPage.oneStatusView}>
                                                <Text style={{color:cookingStatusTextColor, fontWeight:'bold',fontSize:windowHeight/51.64, alignSelf:'center',}}>Cooking</Text>
                                            </View>
                                            <View style={styleOrderDetailPage.oneStatusView}>
                                                <Text style={{color:DeliveringStatusTextColor, fontWeight:'bold',fontSize:windowHeight/51.64, alignSelf:'center',}}>---------</Text>
                                            </View>
                                            <View style={styleOrderDetailPage.oneStatusView}>
                                                <Text style={{color:DeliveringStatusTextColor, fontWeight:'bold',fontSize:windowHeight/51.64, alignSelf:'center',}}>Out For</Text>
                                                <Text style={{color:DeliveringStatusTextColor, fontWeight:'bold',fontSize:windowHeight/51.64, alignSelf:'center',}}>Delivery</Text>
                                            </View>
                                       </View>);
                if(this.state.order.estimatedDeliverTimeRange){
                   ETAView = <View key={'ETAView'} style={styleOrderDetailPage.ETAView}>
                                <Text style={styleOrderDetailPage.ETAText}>
                                Expect arrival between {dateRender.formatTime2StringShort(this.state.order.estimatedDeliverTimeRange.min)} and {dateRender.formatTime2StringShort(this.state.order.estimatedDeliverTimeRange.max)}
                                </Text>
                             </View>;
                }
            }

            var contactUsView = <View key={'contactUsView'} style={styles.infoBannerView}>
                                   <Text style={styles.infoBannerText}>
                                      Got problem with your order? Call us at  
                                   </Text> 
                                   <Text style={styles.infoBannerLink} onPress={()=>this.dialThisNumber('2066012584')}>
                                      (206)601-2584
                                   </Text>
                                </View>
            return [deliverTimeView,ETAView,contactUsView];
        }
    }
    
    renderFooter(){
      var promotionDeductionView = null;
      if(this.state.order.price && this.state.order.price.couponValue){
         promotionDeductionView = (<View key={'promotionDeductionView'} style={styleShoppingCartPage.subtotalView}>
                                         <View style={styleShoppingCartPage.couponTitleView}>
                                             <Text style={styleShoppingCartPage.priceTitleText}>Coupon Deduction</Text>
                                         </View>
                                         <View style={styleShoppingCartPage.couponNumberView}>
                                             <Text style={styleShoppingCartPage.priceNumberText}>-${this.state.order.price.couponValue}</Text>
                                         </View>
                                    </View>);
      }

      var notesToChefView = null;
      if(this.state.order.notesToChef && this.state.order.notesToChef.trim()){
         notesToChefView = (<View key={'noteView'} style={styleShoppingCartPage.noteView}>
                                <View style={styleShoppingCartPage.notesToChefTitleView}>
                                    <Text style={styleShoppingCartPage.priceTitleText}>Note to Chef</Text>
                                </View>
                                <View style={styleShoppingCartPage.notesToChefTextView}>
                                    <Text style={styleShoppingCartPage.notesToChefText}>{commonWidget.getTextLengthLimited(this.state.order.notesToChef,16)}</Text>
                                </View>
                                <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={'#F5F5F5'} onPress={()=> Alert.alert( 'Note to Chef', this.state.order.notesToChef ,[ { text: 'Close' }])}>
                                    <Text style={styleShoppingCartPage.notesToChefButtonText}>View</Text>
                                </TouchableHighlight>
                            </View>);
      }

      let fullDeliveryAddress = this.state.order.shippingAddress.apartmentNumber ? 'Apt/Suite '+this.state.order.shippingAddress.apartmentNumber+' '+this.state.order.shippingAddress.formatted_address:this.state.order.shippingAddress.formatted_address;
      var costBreakDownView = [(<View key={'orderIdView'} style={styleShoppingCartPage.subtotalView}>
                                    <View style={styleShoppingCartPage.priceTitleView}>
                                        <Text style={styleShoppingCartPage.priceTitleText}>OrderId</Text>
                                    </View>
                                    <View style={styleShoppingCartPage.priceNumberView}>
                                        <Text style={styleShoppingCartPage.priceNumberText}>{this.state.order.orderId.substring(0,this.state.order.orderId.indexOf('-'))}</Text>
                                    </View>
                                </View>),
                               (<View key={'subtotalView'} style={styleShoppingCartPage.subtotalView}>
                                    <View style={styleShoppingCartPage.priceTitleView}>
                                        <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
                                    </View>
                                    <View style={styleShoppingCartPage.priceNumberView}>
                                        <Text style={styleShoppingCartPage.priceNumberText}>${this.state.order.price.subTotal}</Text>
                                    </View>
                                </View>),
                                notesToChefView,
                                (<View key={'deliveryFeeView'} style={styleShoppingCartPage.subtotalView}>
                                    <View style={styleShoppingCartPage.priceTitleView}>
                                        <Text style={styleShoppingCartPage.priceTitleText}>Delivery Fee</Text>
                                    </View>
                                    <View style={styleShoppingCartPage.priceNumberView}>
                                        <Text style={styleShoppingCartPage.priceNumberText}>${this.state.order.price.deliveryFee}</Text>
                                    </View>
                                 </View>),
                                promotionDeductionView,
                                (<View key={'taxView'} style={styleShoppingCartPage.subtotalView}>
                                    <View style={styleShoppingCartPage.priceTitleView}>
                                        <Text style={styleShoppingCartPage.priceTitleText}>Tax</Text>
                                    </View>
                                    <View style={styleShoppingCartPage.priceNumberView}>
                                        <Text style={styleShoppingCartPage.priceNumberText}>${this.state.order.price.tax}</Text>
                                    </View>
                                 </View>),
                                (<View key={'totalView'} style={styleShoppingCartPage.subtotalView}>
                                    <View style={styleShoppingCartPage.priceTitleView}>
                                        <Text style={styleShoppingCartPage.totalPriceTitleText}>Total</Text>
                                    </View>
                                    <View style={styleShoppingCartPage.priceNumberView}>
                                        <Text style={styleShoppingCartPage.totalPriceNumberText}>${this.state.order.price.grandTotal}</Text>
                                    </View>
                                 </View>),
                                (<View key={'addressView'} style={styleShoppingCartPage.noteView}>
                                    <View style={styleShoppingCartPage.notesToChefTitleView}>
                                        <Text style={styleShoppingCartPage.priceTitleText}>Deliver To</Text>
                                    </View>
                                    <View style={styleShoppingCartPage.notesToChefTextView}>
                                        <Text style={styleShoppingCartPage.notesToChefText}>{commonWidget.getTextLengthLimited(fullDeliveryAddress,20)}</Text>
                                    </View>
                                    <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={'#F5F5F5'} 
                                    onPress={()=> Alert.alert( 'Deliver Address', fullDeliveryAddress,[ { text: 'Close' }])}>
                                        <Text style={styleShoppingCartPage.notesToChefButtonText}>View</Text>
                                    </TouchableHighlight>
                                 </View>)];
        var commentBoxView = [];
        if(this.state.order.orderStatus.toLowerCase() == 'delivered' && this.state.order.comment && this.state.order.comment.starRating){//if rated,show rating/comment
           if(this.state.order.comment.chefComment && this.state.order.comment.chefComment.trim()){//if chef replied,show reply content
              var chefReplyView = <View key={'chefReplyView'} style={styleOrderDetailPage.chefReplyBox}>
                                    <View style={styleOrderDetailPage.chefPhotoView}>
                                      <Image source={{uri:this.state.order.chefProfilePic}} style={styleOrderDetailPage.chefPhoto}/>
                                    </View>
                                    <View style={styleOrderDetailPage.chefReplyContentView}>
                                      <Text style={styleOrderDetailPage.chefReplyText}>{this.state.order.comment.chefComment}</Text>
                                    </View>
                                  </View>
           }
           commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBox}>
                                  <View style={styleOrderDetailPage.ratingCommentTimeView}>
                                        <View style={styleOrderDetailPage.ratingView}>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                                <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                                <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>                                    
                                                <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                                <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                                <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                        </View>
                                        <View style={styleOrderDetailPage.commentTimeView}>
                                            <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(this.state.order.comment.eaterCommentTime)}</Text>
                                        </View>
                                  </View>
                                  <Text style={styleOrderDetailPage.commentText}>{this.state.order.comment.eaterComment ? this.state.order.comment.eaterComment :'No comment'}</Text>
                              </View>),
                              chefReplyView];
        }else if(this.state.order.orderStatus.toLowerCase() == 'delivered' && this.state.ratingSucceed){
            commentBoxView = <View style={styleOrderDetailPage.commentBox}>
                                  <View style={styleOrderDetailPage.ratingCommentTimeView}>
                                        <View style={styleOrderDetailPage.ratingView}>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                               <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                                <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>                                    
                                                <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                                <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                            <View style={styleOrderDetailPage.ratingIconWrapper}>
                                                <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                            </View>
                                        </View>
                                        <View style={styleOrderDetailPage.commentTimeView}>
                                            <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(new Date().getTime())}</Text>
                                        </View>
                                  </View>
                                  <Text style={styleOrderDetailPage.commentText}>{this.state.comment.trim() ? this.state.comment :'No comment'}</Text>
                             </View>
        }else if(commonWidget.isOrderCommentable(this.state.order)){//if the order is commentable, show commet input area
            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBox}>
                                   <View style={styleOrderDetailPage.ratingCommentTimeView}>
                                        <View style={styleOrderDetailPage.ratingView}>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(1)}>
                                            <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(2)}>
                                            <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(3)}>
                                            <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(4)}>
                                            <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper} onPress={()=>this.pressedRatingIcon(5)}>
                                            <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                        </View>
                                    </View>
                                    <TextInput placeholder="Leave your comment here" style={styleOrderDetailPage.commentInput} multiline={true} returnKeyType = {'default'} autoCorrect={false} 
                                    maxLength={500} onChangeText = {(text) => this.setState({ comment: text }) } onFocus={(()=>this._onFocus()).bind(this)} onBlur={()=>this.scrollToCommentBoxtoBottom()}/>                                     
                                    <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.submitCommentButton} onPress={()=>this.submitComment()}>
                                            <Text style={styleOrderDetailPage.submitCommentButtonText}>Submit</Text>    
                                    </TouchableHighlight>
                                 </View>),
                                (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
        }else if(new Date().getTime()-this.state.order.orderDeliverTime > 7*24*60*60*1000){//if the order expired for comment, show disabled commentbox
            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBox}>
                                    <View style={styleOrderDetailPage.ratingCommentTimeView}>
                                        <View style={styleOrderDetailPage.ratingView}>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                        </View>
                                    </View>
                                    <TextInput placeholder="Order created 7 days ago cannot be reviewed" style={styleOrderDetailPage.commentInput} editable={false}/>                                     
                                 </View>),
                                (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
        }else if(this.state.order.orderStatus.toLowerCase() != 'delivered'){//if order is not delivered,show comment suggestion
            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBox}>
                                    <View style={styleOrderDetailPage.ratingCommentTimeView}>
                                        <View style={styleOrderDetailPage.ratingView}>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                            <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.ratingIconWrapper}>
                                            <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                            </TouchableHighlight>
                                        </View>
                                    </View>
                                    <TextInput placeholder="Leave a comment after delivery" style={styleOrderDetailPage.commentInput} editable={false}/>                                     
                                </View>),
                               (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
        }
        return costBreakDownView.concat(commentBoxView);                                             
    }
     
    render() {        
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;  
        }
   
        return (<View style={styles.container}>
                    <View style={styles.headerBannerView}>    
                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToHistoryOrderPage()}>
                            <View style={styles.backButtonView}>
                                <Image source={backIcon} style={styles.backButtonIcon}/>
                            </View>
                            </TouchableHighlight>    
                            <View style={styles.titleView}>
                               <Text style={styles.titleText}>Order Details</Text>
                            </View>
                            <TouchableHighlight style={styles.headerRightView} underlayColor={'#F5F5F5'} onPress={() => this.fetchOrderDetail()}>
                            <View style={styles.headerRightView}>
                               <Image source={refreshIcon} style={styles.refreshButtonIcon}/>
                            </View>
                            </TouchableHighlight> 
                    </View>
                    <ListView style={styleOrderDetailPage.dishListView} ref="listView" 
                                    dataSource = {this.state.dataSource}
                                    renderHeader={this.renderHeader.bind(this)}
                                    renderRow={this.renderRow.bind(this) } 
                                    renderFooter={this.renderFooter.bind(this)}/>
                    {loadingSpinnerView}
                </View>);
    }
    
    _onLayout(event) {
        this.y = event.nativeEvent.layout.y;
    }
    
    _onFocus() {
        let listViewLength = this.y;
        let listViewBottomToScreenBottom = windowHeight - (listViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        if(listViewBottomToScreenBottom < keyboardHeight){//Scroll up only when keyboard covers part of listView
           this.refs.listView.scrollTo({x: 0, y: keyboardHeight - listViewBottomToScreenBottom, animated: true});   
        }
    }
    
    scrollToCommentBoxtoBottom(){
        let listViewLength = this.y;
        let listViewBottomToScreenBottom = windowHeight - (listViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        if(listViewBottomToScreenBottom < 0){//Scroll down to near screen bottom only listViewBottomToScreenBottom excceed the screen
           this.refs.listView.scrollTo({x:0, y:30 - listViewBottomToScreenBottom, animated: true})
        }
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
            commentText: this.state.comment ? this.state.comment.trim():'',
            starRating: Number(this.state.starRating)
        };
        this.setState({showProgress:true});
        
        return this.client.postWithAuth(config.leaveEaterCommentEndpoint,data)
        .then((res)=>{
            if (res.statusCode != 200 && res.statusCode != 202) {
                this.setState({showProgress:false});
                return this.responseHandler(res);
            }
            this.state.order.comment = {starRating:data.starRating, eaterComment:data.commentText, eaterCommentTime:new Date().getTime()}
            //Alert.alert('Success','Comment is left for this order',[{ text: 'OK' }]);    
            self.setState({ratingSucceed:true, showProgress:false, starRating:data.starRating});     
        }).catch((err)=>{
            this.setState({showProgress: false});
            commonAlert.networkError(err);
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
      
    dialThisNumber(phoneNumber){
        Linking.openURL("tel:"+phoneNumber);
    }

    navigateBackToHistoryOrderPage(){
        if(this.callback && (this.state.order.orderStatus!=this.state.orderStatus||this.state.ratingSucceed)){
           console.log(this.state.order);
           this.callback(this.state.order);
        }
        this.props.navigator.pop();
    }
}

var styleOrderDetailPage = StyleSheet.create({
    deliverTimeView:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:windowHeight*0.0974,
        backgroundColor:'#FFCC33'
    },
    deliverStatusView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight*0.0974,
        backgroundColor:'#FFCC33'
    },
    ETAText:{
        color:'#FFFFFF',
        fontWeight:'bold',
        fontSize:windowHeight/52.57,
    },
    ETAView:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:"flex-start",
        height:20,
        backgroundColor:'#FFCC33'
    },
    oneStatusView:{
       flexDirection:'column',
       alignItems:'center',
       justifyContent:'center',
       height:windowHeight*0.0974,
       width:windowWidth/6.0,
    },
    deliverTimeTextView:{
        flex:0.9,
        flexDirection:'row',
        justifyContent:'center',
        alignSelf:'center',
    },
    deliverTimeText:{
        color:'#FFFFFF',
        fontWeight:'bold',
        fontSize:windowHeight/51.64,
    },
    deleteBannerIcon:{
       width:windowHeight*0.0528,
       height:windowHeight*0.0528,
    },
    deleteBannerIconView:{
       flex:0.1,
       justifyContent:'center',
       alignItems:'center'
    },
    dishListView:{
        flex:1,
        backgroundColor:'#fff',
        flexDirection:'column',
        paddingBottom:10,
    },
    oneListingView:{
        backgroundColor:'#FFFFFF',  
        flexDirection:'row',
        flex:1,
        borderColor:'#EAEAEA',
        borderTopWidth:1,
    },
    dishPhoto:{
        width:windowWidth*0.344,
        height:windowWidth*0.344,
    },
    orderInfoView:{
        flex:1,
        height:windowWidth*0.344,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingVertical:windowHeight/73.6,
    },
    dishNameText:{
        fontSize:windowHeight/47.64,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    dishPriceText:{
        fontSize:windowHeight/37.056,
        fontWeight:'bold',
        color:'#F8C84E',
    },
    dishIngredientView:{
        flex:1,
        height:windowHeight*0.0792,  
    },
    dishIngredientText:{
        fontSize:windowHeight/51.636,
        color:'#9B9B9B',
    },    
    commentBox:{
        alignSelf:'center',
        backgroundColor:'#F5F5F5',
        width:windowWidth*0.93,
        marginTop:windowHeight*0.0224,
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
        flex:0.6,
        justifyContent:'flex-start',
        flexDirection:'row',
        backgroundColor:'#FFFFFF',
    },
    commentInput:{
        height:90, 
        padding:windowHeight*0.0224,
        fontSize:14,
    },
    commentText:{
        padding:15,
        fontSize:14,
        color:'#4A4A4A',
    },
    ratingIconWrapper:{
        alignSelf:'center',
        marginRight:windowWidth/51.75,
        marginBottom:windowHeight/49.6,
    },
    ratingIcon:{
        width:windowHeight*0.045,
        height:windowHeight*0.045,        
    },
    chefReplyBox:{
        flexDirection:'row',
        alignSelf:'center',
        width:windowWidth*0.93,
        marginTop:10,
    },
    chefPhotoView:{
        flex:1/6,
        flexDirection:'column',
        alignItems:'flex-start',
        justifyContent:'flex-start',
    },
    chefPhoto:{
        width:windowWidth*0.93/7,
        height:windowWidth*0.93/7,
        borderWidth:0,
        borderRadius:8,
    },
    chefReplyContentView:{
         flex:5/6,
         backgroundColor:"#4A4A4A",
    },
    chefReplyText:{
        padding:15,
        fontSize:14,
        color:'#F5F5F5',
    },
    ratingCommentTimeView:{
        flexDirection:'row',
        height:windowHeight*0.048,
        flex:1,
    },
    commentTimeView:{
        flex:0.4,
        flexDirection:'row',
        justifyContent:'flex-end',
        backgroundColor:'#FFFFFF'
    },
    commentTimeText:{
        alignSelf:'center',
        fontSize:12,
        color:'#9B9B9B',
        fontWeight:'600',
    },
});

var styleShoppingCartPage = StyleSheet.create({
    subtotalView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center'
    },
    noteView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingLeft:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center'
    },
    taxView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center',
    },
    promotionDeductionView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center',
    },
    deliveryFeeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        justifyContent:'center'
    },
    addressView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center',
    },
    addressTitleView:{
        flex:0.4,
        width:windowWidth*0.4,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    addressTitleText:{ 
        fontSize:windowHeight/36.8,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    addressTextView:{
        flex:0.6,
        width:windowWidth*0.6,
        alignItems:'flex-end',
        alignSelf:'center',
    },
    promotionCodeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center'
    },
    totalView:{
        flexDirection:'row',
        height:windowHeight/10,
        paddingHorizontal:windowWidth/27.6,
        paddingTop:windowHeight/20.0,
        borderColor:'#F5F5F5',
        justifyContent:'center',
        marginBottom:20,
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
    addressLine:{
        color:'#4A4A4A',
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
    removeCouponText:{
        fontSize:windowHeight/49.06,
        color:'#ffcc33',
        fontWeight:'500',
        alignSelf:'center',
        paddingLeft:10,
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
    notesToChefTitleView:{
        flex:0.35,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    couponTitleView:{
        flex:0.75,
        flexDirection:'row',
        alignItems:'flex-start',
        alignSelf:'center',
    },
    notesToChefTextView:{
        flex:0.5,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    notesToChefText:{
        fontSize:windowHeight/47.33,
        color:'#979797',
        alignSelf:'center',  
    },
    notesToChefButtonView:{
        flex:0.15,
        alignItems:'flex-end',
        alignSelf:'stretch',
        justifyContent:'center',
        paddingHorizontal:windowWidth/27.6,
    },
    notesToChefButtonText:{
        fontSize:windowHeight/36.8,
        fontWeight:'500',
        color:'#FFCC33',
        alignSelf:'center',
    },
    couponNumberView:{
        flex:0.25,
        alignItems:'flex-end',
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
    promotionCodeTitleView:{
        flex:0.375,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    showPromoCodeView:{
        flexDirection:'row',
        width:windowWidth*0.5,
        justifyContent:'center',
    },
    showPromoCodeText:{
        fontSize:windowHeight/47.33,
        color:'#9B9B9B',
        alignSelf:'center',
    },
    promoCodeInputView:{
        height:28,
        flexDirection:'row',
        borderColor:'#F2F2F2',
        borderWidth:1,
        borderRadius:5,
        flex:0.53,
        alignSelf:'center',
    },
    AddRemoveCouponButtonView:{
        flex:0.095,
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
        color:'#9B9B9B',
    },
    dishIngredientView:{
        height:windowHeight*0.065,  
    },
    dishIngredientText:{
        fontSize:windowHeight/47.33,
        color:'#9B9B9B',
    },
    actualQuantityView:{
        height:windowHeight*0.032,  
    },
    actualQuantityText:{
        fontSize:windowHeight/47.33,
        color:'#FF6347',
    },
    quantityTotalPriceView:{
        flex:1,
        flexDirection:'row', 
    },
    quantityView:{
        flex:0.5,
        flexDirection:'row', 
        alignItems:'flex-start',
    },
    totalPriceView:{
        flex:0.5,
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
        width: windowHeight/24.53, 
        height: windowHeight/24.53,
    }, 
    removePromoCodeIcon:{
        width: windowHeight/24.53, 
        height: windowHeight/24.53,
    }, 
    footerView:{ 
        flexDirection:'row', 
        height:windowHeight*0.075, 
    },
    getPriceButtonView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#FF9933',
    },
    checkOutButtonView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#FFCC33',
    }, 
    checkOutButtonGreyView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#9B9B9B',
    }, 
    bottomButtonText:{
        fontSize:windowHeight/30.6,
        fontWeight:'400',
        color:'#fff',
        alignSelf:'center', 
    },
    bottomButtonTextGreyed:{
        fontSize:windowHeight/30.6,
        fontWeight:'400',
        color:'#D5D5D5',
        alignSelf:'center', 
    }
});

module.exports = OrderDetailPage;

