'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var config = require('./config');
var {FBLogin} = require('react-native-facebook-login');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/icon-large-logo.png');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var dateRender = require('./commonModules/dateRender');
var validator = require('validator');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var LoadMoreBottomComponent = require('./loadMoreBottomComponent');
const eaterOrderPageSize = 7;
const firstTimeLoadPageSize = 14;
var lastDataCount = 0;
var enterPic = require('./icons/enter.png');
var orange_dot = require('./icons/orange_dot.png');
var meOff = require('./icons/me_off.png');
var meOn = require('./icons/me_on.png');

var ordersOff = require('./icons/orders_off.png');
var ordersOn = require('./icons/orders_on.png');

var shopsOff = require('./icons/shops_off.png');
var shopsOn = require('./icons/shops_on.png');

import Dimensions from 'Dimensions';
var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;

var h1 = 28*windowHeight/677;
var h2 = windowHeight/35.5;
var h3 = windowHeight/33.41;
var h4 = windowHeight/47.33;
var h5 = 12;
var b1 = 15*windowHeight/677;
var b2 = 15*windowHeight/677;

var newMessage = '';

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  PushNotificationIOS,
  AsyncStorage,
  Alert,
  ListView,
} from 'react-native';

const facebookPermissions = ["public_profile"];
var footerView = null;
class OrderPage extends Component {

  constructor(props) {
    super(props);
    var routeStack = this.props.navigator.state.routeStack;
    let eater = routeStack[0].passProps.eater;
    let principal = routeStack[0].passProps.principal;
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      eater: eater,
      principal:principal,
      dataSourceOrderPending: ds.cloneWithRows([]),
      orderPending:[],
      lastSortKeyOrders:null,
      isAllOrdersLoaded:false,
      orders:[],
      showNetworkUnavailableScreen:false,
      showProgress:false,
      showProgressBottom:false,
      orderPendingShow:false,
      hasOrderToReview:false,
      hasOrderReply:false,
    };

    newMessage = <Image source={orange_dot} style={styleOrderPage.dot} />
  }

  componentDidMount(){
    this.client = new HttpsClient(config.baseUrl, true);
    this.setState({showProgress: true});
    this.onOpenOrderPage();
    return this.fetchOrders();
}

  async fetchOrders() {
        const currentTime = new Date().getTime();
        const end = 'end=' + currentTime;
        const nextString = 'next=' + eaterOrderPageSize;
        if(!this.state.lastSortKeyOrders){//first time load all 7 days order
          var start = 'start=0';
          var queryStringOrders = start + '&' + end + '&next=' + firstTimeLoadPageSize;
        }else{
          var start = 'start=0';
          var lastSortKeyOrdersString = 'lastSortKey=' + this.state.lastSortKeyOrders;
          var queryStringOrders = start + '&' + end + '&' + lastSortKeyOrdersString + '&' + nextString
        }

        if(!this.state.lastSortKeyComments){//first time load all 7 days order
          const start = 'start=0';
          var queryStringComments = start + '&' + end + '&next= ' + firstTimeLoadPageSize;
        }else{
          var start = 'start=0';
          var lastSortKeyCommentsString = 'lastSortKey=' + this.state.lastSortKeyComments;
          var queryStringComments = start + '&' + end + '&' + lastSortKeyCommentsString + '&' + nextString
        }

        let eater = await AuthService.getPrincipalInfo();
        try{
          var resOrders = await this.client.getWithAuth(config.orderHistoryEndpoint+eater.userId+'?'+queryStringOrders);
          this.setState({showProgress:false,showProgressBottom:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress:false,showProgressBottom:false,showNetworkUnavailableScreen:true});
          commonAlert.networkError(err);
          return;
        }

        try{
          var resComments = await this.client.getWithAuth(config.orderCommentEndpoint+eater.userId+'?'+queryStringComments);
          this.setState({showProgress:false,showProgressBottom:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress:false,showProgressBottom:false,showNetworkUnavailableScreen:true});
          commonAlert.networkError(err);
          return;
        }

        if (resOrders && resOrders.statusCode != 200 && resOrders.statusCode != 202) {
            this.setState({showProgress:false,showProgressBottom:false,});
            return this.responseHandler(resOrders);
        }
        if (resComments && resComments.statusCode != 200 && resComments.statusCode != 202) {
            this.setState({showProgress:false,showProgressBottom:false,});
            return this.responseHandler(resComments);
        }

        if (resOrders.data || resComments.data){
            if(!this.state.lastSortKeyOrders && !this.state.lastSortKeyComments){
              this.state.orders = resOrders.data.orders;
              this.state.comments = resComments.data.comments;
            }else{
              this.state.orders = this.state.orders.concat(resOrders.data.orders);
              this.state.comments = this.state.comments.concat(resComments.data.comments);
            }

            if(resOrders.data.lastSortKey && this.state.lastSortKeyOrders != resOrders.data.lastSortKey){
              this.state.lastSortKeyOrders = resOrders.data.lastSortKey
            }else if(!resOrders.data.lastSortKey){
              this.setState({isAllOrdersLoaded:true});
            }else{
              return;
            }

            if(resComments.data.lastSortKey){
              this.state.lastSortKeyComments = resComments.data.lastSortKey
            }

            for(var comment of this.state.comments){
                for(var order of this.state.orders){
                    if(order.orderId == comment.orderId){
                      order.comment = comment;
                    }
                }
            }
            var orderPending = [];
            var orderNeedReview = [];
            for(var oneOrder of this.state.orders){
                if(commonWidget.isOrderPending(oneOrder)){
                   orderPending.push(oneOrder);
                }else if(commonWidget.isOrderCommentable(oneOrder)){
                   orderNeedReview.push(oneOrder);
               }
            }

            var dd = this.state.orders.length;
            if (dd > 10) {
                footerView = <LoadMoreBottomComponent isAllItemsLoaded={this.state.isAllOrdersLoaded} itemsName={'Orders'} isloading={this.state.showProgressBottom} pressToLoadMore={this.loadMoreOrders.bind(this)}/>
            } else {
                footerView = null;
            }

            this.setState({
                          dataSourceOrderPending: this.state.dataSourceOrderPending.cloneWithRows(orderPending),
                          showProgress:false,
                          showProgressBottom:false,
                          orderPending:orderPending,
                          orders:JSON.parse(JSON.stringify(this.state.orders)),
                          orderPendingShow:(orderPending.length > 0),
                          hasOrderToReview:(orderNeedReview.length > 0)
                        });
        }
    }

    ShowHideTextComponentView = () =>{
      this.setState({orderPendingShow: !this.state.orderPendingShow})
    }

    renderRow(order){
      return  (
        <TouchableOpacity onPress={()=>this.navigateToOrderDetailPage(order)} activeOpacity={0.7}>
        <View style={styleOrderPage.cell}>
            <View style={styleOrderPage.oneListingView}>
                <View style={styleOrderPage.orderInfoView}>
                    <Text style={styleOrderPage.shopNameText}>{order.shopname}</Text>
                    <Text style={styleOrderPage.completeTimeText}>
                    Order Placed: {dateRender.renderDate2(order.orderCreatedTime)}
                    </Text>
                    <Text style={styleOrderPage.completeTimeText}>
                    Status: {order.orderStatus}
                    </Text>
                </View>
                <Image source={enterPic} style={styleOrderPage.enterPicNew}/>
            </View>
        </View>
      </TouchableOpacity>
     );
    }

    renderFooter(){
      if(this.state.orders && this.state.orders.length > 0 && this.state.orders.length >= firstTimeLoadPageSize){
        return footerView;
      }
    }


    render(){
      var n = 0;
      if(this.state.orderPending.length > 3){
         n = 3;
      }else{
         n = this.state.orderPending.length;
      }

      return(
        <View style={styles.containerNew}>
        <Image style={styles.pageBackgroundImage} source={backgroundImage}>
          <View style={styles.headerBannerViewNew}>
              <View style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToHistoryOrderPage()}>
              </View>
              <View style={styles.headerRightView}>
              </View>
          </View>
          <View style={styles.titleViewNew}>
              <Text style={styles.titleTextNew}>Orders</Text>
          </View>
          {this.state.orderPendingShow ?
          <View>
              <View style={styleOrderPage.ongoingView}>
                <TouchableOpacity style={styleOrderPage.ongoingTouchable} onPress={this.ShowHideTextComponentView}>
                  <Text style={styleOrderPage.ongoingTextTop}>Ongoing Orders ({this.state.eater.orderOngoing})</Text>
                </TouchableOpacity>
                </View>
                <View style={{height: n * 80 * windowHeightRatio, alignItems: 'center', width:windowWidth - 76 * windowWidthRatio, marginLeft: 56 * windowWidthRatio, paddingBottom: 15 * windowHeightRatio,}}>
                    <ListView
                    dataSource = {this.state.dataSourceOrderPending}
                    renderRow={this.renderRow.bind(this) }
                    renderFooter={ this.renderFooter.bind(this) }
                    pageSize={10}
                    initialListSize={1}/>
                </View>
          </View> :
          <TouchableOpacity style={styleOrderPage.ongoingTouchable} onPress={this.ShowHideTextComponentView}>
              <View style={styleOrderPage.ongoingView}>
                <Text style={styleOrderPage.ongoingText2Top}>Ongoing Orders ({this.state.eater.orderOngoing})</Text>
              </View>
          </TouchableOpacity>}

          <View style={styleOrderPage.dividerView}><Text style={styleOrderPage.dividerLineTop}></Text></View>
          <TouchableOpacity style={styleOrderPage.ongoingTouchable}  onPress={() => this.onPressNeedReviewsOrdersBtn()}>
              <View style={styleOrderPage.reviewsView}>
              <Text style={styleOrderPage.ongoingText}>Orders Need Review ({this.state.eater.orderNeedComments})</Text>
                  {this.state.hasOrderToReview ? newMessage : null}
              </View>
          </TouchableOpacity>

          <View style={styleOrderPage.dividerView}><Text style={styleOrderPage.dividerLine}></Text></View>
          <TouchableOpacity style={styleOrderPage.ongoingTouchable}  onPress={() => this.onPressCompleteOrdersBtn()}>
              <View style={styleOrderPage.reviewsView}>
              <Text style={styleOrderPage.ongoingText}>Completed Orders ({this.state.eater.orderCount - this.state.eater.orderOngoing - this.state.eater.orderNeedComments})</Text>
              </View>
          </TouchableOpacity>

          <View style={styleOrderPage.dividerView}><Text style={styleOrderPage.dividerLine}></Text></View>

          <View style={styleOrderPage.placeHolderView}></View>
          <View style = {styles.tabBarNew}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                  <TouchableHighlight underlayColor={'#F5F5F5'} onPress={() => this.onPressShopsTabBtn()}>
                      <View style={styles.tabBarButtonNew}>
                          <Image source={shopsOff}  style={styles.tabBarButtonImageShop}/>
                          <View>
                            <Text style={styles.tabBarButtonTextOffNew}>Shops</Text>
                          </View>
                      </View>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={'#F5F5F5'}>
                      <View style={styles.tabBarButtonNew}>
                          <Image source={ordersOn}  style={styles.tabBarButtonImageOrder}/>
                          <View>
                            <Text style={styles.tabBarButtonTextOnNew}>Orders</Text>
                          </View>
                      </View>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={'#F5F5F5'} onPress={() => this.onPressMeTabBtn()}>
                      <View style={styles.tabBarButtonNew}>
                          <Image source={meOff}  style={styles.tabBarButtonImageMe}/>
                          <View>
                            <Text style={styles.tabBarButtonTextOffNew}>Me</Text>
                          </View>
                      </View>
                  </TouchableHighlight>
              </View>
          </View>
        </Image>
        </View>);
    }

    async onOpenOrderPage() {
      this.setState({ isMenuOpen: true });
      if (this.state.eater) {
        let res = await this.client.getWithAuth(config.eaterEndpoint);
        this.setState({ eater: res.data.eater });
      }
    }

    loadMoreOrders(){
      this.setState({showProgressBottom:true});
      this.fetchOrders();
    }

    navigateBackToHistoryOrderPage(){
        if(this.callback && (this.state.order.orderStatus!=this.state.orderStatus||this.state.ratingSucceed)){
           this.callback(this.state.order);
        }
        this.props.navigator.pop();
    }

    onPressCompleteOrdersBtn(){
      this.props.navigator.push({
          name: 'HistoryOrderPage',
          passProps: {
             eater: this.state.eater,
             orderType:'orderCompleted'
          }
      });
    }

    onPressNeedReviewsOrdersBtn(){
      this.props.navigator.push({
          name: 'HistoryOrderPage',
          passProps: {
             eater: this.state.eater,
             orderType:'orderNeedReview'
          }
      });
    }

    onPressShopsTabBtn(){
        this.props.navigator.resetTo({
          name: 'ChefListPage',
        });
    }

    onPressMeTabBtn(){
      this.props.navigator.resetTo({
          name: 'EaterPage',
          passProps:{
              eater:this.state.eater,
              principal:this.state.principal,
              callback: function(eater){
                  this.props.caller.setState({eater:eater});
              }.bind(this)
          }
      });
    }

    navigateToOrderDetailPage(order){
      console.log('navigateToOrderDetailPage_orderPage ' + this.state.eater);
      this.props.navigator.push({
          name: 'OrderDetailPage',
          passProps:{
              eater:this.state.eater,
              order:order,
          }
      });
    }
  }


  var styleOrderPage = StyleSheet.create({

  ongoingView:{
    marginLeft: 20 * windowWidthRatio,
  },
  ongoingTouchable:{
    width: windowWidth,
  },
  ongoingText:{
    fontWeight: 'bold',
    fontSize: h2,
    color: '#4a4a4a',
    paddingTop: 20 * windowHeightRatio,
    paddingBottom:  20 * windowHeightRatio,
  },
  ongoingTextTop:{
    fontWeight: 'bold',
    fontSize: h2,
    color: '#4a4a4a',
    paddingBottom: 5 * windowHeightRatio,
    paddingBottom:  15 * windowHeightRatio,
  },
  ongoingText2Top:{
    fontWeight: 'bold',
    fontSize: h2,
    color: '#4a4a4a',
    paddingBottom:  20 * windowHeightRatio,
  },
  dividerView:{
    width: windowWidth,
    alignItems: 'center',
  },
  dividerLine:{
    height: 1,
    backgroundColor : '#EAEAEA',
    width: windowWidth - 40 * windowWidthRatio,
    marginLeft: 20 * windowWidthRatio,
    marginRight: 20* windowWidthRatio,
  },
  dividerLineTop:{
    height: 1,
    backgroundColor : '#EAEAEA',
    width: windowWidth - 40 * windowWidthRatio,
    marginLeft: 20 * windowWidthRatio,
    marginRight: 20* windowWidthRatio,
  },

  reviewsView:{
    marginLeft: 20* windowWidthRatio,
    alignItems : 'center',
    flexDirection: 'row'
  },
  dot:{
    height: 10 * windowWidthRatio,
    width: 10 * windowWidthRatio,
    marginTop:-15,
  },

  cell: {
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    width:windowWidth - 76 * windowWidthRatio,
  },
  oneListingView:{
      backgroundColor:'#FFFFFF',
      flexDirection:'row',
      flex:1,
      borderBottomWidth:0,
  },
  orderInfoView:{
      flex:1,
    //  height:windowWidth*0.333,
      flexDirection:'column',
      paddingLeft:0,
      paddingRight:0,
      paddingTop:10 * windowHeightRatio,
      paddingBottom:10 * windowHeightRatio,
  },
  completeTimeText:{
      fontSize:h4,
      color:'#979797',
      //marginTop:windowHeight*0.009,
  },
  enterPicNew:{
    top:35 * windowHeightRatio,
      width:6 * windowWidthRatio,
      height:13 * windowHeightRatio,
      right: 0,
  },

  cell: {
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    width:windowWidth - 76 * windowWidthRatio,

    // marginRight:20 * windowWidthRatio,
  //  marginLeft:56 * windowWidthRatio,
  },
  oneListingView:{
      backgroundColor:'#FFFFFF',
      flexDirection:'row',
      flex:1,
      borderBottomWidth:0,
  },
  orderInfoView:{
      flex:1,
    //  height:windowWidth*0.333,
      flexDirection:'column',
      paddingLeft:0,
      paddingRight:0,
      paddingTop:10 * windowHeightRatio,
      paddingBottom:10 * windowHeightRatio,
  },
  completeTimeText:{
      fontSize:h4,
      color:'#979797',
      //marginTop:windowHeight*0.009,
  },
  enterPicNew:{
    top:35 * windowHeightRatio,
      width:6 * windowWidthRatio,
      height:13 * windowHeightRatio,
      right: 0,
  },
  placeHolderView:{
    flex:1,
  }
});

module.exports = OrderPage;
