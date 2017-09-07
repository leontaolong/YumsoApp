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

var receiptBottom = require('./icons/receipt_bottom.png');
var receiptTop = require('./icons/receipt_top.png');
var demoFood = require('./icons/demoFood.jpeg');
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

//let fullDeliveryAddress = this.state.order.shippingAddress.apartmentNumber ? 'Apt/Suite '+this.state.order.shippingAddress.apartmentNumber+' '+this.state.order.shippingAddress.formatted_address:this.state.order.shippingAddress.formatted_address;
let fullDeliveryAddressNew = "P.No. 67, Demo ,demo, demo demo (302012)";

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
  ScrollView,
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
            <View key={orderItem.dishDetail.dishId} style={styleOrderDetailPage.oneListingViewNew}>
                <Image source={imageSrc} style={styleOrderDetailPage.dishPhotoNew}/>
                <View style={styleOrderDetailPage.orderInfoViewNew}>
                    <Text style={styleOrderDetailPage.dishNameTextNew}>{orderItem.dishName}</Text>
                    {/*<View style={styleOrderDetailPage.dishIngredientView}>
                       <Text style={styleOrderDetailPage.dishIngredientText}>{commonWidget.getTextLengthLimited(orderItem.dishDetail.ingredients,43)}</Text>
                    </View>*/}
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
        //Render 'delivered' status
        var ETAView=null;
        if(this.state.showDeliverStatusView){
           //if(this.state.order.orderStatus.toLowerCase()=='delivered' || this.state.order.orderStatus.toLowerCase()=='arrived'){
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

            var headerNew = <View style={styles.titleViewNew}>
                                <Text style={styles.titleTextNew}>Order Details</Text>

                            </View>

            var deliverTimeViewNew = (<View key={'deliverTimeView'} style={styleOrderDetailPage.deliverTimeView}>
                                        <View style={{flexDirection: "row"}}>
                                            <Text style={styleOrderDetailPage.deliverTimeTextNew}>
                                               Order from
                                            </Text>
                                            <Text style={styleOrderDetailPage.orderFromNameNew}>Morning Cafe</Text>
                                        </View>


                                        <Text style={styleOrderDetailPage.deliverTimeTextNew}>
                                           Your order was delivered at {dateRender.renderDate2(this.state.order.orderStatusModifiedTime)}
                                        </Text>
                                   </View>);

            var contactUsView = <View key={'contactUsView'} style={styles.infoBannerViewNew}>
                                   <Text style={styles.infoBannerTextNew}>
                                      Got problem with your order? Call us at
                                   </Text>
                                   <Text style={styles.infoBannerLinkViewNew} onPress={()=>this.dialThisNumber('2062258636')}>
                                      (206)225-8636
                                   </Text>
                                </View>

          var itemsTextNew = <View style={{paddingTop: 20 * windowHeightRatio, paddingBottom:20* windowHeightRatio, paddingLeft: 20 * windowWidthRatio}}>
                              <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Items</Text>
                          </View>



            return [headerNew,deliverTimeViewNew,ETAView,contactUsView,itemsTextNew];
        }
    }

    renderFooter(){

      var notesToChefView = null;
      // if(this.state.order.notesToChef && this.state.order.notesToChef.trim()){
      if(1 == 1){   // this is for only show this filed commont this and uncomment abow "if" condition
         notesToChefView = (<View key={'noteView'} style={styleShoppingCartPage.noteViewNew}>

                                <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                    <Text style={styleShoppingCartPage.orderSummaryTextNew}>Note to Chef</Text>
                                    <Text style={{fontSize:b2, color:"4a4a4a", width:windowWidth - 80 * windowWidthRatio, height:22*windowHeightRatio}}>Please warm both croissants, thank you!</Text>

                                </View>
                                <View style={styleShoppingCartPage.notesToChefTextView}>
                                    <Text style={styleShoppingCartPage.notesToChefText}>{commonWidget.getTextLengthLimited(this.state.order.notesToChef,16)}</Text>
                                </View>
                                <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={'#F5F5F5'} onPress={()=> Alert.alert( 'Note to Chef', this.state.order.notesToChef ,[ { text: 'Close' }])}>
                                    <Text style={styleShoppingCartPage.viewTextNew}>    Read</Text>
                                </TouchableHighlight>
                            </View>);
      }

      var promotionDeductionView = null;
//      if(this.state.order.price && this.state.order.price.couponValue){
    if(1 == 1){  // this is for only show this filed commont this and uncomment abow "if" condition
         promotionDeductionView = (<View key={'promotionDeductionView'} style={styleShoppingCartPage.subtotalViewNew}>

                                         <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                             <Text style={styleShoppingCartPage.orderSummaryTextNew}>Promotion Code</Text>
                                             <Text style={{fontSize:b2, color:"4a4a4a", width:windowWidth - 80 * windowWidthRatio, height:22*windowHeightRatio}}>2s)^-wo#-456 (-$5.00)</Text>

                                         </View>

                                    </View>);
      }


      let fullDeliveryAddress = this.state.order.shippingAddress.apartmentNumber ? 'Apt/Suite '+this.state.order.shippingAddress.apartmentNumber+' '+this.state.order.shippingAddress.formatted_address:this.state.order.shippingAddress.formatted_address;
      var costBreakDownView = [(notesToChefView),
                                (promotionDeductionView),
                                  (
                                <View key={'orderSummary'} style={styleShoppingCartPage.orderSummaryNew}>
                                    <Text style={styleShoppingCartPage.orderSummaryTextNew}>Order Summary</Text>
                                </View>),

                                (
                                <View key={'receiptTop'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
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
                                       <View style={styleShoppingCartPage.notesToChefTitleView}>
                                           <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Deliver to</Text>
                                       </View>
                                       <View style={styleShoppingCartPage.orderSummaryBoxViewAddressNew}>
                                           <Text style={styleShoppingCartPage.orderSummaryBoxValueAddressNew}>{commonWidget.getTextLengthLimited(fullDeliveryAddress,20)}</Text>
                                       </View>
                                       <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={'#F5F5F5'}
                                       onPress={()=> Alert.alert( 'Deliver Address', fullDeliveryAddress,[ { text: 'Close' }])}>
                                           <Text style={styleShoppingCartPage.addressMoreButtonTextNew}>View</Text>
                                       </TouchableHighlight>
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

                                 (<View key={'discountView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                                     <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                         <View style={styleShoppingCartPage.priceTitleView}>
                                             <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Discount</Text>
                                         </View>
                                         <View style={styleShoppingCartPage.priceNumberView}>
                                             <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>(-$5.00)</Text>
                                         </View>
                                     </View>
                                     <View style={styleShoppingCartPage.lineBackgroundNew}>
                                         <Text style= {styleShoppingCartPage.lineNew}></Text>
                                     </View>

                                  </View>),

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

                                 (
                                 <View key={'receiptBottom'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                                     <Image source={receiptBottom} style={styleShoppingCartPage.receiptBottomImageNew} />
                                 </View>)];
        var commentBoxView = [];
        if(this.state.order.orderStatus.toLowerCase() == 'delivered' && this.state.order.comment && this.state.order.comment.starRating){//if rated,show rating/comment
           if(this.state.order.comment.chefComment && this.state.order.comment.chefComment.trim()){//if chef replied,show reply content
          //   if(1 == 1){
              var chefReplyView = <View key={'chefReplyView'}  style={{marginLeft: 72 * windowWidthRatio,marginRight: 20 * windowWidthRatio, marginTop:10 * windowHeightRatio, borderColor:'#EAEAEA', borderTopWidth:1, paddingTop:10}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={{fontSize:b2, color:"4a4a4a", fontWeight: 'bold',marginBottom: 10*windowHeightRatio}}>Kung Fu Tea</Text>
                                        <View style={styleOrderDetailPage.commentTimeView}>
                                            <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(new Date().getTime())}</Text>
                                        </View>
                                    </View>
                                    <Text style={{fontSize:b2, color:"4a4a4a",marginBottom: 40*windowHeightRatio}}>Thank you so much, we appreciate your review. We are glad that you like it. </Text>

                                  </View>
           }
           commentBoxView = [(<View style={styleOrderDetailPage.commentBoxNew}>
                                 <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                     <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                 </View>
                                 <View style={{ height:img36Height, flexDirection:'row'}}>
                                     <Image source={demoFood} style={{height:img36Height, width: img36Height, borderRadius: img36Height*0.5}}/>
                                     <View  style={{paddingLeft:16*windowWidthRatio}}>
                                         <Text style={{fontSize:12, color:"4a4a4a"}}>natalieh</Text>
                                         <Image source={star5} style={{height:10*windowHeightRatio,marginTop:5*windowHeightRatio, width: 70*windowWidthRatio}}/>
                                     </View>
                                     <View style={styleOrderDetailPage.commentTimeView}>
                                         <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(new Date().getTime())}</Text>
                                     </View>
                                 </View>
                                 <View style={{marginLeft: 52 * windowWidthRatio, marginTop:10 * windowHeightRatio}}>
                                     <Text style={{fontSize:b2, color:"4a4a4a"}}>Love it! I will totally order it adain!</Text>
                                     <View style={{flexDirection:'row', marginTop:10* windowHeightRatio, paddingBottom:10* windowHeightRatio}}>

                                         <Image source={demoFood} style={styleOrderDetailPage.uploadImageNew}/>
                                         <Image source={demoFood} style={styleOrderDetailPage.uploadImageNew}/>
                                     </View>
                                 </View>
                            </View>),
                              chefReplyView];
       }else if(this.state.order.orderStatus.toLowerCase() == 'delivered' && this.state.ratingSucceed){
// }else if(1 == 1){
            commentBoxView = <View style={styleOrderDetailPage.commentBoxNew}>
                                  <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                      <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                  </View>
                                  <View style={{ height:img36Height, flexDirection:'row'}}>
                                      <Image source={demoFood} style={{height:img36Height, width: img36Height, borderRadius: img36Height*0.5}}/>
                                      <View  style={{paddingLeft:16*windowWidthRatio}}>
                                          <Text style={{fontSize:12, color:"4a4a4a"}}>natalieh</Text>
                                          <Image source={star5} style={{height:10*windowHeightRatio,marginTop:5*windowHeightRatio, width: 70*windowWidthRatio}}/>
                                      </View>
                                      <View style={styleOrderDetailPage.commentTimeView}>
                                          <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(new Date().getTime())}</Text>
                                      </View>
                                  </View>
                                  <View style={{marginLeft: 52 * windowWidthRatio, marginTop:10 * windowHeightRatio}}>
                                      <Text style={{fontSize:b2, color:"4a4a4a"}}>Love it! I will totally order it adain!</Text>
                                      <View style={{flexDirection:'row', marginTop:10* windowHeightRatio, paddingBottom:10* windowHeightRatio}}>

                                          <Image source={demoFood} style={styleOrderDetailPage.uploadImageNew}/>
                                          <Image source={demoFood} style={styleOrderDetailPage.uploadImageNew}/>
                                      </View>
                                  </View>
                             </View>
      }else if(commonWidget.isOrderCommentable(this.state.order)){//if the order is commentable, show commet input area
  // }else if(1 == 3){//if the order is commentable, show commet input area // ben change it

            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBoxNew}>
                                    <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                        <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                    </View>
                                    <TextInput  placeholder="Please leave your comments."  multiline={true} style={styleOrderDetailPage.commentTextInputNew}></TextInput>
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
                                    <View style={{ paddingBottom:5* windowHeightRatio}}>
                                        <Text style={{fontSize:h3 , color:"#4a4a4a"}}>Upload Images (Optional)</Text>
                                    </View>

                                    <View style={styleOrderDetailPage.uploadImageViewNew}>

                                        <Image source={demoFood} style={styleOrderDetailPage.uploadImageNew}/>

                                        <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.uploadImageNew}>
                                                <Text style={styleOrderDetailPage.uploadBtnImageNew}>+</Text>
                                        </TouchableHighlight>
                                    </View>

                                    <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.submitCommentButton} onPress={()=>this.submitComment()}>
                                            <Text style={styleOrderDetailPage.submitCommentButtonText}>Submit</Text>
                                    </TouchableHighlight>
                                 </View>),
                                (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
        }else if(new Date().getTime()-this.state.order.orderDeliverTime > 7*24*60*60*1000){//if the order expired for comment, show disabled commentbox
        // }else if(1 == 1){
            commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBoxNew}>

                                    <View style={{paddingTop: 30 * windowHeightRatio, paddingBottom:20* windowHeightRatio}}>
                                        <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Reviews</Text>
                                    </View>


                                  {/*  <View style={styleOrderDetailPage.ratingCommentTimeView}>
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
                                    </View>*/}
                                    <TextInput placeholder="Order created 7 days ago cannot be reviewed" style={styleOrderDetailPage.commentTextInput2New} editable={false}/>
                                 </View>),
                                (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
       }else if(this.state.order.orderStatus.toLowerCase() != 'delivered'){//if order is not delivered,show comment suggestion
      // }else if(1 == 1){
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
                                    <View style={{ paddingBottom:5* windowHeightRatio}}>
                                        <Text style={{fontSize:h3 , color:"#4a4a4a"}}>Upload Images (Optional)</Text>
                                    </View>

                                    <View style={styleOrderDetailPage.uploadImageViewNew}>

                                        <Image source={demoFood} style={styleOrderDetailPage.uploadImageNew}/>

                                        <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.uploadImageNew}>
                                                <Text style={styleOrderDetailPage.uploadBtnImageNew}>+</Text>
                                        </TouchableHighlight>
                                    </View>

                                    <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.submitCommentButton} onPress={()=>this.submitComment()}>
                                            <Text style={styleOrderDetailPage.submitCommentButtonText}>Submit</Text>
                                    </TouchableHighlight>
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

        return (<View style={styles.containerNew}>
                  {/*  <View style={styles.headerBannerView}>
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
                    </View> */}


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
                      {/*  <View style={{paddingLeft: 20, paddingRight: 20, backgroundColor: "#EAEAEA",}}>

                        <View style={styleShoppingCartPage.orderSummaryNew}>
                            <Text style={styleShoppingCartPage.orderSummaryTextNew}>Order Summary</Text>
                        </View>
                        <View style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                            <Image source={receiptTop} style={styleShoppingCartPage.receiptTopBottomImageNew} />
                        </View>
                        <View style={styleShoppingCartPage.orderSummaryRowNew}>
                              <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                  <View style={styleShoppingCartPage.priceTitleView}>
                                      <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>OrderId</Text>
                                  </View>
                                  <View style={styleShoppingCartPage.priceNumberView}>
                                      <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>{this.state.order.orderId.substring(0,this.state.order.orderId.indexOf('-'))}</Text>
                                  </View>

                              </View>
                        </View>
                        <View style={styleShoppingCartPage.lineBackgroundNew}>
                            <Text style= {styleShoppingCartPage.lineNew}></Text>
                        </View>
                        <View style={styleShoppingCartPage.orderSummaryRowNew}>
                            <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                <View style={styleShoppingCartPage.priceTitleView}>
                                    <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Subtotal</Text>
                                </View>
                                <View style={styleShoppingCartPage.priceNumberView}>
                                    <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.order.price.subTotal}</Text>
                                </View>
                            </View>



                        </View>
                        <View style={styleShoppingCartPage.lineBackgroundNew}>
                            <Text style= {styleShoppingCartPage.lineNew}></Text>
                        </View>
                        <View style={styleShoppingCartPage.orderSummaryRowNew}>
                           <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                               <View style={styleShoppingCartPage.notesToChefTitleView}>
                                   <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Deliver To</Text>
                               </View>
                               <View style={styleShoppingCartPage.orderSummaryBoxViewAddressNew}>
                                   <Text style={styleShoppingCartPage.orderSummaryBoxValueAddressNew}>{commonWidget.getTextLengthLimited(fullDeliveryAddressNew,20)}</Text>
                               </View>
                               <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={'#F5F5F5'}
                               onPress={()=> Alert.alert( 'Deliver Address', fullDeliveryAddressNew,[ { text: 'Close' }])}>
                                   <Text style={styleShoppingCartPage.addressMoreButtonTextNew}>View</Text>
                               </TouchableHighlight>
                           </View>
                           <View style={styleShoppingCartPage.lineBackgroundNew}>
                               <Text style= {styleShoppingCartPage.lineNew}></Text>
                           </View>

                        </View>
                        <View style={styleShoppingCartPage.orderSummaryRowNew}>
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

                         </View>
                         <View style={styleShoppingCartPage.orderSummaryRowNew}>
                            <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                <View style={styleShoppingCartPage.priceTitleView}>
                                    <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Tax</Text>
                                </View>
                                <View style={styleShoppingCartPage.priceNumberView}>
                                    <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.order.price.tax}</Text>
                                </View>
                            </View>

                         </View>
                         <View style={styleShoppingCartPage.orderSummaryRowNew}>
                            <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                                <View style={styleShoppingCartPage.priceTitleView}>
                                    <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Total</Text>
                                </View>
                                <View style={styleShoppingCartPage.priceNumberView}>
                                    <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.order.price.grandTotal}</Text>
                                </View>
                            </View>

                         </View>

                         <View style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                             <Image source={receiptBottom} style={styleShoppingCartPage.receiptTopBottomImageNew} />
                         </View>













                        </View>*/}



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
        //alignItems:'center',
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
        backgroundColor:'#FFFFFF',
        //width:windowWidth*0.93,
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
      //  height:windowHeight*0.048,
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
      //  fontWeight:'600',
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
        //borderTopWidth:1,
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
      //  marginTop: 40 * windowHeightRatio,

        fontSize:windowHeight/37.056,
        fontWeight:'bold',
        color:'#F8C84E',

    },
    orderInfoViewNew:{
        flex:1,
        height: 112 * windowHeightRatio,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        //paddingRight:windowWidth/27.6,
        marginBottom: 10 * windowHeightRatio,
        paddingBottom: 10 * windowHeightRatio,
        position: "relative",
        //paddingVertical:windowHeight/73.6,
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
        // marginLeft: 20 * windowWidthRatio,
        // marginRight: 20* windowWidthRatio ,
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
        backgroundColor: "#EAEAEA",
        marginBottom:20 * windowHeightRatio,
        height: 84 * windowHeightRatio,
        // marginLeft: 20 * windowWidthRatio,
        // marginRight: 20* windowWidthRatio ,
    },
    commentTextInput2New:{
        padding:15 * windowWidthRatio,
        fontSize:b2,
        color:'#4A4A4A',
        backgroundColor: "#EAEAEA",
        marginBottom:20 * windowHeightRatio,
        height: 50 * windowHeightRatio,
        // marginLeft: 20 * windowWidthRatio,
        // marginRight: 20* windowWidthRatio ,
    },

    uploadImageViewNew: {
      //  backgroundColor: "#ccffcc",
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
        //backgroundColor: "#aaccaa",
        height: 80 * windowHeightRatio,
        fontWeight: '100',
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
        flex:0.14,
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
    },

    orderSummaryNew: {
      // marginLeft:20 * windowWidthRatio,
      // marginRight:20 * windowWidthRatio,
      backgroundColor: "#EAEAEA",
     paddingLeft:20 * windowWidthRatio,
      height: 54 * windowHeightRatio,
    //  alignItems: "center",
      justifyContent: "center",
    },
    orderSummaryTextNew:{
      fontSize: h3,
      fontWeight:"bold",
      color:"#4A4A4A",
    },
    receiptTopBottomImageViewNew: {
        backgroundColor: "#EAEAEA",

    },
    receiptTopImageNew: {
      height:8 * windowHeightRatio,
      width: windowWidth - (20 * windowWidthRatio)*2,
      backgroundColor: "#EAEAEA",
     marginLeft:20 * windowWidthRatio,
     marginRight:20 * windowWidthRatio,
    },

    receiptBottomImageNew: {
      height:8 * windowHeightRatio,
      width: windowWidth - (20 * windowWidthRatio)*2,
      backgroundColor: "#EAEAEA",
     marginLeft:20 * windowWidthRatio,
     marginRight:20 * windowWidthRatio,
     marginBottom: 30 * windowHeightRatio,
    },

    orderSummaryRowNew: {
      backgroundColor: "#EAEAEA",
  //    paddingLeft:20 * windowWidthRatio,
      //height: 65 * windowHeightRatio,
      justifyContent: "center",

    },

    orderSummaryBoxNew: {
        backgroundColor: "#FFFFFF",
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        flexDirection:'row',
        justifyContent:'center',
        //height: 65 * windowHeightRatio,
        // borderColor: "#EAEAEA",
        // borderBottomWidth: 3,
        width: windowWidth - (20 * windowWidthRatio)*2,
    },

    orderSummaryBoxTitleNew:{
        fontSize:h4,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginLeft: 15 * windowWidthRatio,
        marginTop:20,
        marginBottom: 20,

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
        paddingTop: 20* windowWidthRatio,
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
        // borderColor: "#EAEAEA",
        // borderBottomWidth: 3,
        // paddingLeft:20 * windowWidthRatio,
        // paddingRight:20 * windowWidthRatio,

    },
    lineNew: {
      backgroundColor: "#EAEAEA",
      height: 1,
      width:windowWidth - (35 * windowWidthRatio)*2,
      // marginLeft:30 * windowWidthRatio,
      // marginRight:30 * windowWidthRatio,

    },

    noteViewNew:{
        flexDirection:'row',
        //height:70 * windowHeightRatio,
        //paddingLeft:windowWidth/27.6,
        borderBottomWidth:1,
        borderColor:'#EAEAEA',
        justifyContent:'center',
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,


    },
    subtotalViewNew:{
        flexDirection:'row',
        //height:70 * windowHeightRatio,
        //paddingHorizontal:windowWidth/27.6,
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
        // marginBottom: 20 * windowHeightRatio,
         marginTop: 30 * windowHeightRatio,
        height:60 * windowHeightRatio

      //  backgroundColor: "#aaaa00",
    },
    notesToChefTitleViewNew:{
        flex:0.35,
        alignItems:'flex-start',
        alignSelf:'center',
        marginBottom: 20 * windowHeightRatio,
        marginTop: 20 * windowHeightRatio,
    },




});

module.exports = OrderDetailPage;
