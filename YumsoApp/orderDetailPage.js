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
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen');
var defaultAvatar = require('./icons/defaultAvatar.jpg');


var receiptBottom = require('./icons/receipt_bottom.png');
var receiptTop = require('./icons/receipt_top.png');
var demoFood = require('./icons/demoFood.jpeg');
var star0 = require('./icons/icon-0-starview.png');
var star1 = require('./icons/icon-1-starview.png');
var star2 = require('./icons/icon-2-starview.png');
var star3 = require('./icons/icon-3-starview.png');
var star4 = require('./icons/icon-4-starview.png');
var star5 = require('./icons/icon-5-starview.png');


import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 280 //Todo: get keyboard size programmatically.


var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;


var h1 = 28*windowHeight/677;
var h2 = windowHeight/35.5;
var h3 = windowHeight/33.41;
var h4 = windowHeight/47.33;
var h5 = 12;
var b1 = 15*windowHeight/677;
var b2 = 15*windowHeight/677;

var img36Height = 36* windowHeightRatio;

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
  Linking,
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
        console.log('eater'+eater);
        this.callback = routeStack[routeStack.length-1].passProps.callback;
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(order.orderList)),
            showProgress:false,
            order:order,
            eater:eater,
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
                            name: 'WelcomePage',
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
            <View key={orderItem.dishDetail.dishId} style={styleOrderDetailPage.oneListingViewNew}>
                <Image source={imageSrc} style={styleOrderDetailPage.dishPhotoNew}/>
                <View style={styleOrderDetailPage.orderInfoViewNew}>
                    <Text style={styleOrderDetailPage.dishNameTextNew}>{orderItem.dishName}</Text>
                    <View style={styleOrderDetailPage.bottomViewNew}>
                        <Text style={styleOrderDetailPage.dishPriceTextNew}>${orderItem.price}</Text>
                        <Text style={styleOrderDetailPage.quantityTextNew}>Quantity: {orderItem.quantity}</Text>
                    </View>
                </View>
                <View style={{backgroundColor: "#EAEAEA", height: 1,}}>
                </View>
            </View>
        );
    }

    renderHeader(){
        var ETAView=null;
        if(this.state.showDeliverStatusView){
            var headerNew = <View style={styles.titleViewNew}>
                                <Text style={styles.titleTextNew}>Order Details</Text>
                            </View>

            var orderStatusTextNew = <View style={{paddingBottom:20* windowHeightRatio, paddingLeft: 20 * windowWidthRatio}}>
                                         <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Order Status</Text>
                                     </View>

            
            if(this.state.order.orderStatus.toLowerCase()=='delivered'){
               var deliverTimeTextNew = 'Your order was delivered at ' + dateRender.renderDate2(this.state.order.orderStatusModifiedTime);
            }else if(this.state.order.orderStatus.toLowerCase()=='cancelled'){
               var deliverTimeTextNew = 'Your order has been cancelled';
            }else{
               if(this.state.order.estimatedDeliverTimeRange){
                  var deliverTimeTextNew = 'Your order is out for delivery. Expect arrival between ' + dateRender.formatTime2StringShort(this.state.order.estimatedDeliverTimeRange.min)+' and '+dateRender.formatTime2StringShort(this.state.order.estimatedDeliverTimeRange.max);
               }else{
                  var deliverTimeTextNew = 'Your order is out for delivery.';
               }
            }    

            var deliverTimeViewNew = (<View key={'deliverTimeViewNew'} style={styleOrderDetailPage.deliverTimeViewNew}>
                                        <View style={{flexDirection: "row"}}>
                                            <Text style={styleOrderDetailPage.deliverTimeTextNew}>
                                                Order from
                                            </Text>
                                            <Text style={styleOrderDetailPage.orderFromNameNew}> {this.state.order.shopname}</Text>
                                        </View>
                                        <Text style={styleOrderDetailPage.deliverTimeTextNew}>
                                            {deliverTimeTextNew}
                                        </Text>
                                     </View>);

            var contactUsView = <View key={'contactUsView'} style={styles.infoBannerViewNew}>
                                   <Text style={styles.infoBannerTextNew}>
                                      Got problem with your order? Call us at
                                   </Text>
                                   <Text style={styles.infoBannerLinkViewNew} onPress={()=>this.dialThisNumber('2062258636')}>
                                      (206)225-8686
                                   </Text>
                                </View>

            var itemsTextNew = <View key={'itemsTextNew'} style={{paddingTop: 20 * windowHeightRatio, paddingBottom:20* windowHeightRatio, paddingLeft: 20 * windowWidthRatio}}>
                                  <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Item(s)</Text>
                               </View>

            return [headerNew,orderStatusTextNew,deliverTimeViewNew,contactUsView,itemsTextNew];
        }
    }

    renderFooter(){

      var notesToChefView = null;
      if(this.state.order.notesToChef && this.state.order.notesToChef.trim()){
         notesToChefView = (<View key={'noteView'} style={styleShoppingCartPage.noteViewNew}>
                                <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                    <Text style={styleShoppingCartPage.orderSummaryTextNew}>Note to Chef</Text>
                                    <Text style={{fontSize:b2, color:'#4A4A4A', width:windowWidth - 80 * windowWidthRatio}}>{this.state.order.notesToChef}</Text>
                                </View>
                            </View>);
      }

      var promotionDeductionView = null;
      if(this.state.order.price && this.state.order.price.couponValue){
         promotionDeductionView = <View key={'promotionDeductionView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                     <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                        <View style={styleShoppingCartPage.priceTitleView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Discount</Text>
                                        </View>
                                        <View style={styleShoppingCartPage.priceNumberView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>-${this.state.order.price.couponValue}</Text>
                                        </View>
                                     </View>
                                     <View style={styleShoppingCartPage.lineBackgroundNew}>
                                        <Text style= {styleShoppingCartPage.lineNew}></Text>
                                     </View>
                                 </View>
      }


      let fullDeliveryAddress = null; 
      var line1 = this.state.order.shippingAddress.streetNumber + ' ' + this.state.order.shippingAddress.streetName;
      var line2 = this.state.order.shippingAddress.apartmentNumber;
      var line3 = this.state.order.shippingAddress.city + ', ' + this.state.order.shippingAddress.state + ', ' + this.state.order.shippingAddress.postal;

      if (!line2 || !line2.trim()) {
          fullDeliveryAddress = <View style={styleShoppingCartPage.addressTextView}>
                                    <Text style={styleShoppingCartPage.addressText}>{line1}</Text>
                                    <Text style={styleShoppingCartPage.addressText}>{line3}</Text>
                                </View>
      } else {
          fullDeliveryAddress = <View style={styleShoppingCartPage.addressTextView}>
                                    <Text style={styleShoppingCartPage.addressText}>{line1}</Text>
                                    <Text style={styleShoppingCartPage.addressText}>{line2}</Text>
                                    <Text style={styleShoppingCartPage.addressText}>{line3}</Text>
                                </View>
      }


      var costBreakDownView = [ (notesToChefView),
                                (<View key={'orderSummary'} style={styleShoppingCartPage.orderSummaryNew}>
                                      <Text style={styleShoppingCartPage.orderSummaryTextNew}>Order Summary</Text>
                                </View>),

                                (<View key={'receiptTop'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                                      <Image source={receiptTop} style={styleShoppingCartPage.receiptTopImageNew} />
                                </View>),

                                (<View key={'orderIdView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                      <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                          <View style={styleShoppingCartPage.priceTitleView}>
                                              <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Order #</Text>
                                          </View>
                                          <View style={styleShoppingCartPage.priceNumberView}>
                                              <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>{this.state.order.orderId.substring(0,this.state.order.orderId.indexOf('-'))}</Text>
                                          </View>
                                      </View>
                                      <View style={styleShoppingCartPage.lineBackgroundNew}>
                                          <Text style= {styleShoppingCartPage.lineNew}></Text>
                                      </View>
                                </View>),

                               (<View key={'subtotalView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                    <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                        <View style={styleShoppingCartPage.priceTitleView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Subtotal</Text>
                                        </View>
                                        <View style={styleShoppingCartPage.priceNumberView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.order.price.subTotal}</Text>
                                        </View>
                                    </View>
                                    <View style={styleShoppingCartPage.lineBackgroundNew}>
                                        <Text style= {styleShoppingCartPage.lineNew}></Text>
                                    </View>
                                </View>),

                               (<View key={'addressView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                   <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                       <View style={styleShoppingCartPage.notesToChefTitleAddressView}>
                                           <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Deliver to</Text>
                                       </View>
                                       <View style={styleShoppingCartPage.orderSummaryBoxViewAddressNew}>
                                       {fullDeliveryAddress}
                                       </View>
                                   </View>
                                   <View style={styleShoppingCartPage.lineBackgroundNew}>
                                       <Text style= {styleShoppingCartPage.lineNew}></Text>
                                   </View>
                                </View>),

                                (<View key={'deliveryFeeView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                    <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                        <View style={styleShoppingCartPage.priceTitleView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Delivery Fee</Text>
                                        </View>
                                        <View style={styleShoppingCartPage.priceNumberView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.order.price.deliveryFee}</Text>
                                        </View>
                                    </View>
                                    <View style={styleShoppingCartPage.lineBackgroundNew}>
                                        <Text style= {styleShoppingCartPage.lineNew}></Text>
                                    </View>
                                </View>),

                                promotionDeductionView,

                                (<View key={'taxView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                      <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                          <View style={styleShoppingCartPage.priceTitleView}>
                                              <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Tax</Text>
                                          </View>
                                          <View style={styleShoppingCartPage.priceNumberView}>
                                              <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.order.price.tax}</Text>
                                          </View>
                                      </View>
                                      <View style={styleShoppingCartPage.lineBackgroundNew}>
                                          <Text style= {styleShoppingCartPage.lineNew}></Text>
                                      </View>
                                </View>),

                                (<View key={'totalView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                    <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                        <View style={styleShoppingCartPage.priceTitleView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>TOTAL</Text>
                                        </View>
                                        <View style={styleShoppingCartPage.priceNumberView}>
                                            <Text style={styleShoppingCartPage.orderSummaryBoxBoldValueNew}>${this.state.order.price.grandTotal}</Text>
                                        </View>
                                    </View>
                                </View>),

                                (<View key={'receiptBottom'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                                     <Image source={receiptBottom} style={styleShoppingCartPage.receiptBottomImageNew} />
                                </View>)];
        var commentBoxView = [];
        if(this.state.order.orderStatus.toLowerCase() == 'delivered' && this.state.order.comment && this.state.order.comment.starRating){//if rated,show rating/comment
           if(this.state.order.comment.chefComment && this.state.order.comment.chefComment.trim()){//if chef replied,show reply content
              var chefReplyView = <View key={'chefReplyView'}  style={{marginLeft: 72 * windowWidthRatio,marginRight: 20 * windowWidthRatio, marginTop:10 * windowHeightRatio, borderColor:'#EAEAEA', borderTopWidth:1, paddingTop:10}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={{fontSize:b2, color:'#4A4A4A', fontWeight: 'bold',marginBottom: 10*windowHeightRatio}}>{this.state.order.comment.shopname}</Text>
                                        <View style={styleOrderDetailPage.commentTimeView}>
                                            <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(this.state.order.comment.chefCommentTime)}</Text>
                                        </View>
                                    </View>
                                    <Text style={{fontSize:b2, color:'#4A4A4A',marginBottom: 40*windowHeightRatio}}>{this.state.order.comment.chefComment}</Text>
                                 </View>
           }

           var rIcon = null

           if (this.state.order.comment.starRating == 0) {
               rIcon = star0;
           } else if (this.state.order.comment.starRating == 1) {
               rIcon = star1;
           } else if (this.state.order.comment.starRating == 2) {
               rIcon = star2;
           } else if (this.state.order.comment.starRating == 3) {
               rIcon = star3;
           } else if (this.state.order.comment.starRating == 4) {
               rIcon = star4;
           } else if (this.state.order.comment.starRating == 5) {
               rIcon = star5;
           }

           commentBoxView = [(<View style={styleOrderDetailPage.commentBoxNew}>
                                 <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                     <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Review</Text>
                                 </View>
                                 <View style={{ height:img36Height, flexDirection:'row'}}>
                                    {
                                    this.state.eater.eaterProfilePic ?
                                    <Image source={{ uri: this.state.eater.eaterProfilePic}} style={{height:img36Height, width: img36Height, borderRadius: img36Height*0.5}}/>
                                    :
                                    <Image source={defaultAvatar} style={{height:img36Height, width: img36Height, borderRadius: img36Height*0.5}}/>
                                    }
                                    <View  style={{paddingLeft:16*windowWidthRatio}}>
                                         <Text style={{fontSize:12, color:'#4A4A4A'}}>{this.state.eater.eaterAlias}</Text>
                                         <Image source={rIcon} style={{height:10*windowHeightRatio,marginTop:5*windowHeightRatio, width: 70*windowWidthRatio}}/>
                                    </View>
                                    <View style={styleOrderDetailPage.commentTimeView}>
                                         <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(this.state.order.comment.eaterCommentTime)}</Text>
                                    </View>
                                 </View>
                                 <View style={{marginLeft: 52 * windowWidthRatio, marginTop:10 * windowHeightRatio}}>
                                    <Text style={{fontSize:b2, color:'#4A4A4A'}}>{this.state.order.comment.eaterComment ? this.state.order.comment.eaterComment :'No comment'}</Text>
                                 </View>
                            </View>),
                            chefReplyView];
       }else if(this.state.order.orderStatus.toLowerCase() == 'delivered' && this.state.ratingSucceed){
            commentBoxView = <View style={styleOrderDetailPage.commentBoxNew}>
                                  <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                      <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                  </View>
                                  <View style={{ height:img36Height, flexDirection:'row'}}>
                                      <View  style={{paddingLeft:16*windowWidthRatio}}>
                                          <Text style={{fontSize:12, color:'#4A4A4A'}}>{this.state.eater.eaterAlias}</Text>
                                          <Image source={star5} style={{height:10*windowHeightRatio,marginTop:5*windowHeightRatio, width: 70*windowWidthRatio}}/>
                                      </View>
                                      <View style={styleOrderDetailPage.commentTimeView}>
                                          <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(new Date().getTime())}</Text>
                                      </View>
                                  </View>
                                  <View style={{marginLeft: 52 * windowWidthRatio, marginTop:10 * windowHeightRatio}}>
                                       <Text style={{ fontSize: b2, color: '#4A4A4A' }}>{this.state.comment.trim() ? this.state.comment : 'No comment'}</Text>
                                  </View>
                             </View>
      }else if(commonWidget.isOrderCommentable(this.state.order)){//if the order is commentable, show commet input area
            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBoxNew}>
                                    <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                        <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                    </View>
                                    <TextInput placeholder="Leave your comment here" style={styleOrderDetailPage.commentTextInputNew} multiline={true} returnKeyType={'default'} autoCorrect={false}
                                        maxLength={500} onChangeText={(text) => this.setState({ comment: text })} onFocus={(() => this._onFocus()).bind(this)} onBlur={() => this.scrollToCommentBoxtoBottom()} /> 
                                    <View style={{ paddingBottom:5* windowHeightRatio}}>
                                        <Text style={{fontSize:h3 , color:"#4a4a4a"}}>Overall Rate</Text>
                                    </View>

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
                                    <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.submitCommentButton} onPress={()=>this.submitComment()}>
                                        <Text style={styleOrderDetailPage.submitCommentButtonText}>Submit</Text>
                                    </TouchableHighlight>
                                 </View>),
                                (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
        }else if(new Date().getTime()-this.state.order.orderDeliverTime > 7*24*60*60*1000){//if the order expired for comment, show disabled commentbox
            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBoxNew}>
                                    <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                        <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                    </View>
                                    <TextInput placeholder="Order created 7 days ago is closed for review" style={styleOrderDetailPage.commentTextInput2New} editable={false}/>
                               </View>),
                              (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
       }else if(this.state.order.orderStatus.toLowerCase() != 'delivered'){//if order is not delivered,show comment suggestion
            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBoxNew}>
                                    <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                        <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                    </View>
                                    <TextInput  placeholder="Leave a comment after delivery"  multiline={true} style={styleOrderDetailPage.commentTextInputNew} editable={false}></TextInput>
                                    <View style={{ paddingBottom:5* windowHeightRatio}}>
                                        <Text style={{fontSize:h3 , color:"#4a4a4a"}}>Overall Rate</Text>
                                    </View>

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
                               </View>),
                               (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
        }
        var bottomMarginView = <View style={{height:50*windowHeightRatio}}></View>;
        return costBreakDownView.concat(commentBoxView, bottomMarginView);
    }


    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;
        }

        return (<View style={styles.containerNew}>
                        <View style={styles.headerBannerViewNew}>
                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToHistoryOrderPage()}>
                              <View style={styles.backButtonViewsNew}>
                                  <Image source={backIcon} style={styles.backButtonIconsNew}/>
                              </View>
                            </TouchableHighlight>

                            <View style={styles.headerRightView}>
                            </View>
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
        flexDirection:'column',
        justifyContent:'center',
        height:windowHeight*0.0974,
        backgroundColor:'#FFCC33',
        paddingLeft: 20 * windowWidthRatio,
        paddingRight: 20 * windowWidthRatio,
    },
    deliverStatusView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight*0.0974,
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
        color:'#4A4A4A',
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
    },
    orderInfoView:{
        flex:1,
        height:windowWidth*0.344,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingVertical:windowHeight/73.6,
    },
    commentBox:{
        alignSelf:'center',
        backgroundColor:'#FFFFFF',
        marginTop:windowHeight*0.0224,
    },
    submitCommentButton:{
        backgroundColor:'#7bcbbe',
        height:50 * windowHeightRatio,
        justifyContent:'center',
        marginBottom: 40 * windowHeightRatio,
    },
    submitCommentButtonText:{
        color:'#FFF',
        fontWeight:'bold',
        alignSelf:'center',
        fontSize: b1,
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
    },
    dishPhotoNew:{
        width:162 * windowWidthRatio,
        height:112 * windowHeightRatio,
    },
    oneListingViewNew:{
        backgroundColor:'#FFFFFF',
        flexDirection:'row',
        flex:1,
        borderColor:'#EAEAEA',
        marginRight: 20 * windowWidthRatio,
        marginLeft:20 * windowWidthRatio,
        borderColor:"#EAEAEA",
        borderBottomWidth:1,
        paddingTop:10*windowHeightRatio,
    },
    orderFromNameNew:{
        color:'#4A4A4A',
        fontWeight:'bold',
        fontSize:windowHeight/51.64,
    },
    deliverTimeTextNew:{
        color:'#4A4A4A',
        fontSize:windowHeight/51.64,
    },
    dishNameTextNew:{
        fontSize:h3,
        fontWeight:'bold',
        color:'#4A4A4A',
        height: 70*windowHeightRatio,
    },
    dishPriceTextNew:{
        fontSize:windowHeight/37.056,
        fontWeight:'bold',
        color:'#F8C84E',
    },
    orderInfoViewNew:{
        flex:1,
        height: 112 * windowHeightRatio,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        marginBottom: 10 * windowHeightRatio,
        paddingBottom: 10 * windowHeightRatio,
        position: "relative",
    },
    quantityTextNew:{
        fontSize:windowHeight/51.636,
        color:'#9B9B9B',
    },
    bottomViewNew: {
        position: "absolute",
        bottom:0,
    },
    commentTextNew:{
        padding:15 * windowWidthRatio,
        fontSize:b2,
        color:'#4A4A4A',
        backgroundColor: "#EAEAEA",
        marginBottom:40 * windowHeightRatio,
    },
    commentBoxNew:{
        alignSelf:'center',
        backgroundColor:'#FFFFFF',
        width:windowWidth - (40 * windowWidthRatio),
        marginTop:windowHeight*0.0224,
    },
    commentTextInputNew:{
        padding:15 * windowWidthRatio,
        fontSize:b2,
        color:'#4A4A4A',
        backgroundColor: "#F5F5F5",
        marginBottom:20 * windowHeightRatio,
        height: 84 * windowHeightRatio,
    },
    commentTextInput2New:{
        padding:15 * windowWidthRatio,
        fontSize:b2,
        color:'#4A4A4A',
        backgroundColor: "#F5F5F5",
        marginBottom:20 * windowHeightRatio,
        height: 50 * windowHeightRatio,
    },
    uploadImageViewNew: {
        marginBottom: 30 * windowHeightRatio,
        flexDirection: 'row',
    },
    uploadImageNew: {
        height: 80 * windowHeightRatio,
        width: 80 * windowWidthRatio,
        backgroundColor: "#EAEAEA",
        marginRight: 6 * windowWidthRatio,
    },
    uploadBtnImageNew: {
        fontSize: 60,
        color: "#979797",
        paddingTop: -15* windowHeightRatio,
        paddingLeft: 15* windowWidthRatio,
        height: 80 * windowHeightRatio,
        fontWeight: '100',
    },
    deliverTimeViewNew:{
        flexDirection:'column',
        justifyContent:'center',
        height:windowHeight*0.0974,
        backgroundColor:'#FFF3D1',
        marginRight: 20 * windowWidthRatio,
        marginLeft: 20 * windowWidthRatio,
        paddingLeft: 15 * windowWidthRatio,
        paddingRight : 15 * windowWidthRatio,
    },
});

var styleShoppingCartPage = StyleSheet.create({
    addressTextView:{
        marginVertical: 20 * windowHeightRatio,
        marginRight: 15 * windowWidthRatio,
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    addressText:{
        fontSize: h4,
        color: '#4A4A4A',
    },
    priceTitleView:{
        flex:1/2.0,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    priceNumberView:{
        flex:1/2.0,
        alignItems:'flex-end',
        alignSelf:'center',
    },
    dishPriceText:{
        fontSize:windowHeight/40.89,
        fontWeight:'600',
        color:'#9B9B9B',
    },
    orderSummaryNew: {
        marginTop:20*windowHeightRatio,
        backgroundColor: "#F5F5F5",
        paddingLeft:20 * windowWidthRatio,
        height: 54 * windowHeightRatio,
        justifyContent: "center",
    },
    orderSummaryTextNew:{
        fontSize: h3,
        fontWeight:"bold",
        color:"#4A4A4A",
    },
    receiptTopBottomImageViewNew: {
        backgroundColor: "#F5F5F5",
    },
    receiptTopImageNew: {
        height:8 * windowHeightRatio,
        width: windowWidth - (20 * windowWidthRatio)*2,
        backgroundColor: "#F5F5F5",
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
    },
    receiptBottomImageNew: {
        height:8 * windowHeightRatio,
        width: windowWidth - (20 * windowWidthRatio)*2,
        backgroundColor: "#F5F5F5",
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        marginBottom: 30 * windowHeightRatio,
    },
    orderSummaryRowNew: {
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
    },
    orderSummaryBoxNew: {
        backgroundColor: "#FFFFFF",
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        flexDirection:'row',
        justifyContent:'center',
        width: windowWidth - (20 * windowWidthRatio)*2,
    },
    orderSummaryBoxTitleNew:{
        fontSize:h4,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginLeft: 15 * windowWidthRatio,
        marginTop:20 * windowHeightRatio,
        marginBottom: 20 * windowHeightRatio,
    },
    orderSummaryBoxValueNew:{
        fontSize:h4,
        color:'#4A4A4A',
        marginRight: 15 * windowWidthRatio,
    },
    orderSummaryBoxBoldValueNew:{
        fontSize:h4,
        color:'#4A4A4A',
        marginRight: 15 * windowWidthRatio,
        fontWeight: "bold",
    },
    addressMoreButtonTextNew:{
        fontSize:h4,
        color:'#7bcbbe',
        alignSelf:'center',
        paddingTop: 23* windowWidthRatio,
    },
    orderSummaryBoxValueAddressNew:{
        fontSize:h4,
        color:'#4A4A4A',
    },
    orderSummaryBoxViewAddressNew:{
        flex:1/2.0,
        alignItems:'flex-end',
        alignSelf:'center',
    },
    lineBackgroundNew: {
        backgroundColor: "#FFFFFF",
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        flexDirection:'row',
        justifyContent:'center',
    },
    lineNew: {
        backgroundColor: "#EAEAEA",
        height: 1,
        width:windowWidth - (35 * windowWidthRatio)*2,
    },
    noteViewNew:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#EAEAEA',
        justifyContent:'center',
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
    },
    subtotalViewNew:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#EAEAEA',
        justifyContent:'center',
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        marginBottom:35 * windowHeightRatio,
    },
    viewTextNew:{
        fontSize: h2,
        color:'#7bcbbe',
        alignSelf:'center',
        marginTop: 30 * windowHeightRatio,
        height:60 * windowHeightRatio
    },
    notesToChefTitleViewNew:{
        flex:0.35,
        alignItems:'flex-start',
        alignSelf:'center',
        marginBottom: 20 * windowHeightRatio,
        marginTop: 20 * windowHeightRatio,
    },
    notesToChefTitleAddressView:{
        flex:0.35,
        alignItems:'flex-start',
    },
});

module.exports = OrderDetailPage;
