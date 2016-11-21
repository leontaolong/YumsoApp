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
var NetworkUnavailableScreen = require('./networkUnavailableScreen');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
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
            orderListSelect:'',
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
                if(oneOrder.orderStatus.toLowerCase() == 'new' || oneOrder.orderStatus.toLowerCase() == 'delivering'){
                   orderPending.push(oneOrder);
                }else if(oneOrder.orderStatus.toLowerCase() == 'delivered' && new Date().getTime()-oneOrder.orderDeliverTime <= 7*24*60*60*1000 && !oneOrder.comment){
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
                           orderCompleted:orderCompleted
                         });
            
            if(orderPending.length>0){
               this.setState({orderListSelect:'orderPending'});
            }else if(orderNeedReview.length>0){
               this.setState({orderListSelect:'orderNeedReview'});
            }else{
               this.setState({orderListSelect:'orderCompleted'});                 
            }
        }
    }
     
    
    renderRow(order){
        if(order.orderStatus.toLowerCase() == 'delivered'){
           var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Delivered at {dateRender.renderDate2(order.orderStatusModifiedTime)}</Text>
           if(new Date().getTime()-order.orderDeliverTime <= 7*24*60*60*1000 && !order.comment){
              var action = "Review Order >"
           }else{
              var action = "Order Details >"
           }
        }else if(order.orderStatus.toLowerCase() == 'new'){
          if(order.estimatedDeliverTimeRange){
             var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>
                                  Expect arrival between {dateRender.formatTime2StringShort(order.estimatedDeliverTimeRange.min)} and {dateRender.formatTime2StringShort(order.estimatedDeliverTimeRange.max)}
                                   </Text>
          }else{
             var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Will be out for delivery at {dateRender.renderDate2(order.orderDeliverTime)}</Text>
          }
          
          var action = "Track Order >"
        }else if(order.orderStatus.toLowerCase() == 'delivering'){
          if(order.estimatedDeliverTimeRange){
             var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>
                                   Expect arrival between {dateRender.formatTime2StringShort(order.estimatedDeliverTimeRange.min)} and {dateRender.formatTime2StringShort(order.estimatedDeliverTimeRange.max)}
                                   </Text>
          }
          var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Delivering</Text>
          var action = "Track Order >"
        }else if(order.orderStatus.toLowerCase() == 'cancelled'){
          var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Cancelled at {dateRender.renderDate2(order.orderStatusModifiedTime)}</Text>
          var action = "Order Details >"
        }

        if(order.shopPictures && order.shopPictures[0]){
           var imageSrc = {uri:order.shopPictures[0]};
        }else{
           var imageSrc = defaultShopPic;
        }
     
        return  (
                    <TouchableHighlight onPress={()=>this.navigateToOrderDetailPage(order)}> 
                        <View key={order.orderId} style={styleHistoryOrderPage.oneListingView}>
                            <Image source={imageSrc} style={styleHistoryOrderPage.shopPhoto}/>
                            <View style={styleHistoryOrderPage.orderInfoView}>
                                <Text style={styleHistoryOrderPage.shopNameText}>{order.shopname}</Text>                                                          
                                {orderStatusText}           
                                <Text style={styleHistoryOrderPage.grandTotalText}>Total: ${order.price.grandTotal}</Text>
                                <View style={styleHistoryOrderPage.orderDetailsClickableView}>
                                   <Text style={styleHistoryOrderPage.orderDetailsClickable}>{action}</Text>                                                                               
                                </View>
                            </View>
                        </View>
                    </TouchableHighlight>
                 );
    }
        
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }
                
        var networkUnavailableView = null;
        var orderListView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchOrderAndComments.bind(this)} />
        }else{
           if(this.state.orderListSelect=='orderPending'){
              if(this.state.orderPending && this.state.orderPending.length==0){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order pending.</Text>
              }
              orderListView = <RefreshableListView
                               dataSource = {this.state.dataSourceOrderPending}
                               renderRow={this.renderRow.bind(this) }
                               loadData={this.fetchOrderAndComments.bind(this)}/>
           }else if(this.state.orderListSelect=='orderNeedReview'){
              if(this.state.orderNeedReview && this.state.orderNeedReview.length==0){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order needs review.</Text>
              }
              orderListView = <RefreshableListView
                               dataSource = {this.state.dataSourceNeedReview}
                               renderRow={this.renderRow.bind(this) }
                               loadData={this.fetchOrderAndComments.bind(this)}/>
           }else{
              if(this.state.orderCompleted && this.state.orderCompleted.length==0){
                 var noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order completed.</Text>
              }
              orderListView = <RefreshableListView
                               dataSource = {this.state.dataSourceCompleted}
                               renderRow={this.renderRow.bind(this) }
                               loadData={this.fetchOrderAndComments.bind(this)}/>
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
             return '#F5F5F5';
         }else{
             return '#FFFFFF';
         }
    }

    navigateToOrderDetailPage(order){
        this.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'OrderDetailPage', 
            passProps:{
                eater:this.state.eater,
                order:order,
                callback: this.componentDidMount.bind(this) //todo: force rerender or just setState
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
        marginTop:windowHeight*0.0150,
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