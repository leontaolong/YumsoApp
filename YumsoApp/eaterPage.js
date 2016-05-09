var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var ImageCamera = require('./imageCamera');
var MapPage = require('./mapPage');
var backIcon = require('./icons/ic_keyboard_arrow_left_48pt_3x.png');
var defaultAvatar = require('./TestImages/Obama.jpg');
var uploadPhotoIcon = require('./icons/ic_add_a_photo_48pt_3x.png');
var houseIcon = require('./icons/Icon-house.png');
var paypalIcon = require('./icons/Icon-paypal.png');
var visaIcon = require('./icons/Icon-visa.png');

import Dimensions from 'Dimensions';

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class EaterPage extends Component {
     constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length-1].passProps.eater;      
        let principal = routeStack[routeStack.length-1].passProps.principal;
        let callback = routeStack[routeStack.length-1].passProps.callback;
        this.state = {
            eater:eater,
            principal:principal,
            showProgress:false,
            edit:false,
            callback:callback,
            addMoreAddress:false,
            editHomeAddress:false,
            editWorkAddress:false
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
     render() {
         if(this.state.addMoreAddress){
             return(<MapPage onSelectAddress={this.mapDoneForAddAddress.bind(this)} onCancel={this.onCancelMap.bind(this)}/>);        
         }
         if(this.state.editHomeAddress){
             return(<MapPage onSelectAddress={this.mapDoneForHomeAddress.bind(this)} onCancel={this.onCancelMap.bind(this)}/>);   
         }
         if(this.state.editWorkAddress){
             return(<MapPage onSelectAddress={this.mapDoneForWorkAddress.bind(this)} onCancel={this.onCancelMap.bind(this)}/>);            
         }
         if (this.state.edit) {
             var otherAddressListRendered = [];
             for (let i = 0; i < this.state.addressList.length; i++) {
                 otherAddressListRendered.push(
                     <View key={i} style={styleEaterPage.addressView}>
                       <View style={styleEaterPage.addressTitleView}>
                          <Image source={houseIcon} style={styleEaterPage.houseIcon}/>
                          <Text style={styleEaterPage.addressTitleText}>Other</Text>
                       </View>
                       <View style={styleEaterPage.addressTextView}>
                          <Text style={styleEaterPage.addressText}>
                            {this.state.addressList[i].formatted_address}
                          </Text>
                       </View>
                       <TouchableHighlight style={styleEaterPage.addressEditView}  onPress = {()=>this.removeAddress(this.state.addressList[i])}>
                          <Text style={styleEaterPage.addressEditText}>Remove</Text>
                       </TouchableHighlight>
                     </View> 
                 );
             }
             return (
               <View style={styles.container}>
                 <View style={styles.headerBannerView}>
                         <View style={styles.backButtonView}>
                         <TouchableHighlight onPress = {() => {this.setState({ edit: false })}}>
                             <Image source={backIcon} style={styles.backButtonIcon}/>
                         </TouchableHighlight> 
                         </View>
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}>Edit Profile</Text>
                         </View>
                         <View style={styles.headerRightView}>
                         <TouchableHighlight onPress = {this.submit.bind(this)}>                             
                               <Text style={styles.headerRightTextButtonText}>Save</Text>
                         </TouchableHighlight>
                         </View>
                 </View>
                 <ScrollView>
                     
                     <View style={styleEaterPage.sectionTitleView}>
                        <Text style={styleEaterPage.sectionTitleText}>ABOUT</Text>
                     </View>
                     <View style={styleEaterPage.nameInputView}>
                       <View style={styleEaterPage.nameInputTitleView}>
                          <Text style={styleEaterPage.nameInputTitleText}>First Name</Text>
                       </View>
                       <View style={styleEaterPage.nameInputTextView}>
                          <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.firstname}
                         onChangeText = {(text) => this.setState({ firstname: text }) }/>
                       </View>
                     </View>
                     <View style={styleEaterPage.nameInputView}>
                       <View style={styleEaterPage.nameInputTitleView}>
                          <Text style={styleEaterPage.nameInputTitleText}>Last Name</Text>
                       </View>
                       <View style={styleEaterPage.nameInputTextView}>
                          <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.lastname}
                         onChangeText = {(text) => this.setState({ lastname: text }) }/>
                       </View>
                     </View>
                     <View style={styleEaterPage.nameInputView}>
                       <View style={styleEaterPage.nameInputTitleView}>
                          <Text style={styleEaterPage.nameInputTitleText}>Alias</Text>
                       </View>
                       <View style={styleEaterPage.nameInputTextView}>
                          <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.eaterAlias}
                         onChangeText = {(text) => this.setState({ eaterAlias: text }) }/>
                       </View>
                     </View>

                     <View style={styleEaterPage.genderSelectView}>
                        <View style={styleEaterPage.oneGenderSelectView}>
                           <Text style={styleEaterPage.oneGenderSelectText}>Male</Text>
                        </View>
                        <View style={styleEaterPage.oneGenderSelectMiddleView}>
                           <Text style={styleEaterPage.oneGenderSelectText}>Female</Text>
                        </View>
                        <View style={styleEaterPage.oneGenderSelectView}>
                           <Text style={styleEaterPage.oneGenderSelectText}>Not to tell</Text>
                        </View>
                     </View>
                     
                     <View style={styleEaterPage.nameInputView}>
                       <View style={styleEaterPage.nameInputTitleView}>
                          <Text style={styleEaterPage.nameInputTitleText}>Email</Text>
                       </View>
                       <View style={styleEaterPage.nameInputTextView}>
                          <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.email}
                         onChangeText = {(text) => this.setState({ email: text }) }/>
                       </View>
                     </View>
                     
                     <View style={styleEaterPage.nameInputView}>
                       <View style={styleEaterPage.nameInputTitleView}>
                          <Text style={styleEaterPage.nameInputTitleText}>Phone</Text>
                       </View>
                       <View style={styleEaterPage.nameInputTextView}>
                          <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.phoneNumber}
                         onChangeText = {(text) => this.setState({ phoneNumber: text }) }/>
                       </View>
                     </View>
                     
                     <View style={styleEaterPage.sectionTitleView}>
                        <Text style={styleEaterPage.sectionTitleText}>ADDRESS</Text>
                     </View>      
                                             
                     <View style={styleEaterPage.addressView}>
                       <View style={styleEaterPage.addressTitleView}>
                          <Image source={houseIcon} style={styleEaterPage.houseIcon}/>
                          <Text style={styleEaterPage.addressTitleText}>Home</Text>
                       </View>
                       <View style={styleEaterPage.addressTextView}>
                          <Text style={styleEaterPage.addressText}>
                            {this.state.homeAddress!=null?this.state.homeAddress.formatted_address:''}
                          </Text>
                       </View>
                       <TouchableHighlight style={styleEaterPage.addressEditView}  onPress = {()=>this.setState({editHomeAddress:true})}>
                          <Text style={styleEaterPage.addressEditText}>Edit</Text>
                       </TouchableHighlight>
                     </View> 
                          
                     <View style={styleEaterPage.addressView}>
                       <View style={styleEaterPage.addressTitleView}>
                          <Image source={houseIcon} style={styleEaterPage.houseIcon}/>
                          <Text style={styleEaterPage.addressTitleText}>Work</Text>
                       </View>
                       <View style={styleEaterPage.addressTextView}>
                          <Text style={styleEaterPage.addressText}>
                            {this.state.workAddress!=null?this.state.workAddress.formatted_address:''}
                          </Text>
                       </View>
                       <TouchableHighlight style={styleEaterPage.addressEditView}  onPress = {()=>this.setState({editWorkAddress:true})}>
                          <Text style={styleEaterPage.addressEditText}>Edit</Text>
                       </TouchableHighlight>
                     </View>                                
                     {otherAddressListRendered}
                     <View style={styleEaterPage.addNewAddressClickableView}>
                          <Text onPress = {()=>this.setState({addMoreAddress:true})} style={styleEaterPage.addNewAddressClickableText}>+ Add a new address</Text>
                     </View>
                    
                     <ActivityIndicatorIOS
                         animating={this.state.showProgress}
                         size="large"
                         style={styles.loader}/>
                 </ScrollView>
                </View>);
         }
         if (this.state.showProgress) {
             return (
                 <View>
                     <ActivityIndicatorIOS
                         animating={this.state.showProgress}
                         size="large"
                         style={styles.loader}/>
                 </View>);
         } else {
             var addressListRendered = [];
             for (let i = 0; i < this.state.eater.addressList.length; i++) {
                 addressListRendered.push(
                     <Text key={i} style={styleEaterPage.eaterPageGreyText}>{this.state.eater.addressList[i].formatted_address}</Text>
                 );
             }
             var chefProfile = this.state.eater.eaterProfilePic == null ? defaultAvatar : { uri: this.state.eater.eaterProfilePic }
             return (
                <View style={styles.container}>
                   <View style={styles.headerBannerView}>                  
                         <View style={styles.backButtonView}>
                         <TouchableHighlight onPress={() => this.navigateBackToChefList() }>
                             <Image source={backIcon} style={styles.backButtonIcon}/>
                         </TouchableHighlight> 
                         </View>
                         
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}></Text>
                         </View>
                         <View style={styles.headerRightView}>
                         <TouchableHighlight onPress={() => { this.setState({ edit: true, 
                                     firstname: this.state.eater.firstname, 
                                     lastname: this.state.eater.lastname, 
                                     eaterAlias: this.state.eater.eaterAlias,
                                     gender: this.state.eater.gender,
                                     phoneNumber: this.state.eater.phoneNumber,
                                     homeAddress: this.state.eater.homeAddress,
                                     workAddress: this.state.eater.workAddress,
                                     addressList: this.state.eater.addressList
                                    })}}>
                             
                               <Text style={styles.headerRightTextButtonText}>Edit</Text>
                         </TouchableHighlight>
                         </View>
                   </View>
                   <ScrollView>
                     <Image source={chefProfile} style={styleEaterPage.eaterProfilePic}>
                         <View style={styleEaterPage.uploadPhotoButtonView}>
                             <TouchableHighlight onPress={() => this.uploadPic() }>
                                 <Image source={uploadPhotoIcon} style={styleEaterPage.uploadPhotoIcon}/>
                             </TouchableHighlight>
                         </View>
                     </Image>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterNameText}>{this.state.eater.firstname} {this.state.eater.lastname} ({this.state.eater.eaterAlias}) </Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.principal.identityProvider === 'Yumso' ? `Email:${this.state.eater.email}` : 'Logged in using Facebook'}</Text>
                     </View>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterPageGreyText}>Address: </Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>+ HOME</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.eater.homeAddress!=null?this.state.eater.homeAddress.formatted_address:''}</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>+ WORK</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.eater.workAddress!=null?this.state.eater.workAddress.formatted_address:''}</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>+ Other Address: </Text>
                         {addressListRendered}
                     </View>
                     <View style={styleEaterPage.eaterPageRowView}>                        
                         <View style={styleEaterPage.addNewAddressClickableView}>
                             <TouchableHighlight onPress={this.selectPayment.bind(this)}>
                                <Text style={styleEaterPage.addNewAddressClickableText}>Payment Options</Text>
                             </TouchableHighlight>
                         </View>
                    </View>
                  </ScrollView>
                </View>);
         }
     }
    
    uploadPic(){
           ImageCamera.PickImage((source)=>{
                this.state.eater.eaterProfilePic = source.uri;
                this.setState({eater:this.state.eater});
                var photo = {
                    uri: source.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                };
                var request = new XMLHttpRequest();

                var body = new FormData();
                body.append('photo', photo);
                body.append('title', 'A beautiful photo!');
                
                request.onreadystatechange = (e) => {
                    if (request.readyState !== 4) {
                        return;
                    }

                    if (request.status === 200) {
                        console.log('success', request.responseText);
                        Alert.alert( 'Success', 'Successfully upload your profile picture',[ { text: 'OK' }]); 
                    } else {
                        Alert.alert( 'Fail', 'Failed to upload your profile picture. Please retry again later',[ { text: 'OK' }]); 
                    }
                };  
                
                request.open('POST', config.baseUrl+config.eaterPicUploadEndpoint);
                return AsyncStorage.getItem('token').then((token)=>{
                    console.log(token);
                    request.setRequestHeader("Authorization", 'bearer '+token);
                    request.send(body);    
                });
           });     
    }
    
    submit(){
        if (!this.state.firstname || this.state.firstname === '' || this.state.firstname.trim().includes(' ')) {
            Alert.alert('Warning', 'Missing first name or first name is invalid', [{ text: 'OK' }]);    
            return;            
        }        
        if (!this.state.lastname || this.state.lastname === '' || this.state.lastname.trim().includes(' ')) {
            Alert.alert('Warning', 'Missing last name or last name is invalid', [{ text: 'OK' }]);                
        }
        if (!this.state.eaterAlias || this.state.eaterAlias === '') {
            Alert.alert('Warning', 'Missing alias name. This will be displayed publicly to chef and other users', [{ text: 'OK' }]);                
        }
        var _this = this;
        let eater = JSON.parse(JSON.stringify(this.state.eater));
        eater.firstname = this.state.firstname.trim();
        eater.lastname = this.state.lastname.trim();
        eater.eaterAlias = this.state.eaterAlias.trim();
        eater.gender = this.state.gender;
        eater.phoneNumber = this.state.phoneNumber
        eater.homeAddress = this.state.homeAddress;
        eater.workAddress = this.state.workAddress;
        eater.addressList = this.state.addressList;
        return this.client.postWithAuth(config.eaterUpdateEndpoint,{
            eater: eater
        }).then((res)=>{
            if(res.statusCode ===200){
                Alert.alert('Success', 'Successfully updated your profile', [{ text: 'OK' }]); 
                return AuthService.updateCacheEater(eater)
                    .then(()=>{
                        _this.setState({eater:eater, edit:false});             
                        _this.state.callback(_this.state.eater);           
                    }); 
            }else {
                Alert.alert('Fail', 'Failed update your profile. Please retry again later', [{ text: 'OK' }]);          
            }
        });
    }
    
    mapDoneForHomeAddress(address){
         if(address){
             this.setState({homeAddress: address}); 
         }
         this.setState({editHomeAddress:false});
    }
    
    mapDoneForWorkAddress(address){
         if(address){
             this.setState({workAddress: address}); 
         }
         this.setState({editWorkAddress:false});
    }
    
    mapDoneForAddAddress(address){
         if(address){
             for(let oneAddress of this.state.eater.addressList){
                 if(address.formatted_address===oneAddress.formatted_address){
                    Alert.alert('Warning', 'Address already exists', [{ text: 'OK' }]);          
                    return;
                 }
             }
             this.state.addressList.push(address);   
             this.setState({addressList: this.state.addressList}); 
         }
         this.setState({addMoreAddress:false}); 
    }
    
    onCancelMap(){
         this.setState({editWorkAddress:false, editHomeAddress:false, addMoreAddress:false});
    }
    
    navigateBackToChefList(){
         this.props.navigator.pop();
    }
    
    selectPayment() {
        let principal = this.state.principal;
        this.props.navigator.push({
            name: 'PaymentOptionPage',//todo: fb cached will signin and redirect back right away.
            passProps:{
                eaterId: principal.userId
                // onPaymentSelected: function(payment){
                //     this.setState({paymentOption:payment});
                //}.bind(this)
            }
        });
    }
    
    removeAddress(address){
        let newAddresses = [];
        for(var oneAddress of this.state.addressList){
            if(oneAddress.formatted_address!==address.formatted_address){
                newAddresses.push(oneAddress);
            }
        }
        this.setState({addressList: newAddresses});
    }
}

var styleEaterPage = StyleSheet.create({
    uploadPhotoButtonView:{
        position:'absolute',
        right:12,
        top:windowHeight/2.63-47,
    },
    uploadPhotoIcon:{
        width:40,
        height:40,
    },
    eaterProfilePic:{
        width: windowWidth,
        height: windowHeight/2.63,
    },
    eaterPageRowView:{
        flex: 1,
        paddingHorizontal: windowWidth/20.7,
        paddingTop: windowWidth/20.7,
        paddingBottom: windowWidth/41.4,
        borderColor: '#D7D7D7',
        borderTopWidth: 1,
        backgroundColor: '#fff',
    },
    eaterNameText:{
        fontSize:windowHeight/36.8,
        marginBottom:windowHeight/61.3,
    },
    eaterPageGreyText:{
        fontSize: windowHeight/46.0,
        marginBottom: windowWidth/41.4,
        color:'#696969',
    },
    sectionTitleView:{
        flexDirection:'row',
        justifyContent:'center',
        height:70,
        backgroundColor:'#ECECEC',
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    sectionTitleText:{
        alignSelf:'center',
        fontSize:18,
        color:'#696969',
        fontWeight:'400',
    },
    nameInputView:{
        flex:1,
        flexDirection:'row',
        height:50,
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    nameInputTitleView:{
        flex:0.25,
        flexDirection:'row',
        justifyContent:'flex-start',
        marginLeft:15,
    },
    nameInputTitleText:{
        alignSelf:'center',
        fontSize:16,
        color:'#808080',
    },
    nameInputTextView:{
        flex:0.75,
        flexDirection:'row',
        marginRight:15,
    },
    nameInputText:{
        flex:1,
        textAlign:'right',
        fontSize:16,
    },
    genderSelectView:{
        flex:1,
        flexDirection:'row',
        height:50,
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    oneGenderSelectView:{
        flex:1/3,
        flexDirection:'row',
        justifyContent:'center',
    },
    oneGenderSelectMiddleView:{
        flex:1/3,
        flexDirection:'row',
        justifyContent:'center',
        borderLeftWidth:1,
        borderRightWidth:1,
        borderColor:'#D7D7D7',
    },
    oneGenderSelectText:{
        fontSize:15,
        color:'#808080',
        alignSelf:'center',
    },
    houseIcon:{
        width: 30,
        height:30,
        alignSelf:'center',
    },
    addressView:{
        flex:1,
        flexDirection:'row',
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    addressTitleView:{
        flex:0.25,
        flexDirection:'row',
        height:50,
        justifyContent:'flex-start',
        marginLeft:15,
    },
    addressTitleText:{
        alignSelf:'center',
        fontSize:16,
        color:'#808080',
    },
    addressTextView:{
        marginLeft:30,
        flex:0.5,
        justifyContent:'flex-end',
    },
    addressText:{
        fontSize:15,
        marginVertical:16,
    },
    addressEditView:{
        flex:0.15,
        flexDirection:'row',
        marginRight:15,
        justifyContent:'flex-end',
        height:50,
    },
    addressEditText:{
        fontSize:15,
        color:'#ff9933',
        alignSelf:'center',
    },
    addNewAddressClickableView:{
        height:50,
        flexDirection:'row',
        backgroundColor:'#ECECEC',
        justifyContent:'flex-start',
        paddingLeft:15,
    },
    addNewAddressClickableText:{
        fontSize:15,
        color:'#ff9933',
        alignSelf:'center',
    },
    paymentMethodView:{
        flex:1,
        flexDirection:'row',
        height:50,
    },
    paymentMethodIconView:{
        flex:0.75,
        flexDirection:'row',
        justifyContent:'flex-end'
    },
    paymentCreditCardView:{
        flex:1,
        flexDirection:'row',
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    paymentMethodTitleView:{
        flex:0.25,
        flexDirection:'row',
        height:50,
        justifyContent:'flex-start',
    },
    paymentMethodIcon:{
        width:40,
        height:25,
        alignSelf:'center',
    },
    creditCardView:{
        marginVertical:17,
        padding:15,
        width:windowWidth*0.45,
        flexDirection:'column',
        marginRight:15,
        borderColor:'#D7D7D7',
        borderBottomWidth: 0.6,
        borderWidth:1,
        borderRadius:8,
    },
    
});

module.exports = EaterPage;