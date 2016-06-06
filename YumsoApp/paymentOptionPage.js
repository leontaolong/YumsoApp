'use strict';
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var BTClient = require('react-native-braintree');
var paypalIcon = require('./icons/Icon-paypal.png');
var visaIcon = require('./icons/icon-visa.png');
var amexIcon = require('./icons/icon-amex.png');
var masterIcon = require('./icons/icon-mastercard.png');
var discoveryIcon = require('./icons/icon-discover.png');
var plusIcon = require('./icons/Icon-add.png');
var backIcon = require('./icons/icon-back.png');
var checkedIcon = require('./icons/icon-checkBox-checked.jpeg');
var uncheckedIcon = require('./icons/icon-checkBox-unchecked.jpeg');
var Swipeout = require('react-native-swipeout')

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
        var isFromCheckOutPage = routeStack[routeStack.length-1].passProps.isFromCheckOutPage;
        this.onPaymentSelected = routeStack[routeStack.length-1].passProps.onPaymentSelected;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            isFromCheckOutPage:isFromCheckOutPage,
            eaterId:eaterId,
            checkBoxesState:{},
            chosenCard:''
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
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(paymentList),paymentList:paymentList, showProgress: false });
            });
    }

    renderRow(card){  
        var swipeoutBtns = [
                                {
                                    text: 'Delete',
                                    backgroundColor:'#FF0000',
                                    onPress:()=>this.removeAPayment(card),
                                }
                            ];
              
        if(this.state.chosenCard && this.state.chosenCard.cardType == card.cardType && this.state.chosenCard.last4 == card.last4){
           var checkBoxIcon = checkedIcon;
        }else{
           var checkBoxIcon = uncheckedIcon;
        }                  
        
        if(this.state.isFromCheckOutPage){                 
            return (
                <Swipeout backgroundColor={'#FFFFFF'} right={swipeoutBtns}>
                    <View style={stylePaymentOptionPage.paymentMethodView}>         
                        <TouchableHighlight style={stylePaymentOptionPage.checkBoxIconView} underlayColor={'transparent'} onPress={()=>this.onCardClick(card)}>
                                        <Image style={stylePaymentOptionPage.checkBoxIcon} source={checkBoxIcon}/>
                        </TouchableHighlight>
                        <View  style={stylePaymentOptionPage.paymentMethodIconView}>
                            {this.renderPaymentMethodType(card)}
                        </View>
                        <View style={stylePaymentOptionPage.paymentMethodInfoView}>
                        <Text style={stylePaymentOptionPage.paymentMethodInfoText}>xxxx xxxx xxxx {card.last4}</Text>
                        </View>
                    </View>
                </Swipeout>
            );
        }else{
            return (
                <Swipeout backgroundColor={'#FFFFFF'} right={swipeoutBtns}>
                    <View style={stylePaymentOptionPage.paymentMethodView}>         
                        <View  style={stylePaymentOptionPage.paymentMethodIconView}>
                            {this.renderPaymentMethodType(card)}
                        </View>
                        <View style={stylePaymentOptionPage.paymentMethodInfoView}>
                        <Text style={stylePaymentOptionPage.paymentMethodInfoText}>xxxx xxxx xxxx {card.last4}</Text>
                        </View>
                    </View>
                </Swipeout>);
        }
    }
    
    renderFooter(){
        if(this.state.isFromCheckOutPage){  
          return (
             <View style={stylePaymentOptionPage.addCardView}>          
               <View style={stylePaymentOptionPage.checkBoxIconView}>
               </View>
               <TouchableHighlight style={stylePaymentOptionPage.addCardIconView} underlayColor={'transparent'} onPress={()=>this.addAPayment()}>
                  <Image style={stylePaymentOptionPage.addCardIcon} source={plusIcon}/>
               </TouchableHighlight>
               <View style={stylePaymentOptionPage.addCardTitleView}>
                  <Text style={stylePaymentOptionPage.addCardTitleText}>Credit/Debit Card</Text>
               </View>
             </View>);
        }else{
          return (
             <View style={stylePaymentOptionPage.addCardView}>          
               <TouchableHighlight style={stylePaymentOptionPage.addCardIconView} underlayColor={'transparent'} onPress={()=>this.addAPayment()}>
                  <Image style={stylePaymentOptionPage.addCardIcon} source={plusIcon}/>
               </TouchableHighlight>
               <View style={stylePaymentOptionPage.addCardTitleView}>
                  <Text style={stylePaymentOptionPage.addCardTitleText}>Credit/Debit Card</Text>
               </View>
             </View>);
        }
    }
    
    render() {
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        } 
        

        if(this.state.chosenCard && this.state.isFromCheckOutPage){
          var paymentSelectionConfirmButton= (<TouchableHighlight style={stylePaymentOptionPage.bottomButtonWrapper} onPress={()=>this.confirmSelection()}>
                                                    <View style={stylePaymentOptionPage.bottomButton}>
                                                        <Text style={stylePaymentOptionPage.bottomButtonText}>Choose this Payment Method</Text>
                                                    </View>
                                              </TouchableHighlight>);
        }
        
        return (
            <View style={styles.geryContainer}>
               <View style={styles.headerBannerView}>
                         <View style={styles.headerLeftView}>
                         <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={() => this.navigateBack()}>
                             <Image source={backIcon} style={styles.backButtonIcon}/>
                         </TouchableHighlight> 
                         </View>
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}>Payment Options</Text>
                         </View>
                         <View style={styles.headerRightView}>
                         </View>
               </View>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this)}
                    renderFooter={this.renderFooter.bind(this)}/>  
              {paymentSelectionConfirmButton}                    
            </View>
        );
    }

    navigateBack() {
        this.props.navigator.pop();
    }
    
    onCardClick(card){
        this.setState({chosenCard:card});
        var _paymentList = JSON.parse(JSON.stringify(this.state.paymentList));
        this.setState({dataSource:this.state.dataSource.cloneWithRows(_paymentList)});
        
        if(this.onPaymentSelected){
           this.onPaymentSelected(card);
        }
    }
    
    confirmSelection(){
        this.props.navigator.pop();
    }
    
    renderPaymentMethodType(card){
        switch (card.cardType) {
            case 'Visa':
                return <Image source={visaIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;
            case 'MasterCard':
                return <Image source={masterIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;
            case 'AmEx':
                return <Image source={amexIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;
            case 'Discovery':
                return <Image source={discoveryIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;                    
            default:
                return <Image source={visaIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>; 
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
                        
var stylePaymentOptionPage = StyleSheet.create({
    paymentMethodView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        paddingHorizontal:15,
        borderTopWidth:3,
        borderColor:'#F5F5F5',
    },
    checkBoxIconView:{
        flex:0.1,
        flexDirection:'row',
        justifyContent:'flex-start'  
    },
    checkBoxIcon:{
        width:25,
        height:25,
        alignSelf:'center',
    },
    paymentMethodInfoView:{
        flex:0.5,
        flexDirection:'row',
        justifyContent:'flex-start',
    },
    paymentMethodInfoText:{
        alignSelf:'center',
        fontSize:windowHeight/47.33,
        color:'#4A4A4A',
    },
    paymentMethodIconView:{
        flex:0.15,
        flexDirection:'row',
        justifyContent:'flex-start'
    },
    paymentCreditCardView:{
        flex:1,
        flexDirection:'row',
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    paymentMethodIcon:{
        width:32,
        height:20,
        alignSelf:'center',
    },
    addCardView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        paddingHorizontal:15,
        borderTopWidth:3,
        borderColor:'#F5F5F5',
    },
    addCardTitleView:{
        flex:0.5,
        flexDirection:'row',
        justifyContent:'flex-start',
    },
    addCardTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/51.636,
        color:'#4A4A4A',
    },
    addCardIconView:{
        flex:0.15,
        flexDirection:'row',
        justifyContent:'flex-start'
    },
    addCardIcon:{
        width:30,
        height:30,
        alignSelf:'center',
    },
    bottomButtonWrapper:{
      flexDirection:'row',        
      justifyContent: 'center',
      backgroundColor:'#FFCC33',
      position:'absolute',
      left: 0, 
      right: 0,
      top:windowHeight-windowHeight*0.075,
      height:windowHeight*0.075,
      width:windowWidth,
    },
    bottomButton:{
      flexDirection:'row',        
      justifyContent: 'center',
      height:windowHeight*0.075,
      width:windowWidth,
    },
    bottomButtonText:{
      color:'#fff',
      fontSize:windowHeight/37.056,
      fontWeight:'bold',
      alignSelf: 'center',
    },
});                
                        
module.exports = PaymentOptionPage;