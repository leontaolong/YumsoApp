'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var backIcon = require('./icons/icon-back.png');
import Dimensions from 'Dimensions';

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
  Picker
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class HistoryOrderPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            showCommentBox:false
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        return this.fetchOrderAndComments(); 
    }
    
    async fetchOrderAndComments() {
        const start = 'start='+new Date().setDate(new Date().getDate()-30);
        const end = 'end='+ new Date().getTime();
        let eater = await AuthService.getPrincipalInfo();
        let pastOneWeekOrder = await this.client.getWithAuth(config.orderHistoryEndpoint+eater.userId+'?'+start+'&'+end);
        let pastOneWeekComment = await this.client.getWithAuth(config.orderCommentEndpoint+eater.userId+'?'+start+'&'+end);
        if(pastOneWeekOrder.statusCode!=200){
            throw new Error('Fail getting past orders');//todo: 401 jump
        }
        if(pastOneWeekComment.statusCode!=200){
            throw new Error('Fail getting past comments');
        }
        let orders = pastOneWeekOrder.data.orders;
        let comments = pastOneWeekComment.data.comments;
        console.log(orders); console.log(comments);
        for(var comment of comments){
            for(var order of orders){
                if(order.orderId==comment.orderId){
                    order.comment = comment;
                }
            }
        }
        this.setState({dataSource: this.state.dataSource.cloneWithRows(orders), showProgress:false, orders:orders});
    }
     
    renderRow(order){
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        }  

        if(order.orderStatus == 'Delivered'){
          var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Delivered at {dateRender.renderDate2(order.orderStatusModifiedTime)}</Text>
        }else{
          var orderStatusText = <Text style={styleHistoryOrderPage.completeTimeText}>Pending....</Text>
        }
        
        return (<View key={order.orderId} style={styleHistoryOrderPage.oneListingView}>
                    <Image source={{uri:order.chefProfilePic}} style={styleHistoryOrderPage.shopPhoto}/>
                    <View style={styleHistoryOrderPage.orderInfoView}>
                        <Text style={styleHistoryOrderPage.shopNameText}>{order.shopname}</Text>                                                          
                        {orderStatusText}           
                        <Text style={styleHistoryOrderPage.grandTotalText}>Total: ${order.price.grandTotal}</Text>
                        <View style={styleHistoryOrderPage.orderDetailsClickableView}>
                        <Text onPress={()=>this.navigateToOrderDetailPage(order)} style={styleHistoryOrderPage.orderDetailsClickable}>Order Details  ></Text>                                                                               
                        </View>
                    </View>
                </View>);
    }
        
    render() {
        if(this.state.showCommentBox == true){
           return (
                <View style={styles.geryContainer}> 
                    <TextInput placeholder="comments" style={styles.loginInput}
                        onChangeText = {(text) => this.setState({ comment: text }) }/>
                    <TextInput placeholder="Star Rating integer" style={styles.loginInput} onChangeText = {(text) => this.setState({ starRating: text }) }/>                    
                    <TouchableHighlight style={styles.button} onPress={()=>this.submitComment()}>
                        <Text style={styles.buttonText}>Submit</Text>    
                    </TouchableHighlight>                                                
                    <TouchableHighlight style={styles.button}
                        onPress={()=>this.setState({showCommentBox:false, comment:undefined, starRating:undefined, orderTheCommentIsFor:undefined}) }>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableHighlight>       
                </View>
            );
        }
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                   <View style={styles.headerLeftView}>
                   <TouchableHighlight underlayColor={'transparent'} style={styles.backButtonView} onPress={() => this.navigateBackToChefList()}>
                     <Image source={backIcon} style={styles.backButtonIcon}/>
                   </TouchableHighlight>
                   </View>    
                   <View style={styles.titleView}>
                     <Text style={styles.titleText}>My Orders</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View>
               <ListView
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) }/>                    
            </View>
        );
    }
    
    submitComment(){
        var self = this;
        var comment = this.state.comment;
        var orderTheCommentIsFor = this.state.orderTheCommentIsFor;
        var starRating = this.state.starRating;
        if (!starRating) {
            Alert.alert('','Please rate the order',[{ text: 'OK' }]);
            return;
        }
        var data = {
            chefId: orderTheCommentIsFor.chefId,
            orderId: orderTheCommentIsFor.orderId,
            eaterId: orderTheCommentIsFor.eaterId,
            commentText: comment,
            starRating: Number(starRating)
        };
        return this.client.postWithAuth(config.leaveEaterCommentEndpoint,data)
        .then((res)=>{
            if(res.statusCode===200){
               Alert.alert('Success','Comment is left for this order',[{ text: 'OK' }]);    
            }
            this.state.orderTheCommentIsFor.comment={
                        eaterComment:comment,
                        starRating: data.starRating,
                        eaterCommentTime:new Date().getTime(),
                    };
            var orders = this.state.orders;       
            self.setState({showCommentBox:false, dataSource: this.state.dataSource.cloneWithRows(orders), orders:orders, comment:undefined, starRating:undefined, orderTheCommentIsFor:undefined});
        });
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
        borderBottomWidth:windowHeight*0.007,
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