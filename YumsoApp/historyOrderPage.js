'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var backIcon = require('./icons/icon-back.png');
var defaultShopPic = require('./icons/defaultAvatar.jpg');
var enterPic = require('./icons/enter.png');
var RefreshableListView = require('react-native-refreshable-listview');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen');
var LoadMoreBottomComponent = require('./loadMoreBottomComponent');
const eaterOrderPageSize = 7;
const firstTimeLoadPageSize = 14;
var lastDataCount = 0;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  Picker
} from 'react-native';

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

var selectedHeader = 'orderNeedReview';
//var footerView = null;

class HistoryOrderPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2
        });
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length-1].passProps.eater;
        let orderType = routeStack[routeStack.length-1].passProps.orderType;
        if (orderType == 'orderNeedReview') {
            selectedHeader = 'Orders Need Reviews';
        }
        else{
            selectedHeader = 'Completed Orders';
        }
        this.state = {
            dataSourceOrderPending: ds.cloneWithRows([]),
            dataSourceNeedReview: ds.cloneWithRows([]),
            dataSourceCompleted: ds.cloneWithRows([]),
            showProgress:false,
            showProgressBottom:false,
            showCommentBox:false,
            showNetworkUnavailableScreen:false,
            eater:eater,
            orderPending:[],
            orderNeedReview:[],
            orderCompleted:[],
            orderListSelect:orderType,
            orders:[],
            comments:[],
            lastSortKeyOrders:null,
            lastSortKeyComments:null,
            isAllOrdersLoaded:false,
        };
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
                                    this.componentDidMount();
                                }.bind(this)
                            }
                        });
                    });
            } else {
                 Alert.alert( 'Network or server error', 'Please try again later',[ { text: 'OK' }]);
                 this.setState({showProgress: false,showNetworkUnavailableScreen:true});
            }
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.setState({showProgress: true});
        return this.fetchOrderAndComments();
    }

    async fetchOrderAndComments() {
        const currentTime = new Date().getTime();
        //const oneWeekAgo = currentTime - 7*24*60*60*1000;
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
          console.log(resOrders);
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
            var orderCompleted = [];
            for(var oneOrder of this.state.orders){
                if(commonWidget.isOrderPending(oneOrder)){
                   orderPending.push(oneOrder);
                }else if(commonWidget.isOrderCommentable(oneOrder)){
                   orderNeedReview.push(oneOrder);
                }else{
                   orderCompleted.push(oneOrder);
                }
            }
            console.log("AllOrder: ");
            console.log(this.state.orders.length);
            // var dd = this.state.orders.length;
            //
            // if (dd > 10) {
            //   footerView = <LoadMoreBottomComponent isAllItemsLoaded={this.state.isAllOrdersLoaded} itemsName={'Orders'} isloading={this.state.showProgressBottom} pressToLoadMore={this.loadMoreOrders.bind(this)}/>
            //
            // } else {
            //   footerView = null;
            // }

            this.setState({
                           dataSourceOrderPending: this.state.dataSourceOrderPending.cloneWithRows(this.state.orders),
                           dataSourceNeedReview: this.state.dataSourceNeedReview.cloneWithRows(orderNeedReview),
                           dataSourceCompleted: this.state.dataSourceCompleted.cloneWithRows(orderCompleted),
                           showProgress:false,
                           showProgressBottom:false,
                           orderPending:orderPending,
                           orderNeedReview:orderNeedReview,
                           orderCompleted:orderCompleted,
                           orders:JSON.parse(JSON.stringify(this.state.orders)),
                         });
        }
    }

    loadMoreOrders(){
           console.log('loadMoreOrders');
           this.setState({showProgressBottom:true});
           this.fetchOrderAndComments();
    }

    renderRow(order){
        if(commonWidget.isOrderCommentable(order)){
           var action = "Review Order";
        }else if(commonWidget.isOrderPending(order)){
           if(order.orderStatus=='new'){
              var action = "New Order"
           }else{
              var action = "Delivering"
           }
        }else{
           var action = "See Details"
        }

        if(order.orderStatus.toLowerCase() == 'cancelled'){
          var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>
                                Cancelled
                                </Text>

          var orderStatusText2 = <Text style={styleHistoryOrderPage.completeTimeText}>
                                Status: cancelled
                                </Text>

        }else{
           var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>
                                 Order Placed: {dateRender.renderDate2(order.orderCreatedTime)}
                                 </Text>

          var orderStatusText2 = <Text style={styleHistoryOrderPage.completeTimeText}>
                                  Status: delivered
                                  </Text>
        }

        if(order.shopPictures && order.shopPictures[0]){
           var imageSrc = {uri:order.shopPictures[0]};
        }else{
           var imageSrc = defaultShopPic;
        }

        return  (
                    <TouchableOpacity onPress={()=>this.navigateToOrderDetailPage(order)} activeOpacity={0.7}>
                    <View style={styleHistoryOrderPage.cell}>
                        <View key={order.orderId} style={styleHistoryOrderPage.oneListingView}>
                          {/*  <Image source={imageSrc} style={styleHistoryOrderPage.shopPhoto}/> */}
                            <View style={styleHistoryOrderPage.orderInfoView}>
                                <Text style={styleHistoryOrderPage.shopNameText}>{order.shopname}</Text>
                                {/*<Text style={styleHistoryOrderPage.completeTimeText}>
                                OrderId: {order.orderIdShort}
                                </Text>   */}
                                {orderStatusText}
                                {orderStatusText2}

                              {/*  <Text style={styleHistoryOrderPage.grandTotalText}>Total: ${order.price.grandTotal}</Text>
                                <View style={styleHistoryOrderPage.orderDetailsClickableView}>
                                   <Text style={styleHistoryOrderPage.orderDetailsClickable}>{action}</Text>
                                </View>*/}
                            </View>
                            <Image source={enterPic} style={styleHistoryOrderPage.enterPicNew}/>
                        </View>

                        </View>
                    </TouchableOpacity>
                 );
    }

    renderFooter(){
       console.log(this.state.orders)
       if(this.state.orders && this.state.orders.length > 0 && this.state.orders.length >= firstTimeLoadPageSize){

         var dd = this.state.orders.length;

         if (dd > 10) {
           return <LoadMoreBottomComponent isAllItemsLoaded={this.state.isAllOrdersLoaded} itemsName={'Orders'} isloading={this.state.showProgressBottom} pressToLoadMore={this.loadMoreOrders.bind(this)}/>;

         } else {
           return null
         }
       }
    }

    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>
        }
        var orderListView = null;
        var networkUnavailableView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.componentDidMount.bind(this)} />
        }else{
           if(this.state.orderListSelect=='orderPending'){
              if(this.state.orderPending && this.state.orderPending.length==0 && !this.state.showProgress){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order pending.</Text>
              }
              //console.log('orderPending')
              var orderListView = <RefreshableListView
                                            dataSource = {this.state.dataSourceOrderPending}
                                            renderRow={this.renderRow.bind(this) }
                                            renderFooter={ this.renderFooter.bind(this) }
                                            pageSize={10}
                                            initialListSize={1}
                                            loadData={this.fetchOrderAndComments.bind(this)}/>
           }else if(this.state.orderListSelect=='orderNeedReview'){
              if(this.state.orderNeedReview && this.state.orderNeedReview.length==0 && !this.state.showProgress){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order needs review.</Text>
              }
              //console.log('orderNeedReview')
              else{

                  var orderListView =  <RefreshableListView
                                        dataSource = {this.state.dataSourceNeedReview}
                                        renderRow={this.renderRow.bind(this) }
                                        renderFooter={ this.renderFooter.bind(this) }
                                        pageSize={10}
                                        initialListSize={1}
                                        loadData={this.fetchOrderAndComments.bind(this)}/>;
              }
            }else{
              //console.log('completed')

             if(this.state.orderCompleted && this.state.orderCompleted.length==0 && !this.state.showProgress){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order completed.</Text>
              }
              else{

                  var orderListView = <ListView
                                       dataSource = {this.state.dataSourceCompleted}
                                       renderRow={this.renderRow.bind(this) }
                                       renderFooter={ this.renderFooter.bind(this) }
                                       pageSize={10}
                                       initialListSize={1}/>;

              }
           }
        }

        return (
            <View style={styles.containerNew}>
              {/* <View style={styles.headerBannerView}>
                   <TouchableHighlight style={styles.headerLeftView} underlayColor={'#000'} onPress={() => this.navigateBackToChefList()}>
                      <View style={styles.backButtonView}>
                        <Image source={backIcon} style={styles.backButtonIcon}/>
                      </View>
                   </TouchableHighlight>
                   <View style={styles.titleView}>
                      <Text style={styles.titleText}>My Orders</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View> */}

               <View style={styles.headerBannerViewNew}>

                   <TouchableHighlight style={styles.headerLeftView} underlayColor={'#fff'} onPress={() => this.navigateBackToChefList()}>
                      <View style={styles.backButtonViewsNew}>
                        <Image source={backIcon} style={styles.backButtonIconsNew}/>
                      </View>
                   </TouchableHighlight>

                   <View style={styles.headerRightView}>
                   </View>
               </View>
               <View style={styles.titleViewNew}>
                   <Text style={styles.titleTextNew}>{selectedHeader}</Text>
               </View>

            {/*}   <View style={styleHistoryOrderPage.orderListSelectView}>
                   <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleOrderList('orderPending') }
                    style={{flex:1/3,flexDirection:'row',justifyContent:'center',alignItems:'center',
                    backgroundColor:this.renderOrderListOnSelectColor('orderPending')}}>
                      <Text style={styleHistoryOrderPage.oneOrderListSelectText}>Pending</Text>
                   </TouchableHighlight>
                   <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleOrderList('orderNeedReview') }
                    style={{flex:1/3,flexDirection:'row',justifyContent:'center',alignItems:'center',borderColor:'#F5F5F5', borderLeftWidth:1,borderRightWidth:1,
                    backgroundColor:this.renderOrderListOnSelectColor('orderNeedReview')}}>
                      <Text style={styleHistoryOrderPage.oneOrderListSelectText}>Need Review</Text>
                   </TouchableHighlight>
                   <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleOrderList('orderCompleted') }
                    style={{flex:1/3,flexDirection:'row',justifyContent:'center',alignItems:'center',
                    backgroundColor:this.renderOrderListOnSelectColor('orderCompleted')}}>
                      <Text style={styleHistoryOrderPage.oneOrderListSelectText}>Completed</Text>
                   </TouchableHighlight>
                </View> */}

               {networkUnavailableView}
               {noOrderText}
               {orderListView}
               {loadingSpinnerView}
            </View>
        );
    }

    navigateBackToChefList() {
        this.props.navigator.pop();
    }

    toggleOrderList(orderListSelectName){
        if(orderListSelectName!=this.state.orderListSelect){
           this.setState({orderListSelect:orderListSelectName});
        }
        // if(orderListSelectName == 'orderPending' || orderListSelectName == 'orderNeedReview'){
        //    this.setState({lastSortKeyOrders:null,lastSortKeyComments:null,});
        // }
    }

    renderOrderListOnSelectColor(orderListSelectName){
         if(this.state.orderListSelect == orderListSelectName){
            return '#FFFFFF';
         }else{
            return '#F5F5F5';
         }
    }

    updateOneOrder(order){
        for(oneOrder of this.state.orders){
            if(order.orderId == oneOrder.orderId){
               oneOrder['orderStatus'] = order.orderStatus;
               oneOrder['orderDeliverTime'] = order.orderDeliverTime;
               oneOrder['comment'] = order.comment;
               break;
            }
        }

        let orderPending = [];
        let orderNeedReview = [];
        let orderCompleted = [];
        for(var oneOrder of this.state.orders){
            if(commonWidget.isOrderPending(oneOrder)){
               orderPending.push(oneOrder);
            }else if(commonWidget.isOrderCommentable(oneOrder)){
               orderNeedReview.push(oneOrder);
            }else{
               orderCompleted.push(oneOrder);
            }
        }
        this.setState({
                           dataSourceOrderPending: new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2}).cloneWithRows(orderPending),
                           dataSourceNeedReview: new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2}).cloneWithRows(orderNeedReview),
                           dataSourceCompleted: new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2}).cloneWithRows(orderCompleted),
                           showProgress:false,
                           orderPending:orderPending,
                           orderNeedReview:orderNeedReview,
                           orderCompleted:orderCompleted,
                     });
    }

    navigateToOrderDetailPage(order){
        this.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'OrderDetailPage',
            passProps:{
                eater:this.state.eater,
                order:order,
                callback: this.updateOneOrder.bind(this) //todo: force rerender or just setState
            }
        });
    }
}

var styleHistoryOrderPage = StyleSheet.create({
    oneListingView:{
        backgroundColor:'#FFFFFF',
        flexDirection:'row',
        flex:1,
      //  borderColor:'#F5F5F5',
        borderBottomWidth:0,
    },
    shopPhoto:{
        width:windowWidth*0.333,
        height:windowWidth*0.333,
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
    shopNameText:{
        fontSize:h3,
        //fontWeight:'bold',
        color:'#4A4A4A',
    },
    grandTotalText:{
        fontSize:windowHeight/47.33,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginTop:windowHeight*0.009,
    },
    completeTimeText:{
        fontSize:h4,
        color:'#979797',
        //marginTop:windowHeight*0.009,
    },
    orderDetailsClickableView:{
        flexDirection:'row',
        justifyContent:'flex-end',
        flex:1,
    },
    orderDetailsClickable:{
        fontSize:windowHeight/51.636,
        fontWeight:'bold',
        color:'#F8C84E',
        alignSelf:'flex-end',
    },
    orderListSelectView:{
        height:windowHeight/14.72,
        flexDirection:'row',
    },
    oneOrderListSelectText:{
        fontSize:windowHeight/40.88,
        color:'#4A4A4A',
        fontWeight:'500',
    },
    enterPicNew:{
      top:35 * windowHeightRatio,
        width:6 * windowWidthRatio,
        height:13 * windowHeightRatio,
        right: 0,
    },
    bottomLine: {
      marginLeft: 20 * windowWidthRatio,
      marginRight: 20 * windowWidthRatio,
      backgroundColor: "#EAEAEA",
      height: 1,
    },

    cell: {
      borderBottomWidth: 1,
      borderColor: "#EAEAEA",
      marginRight:20 * windowWidthRatio,
      marginLeft:20 * windowWidthRatio,
    }

});

module.exports = HistoryOrderPage;
