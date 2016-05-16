var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var backIcon = require('./icons/ic_keyboard_arrow_left_48pt_3x.png');
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
        return (
            <View style={styleHistoryOrderPage.oneCommentView}>
                <View style={styleHistoryOrderPage.shopNameTimePriceView}>
                   <View style={styleHistoryOrderPage.shopNameOrderTimeView}>
                      <Text style={styleHistoryOrderPage.shopNameText}>{order.shopname}</Text>
                      <Text style={styleHistoryOrderPage.orderTimeText}>{dateRender.renderDate1(order.orderCreatedTime)}</Text>
                   </View>
                   <View style={styleHistoryOrderPage.orderPriceView}>
                      <Text style={styleHistoryOrderPage.orderPriceText}>${order.grandTotal}</Text>
                   </View>
                </View>
                {this.displayCommentOrBox(order)}
            </View>
        );
    }
    
    displayCommentOrBox(order) {
        console.log(order);
        var imageSrc;
        
        if(order.chefProfilePic){
            imageSrc={uri:order.chefProfilePic};   
        }
        
        var todayInMillisec = new Date().getTime()
        
        if(!order.comment){
          if(todayInMillisec-order.orderCreatedTime < 604800000){//Only order with 7 days from now can be rated and commented
             return (<View style={styleHistoryOrderPage.eaterNoCommentView}>
                           <TouchableHighlight onPress={() => this.setState({ showCommentBox: true, orderTheCommentIsFor: order }) }>
                                <Text style={styleHistoryOrderPage.addCommentTextClickable}>Rate and Comment</Text>
                           </TouchableHighlight>
                    </View>);
          }else{
            return (<View style={styleHistoryOrderPage.eaterNoCommentView}>
                        <Text style={styleHistoryOrderPage.commentText}>No Rate or Comment</Text>
                    </View>);
          }                            
        }else{
           var commentSectionRender = [];
           var hasRating = (<View key={'ratingSection'} style={styleHistoryOrderPage.orderRatingView}>
                                {rating.renderRating(order.comment.starRating)}
                            </View>);
           commentSectionRender.push(hasRating);
                        
           if(order.comment.starRating && order.comment.eaterComment){
              var hasEaterComment = (<View key={'eaterCommentSection'} style={styleHistoryOrderPage.eaterCommentView}>
                                         <Text style={styleHistoryOrderPage.commentText}>{order.comment.eaterComment}</Text>
                                         <View style={styleHistoryOrderPage.commentTimeView}>
                                            <Text style={styleHistoryOrderPage.commentTimeText}>{dateRender.renderDate1(order.comment.eaterCommentTime)}</Text>
                                         </View>
                                     </View>);
              commentSectionRender.push(hasEaterComment);
           }else if(order.comment.starRating && !order.comment.eaterComment){
              if(todayInMillisec-order.orderCreatedTime < 604800000){//Only order with 7 days from now can be rated and commented
                 var noEaterComment = (<View key={'eaterCommentSection'} style={styleHistoryOrderPage.eaterNoCommentView}>
                                         <TouchableHighlight onPress={() => this.setState({ showCommentBox: true, orderTheCommentIsFor: order }) }> 
                                           <Text style={styleHistoryOrderPage.addCommentTextClickable}>Add Comment</Text>
                                         </TouchableHighlight>
                                       <View style={styleHistoryOrderPage.commentTimeView}>
                                           <Text style={styleHistoryOrderPage.commentTimeText}>{dateRender.renderDate1(order.comment.eaterCommentTime)}</Text>
                                       </View>
                                       </View>);
            }else{
                 var noEaterComment = (<View style={styleHistoryOrderPage.eaterNoCommentView}>
                                           <Text style={styleHistoryOrderPage.commentText}>No Comment</Text>
                                       </View>); 
            }
            commentSectionRender.push(noEaterComment);
           }
           
           if(order.comment.chefComment){
              hasChefComment = (<View key={'chefCommentSection'} style={styleHistoryOrderPage.chefCommentView}>
                                  <View style={styleHistoryOrderPage.chefPhotoView}>
                                       <Image source={imageSrc} style={styleHistoryOrderPage.chefPhoto}/>
                                  </View>
                                  <View style={styleHistoryOrderPage.chefCommentTextView}>
                                      <Text style={styleHistoryOrderPage.commentText}>{order.comment.chefComment}</Text>                                  
                                      <View style={styleHistoryOrderPage.commentTimeView}>
                                         <Text style={styleHistoryOrderPage.commentTimeText}>{dateRender.renderDate1(order.comment.chefCommentTime)}</Text>
                                      </View>
                                  </View>                           
                                </View>);
              commentSectionRender.push(hasChefComment);
           }  
           
           return commentSectionRender;
        }
    }
    
    render() {
        if(this.state.showCommentBox == true){
           return (
                <View style={styles.container}> 
                    <TextInput placeholder="comments" style={styles.loginInput}
                        onChangeText = {(text) => this.setState({ comment: text }) }/>
                    <TextInput placeholder="Star Rating integer" style={styles.loginInput}
                        onChangeText = {(text) => this.setState({ starRating: text }) }/>                    
                    <TouchableHighlight style={styles.button}
                        onPress={()=>this.submitComment()}>
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
               <View style={styleHistoryOrderPage.headerBannerView}>    
                   <View style={styleHistoryOrderPage.backButtonView}>
                   <TouchableHighlight onPress={() => this.navigateBackToChefList()}>
                     <Image source={backIcon} style={styleHistoryOrderPage.backButtonIcon}/>
                   </TouchableHighlight>
                   </View>    
                   <View style={styleHistoryOrderPage.historyOrderTitleView}>
                     <Text style={styleHistoryOrderPage.historyOrderTitleText}>History Order</Text>
                   </View>
                   <View style={{flex:0.1/3,width:windowWidth/3}}>
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
}

var styleHistoryOrderPage = StyleSheet.create({
    headerBannerView:{
        flex:0.1,
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
    },
    backButtonView:{
        flex:0.1/3,
        width:windowWidth/3,
        paddingTop:6,
    },
    backButtonIcon:{
        width:30,
        height:30,
    },
    historyOrderTitleView:{
        flex:0.1/3, 
        width:windowWidth/3,
        alignItems:'center',     
    },
    historyOrderTitleText:{
        marginTop:12,
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

module.exports = HistoryOrderPage;