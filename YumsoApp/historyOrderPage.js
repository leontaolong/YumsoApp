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
            dataSource: ds.cloneWithRows([]),
            showProgress:false,
            showCommentBox:false,
            showNetworkUnavailableScreen:false,
            eater:eater
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
                 Alert.alert( 'Network and server Error', 'Failed. Please try again later',[ { text: 'OK' }]);   
            }
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        return this.fetchOrderAndComments(); 
    }
    
    async fetchOrderAndComments() {
        this.setState({showProgress: true});
        const start = 'start=0';
        const end = 'end='+ new Date().getTime();
        let eater = await AuthService.getPrincipalInfo();
        try{
          var pastOneWeekOrder = await this.client.getWithAuth(config.orderHistoryEndpoint+eater.userId+'?'+start+'&'+end);
          this.setState({showProgress:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress: false,showNetworkUnavailableScreen:true});
          commonAlert.networkError();
          return;
        }

        try{
          var pastOneWeekComment = await this.client.getWithAuth(config.orderCommentEndpoint+eater.userId+'?'+start+'&'+end);
          this.setState({showProgress:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress: false,showNetworkUnavailableScreen:true});
          commonAlert.networkError();
          return;
        }
    
        if (pastOneWeekOrder && pastOneWeekOrder.statusCode != 200) {
            this.setState({showProgress:false});
            return this.responseHandler(pastOneWeekOrder);
        }
        if (pastOneWeekComment && pastOneWeekComment.statusCode != 200) {
            this.setState({showProgress:false});  
            return this.responseHandler(pastOneWeekOrder);
        }

        if (pastOneWeekOrder && pastOneWeekOrder.data && pastOneWeekComment && pastOneWeekComment.data){
            let orders = pastOneWeekOrder.data.orders;
            let comments = pastOneWeekComment.data.comments;
            console.log(orders); 
            console.log(comments);
            for(var comment of comments){
                for(var order of orders){
                    if(order.orderId==comment.orderId){
                        order.comment = comment;
                    }
                }
            }
            this.setState({dataSource: this.state.dataSource.cloneWithRows(orders), showProgress:false, orders:orders});
        }
    }
     
    
    renderRow(order){
        if(order.orderStatus == 'Delivered'){
          var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Delivered at {dateRender.renderDate2(order.orderStatusModifiedTime)}</Text>
        }else{
          var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Will be out for delivery at {dateRender.renderDate2(order.orderDeliverTime)}</Text>
        }
        if(order.shopPictures && order.shopPictures[0]){
           var imageSrc = {uri:order.shopPictures[0]};
        }else{
           var imageSrc = defaultShopPic;
        }
     
        return (<View key={order.orderId} style={styleHistoryOrderPage.oneListingView}>
                    <TouchableHighlight onPress={()=>this.navigateToOrderDetailPage(order)}>
                    <Image source={imageSrc} style={styleHistoryOrderPage.shopPhoto}/>
                    </TouchableHighlight>
                    <View style={styleHistoryOrderPage.orderInfoView}>
                        <Text style={styleHistoryOrderPage.shopNameText}>{order.shopname}</Text>                                                          
                        {orderStatusText}           
                        <Text style={styleHistoryOrderPage.grandTotalText}>Total: ${order.price.grandTotal}</Text>
                        <TouchableHighlight style={styleHistoryOrderPage.orderDetailsClickableView} underlayColor={'transparent'} onPress={()=>this.navigateToOrderDetailPage(order)}>
                           <Text style={styleHistoryOrderPage.orderDetailsClickable}>Order Details  ></Text>                                                                               
                        </TouchableHighlight>
                    </View>
                </View>);
    }
        
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }
                
        if(this.state.orders && this.state.orders.length==0){
          var  noOrderText = <Text style={styles.listViewEmptyText}>You do not have any order recently, come and order some!</Text>
        }

        var networkUnavailableView = null;
        var commentListView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchOrderAndComments.bind(this)} />
        }else{
           commentListView = <RefreshableListView
                              dataSource = {this.state.dataSource}
                              renderRow={this.renderRow.bind(this) }
                              loadData={this.fetchOrderAndComments.bind(this)}/>
        }
        
        return (
            <View style={styles.container}>
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
               {networkUnavailableView}
               {noOrderText}
               {commentListView}
               {loadingSpinnerView}                   
            </View>
        );
    }

    navigateBackToChefList() {
        this.props.navigator.pop();
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
        width:windowWidth*0.344,
        height:windowWidth*0.344,
    },
    orderInfoView:{
        flex:1,
        height:windowWidth*0.344,
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
});    

module.exports = HistoryOrderPage;