var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
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
        this.fetchOrderAndComments(); 
    }
    
    async fetchOrderAndComments() {
        const start = 'start='+new Date().setDate(new Date().getDate()-7);
        const end = 'end=9999999999999999';
        let eater = await AuthService.getPrincipalInfo();
        let pastOneWeekOrder = await this.client.getWithAuth(config.orderHistoryEndpoint+eater.userId+'?'+start+'&'+end);
        let pastOneWeekComment = await this.client.getWithAuth(config.orderCommentEndpoint+eater.userId+'?'+start+'&'+end);
        if(pastOneWeekOrder.statusCode!=200){
            throw new Error('Fail getting past orders');
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
                      <Text style={styleHistoryOrderPage.orderTimeText}>{new Date(order.orderCreatedTime).getDate()+'/'+new Date(order.orderCreatedTime).getMonth()+'/'+new Date(order.orderCreatedTime).getFullYear()}</Text>
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
        
        if(!order.comment){
           var noRateNoComment = (<View style={styleHistoryOrderPage.eaterNoCommentView}>
                                <TouchableHighlight onPress={() => this.setState({ showCommentBox: true, orderTheCommentIsFor: order }) }>
                                  <Text style={styleHistoryOrderPage.addCommentTextClickable}>Rate and Comment</Text>
                                </TouchableHighlight>
                             </View>);
                             
           return noRateNoComment;
        }else{
           if(order.comment.chefComment){
              hasChefComment = (<View key={'chefComment'} style={styleHistoryOrderPage.chefCommentView}>
                                  <View style={styleHistoryOrderPage.chefPhotoView}>
                                       <Image source={imageSrc} style={styleHistoryOrderPage.chefPhoto}/>
                                  </View>
                                  <View style={styleHistoryOrderPage.chefCommentTextView}>
                                      <Text style={styleHistoryOrderPage.commentText}>{order.comment.chefComment}</Text>                                  
                                      <View style={styleHistoryOrderPage.commentTimeView}>
                                         <Text style={styleHistoryOrderPage.commentTimeText}>03/10/2016</Text>
                                      </View>
                                  </View>                           
                              </View>);
           }  
            
           if(order.comment.starRating && order.comment.eaterComment){
             var hasRateAndComment =[
                                    (<View key={'rating'} style={styleHistoryOrderPage.orderRatingView}>
                                        {rating.renderRating(order.comment.starRating)}
                                    </View>),
                                    (<View key={'eaterComment'} style={styleHistoryOrderPage.eaterCommentView}>
                                        <Text style={styleHistoryOrderPage.commentText}>{order.comment.eaterComment}</Text>
                                        <View style={styleHistoryOrderPage.commentTimeView}>
                                            <Text style={styleHistoryOrderPage.commentTimeText}>04/30/2016</Text>
                                        </View>
                                    </View>)
                                    ];
             return [hasRateAndComment,hasChefComment];
           }else if(order.comment.starRating && !order.comment.eaterComment){
              hasRateNoComment = [
                                  (<View key={'rating'} style={styleHistoryOrderPage.orderRatingView}>
                                    {rating.renderRating(order.comment.starRating)}
                                  </View>),
                                  (<View key={'eaterComment'} style={styleHistoryOrderPage.eaterNoCommentView}>
                                   <TouchableHighlight onPress={() => this.setState({ showCommentBox: true, orderTheCommentIsFor: order }) }> 
                                    <Text style={styleHistoryOrderPage.addCommentTextClickable}>Add Comment</Text>
                                   </TouchableHighlight>
                                    <View style={styleHistoryOrderPage.commentTimeView}>
                                      <Text style={styleHistoryOrderPage.commentTimeText}>04/30/2016</Text>
                                    </View>
                                   </View>)
                                 ];
             return [hasRateNoComment,hasChefComment];
           }            
        }
    }
    
    render() {
        if(this.state.showCommentBox==true){
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
                        onPress={()=>this.setState({showCommentBox:false, comment:undefined, orderTheCommentIsFor:undefined}) }>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableHighlight>       
                </View>
            );
        }
        return (
            <View style={styles.container}>
               <View style={styleHistoryOrderPage.headerBannerView}>
                 <TouchableHighlight onPress={() => this.navigateBackToChefList()}>
                   <View style={styleHistoryOrderPage.backButtonView}>
                     <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png')} style={styleHistoryOrderPage.backButtonIcon}/>
                   </View>
                 </TouchableHighlight>
                 <Text>History Order</Text>
               </View>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } />
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToChefList() }>
                    <Text style={styles.buttonText}>back to chef list</Text>
                </TouchableHighlight>                      
            </View>
        );
    }
    
    submitComment(){
        var self = this;
        var comment = this.state.comment;
        var orderTheCommentIsFor = this.state.orderTheCommentIsFor;
        var starRating = this.state.starRating;
        if (!starRating) {
            Alert.alert(
                '',
                'Please rate the order',
                [
                    { text: 'OK' }
                ]
            );
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
                Alert.alert(
                    'Success',
                    'Comment is left for this order',
                    [
                        { text: 'OK' }            
                    ]
                );    
            }
            this.state.orderTheCommentIsFor.comment={
                        eaterComment:comment,
                        starRating: data.starRating
                    };
            var orders = this.state.orders;       
            self.setState({showCommentBox:false, dataSource: this.state.dataSource.cloneWithRows(orders), orders:orders, comment:undefined, orderTheCommentIsFor:undefined});
        });
    }

    navigateBackToChefList() {
        this.props.navigator.pop();
    }
}

var styleHistoryOrderPage = StyleSheet.create({
    backButtonView:{
        position:'absolute',
        top:15,
        left:0,
    },
    backButtonIcon:{
        width:40,
        height:40,
    },
    oneCommentView:{
       flex:1,
       flexDirection:'column',
       paddingHorizontal:10,
       paddingVertical:20,
       borderTopWidth:1,
       borderColor: '#D7D7D7',
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