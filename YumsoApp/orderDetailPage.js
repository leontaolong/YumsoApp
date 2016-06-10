'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var ratingIconGrey = require('./icons/icon-rating-grey.png');
var ratingIconOrange = require('./icons/icon-rating-orange.png');
var deleteBannerIcon = require('./icons/icon-x.png')
import Dimensions from 'Dimensions';
import {KeyboardAwareListView} from 'react-native-keyboard-aware-scroll-view';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

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
  Alert
} from 'react-native';


class ShoppingCartPage extends Component {
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
            showDeliverTimeView:true,
            ratingSucceed:false,
            ratingIcon1:order.comment? (order.comment.starRating && order.comment.starRating>=1 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon2:order.comment? (order.comment.starRating && order.comment.starRating>=2 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon3:order.comment? (order.comment.starRating && order.comment.starRating>=3 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon4:order.comment? (order.comment.starRating && order.comment.starRating>=4 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
            ratingIcon5:order.comment? (order.comment.starRating && order.comment.starRating>=5 ? ratingIconOrange :ratingIconGrey):ratingIconGrey,
        };
        this.client = new HttpsClient(config.baseUrl, true);
        this.responseHandler = function (response, msg) {
            if (response.statusCode === 401) {
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
        let imageSrc =require('./ok.jpeg') ;
        if(orderItem.dishDetail && orderItem.dishDetail.pictures && orderItem.dishDetail.pictures.length!=0){
            imageSrc={uri:orderItem.dishDetail.pictures[0]};   
        } 
        return (
            <View key={orderItem.dishDetail.dishId} style={styleOrderDetailPage.oneListingView}>
                <Image source={imageSrc} style={styleOrderDetailPage.dishPhoto}/>
                <View style={styleOrderDetailPage.orderInfoView}>
                    <Text style={styleOrderDetailPage.dishNameText}>{orderItem.dishName}</Text>                             
                    <View style={styleOrderDetailPage.dishIngredientView}>
                       <Text style={styleOrderDetailPage.dishIngredientText}>{orderItem.dishDetail.ingredients}</Text>
                    </View>                  
                    <Text style={styleOrderDetailPage.dishPriceText}>${orderItem.price}</Text>                                          
                    <Text style={styleOrderDetailPage.dishIngredientText}>Quantity: {orderItem.quantity}</Text>                                        
                </View>
            </View>
        );
    }
    
    renderFooter(){
        if(this.state.order.comment && this.state.order.comment.starRating){
           var commentBoxView = <View style={styleOrderDetailPage.commentBox}>
                                  <View style={styleOrderDetailPage.ratingView}>
                                      <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>                                    
                                      <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                  </View>
                                  <Text style={styleOrderDetailPage.commentText}>{this.state.order.comment.eaterComment ? this.state.order.comment.eaterComment :'No comment'}</Text>
                               </View>
        }else if(this.state.ratingSucceed){
          var commentBoxView = <View style={styleOrderDetailPage.commentBox}>
                                  <View style={styleOrderDetailPage.ratingView}>
                                      <Image source={this.state.ratingIcon1} style={styleOrderDetailPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon2} style={styleOrderDetailPage.ratingIcon}/>                                    
                                      <Image source={this.state.ratingIcon3} style={styleOrderDetailPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon4} style={styleOrderDetailPage.ratingIcon}/>
                                      <Image source={this.state.ratingIcon5} style={styleOrderDetailPage.ratingIcon}/>
                                  </View>
                                  <Text style={styleOrderDetailPage.commentText}>{this.state.comment.trim() ? this.state.comment :'No comment'}</Text>
                               </View>
        }else if(new Date().getTime()-this.state.order.orderDeliverTime < 7*24*60*60*1000){
           var commentBoxView = <View style={styleOrderDetailPage.commentBox}>
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
                                  <TextInput placeholder="Leave your comment here" style={styleOrderDetailPage.commentInput} multiline={true} returnKeyType = {'done'} autoCorrect={false} onChangeText = {(text) => this.setState({ comment: text }) }/>                                     
                                  <TouchableHighlight underlayColor={'transparent'} style={styleOrderDetailPage.submitCommentButton} onPress={()=>this.submitComment()}>
                                        <Text style={styleOrderDetailPage.submitCommentButtonText}>Submit</Text>    
                                  </TouchableHighlight>
                               </View>
        }
                
        return commentBoxView;                                                 
    }
    
    render() {
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        } 

        if(this.state.showDeliverTimeView){
          var deliverTimeView = (<View style={styleOrderDetailPage.deliverTimeView}>
                                    <Text style={styleOrderDetailPage.deliverTimeText}>Your order was delivered at {dateRender.renderDate2(this.state.order.orderDeliverTime)}</Text>
                                    <TouchableHighlight style={styleOrderDetailPage.deleteBannerIconView} underlayColor={'transparent'} onPress={()=>this.setState({showDeliverTimeView:false})}>
                                       <Image source={deleteBannerIcon} style={styleOrderDetailPage.deleteBannerIcon} />
                                    </TouchableHighlight>
                                 </View>);
        }

        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <View style={styles.headerLeftView}>
                       <TouchableHighlight style={styles.backButtonView} underlayColor={'#ECECEC'} onPress={() => this.navigateBackToDishList()}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </TouchableHighlight>
                    </View>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Order Details</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
               </View>
               {deliverTimeView}
               <KeyboardAwareListView style={styleOrderDetailPage.dishListView}
                    ref={'scroll'}        
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } 
                    renderFooter={this.renderFooter.bind(this)}/>
            </View>
        );
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
            commentText: this.state.comment,
            starRating: Number(this.state.starRating)
        };
        return this.client.postWithAuth(config.leaveEaterCommentEndpoint,data)
        .then((res)=>{
            if (res.statusCode != 200) {
                return this.responseHandler(res);
            }
            Alert.alert('Success','Comment is left for this order',[{ text: 'OK' }]);    
            self.setState({ratingSucceed:true, starRating:data.starRating, comment:data.commentText, eaterCommentTime:new Date().getTime()});     
        });
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
    
    _scrollToInput (event, reactNode) {
        this.refs.scroll.scrollToFocusedInput(event, reactNode);
    }
}

var styleOrderDetailPage = StyleSheet.create({
    deliverTimeView:{
        flexDirection:'row',
        justifyContent:'space-around',
        height:windowHeight*0.0974,
        borderColor:'#F5F5F5',
        borderBottomWidth:windowHeight*0.007,
        backgroundColor:'#FFCC33'
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
    },
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
        marginTop:24,
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
        height:40,
        justifyContent:'flex-start',
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
        marginHorizontal:10,
    },
    commentInput:{
        height:90, 
        padding:15,
        fontSize:14,       
    },
    commentText:{
        padding:15,
        fontSize:14,
        color:'#A7A7A7',
    },
    ratingIconWrapper:{
        alignSelf:'center',
    },
    ratingIcon:{
        width:30,
        height:30,        
    },
});

module.exports = ShoppingCartPage;

