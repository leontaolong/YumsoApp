'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var backIcon = require('./icons/icon-back.png');
var defaultShopPic = require('./icons/defaultAvatar.jpg');
var RefreshableListView = require('react-native-refreshable-listview');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')

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

class HistoryOrderPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length-1].passProps.eater;      
        this.state = {
            dataSourceOrderPending: ds.cloneWithRows([]),
            dataSourceNeedReview: ds.cloneWithRows([]),
            dataSourceCompleted: ds.cloneWithRows([]),
            showProgress:false,
            showCommentBox:false,
            showNetworkUnavailableScreen:false,
            eater:eater,
            orderListSelect:'orderCompleted',
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
        const start = 'start=0';
        const end = 'end='+ new Date().getTime();
        let eater = await AuthService.getPrincipalInfo();
        try{
          var pastOneWeekOrder = await this.client.getWithAuth(config.orderHistoryEndpoint+eater.userId+'?'+start+'&'+end);
          this.setState({showProgress:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress: false,showNetworkUnavailableScreen:true});
          commonAlert.networkError(err);
          return;
        }

        try{
          var pastOneWeekComment = await this.client.getWithAuth(config.orderCommentEndpoint+eater.userId+'?'+start+'&'+end);
          this.setState({showProgress:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress: false,showNetworkUnavailableScreen:true});
          commonAlert.networkError(err);
          return;
        }
    
        if (pastOneWeekOrder && pastOneWeekOrder.statusCode != 200 && pastOneWeekOrder.statusCode != 202) {
            this.setState({showProgress:false});
            return this.responseHandler(pastOneWeekOrder);
        }
        if (pastOneWeekComment && pastOneWeekOrder.statusCode != 200 && pastOneWeekOrder.statusCode != 202) {
            this.setState({showProgress:false});  
            return this.responseHandler(pastOneWeekOrder);
        }

        if (pastOneWeekOrder && pastOneWeekOrder.data && pastOneWeekComment && pastOneWeekComment.data){
            let orders = pastOneWeekOrder.data.orders;
            let comments = pastOneWeekComment.data.comments;
            //console.log(orders); 
            for(var comment of comments){
                for(var order of orders){
                    if(order.orderId==comment.orderId){
                       order.comment = comment;
                    }
                }
            }

            var orderPending = [];
            var orderNeedReview = [];
            var orderCompleted = [];
            for(var oneOrder of orders){
                if(commonWidget.isOrderPending(oneOrder)){
                   orderPending.push(oneOrder);
                }else if(commonWidget.isOrderCommentable(oneOrder)){
                   orderNeedReview.push(oneOrder);
                }else{
                   orderCompleted.push(oneOrder);
                }
            }
            this.setState({
                           dataSourceOrderPending: this.state.dataSourceOrderPending.cloneWithRows(orderPending),
                           dataSourceNeedReview: this.state.dataSourceNeedReview.cloneWithRows(orderNeedReview),
                           dataSourceCompleted: this.state.dataSourceCompleted.cloneWithRows(orderCompleted),
                           showProgress:false, 
                           orderPending:orderPending,
                           orderNeedReview:orderNeedReview,
                           orderCompleted:orderCompleted,
                           orders:orders,
                         });
        }
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
        }else{
           var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>
                                 Placed at {dateRender.renderDate2(order.orderCreatedTime)}
                                 </Text>
        }

        if(order.shopPictures && order.shopPictures[0]){
           var imageSrc = {uri:order.shopPictures[0]};
        }else{
           var imageSrc = defaultShopPic;
        }
     
        return  (
                    <TouchableOpacity onPress={()=>this.navigateToOrderDetailPage(order)} activeOpacity={0.7}> 
                        <View key={order.orderId} style={styleHistoryOrderPage.oneListingView}>
                            <Image source={imageSrc} style={styleHistoryOrderPage.shopPhoto}/>
                            <View style={styleHistoryOrderPage.orderInfoView}>
                                <Text style={styleHistoryOrderPage.shopNameText}>{order.shopname}</Text> 
                                <Text style={styleHistoryOrderPage.completeTimeText}>
                                OrderId: {order.orderIdShort}
                                </Text>                                                         
                                {orderStatusText}           
                                <Text style={styleHistoryOrderPage.grandTotalText}>Total: ${order.price.grandTotal}</Text>
                                <View style={styleHistoryOrderPage.orderDetailsClickableView}>
                                   <Text style={styleHistoryOrderPage.orderDetailsClickable}>{action}</Text>                                                                               
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                 );
    }
        
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>  
        }
        var orderListView = null;
        var networkUnavailableView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchOrderAndComments.bind(this)} />
        }else{
           var orderPendingListView = <RefreshableListView
                                            dataSource = {this.state.dataSourceOrderPending}
                                            renderRow={this.renderRow.bind(this) }
                                            loadData={this.fetchOrderAndComments.bind(this)}/>
            
           var orderNeedReviewListView = <RefreshableListView
                                            dataSource = {this.state.dataSourceNeedReview}
                                            renderRow={this.renderRow.bind(this) }
                                            loadData={this.fetchOrderAndComments.bind(this)}/>
           
           var orderCompletedListView = <RefreshableListView
                                            dataSource = {this.state.dataSourceCompleted}
                                            renderRow={this.renderRow.bind(this) }
                                            loadData={this.fetchOrderAndComments.bind(this)}/>

           if(this.state.orderListSelect=='orderPending'){
              if(this.state.orderPending && this.state.orderPending.length==0){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order pending.</Text>
              }
              orderListView = orderPendingListView;
           }else if(this.state.orderListSelect=='orderNeedReview'){
              if(this.state.orderNeedReview && this.state.orderNeedReview.length==0){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order needs review.</Text>
              }
              orderListView = orderNeedReviewListView;
            }else{
              if(this.state.orderCompleted && this.state.orderCompleted.length==0){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order completed.</Text>
              }
              orderListView = orderCompletedListView;
           }
        }
        
        return (
            <View style={styles.greyContainer}>
               <View style={styles.headerBannerView}>    
                   <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToChefList()}>
                      <View style={styles.backButtonView}>
                        <Image source={backIcon} style={styles.backButtonIcon}/>
                      </View>
                   </TouchableHighlight>    
                   <View style={styles.titleView}>
                      <Text style={styles.titleText}>My Orders</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View>
               <View style={styleHistoryOrderPage.orderListSelectView}>
                   <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleOrderList('orderPending') } 
                    style={{flex:1/3,flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:this.renderOrderListOnSelectColor('orderPending')}}>
                      <Text style={styleHistoryOrderPage.oneOrderListSelectText}>Pending</Text>
                   </TouchableHighlight>
                   <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleOrderList('orderNeedReview') } 
                    style={{flex:1/3,flexDirection:'row',justifyContent:'center',alignItems:'center',borderColor:'#F5F5F5', borderLeftWidth:1,borderRightWidth:1,
                    backgroundColor:this.renderOrderListOnSelectColor('orderNeedReview')}}>
                      <Text style={styleHistoryOrderPage.oneOrderListSelectText}>Need Review</Text>
                   </TouchableHighlight>
                   <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleOrderList('orderCompleted') }
                    style={{flex:1/3,flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:this.renderOrderListOnSelectColor('orderCompleted')}}>
                      <Text style={styleHistoryOrderPage.oneOrderListSelectText}>Completed</Text>
                   </TouchableHighlight>
                </View>
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
        borderColor:'#F5F5F5',
        borderBottomWidth:5,
    },
    shopPhoto:{
        width:windowWidth*0.333,
        height:windowWidth*0.333,
    },
    orderInfoView:{
        flex:1,
        height:windowWidth*0.333,
        flexDirection:'column',
        paddingLeft:windowWidth*0.04,
        paddingRight:windowWidth*0.048,
        paddingTop:windowWidth*0.024,
        paddingBottom:windowWidth*0.024,
    },
    shopNameText:{
        fontSize:windowHeight/35.5,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    grandTotalText:{
        fontSize:windowHeight/47.33,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginTop:windowHeight*0.009,
    },
    completeTimeText:{
        fontSize:windowHeight/51.636,
        color:'#4A4A4A',
        marginTop:windowHeight*0.009,
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
    }
});    

module.exports = HistoryOrderPage;