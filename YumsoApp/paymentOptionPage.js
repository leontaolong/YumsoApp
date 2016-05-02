var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var BTClient = require('react-native-braintree');

import Dimensions from 'Dimensions';

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
  Alert,
  Picker
} from 'react-native';

class PaymentOptionPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        var eaterId = routeStack[routeStack.length-1].passProps.eaterId;
        this.onPaymentSelected = routeStack[routeStack.length-1].passProps.onPaymentSelected;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            eaterId:eaterId,
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchPaymentOptions(); 
    }
    
    fetchPaymentOptions() {
        return this.client.getWithAuth(config.getPaymentList+this.state.eaterId)
            .then((res) => {
                if(res.statusCode===401){
                    //todo: jump to sign in page.
                    return;
                }
                if (res.statusCode != 200) {
                    throw new Error('Fail getting past payment list');
                }
                let paymentList = res.data.paymentList;
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(paymentList), showProgress: false });
            });
    }

    renderRow(card){  
        return (
            <View style={styleChefCommentsPage.oneListingView}>
                <TouchableHighlight style={styleChefCommentsPage.eaterChefCommetView} onPress={()=>this.onCardClick(card)}>
                   <View style={styleChefCommentsPage.eaterNameRatingView}>
                      <View style={styleChefCommentsPage.eaterNameView}>
                          <Text style={styleChefCommentsPage.eaterNameText}>{card.last4}</Text>
                      </View>
                      <View style={styleChefCommentsPage.orderRatingView}>
                          <Text style={styleChefCommentsPage.eaterNameText}>{card.cardType}</Text>
                      </View>
                   </View>
                </TouchableHighlight>   
                <TouchableHighlight style={styleChefCommentsPage.orderRatingView} onPress={()=>this.editAPayment(card)}>
                    <Text style={styleChefCommentsPage.eaterNameText}>Edit</Text>
                </TouchableHighlight>               
                <TouchableHighlight style={styleChefCommentsPage.orderRatingView} onPress={()=>this.removeAPayment(card)}>
                    <Text style={styleChefCommentsPage.eaterNameText}>Remove</Text>
                </TouchableHighlight>                   
            </View>
        );
    }
    
    render() {
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        } 
        return (
            <View style={styles.container}>
               <View style={styleChefCommentsPage.headerBannerView}>    
                   <View style={styleChefCommentsPage.backButtonView}>
                   <TouchableHighlight onPress={() => this.navigateBackToChefPage()}>
                     <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png')} style={styleChefCommentsPage.backButtonIcon}/>
                   </TouchableHighlight>
                   </View>    
                   <View style={styleChefCommentsPage.historyOrderTitleView}>
                     <Text style={styleChefCommentsPage.historyOrderTitleText}>Payment Options</Text>
                   </View>
                   <View style={{flex:0.1/3,width:windowWidth/3}}>
                   </View>
               </View>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) }/> 
               <TouchableHighlight onPress={()=>this.addAPayment()}>
                    <Text>Add more..</Text>
               </TouchableHighlight>                 
            </View>
        );
    }

    navigateBackToChefPage() {
        this.props.navigator.pop();
    }
    
    onCardClick(card){
        if(this.onPaymentSelected){
            this.onPaymentSelected(card);
            this.props.navigator.pop();
        }
    }
    
    editAPayment(card){
        //todo:shall we enable edit or just remove and add a new one?
    }
    
    addAPayment(){
        this.setState({showProgress:true});
        var client = new HttpsClient(config.baseUrl, true);
        client.getWithAuth(config.paymentTokenEndpoint)
            .then((res) => {
                var clientToken = res.data.clientToken;
                return BTClient.setup(clientToken)
                    .then(() => {              
                        return BTClient.showPaymentViewController()
                            .then((nonce) => {
                                return client.postWithAuth(config.addAPayment, { payment_method_nonce: nonce, userId: this.state.eaterId })
                                .then((res)=>{
                                      this.fetchPaymentOptions();                                 
                                });
                            }).catch((err) => {
                                console.log(err);
                                this.setState({showProgress:false});
                            });
                    });
            });
    }
    
    removeAPayment(card) {
        this.setState({showProgress:true});
        var client = new HttpsClient(config.baseUrl, true);
        return client.postWithAuth(config.deletePayment, { last4: card.last4, userId: this.state.eaterId })
            .then((res) => {
                this.fetchPaymentOptions();
            });
    }
}

                        // return BTClient.getCardNonce("4111111111111111", "10", "20").then(function(nonce) {
                        // //payment succeeded, pass nonce to server
                        //     console.log(nonce);
                        //     return client.postWithoutAuth(config.braintreeCheckout, { payment_method_nonce: nonce })
                        // })
                        // .catch(function(err) {
                        // //error handling
                        // console.log(err);
                        // });  
var styleChefCommentsPage = StyleSheet.create({
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
    oneListingView:{
       flex:1,
       flexDirection:'row',
       paddingHorizontal:10,
       paddingVertical:20,
       borderBottomWidth:1,
       borderColor: '#f5f5f5',
    },
    eaterChefCommetView:{
        flex:1,
        flexDirection:'column',
        marginLeft:10,
    },
    shopNameTimePriceView:{
        flex:1,
        flexDirection:'row',
        marginBottom:7,
    },
    eaterNameRatingView:{
        flex:1,
        flexDirection:'row',
    },
    eaterNameView:{
        flex:0.75,
        flexDirection:'row',
    },
    eaterNameText:{
        fontSize:15,
        fontWeight:'600',
    },
    orderRatingView:{
        flex:0.25,
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
    eaterPhotoView:{
        borderRadius: 8, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    eaterPhoto:{
        width:windowHeight/13.8,
        height:windowHeight/13.8,
    },
    CHEFView:{
        backgroundColor:'#FF4500',
        width:55,
        paddingLeft:12,
        marginVertical:5,
    },
    CHEFText:{
        fontSize:13,
        color:'#fff',
    },
    chefCommentView:{
        flex:1,
        flexDirection:'column',
        backgroundColor: '#DCDCDC',
        paddingRight:12,
        paddingVertical:6,
        borderRadius: 6, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    commentText:{
        fontSize:12,
        color:'#696969',
        marginBottom:5,
        marginLeft:12,
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

module.exports = PaymentOptionPage;