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

var h1 = 28 * windowHeight / 677;
var h2 = windowHeight / 35.5;
var h3 = windowHeight / 33.41;
var h4 = windowHeight / 47.33;
var h5 = 12;
var b1 = 15 * windowHeight / 677;
var b2 = 15 * windowHeight / 677;

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
  Animated
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
            chosenDeleteCard:'',
            modalY: new Animated.Value(windowHeight)
            
        };
        this.responseHandler = function(response){
            if(response.statusCode==400){
                 Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);              
            }else if (response.statusCode === 401) {
                return AuthService.logOut()
                    .then(() => {
                        delete this.state.eater;
                        this.props.navigator.push({
                            name: 'WelcomePage',
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
            this.props.navigator.push({
                name: 'WelcomePage'
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
        
        if(this.state.chosenCard && this.state.chosenCard.cardType == card.cardType && this.state.chosenCard.last4 == card.last4){
           var checkBoxIcon = checkedIcon;
        }else{
           var checkBoxIcon = uncheckedIcon;
        }                  
        
        if(this.state.isFromCheckOutPage){                 
            return (
                        <TouchableHighlight underlayColor={'transparent'} onPress={()=>this.onCardClick(card)}>
                            <View style={stylePaymentOptionPage.paymentMethodView}>         
                                <View  style={stylePaymentOptionPage.paymentMethodIconView}>
                                    {this.renderPaymentMethodType(card)}
                                </View>      
                                <View style={stylePaymentOptionPage.paymentMethodInfoView}>
                                    <Text style={stylePaymentOptionPage.paymentMethodInfoText}>**** {card.last4}</Text>
                                </View>
                                <View style={stylePaymentOptionPage.checkBoxIconView}>
                                    <Image style={stylePaymentOptionPage.checkBoxIcon} source={checkBoxIcon}/>
                                </View>
                            </View>
                        </TouchableHighlight>
            );
        }else{
            return (
                <View style={stylePaymentOptionPage.paymentOverview}>
                    <View style={stylePaymentOptionPage.paymentMethodView}>         
                        <View  style={stylePaymentOptionPage.paymentMethodIconView}>
                            {this.renderPaymentMethodType(card)}
                        </View>
                        <View style={stylePaymentOptionPage.paymentMethodInfoView}>
                            <Text style={stylePaymentOptionPage.paymentMethodInfoText}>**** {card.last4}</Text>
                        </View>
                        <Text style={stylePaymentOptionPage.deleteText} onPress={()=>this.onDeleteClick(card)}>Delete</Text>
                    </View>
                </View>
            );
        }
    }
    
    showActionSheet(){
        return (
            <Animated.View style={[{ transform: [{translateY: this.state.modalY}] }]}>
                <View style={stylePaymentOptionPage.actionSheetBorder}>
                    <View style={stylePaymentOptionPage.actionSheetView}>
                                <Text style={stylePaymentOptionPage.actionSheetText}>Delete this payment option from your account?</Text>
                                <TouchableOpacity style={stylePaymentOptionPage.actionSheetConfirmButton} activeOpacity={0.7} onPress={() => this.removeAPayment(this.state.chosenDeleteCard)}>
                                    <Text style={stylePaymentOptionPage.actionSheetConfirmText}>Confirm</Text> 
                                </TouchableOpacity>
                                <TouchableOpacity style={stylePaymentOptionPage.actionSheetDeleteButton} activeOpacity={0.7} onPress={() => this.cancelActionSheet()}>
                                    <Text style={stylePaymentOptionPage.actionSheetDeleteText}>Cancel</Text> 
                                </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    }

    renderFooter(){
        return [
            <View style={{height:9*windowHeight/667}}></View>,
            <TouchableHighlight underlayColor={'rgba(0,0,0,0)'} onPress={()=>this.addAPayment()}>
            <View style={stylePaymentOptionPage.addCardView}>          
            <View style={stylePaymentOptionPage.addCardTitleView}>
                <Text style={stylePaymentOptionPage.addCardTitleText}>+ Add a card</Text>
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
                        <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                            <TouchableOpacity activeOpacity={1} style={styles.pageBackgroundImage} onPress={()=>this.closeModal()}>
                            {overallContent}
                            </TouchableOpacity>
                            {this.showActionSheet()}
                        </Image>
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
    
    onDeleteClick(card) {
        this.setState({chosenDeleteCard:card});
        this.openModal();
    }

    openModal() {
        Animated.timing(this.state.modalY, {
            duration: 300,
            toValue: 0
         }).start();
    }
    
    closeModal() {
        Animated.timing(this.state.modalY, {
            duration: 300,
            toValue: windowHeight
        }).start();
    }

    cancelActionSheet() {
        this.closeModal();
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
        this.closeModal();
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
        this.closeModal();
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
    paymentMethodView:{
        flex:0,
        flexDirection:'row',
        height:windowHeight*0.075,
        borderBottomWidth:1,
        borderColor:'lightgrey',
    },
    checkBoxIconView:{
        flex:0,
        flexDirection:'row',
        justifyContent:'flex-start',
    },
    checkBoxIcon:{
        width:23*windowHeight/700.0,
        height:23*windowHeight/700.0,
        alignSelf:'center',
    },
    deleteText:{
        fontSize: h2,
        color: '#7bcbbe',
        alignSelf: 'center',
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
        height:windowHeight*0.035,
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
        fontSize:h3,
        color:'#7bcbbe',
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
    actionSheetView: {
        flex: 0.5,
        flexDirection:'column',
        height:windowHeight*0.3,
        backgroundColor:'rgba(0,0,0,0)',
    },
    actionSheetText: {
        fontSize:14*windowHeight/677,
        fontWeight:'bold',
        marginTop: windowHeight*0.033,
        marginBottom: windowHeight*0.04,
        paddingLeft: windowWidth/20.7,
    },
    actionSheetConfirmButton: {
        paddingVertical:windowHeight*0.025,
        marginHorizontal:windowWidth/20,
        marginVertical:windowHeight*0.007,
        borderColor:'#7BCBBE',
        borderWidth:2,
        backgroundColor: '#7BCBBE',
    },
    actionSheetConfirmText: {
        color: 'white',
        fontSize:14*windowHeight/677,
        fontWeight:'bold',
        alignSelf: 'center',
    },
    actionSheetDeleteButton: {
        paddingVertical:windowHeight*0.025,
        marginHorizontal:windowWidth/20,
        marginVertical:windowHeight*0.005,
        borderColor:'#7BCBBE',
        borderWidth:2,
    },
    actionSheetDeleteText: {
        color: '#7BCBBE',
        fontSize:14*windowHeight/677,
        fontWeight:'bold',
        alignSelf: 'center',
    },
    actionSheetBorder: {
        shadowOffset: {width: 0, height: 0},
        shadowColor: 'grey',
        shadowOpacity: 0.5,
        shadowRadius: 2.5,
    }
});                
                        
module.exports = PaymentOptionPage;