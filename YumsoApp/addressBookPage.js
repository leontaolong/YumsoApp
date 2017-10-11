'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var commonAlert = require('./commonModules/commonAlert');
var AuthService = require('./authService');
var MapPage = require('./mapPage');
var backIcon = require('./icons/icon-back.png');
var houseIcon = require('./icons/icon-grey-house.png');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
import Dimensions from 'Dimensions';

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;

var h1 = 28*windowHeight/677;
var h2 = windowHeight/35.5;
var h3 = windowHeight/33.41;
var h4 = windowHeight/47.33;
var h5 = 12;
var b1 = 15*windowHeight/677;
var b2 = 15*windowHeight/677;


class addressBookPage extends Component {
     constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length-1].passProps.eater;
        let currentLocation = routeStack[routeStack.length-1].passProps.currentLocation;
        let principal = routeStack[routeStack.length-1].passProps.principal;
        let callback = routeStack[routeStack.length-1].passProps.callback;
        let backcallback = routeStack[routeStack.length-1].passProps.backcallback;
        this.state = {
            eater:eater,
            currentLocation:currentLocation,
            principal:principal,
            showProgress:false,
            callback:callback,
            backcallback:backcallback,
            addMoreAddress:false,
            editHomeAddress:false,
            editWorkAddress:false,
        };

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
                 Alert.alert( 'Network or server error', 'Please try again later',[ { text: 'OK' }]);
            }
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }

     render() {
         var loadingSpinnerView = null;
         if (this.state.showProgress) {
             loadingSpinnerView = <LoadingSpinnerViewFullScreen/>
         }

         if (this.state.addMoreAddress) {
             return (<MapPage onSelectAddress={this.mapDoneForAddAddress.bind(this) } currentAddress={this.state.currentLocation} onCancel={this.onCancelMap.bind(this) } specificAddressMode={true} showHouseIcon={false}/>);
         }
         if (this.state.editHomeAddress) {
             return (<MapPage onSelectAddress={this.mapDoneForHomeAddress.bind(this) } initialLoc = {this.state.eater.homeAddress} onCancel={this.onCancelMap.bind(this) } specificAddressMode={true} showHouseIcon={false}/>);
         }
         if (this.state.editWorkAddress) {
             return (<MapPage onSelectAddress={this.mapDoneForWorkAddress.bind(this) } initialLoc = {this.state.eater.workAddress}  onCancel={this.onCancelMap.bind(this) } specificAddressMode={true} showHouseIcon={false}/>);
         }

        var otherAddressListRendered = [];
        for (let i = 0; i < this.state.eater.addressList.length; i++) {
             let aptNumberView = null;
             if(this.state.eater.addressList[i].apartmentNumber ){
                aptNumberView= <Text style={styleAddressBookPage.addressText}>
                                    {'Apt/Suite#: ' + this.state.eater.addressList[i].apartmentNumber}
                                </Text>
             }
             otherAddressListRendered.push(
                     <View key={i} style={styleAddressBookPage.addressView}>
                         <View  style={styleAddressBookPage.addressViewRow}>
                             <Text style={styleAddressBookPage.addressTitleTextNew}>Other</Text>

                             <View style={styleAddressBookPage.addressTextView}>
                                 <Text style={styleAddressBookPage.addressText}>
                                     {this.state.eater.addressList[i].formatted_address}

                                 </Text>
                                 {aptNumberHomeView}
                             </View>
                         </View>
                         <TouchableHighlight style={styleAddressBookPage.addressEditView} underlayColor={'transparent'} onPress = {() => this.removeAddress(this.state.eater.addressList[i]) }>
                             <Text style={styleAddressBookPage.addressEditText}>Delete</Text>
                         </TouchableHighlight>
                     </View>);
             }

             var aptNumberHomeView = null;
             if (this.state.eater.homeAddress != null && this.state.eater.homeAddress.apartmentNumber && this.state.eater.homeAddress.apartmentNumber.trim()) {
                 var aptNumberHomeView = <Text style={styleAddressBookPage.addressText}>{'Apt/Suite#: ' + this.state.eater.homeAddress.apartmentNumber}</Text>
             }

             var aptNumberWorkView = null;
             if (this.state.eater.workAddress != null && this.state.eater.workAddress.apartmentNumber && this.state.eater.workAddress.apartmentNumber.trim()) {
                 var aptNumberWorkView = <Text style={styleAddressBookPage.addressText}>{'Apt/Suite#: ' + this.state.eater.workAddress.apartmentNumber}</Text>;
             }

             var addAddressView =[ (<View key={'Home'} style={styleAddressBookPage.addressView}>
                                        <View  style={styleAddressBookPage.addressViewRow}>
                                            <Text style={styleAddressBookPage.addressTitleTextNew}>Home</Text>
                                            <View style={styleAddressBookPage.addressTextView}>
                                                <Text style={styleAddressBookPage.addressText}>
                                                    {this.state.eater.homeAddress != null ? this.state.eater.homeAddress.formatted_address : ''}
                                                </Text>
                                                {aptNumberHomeView}
                                            </View>
                                        </View>
                                        <TouchableHighlight style={styleAddressBookPage.addressEditView} underlayColor={'transparent'} onPress = {() => this.setState({ editHomeAddress: true }) }>
                                            <Text style={styleAddressBookPage.addressEditText}>Edit</Text>
                                        </TouchableHighlight>

                                </View>),
                                (<View key={'Work'} style={styleAddressBookPage.addressView}>
                                        <View  style={styleAddressBookPage.addressViewRow}>
                                            <Text style={styleAddressBookPage.addressTitleTextNew}>Work</Text>
                                            <View style={styleAddressBookPage.addressTextView}>
                                                <Text style={styleAddressBookPage.addressText}>
                                                    {this.state.eater.workAddress != null ? this.state.eater.workAddress.formatted_address : ''}
                                                </Text>
                                                {aptNumberWorkView}
                                            </View>
                                        </View>
                                        <TouchableHighlight style={styleAddressBookPage.addressEditView} underlayColor={'transparent'} onPress = {() => this.setState({ editWorkAddress: true }) }>
                                            <Text style={styleAddressBookPage.addressEditText}>Edit</Text>
                                        </TouchableHighlight>
                                </View>),
                                otherAddressListRendered,
                                (<View key={'AddNewAddress'} style={styleAddressBookPage.addNewAddressClickableView}>
                                        <Text onPress = {() => this.setState({ addMoreAddress: true }) } style={styleAddressBookPage.addNewAddressClickableText}>+ Add a new address</Text>
                                </View>)];
             return (<View style={styles.containerNew}>
                        <View style={styles.headerBannerViewNew}>
                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={()=>this.navigateBack()}>
                                <View style={styles.backButtonViewsNew}>
                                   <Image source={backIcon} style={styles.backButtonIconsNew}/>
                                </View>
                            </TouchableHighlight>

                            <View style={styles.headerRightView}>
                            </View>
                        </View>

                        <ScrollView style={{backgroundColor:'#fff'}}>
                        <View style={styles.titleViewNew}>
                            <Text style={styles.titleTextNew}>My Address</Text>
                        </View>
                            {addAddressView}
                            {loadingSpinnerView}
                        </ScrollView>
                    </View>);
     }

    submitAddress(address,addressType,isDelete){
        if(!address){
           return;
        }
        let eater = this.state.eater;
        if(addressType=='home'){
           eater.homeAddress = address;
        }else if(addressType=='work'){
           eater.workAddress = address;
        }else{
           if(isDelete){
              let newAddresses = [];
              for(let oneAddress of this.state.eater.addressList){
                  if(oneAddress.formatted_address!==address.formatted_address){
                     newAddresses.push(oneAddress);
                  }
              }
              eater.addressList = newAddresses;
           }else{
              for(let oneAddress of this.state.eater.addressList){
                  if(address.formatted_address===oneAddress.formatted_address){
                     Alert.alert('Warning', 'Address already exists', [{ text: 'OK' }]);
                    return;
                  }
              }
              if(eater.addressList){
                 eater.addressList.push(address);
              }else{
                 eater['addressList']=[];
                 eater.addressList.push(address);
              }
           }
        }
        this.setState({showProgress:true});
        return this.client.postWithAuth(config.eaterUpdateEndpoint, { eater: eater })
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode != 202) {
                    this.setState({ showProgress: false });
                    return this.responseHandler(res);
                }
                for(let prop in eater){
                    this.state.eater[prop] = eater[prop];
                }
                return AuthService.updateCacheEater(this.state.eater)
                .then(() => {
                    //Alert.alert('Success', 'Successfully updated your address', [{ text: 'OK' }]);
                    this.setState({ eater: this.state.eater, showProgress: false });
                    this.state.callback(this.state.eater);
                }).catch((err)=>{
                    this.setState({showProgress: false});
                    alert(err.message);
                });
        }).catch((err)=>{
            this.setState({showProgress: false});
            commonAlert.networkError(err);
        });
    }

    mapDoneForHomeAddress(address){
         this.submitAddress(address,'home');
         this.setState({editHomeAddress:false});
    }

    mapDoneForWorkAddress(address){
         this.submitAddress(address,'work');
         this.setState({editWorkAddress:false});
    }

    mapDoneForAddAddress(address){
         this.submitAddress(address,'other');
         this.setState({addMoreAddress:false});
    }

    onCancelMap(){
         this.setState({editWorkAddress:false, editHomeAddress:false, addMoreAddress:false});
    }

    navigateBack(){
        this.props.navigator.pop();
    }

    removeAddress(address){
        this.submitAddress(address,'other',true);
    }
}

var styleAddressBookPage = StyleSheet.create({
    houseIcon:{
        width: windowHeight*0.0375,
        height:windowHeight*0.0375,
        alignSelf:'center',
    },



    addNewAddressClickableView:{
        height:windowHeight*0.075,
        flexDirection:'row',
        justifyContent:'flex-start',
        paddingLeft:20 * windowWidthRatio,
    },
    addNewAddressClickableText:{
        fontSize:h3,
        color:'#7bcbbe',
        alignSelf:'center',

    },

    // *** new

    addressTitleTextNew: {
        fontSize: h2,
        fontWeight: "bold",
        marginTop: 10 * windowHeightRatio,
        color: "#4A4A4A",
    },
    addressViewRow:{
        flex:1,
    },
    addressView:{
        flex:1,
        flexDirection:'row',
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
        marginLeft: 20 * windowWidthRatio,
        marginRight: 20 * windowWidthRatio,
    },
    addressTitleView:{
        flex:0.24,
        flexDirection:'row',
        height:windowHeight*0.075,
        justifyContent:'flex-start',
        marginLeft:windowWidth*0.04,
    },
    addressTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/41.6875,
        color:'#9B9B9B',
    },
    addressTextView:{
        marginLeft:0,
        justifyContent:'flex-end',
        marginBottom: 10 * windowHeightRatio,
    },
    addressText:{
        fontSize:h4,
        paddingRight: 5 * windowWidthRatio,
        color: "#4A4A4A",
    },
    addressEditText:{
        fontSize: h2,
        color:'#7bcbbe',
        alignSelf:'center',
    },
    addressEditView:{
        flexDirection:'row',
        //marginRight:windowWidth*0.04,
        justifyContent:'flex-end',
        alignItems: "center",
        height: 60 * windowHeightRatio,
        width: 70 * windowWidthRatio,
        marginTop: 10 * windowHeightRatio,
        paddingTop: 10 * windowHeightRatio,
    },
    // *** end new
});

module.exports = addressBookPage;
