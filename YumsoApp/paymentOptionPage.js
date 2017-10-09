'use strict';
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var BTClient = require('react-native-braintree');
var paypalIcon = require('./icons/icon-paypal.png');
var visaIcon = require('./icons/icon-visa.png');
var amexIcon = require('./icons/icon-amex.png');
var masterIcon = require('./icons/icon-mastercard.png');
var discoveryIcon = require('./icons/icon-discover.png');
var plusIcon = require('./icons/icon-add.png');
var backIcon = require('./icons/icon-back.png');
var checkedIcon = require('./icons/icon-checkBox-checked.jpeg');
var uncheckedIcon = require('./icons/icon-checkBox-unchecked.jpeg');
var deleteCardIcon = require('./icons/icon-delete-grey.png');
var Swipeout = require('react-native-swipeout');
var commonAlert = require('./commonModules/commonAlert');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
var backgroundImage = require('./resourceImages/background@3x.jpg');

import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  Picker,
  ActionSheetIOS,
} from 'react-native';

class PaymentOptionPage extends Component {
    constructor(props){
        super(props);
        this._showActionSheet = this.showActionSheet.bind(this);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        console.log("paymentOptionPage RouteStack" + routeStack);
        let eater = routeStack[routeStack.length-1].passProps.eater;
        
        var isFromCheckOutPage = routeStack[routeStack.length-1].passProps.isFromCheckOutPage;
        this.onPaymentSelected = routeStack[routeStack.length-1].passProps.onPaymentSelected;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:false,
            showNetworkUnavailableScreen:false,
            isFromCheckOutPage:isFromCheckOutPage,
            eaterId:eater?eater.eaterId: undefined,
            checkBoxesState:{},
            chosenCard:'',
            eater:eater,
        };
        this.responseHandler = function(response){
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
            }else{
                 Alert.alert( 'Network or server error', 'Please try again later',[ { text: 'OK' }]);   
            }
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchPaymentOptions(); 
    }
    
    fetchPaymentOptions() {
        if (!this.state.eaterId) {
            console.log("No eaterId!!")
            this.props.navigator.push({
                name: 'LoginPage',
                passProps: {
                    callback: function (eater) {
                        this.setState({ eater: eater, eaterId: eater.eaterId });
                        this.fetchPaymentOptions();
                    }.bind(this)
                }
            });
        }
        this.setState({showProgress:true});
        return this.client.getWithAuth(config.getPaymentList+this.state.eaterId)
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode != 202) {
                    this.setState({showProgress:false});
                    return this.responseHandler(res);
                }
                let paymentList = res.data.paymentList;
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(paymentList),paymentList:paymentList, showProgress: false, showNetworkUnavailableScreen:false});
            }).catch((err)=>{
                this.setState({showProgress: false,showNetworkUnavailableScreen:true});
                commonAlert.networkError(err);
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
                    <View style={stylePaymentOptionPage.paymentOverview}>   
                        <TouchableHighlight underlayColor={'transparent'} onPress={()=>this.onCardClick(card)}>
                            <View style={stylePaymentOptionPage.paymentMethodView}>         
                                <View  style={stylePaymentOptionPage.paymentMethodIconView}>
                                    {this.renderPaymentMethodType(card)}
                                </View>      
                                <View style={stylePaymentOptionPage.paymentMethodInfoView}>
                                    <Text style={stylePaymentOptionPage.paymentMethodInfoText}>xxxx xxxx xxxx {card.last4}</Text>
                                </View>
                                <View style={stylePaymentOptionPage.checkBoxIconView}>
                                    <Image style={stylePaymentOptionPage.checkBoxIcon} source={checkBoxIcon}/>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </View>
            );
        }else{
            return (
                <View style={stylePaymentOptionPage.paymentOverview}>
                    <View style={stylePaymentOptionPage.paymentMethodView}>         
                        <View  style={stylePaymentOptionPage.paymentMethodIconView}>
                            {this.renderPaymentMethodType(card)}
                        </View>
                        <View style={stylePaymentOptionPage.paymentMethodInfoView}>
                            <Text style={stylePaymentOptionPage.paymentMethodInfoText}>xxxx xxxx xxxx {card.last4}</Text>
                        </View>
                        <Text style={stylePaymentOptionPage.deleteText} onPress={this._showActionSheet.bind(this, card)}>Delete</Text>
                    </View>
                </View>
            );
        }
    }
    
    showActionSheet(card) {
        ActionSheetIOS.showActionSheetWithOptions({
            options: [
                'Confirm',
                'Cancel'
            ],
            cancelButtonIndex: 1,
            destructiveButtonIndex: 0,
            title: 'Delete this payment option from your account?'
        }, (index) => {            
            if (index == 0) {
                this.removeAPayment(card);
            }
        })
    }
    renderFooter(){
        return [
            <View style={{height:9*windowHeight/667}}></View>,
            <TouchableHighlight underlayColor={'rgba(0,0,0,0)'} onPress={()=>this.addAPayment()}>
            <View style={stylePaymentOptionPage.addCardView}>          
            <View style={stylePaymentOptionPage.addCardTitleView}>
                <Text style={stylePaymentOptionPage.addCardTitleText}> + Add a card</Text>
            </View>
            </View>
            </TouchableHighlight>];
    }
    
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;  
        }
        
        if(this.state.chosenCard && this.state.isFromCheckOutPage){
          var paymentSelectionConfirmButton= (<TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={()=>this.confirmSelection()}>
                                                  <Text style={styles.bottomButtonView}>Confirm</Text>
                                              </TouchableOpacity>);
        }

        var paymentListView = <ListView style={stylePaymentOptionPage.paymentListView}
                                dataSource = {this.state.dataSource}
                                renderRow={this.renderRow.bind(this)}
                                renderFooter={this.renderFooter.bind(this)}/>
        var networkUnavailableView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchPaymentOptions.bind(this)} />
           paymentListView = null;
        }
        
        var overallContent = (<View>
                                <View style={styles.transparentHeaderBannerView}>
                                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                                        <View style={styles.backButtonView}>
                                            <Image source={backIcon} style={styles.backButtonIcon} />
                                        </View>
                                    </TouchableHighlight>
                                    <View style={styles.titleView}></View>
                                    <View style={styles.headerRightView}></View>
                                </View>

                                <View style={stylePaymentOptionPage.contentTextView}>
                                    <Text style={stylePaymentOptionPage.contentTitle}>Payment Options</Text>
                                
                                    {networkUnavailableView}
                                    {paymentListView}                   
                                    {loadingSpinnerView} 
                                </View>
                                </View>);
        if (this.state.isFromCheckOutPage) {
            return (<View style={styles.container}>
                        <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                            {overallContent}
                        </Image>
                        {paymentSelectionConfirmButton}
                    </View>);
        } else {
            return (<View style={styles.container}>
                        {overallContent}
                    </View>);
        }
    }

    navigateBack() {
        this.props.navigator.pop();
    }
    
    onCardClick(card){
        this.setState({chosenCard:card});
        var _paymentList = JSON.parse(JSON.stringify(this.state.paymentList));
        this.setState({dataSource:this.state.dataSource.cloneWithRows(_paymentList)});
    }
    
    confirmSelection(){
        if(this.onPaymentSelected){
           this.onPaymentSelected(this.state.chosenCard);
        }
        this.props.navigator.pop();
    }
    
    renderPaymentMethodType(card){
        switch (card.cardType) {
            case 'Visa':
                return <Image source={visaIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;
            case 'MasterCard':
                return <Image source={masterIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;
            case 'American Express':
                return <Image source={amexIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;
            case 'Discover':
                return <Image source={discoveryIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>;                    
            default:
                return <Image source={visaIcon} style={stylePaymentOptionPage.paymentMethodIcon}/>; 
        }
    }
    
    addAPayment(){
        this.setState({showProgress:true});
        var client = new HttpsClient(config.baseUrl, true);
        client.getWithAuth(config.paymentTokenEndpoint)
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode != 202) {
                    this.setState({showProgress:false});              
                    return this.responseHandler(res);
                }
                var clientToken = res.data.clientToken;
                return BTClient.setup(clientToken)
                    .then(() => {              
                        return BTClient.showPaymentViewController()
                            .then((nonce) => {
                                return client.postWithAuth(config.addAPayment, { payment_method_nonce: nonce, userId: this.state.eaterId })
                                .then((res)=>{
                                    if (res.statusCode != 200 && res.statusCode != 202) {
                                        this.setState({ showProgress: false });
                                        return this.responseHandler(res);
                                    }                                  
                                    this.fetchPaymentOptions();                                 
                                });
                            }).catch((err) => {
                                console.log(err);
                                this.setState({showProgress:false});
                            });
                    });
            }).catch((err)=>{
                this.setState({showProgress: false});
                commonAlert.networkError(err);
            });
    }
    
    removeAPayment(card) {
        this.setState({showProgress:true});
        var client = new HttpsClient(config.baseUrl, true);
        return client.postWithAuth(config.deletePayment, { token: card.token, userId: this.state.eaterId })
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode != 202) {
                    this.setState({showProgress:false});                  
                    return this.responseHandler(res);
                }      
                this.fetchPaymentOptions();
            }).catch((err)=>{
                this.setState({showProgress: false});
                commonAlert.networkError(err);
            });
    }
}
                        
var stylePaymentOptionPage = StyleSheet.create({
    contentTextView:{
        paddingHorizontal:windowWidth/20.7,
    },
    contentTitle:{
        backgroundColor: 'rgba(0,0,0,0)',        
        fontSize:28*windowHeight/677,
        fontWeight:'bold',
    },
    paymentListView:{
        alignSelf:'stretch',
        paddingBottom:20,
        flexDirection:'column',
        height: windowHeight*8/10,
        backgroundColor: 'rgba(0,0,0,0)', 
        marginTop:windowHeight*0.0560,        
    }, 
    paymentOverview:{
        paddingVertical:windowHeight*0.01, 
    },
    paymentMethodView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        paddingLeft:15*windowHeight/667.0,
        borderBottomWidth:1,
        borderColor:'lightgrey',
        paddingHorizontal:windowWidth/20.7,
    },
    checkBoxIconView:{
        flex:0.1,
        flexDirection:'row',
        justifyContent:'flex-start',
    },
    checkBoxIcon:{
        width:23*windowHeight/700.0,
        height:23*windowHeight/700.0,
        alignSelf:'center',
    },
    deleteText:{
        alignSelf:'center',
        fontSize:windowHeight/47.33,
        color:'#60d1bc',
    },
    paymentMethodInfoView:{
        flex:0.75,
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
    deleteCardIconView:{
        flex:0.1,
        justifyContent:'center',
        alignItems:'center',
    },
    deleteCardIcon:{
        width:30*windowHeight/667.0,
        height:30*windowHeight/667.0,
    },
    paymentMethodIcon:{
        width:32*windowHeight/667.0,
        height:20*windowHeight/667.0,
        alignSelf:'center',
    },
    addCardView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        paddingLeft:15*windowHeight/667.0,
        backgroundColor:'rgba(0,0,0,0)',
    },
    addCardTitleView:{
        flex:0.75,
        flexDirection:'row',
        justifyContent:'flex-start',
        backgroundColor:'rgba(0,0,0,0)'
    },
    addCardTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/40,
        color:'#60d1bc',
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