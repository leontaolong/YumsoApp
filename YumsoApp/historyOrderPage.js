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
        return (<View key={order.orderId} style={styleShoppingCartPage.oneListingView}>
                    <Image source={{uri:order.chefProfilePic}} style={styleShoppingCartPage.dishPhoto}/>
                    <View style={styleShoppingCartPage.shoppingCartInfoView}>
                        <Text style={styleShoppingCartPage.dishNameText}>{order.shopname}</Text>                                                          
                        <Text style={styleShoppingCartPage.dishIngredientText}>Delivered at {dateRender.renderDate2(order.orderDeliverTime)}</Text>            
                        <Text style={styleShoppingCartPage.dishPriceText}>Total: ${order.price.grandTotal}</Text>
                        <View style={styleShoppingCartPage.orderDetailsClickableView}>
                        <Text onPress={()=>this.navigateToOrderDetailPage(order)} style={styleShoppingCartPage.orderDetailsClickable}>Order Details  ></Text>                                                                               
                        </View>
                    </View>
                </View>);
    }
        
    render() {
        if(this.state.showCommentBox == true){
           return (
                <View style={styleHistoryOrderPage.container}> 
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
                     <Text style={styles.titleText}>History Orders</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View>
               <ListView style={styleHistoryOrderPage.commentListView}
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
    container:{
        paddingTop:15,
        flex:1,
        flexDirection:'column',
        backgroundColor:'#F5F5F5',
    },
    commentListView:{
        alignSelf:'stretch',
        flexDirection:'column',
        height: windowHeight*9/10
    },
    oneCommentView:{
       flex:1,
       flexDirection:'column',
       paddingHorizontal:10,
       paddingVertical:20,
       borderBottomWidth:1,
       borderColor: '#f5f5f5',
    },
    shopNameTimePriceView:{
        flex:1,
        flexDirection:'row',
        marginBottom:7,
    },
    shopNameOrderTimeView:{
        flex:0.8,
        flexDirection:'row',
    },
    shopNameText:{
        fontSize:15,
        fontWeight:'600',
    },
    orderTimeText:{
        marginTop:3,
        marginLeft:12,
        fontSize:12,
        color:'#A9A9A9',
    },
    orderPriceView:{
        flex:0.2,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    orderPriceText:{     
        fontSize:14,
        color:'#696969',
        marginTop:2,
    },
    orderRatingView:{
        flex:1,
        flexDirection:'row',
        marginBottom:10,
    },
    eaterCommentView:{
        flex:1,
        paddingHorizontal:10,
        paddingVertical:6,
        borderRadius: 6, 
        borderWidth: 0, 
        backgroundColor: '#f5f5f5',
        overflow: 'hidden', 
        marginBottom:10,
    },
    chefCommentView:{
        flex:1,
        flexDirection:'row',
        marginBottom:10,
    },
    chefPhotoView:{
        borderRadius: 8, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    chefPhoto:{
        width:windowHeight/13.8,
        height:windowHeight/13.8,
    },
    chefCommentTextView:{
        flex:1,
        flexDirection:'column',
        backgroundColor: '#DCDCDC',
        paddingHorizontal:12,
        paddingVertical:6,
        marginLeft:10,
        borderRadius: 8, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    commentText:{
        fontSize:12,
        color:'#696969',
        marginBottom:5,
    },
    commentTimeView:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    commentTimeText:{
        fontSize:12,
        color:'#696969',
    },
    eaterNoCommentView:{
        flex:1,
        flexDirection:'row',
        paddingHorizontal:10,
        paddingVertical:6,
        borderRadius: 6, 
        borderWidth: 0, 
        backgroundColor: '#f5f5f5',
        overflow: 'hidden', 
    },
    addCommentTextClickable:{
        color:'#ff9933',
        fontSize:13,
    }
});    

var styleShoppingCartPage = StyleSheet.create({
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
    dishNameText:{
        fontSize:windowHeight/35.5,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    dishPriceText:{
        fontSize:windowHeight/47.33,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    dishIngredientText:{
        fontSize:windowHeight/51.636,
        color:'#4A4A4A',
        marginTop:windowHeight*0.0141,
        marginBottom:windowHeight*0.0071,
    },
    orderDetailsClickableView:{
        flexDirection:'row',
        justifyContent:'flex-end',
        flex:1,    
    },
    orderDetailsClickable:{
        fontSize:windowHeight/47.33,
        fontWeight:'bold',
        color:'#F8C84E',
        alignSelf:'flex-end',
    },
});

module.exports = HistoryOrderPage;