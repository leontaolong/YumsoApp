'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var ratingIconGrey = require('./icons/icon-rating-grey.png');
var ratingIconOrange = require('./icons/icon-rating-orange.png');
var deleteBannerIcon = require('./icons/icon-x.png');
var defaultDishPic = require('./icons/defaultAvatar.jpg');
import Dimensions from 'Dimensions';
import {KeyboardAwareListView} from 'react-native-keyboard-aware-scroll-view';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 280 //Todo: get keyboard size programmatically.

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
        
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(order.orderList)),
            showProgress:false,
            order:order,
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
                 Alert.alert( 'Network and server Error', 'Failed. Please try again later',[ { text: 'OK' }]);   
            }
        };
    }
            
    renderRow(orderItem){
        let imageSrc = defaultDishPic;
        if(orderItem.dishDetail && orderItem.dishDetail.pictures && orderItem.dishDetail.pictures.length!=0){
            imageSrc={uri:orderItem.dishDetail.pictures[0]};   
        } 
        return (
            <View key={orderItem.dishDetail.dishId} style={styleOrderDetailPage.oneListingView}>
                <Image source={imageSrc} style={styleOrderDetailPage.dishPhoto}/>
                <View style={styleOrderDetailPage.orderInfoView}>
                    <Text style={styleOrderDetailPage.dishNameText}>{orderItem.dishName}</Text>                             
                    <View style={styleOrderDetailPage.dishIngredientView}>
                       <Text style={styleOrderDetailPage.dishIngredientText}>{this.getTextLengthLimited(orderItem.dishDetail.ingredients,43)}</Text>
                    </View>                  
                    <Text style={styleOrderDetailPage.dishPriceText}>${orderItem.price}</Text>                                          
                    <Text style={styleOrderDetailPage.dishIngredientText}>Quantity: {orderItem.quantity}</Text>                                        
                </View>
            </View>
        );
    }
    
    renderHeader(){
        //Render 'Delivered' status
        if(this.state.showDeliverStatusView){  
            if(this.state.order.orderStatus=='Delivered'){
            var deliverTimeView = (<View style={styleOrderDetailPage.deliverTimeView}>
                                        <Text style={styleOrderDetailPage.deliverTimeText}>Your order was delivered at {dateRender.renderDate2(this.state.order.orderStatusModifiedTime)}</Text>
                                        <TouchableHighlight style={styleOrderDetailPage.deleteBannerIconView} underlayColor={'transparent'} onPress={()=>this.setState({showDeliverStatusView:false})}>
                                        <Image source={deleteBannerIcon} style={styleOrderDetailPage.deleteBannerIcon} />
                                        </TouchableHighlight>
                                    </View>);
            }else{
            //Render 'Order received' status 
            var currentTime = new Date().getTime();
            if(this.state.order.orderStatus == 'new'){
                var newStatusTextColor = "#FFFFFF";
                var cookingStatusTextColor = "#b89467";
                var DeliveringStatusTextColor = "#b89467";
                if(currentTime > this.state.order.orderDeliverTime - 2*60*60*1000 && currentTime < this.state.order.orderDeliverTime){
                    cookingStatusTextColor = "#FFFFFF";
                }
            }else if(this.state.order.orderStatus == 'Delivering'){
                var newStatusTextColor = "#FFFFFF";
                var cookingStatusTextColor = "#FFFFFF";
                var DeliveringStatusTextColor = "#FFFFFF";
            }
            
            var deliverTimeView = (<View style={styleOrderDetailPage.deliverStatusView}>
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
            }
            return deliverTimeView;
        }
    }
    
    renderFooter(){
      if(this.state.order.orderStatus=='Delivered'){
        if(this.state.order.comment && this.state.order.comment.starRating){
           if(this.state.order.comment.chefComment && this.state.order.comment.chefComment.trim()){
             var  chefReplyView = <View key={'chefReplyView'} style={styleOrderDetailPage.chefReplyBox}>
                                    <View style={styleOrderDetailPage.chefPhotoView}>
                                      <Image source={{uri:this.state.order.chefProfilePic}} style={styleOrderDetailPage.chefPhoto}/>
                                    </View>
                                    <View style={styleOrderDetailPage.chefReplyContentView}>
                                      <Text style={styleOrderDetailPage.chefReplyText}>{this.state.order.comment.chefComment}</Text>
                                    </View>
                                  </View>
           }
           var commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBox}>
                                    <View style={styleOrderDetailPage.ratingCommentTimeView}>
                                        <View style={styleOrderDetailPage.ratingView}>
                                            <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                            <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>                                    
                                            <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                            <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                            <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                        </View>
                                        <View style={styleOrderDetailPage.commentTimeView}>
                                            <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(this.state.order.comment.eaterCommentTime)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styleOrderDetailPage.commentText}>{this.state.order.comment.eaterComment ? this.state.order.comment.eaterComment :'No comment'}</Text>
                                 </View>),
                                 chefReplyView];
        }else if(this.state.ratingSucceed){
          var commentBoxView = <View style={styleOrderDetailPage.commentBox}>
                                  <View style={styleOrderDetailPage.ratingCommentTimeView}>
                                    <View style={styleOrderDetailPage.ratingView}>
                                        <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                        <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>                                    
                                        <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                        <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                        <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                    </View>
                                    <View style={styleOrderDetailPage.commentTimeView}>
                                        <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(new Date().getTime())}</Text>
                                    </View>
                                  </View>
                                  <Text style={styleOrderDetailPage.commentText}>{this.state.comment.trim() ? this.state.comment :'No comment'}</Text>
                               </View>
        }else if(new Date().getTime()-this.state.order.orderDeliverTime < 7*24*60*60*1000){
           var commentBoxView = [(<View key={'commentBoxView'} style={styleOrderDetailPage.commentBox}>
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
                                    <TextInput placeholder="Leave your comment here" style={styleOrderDetailPage.commentInput} multiline={true} returnKeyType = {'default'} autoCorrect={false} 
                                    maxLength={500} onChangeText = {(text) => this.setState({ comment: text }) } onFocus={(()=>this._onFocus()).bind(this)} onBlur={()=>this.scrollToCommentBoxtoBottom()}/>                                     
                                    <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.submitCommentButton} onPress={()=>this.submitComment()}>
                                            <Text style={styleOrderDetailPage.submitCommentButtonText}>Submit</Text>    
                                    </TouchableHighlight>
                                 </View>),
                                (<View key={'commentBoxBottomView'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>)];
        }
                
        return commentBoxView;
      }                                               
    }
     
    
    render() {        
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }
   
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToDishList()}>
                       <View style={styles.backButtonView}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </View>
                    </TouchableHighlight>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Order Details</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
               </View>
               <ListView style={styleOrderDetailPage.dishListView} ref="listView" 
                            dataSource = {this.state.dataSource}
                            renderHeader={this.renderHeader.bind(this)}
                            renderRow={this.renderRow.bind(this) } 
                            renderFooter={this.renderFooter.bind(this)}/>
               {loadingSpinnerView}
            </View>
        );
    }
    
    _onLayout(event) {
        this.y = event.nativeEvent.layout.y;
        console.log(this.y);
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
            if (res.statusCode != 200) {
                this.setState({showProgress:false});
                return this.responseHandler(res);
            }
            this.state.order.comment = {starRating:data.starRating, eaterComment:data.commentText, eaterCommentTime:new Date().getTime()}
            Alert.alert('Success','Comment is left for this order',[{ text: 'OK' }]);    
            self.setState({ratingSucceed:true, showProgress:false, starRating:data.starRating});     
        });
    }
    
    getTextLengthLimited(text,lengthLimit){
        if(text.length<=lengthLimit){
           return text;
        }else{
           var shortenedText = text.substr(0,lengthLimit-1);
           var betterShortenedText = shortenedText.substr(0,Math.max(shortenedText.lastIndexOf(' '),shortenedText.lastIndexOf(','),shortenedText.lastIndexOf(';'),shortenedText.lastIndexOf('|')));
           return betterShortenedText ? betterShortenedText + '...' : shortenedText+'...';
        }
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
      
    navigateBackToDishList(){
        this.props.navigator.pop();
    }
    
}

var styleOrderDetailPage = StyleSheet.create({
    deliverTimeView:{
        flexDirection:'row',
        justifyContent:'space-around',
        height:windowHeight*0.0974,
        borderColor:'#F5F5F5',
        borderBottomWidth:5,
        backgroundColor:'#FFCC33'
    },
    deliverStatusView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight*0.0974,
        borderColor:'#F5F5F5',
        borderBottomWidth:5,
        backgroundColor:'#FFCC33'
    },
    oneStatusView:{
       flexDirection:'column',
       alignItems:'center',
       justifyContent:'center',
       height:windowHeight*0.0974,
       width:windowWidth/6.0,
    },
    deliverTimeText:{
        color:'#FFFFFF',
        fontWeight:'bold',
        fontSize:windowHeight/51.64,
        alignSelf:'center',
    },
    deleteBannerIcon:{
       width:windowHeight*0.0528,
       height:windowHeight*0.0528,
    },
    deleteBannerIconView:{
       alignSelf:'center',
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
        borderColor:'#F5F5F5',
        borderBottomWidth:5,
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
        backgroundColor:'#F5F5F5',
        width:windowWidth*0.93,
        marginTop:windowHeight*0.0224,
    },
    submitCommentButton:{
        backgroundColor:'#FFCC33',
        height:windowHeight*0.058,
        justifyContent:'center',
    },
    submitCommentButtonText:{
        color:'#FFF',
        fontWeight:'bold',
        alignSelf:'center',
    },
    ratingView:{
        flex:0.5,
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
        height:windowHeight*0.048,
        flex:1,
    },
    commentTimeView:{
        flex:0.5,
        flexDirection:'row',
        justifyContent:'flex-end',
        backgroundColor:'#FFFFFF'
    },
    commentTimeText:{
        alignSelf:'center',
        fontSize:12,
        color:'#9B9B9B',
        fontWeight:'600',
    }
});

module.exports = OrderDetailPage;

