'use strict'
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var ImageCamera = require('./imageCamera');
var MapPage = require('./mapPage');
var backIcon = require('./icons/icon-back.png');
var defaultAvatar = require('./TestImages/Obama.jpg');
var uploadPhotoIcon = require('./icons/icon-camera.png');
var houseIcon = require('./icons/Icon-house.png');
var paypalIcon = require('./icons/Icon-paypal.png');

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
    }
    
     render() {
         if (this.state.showProgress) {
             return (<View>
                 <ActivityIndicatorIOS animating={this.state.showProgress} size="large"  Dstyle={styles.loader}/>
             </View>);
         }
         if (this.state.addMoreAddress) {
             return (<MapPage onSelectAddress={this.mapDoneForAddAddress.bind(this) } onCancel={this.onCancelMap.bind(this) } specificAddressMode={true}/>);
         }
         if (this.state.editHomeAddress) {
             return (<MapPage onSelectAddress={this.mapDoneForHomeAddress.bind(this) } onCancel={this.onCancelMap.bind(this) } specificAddressMode={true}/>);
         }
         if (this.state.editWorkAddress) {
             return (<MapPage onSelectAddress={this.mapDoneForWorkAddress.bind(this) } onCancel={this.onCancelMap.bind(this) } specificAddressMode={true}/>);
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
                             <Text style={styleEaterPage.addressText}>
                                 {this.state.addressList[i].apartmentNumber ? 'Apt/Suite#: ' + this.state.addressList[i].apartmentNumber : ''}
                             </Text>
                         </View>
                         <TouchableHighlight style={styleEaterPage.addressEditView} underlayColor={'transparent'} onPress = {() => this.removeAddress(this.state.addressList[i]) }>
                             <Text style={styleEaterPage.addressEditText}>Delete</Text>
                         </TouchableHighlight>
                     </View>
                 );
             }

             var aptNumberHomeView = null;
             if (this.state.homeAddress != null && this.state.homeAddress.apartmentNumber && this.state.homeAddress.apartmentNumber.trim()) {
                 var aptNumberHomeView = <Text style={styleEaterPage.addressText}>{'Apt/Suite#: ' + this.state.homeAddress.apartmentNumber}</Text>
             }

             var aptNumberWorkView = null;
             if (this.state.workAddress != null && this.state.workAddress.apartmentNumber && this.state.workAddress.apartmentNumber.trim()) {
                 var aptNumberWorkView = <Text style={styleEaterPage.addressText}>{'Apt/Suite#: ' + this.state.workAddress.apartmentNumber}</Text>;
             }

             return (
                 <View style={styles.container}>
                     <View style={styles.headerBannerView}>
                         <View style={styles.headerLeftView}>
                             <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress = {() => { this.setState({ edit: false }) } }>
                                 <Image source={backIcon} style={styles.backButtonIcon}/>
                             </TouchableHighlight>
                         </View>
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}>Edit Profile</Text>
                         </View>
                         <View style={styles.headerRightView}>
                             <TouchableHighlight style={styles.headerRightTextButtonView} underlayColor={'transparent'} onPress = {this.submit.bind(this) }>
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
                                 <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.firstname} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                     onChangeText = {(text) => this.setState({ firstname: text }) }/>
                             </View>
                         </View>
                         <View style={styleEaterPage.nameInputView}>
                             <View style={styleEaterPage.nameInputTitleView}>
                                 <Text style={styleEaterPage.nameInputTitleText}>Last Name</Text>
                             </View>
                             <View style={styleEaterPage.nameInputTextView}>
                                 <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.lastname} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                     onChangeText = {(text) => this.setState({ lastname: text }) }/>
                             </View>
                         </View>
                         <View style={styleEaterPage.nameInputView}>
                             <View style={styleEaterPage.nameInputTitleView}>
                                 <Text style={styleEaterPage.nameInputTitleText}>Alias</Text>
                             </View>
                             <View style={styleEaterPage.nameInputTextView}>
                                 <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.eaterAlias} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                     onChangeText = {(text) => this.setState({ eaterAlias: text }) }/>
                             </View>
                         </View>

                         <View style={styleEaterPage.genderSelectView}>
                             <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleGender('Male') } style={styleEaterPage.oneGenderSelectView}>
                                 <Text style={{ fontSize: 15, color: this.renderGenderTextColor('Male'), alignSelf: 'center' }}>Male</Text>
                             </TouchableHighlight>
                             <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleGender('Female') } style={styleEaterPage.oneGenderSelectMiddleView}>
                                 <Text style={{ fontSize: 15, color: this.renderGenderTextColor('Female'), alignSelf: 'center' }}>Female</Text>
                             </TouchableHighlight>
                             <TouchableHighlight underlayColor={'transparent'} onPress = {() => this.toggleGender('Not to tell') } style={styleEaterPage.oneGenderSelectView}>
                                 <Text style={{ fontSize: 15, color: this.renderGenderTextColor('Not to tell'), alignSelf: 'center' }}>Not to tell</Text>
                             </TouchableHighlight>
                         </View>

                         <View style={styleEaterPage.nameInputView}>
                             <View style={styleEaterPage.nameInputTitleView}>
                                 <Text style={styleEaterPage.nameInputTitleText}>Email</Text>
                             </View>
                             <View style={styleEaterPage.nameInputTextView}>
                                 <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.email} autoCapitalize={'none'} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                     onChangeText = {(text) => this.setState({ email: text }) }/>
                             </View>
                         </View>

                         <View style={styleEaterPage.nameInputView}>
                             <View style={styleEaterPage.nameInputTitleView}>
                                 <Text style={styleEaterPage.nameInputTitleText}>Phone</Text>
                             </View>
                             <View style={styleEaterPage.nameInputTextView}>
                                 <TextInput style={styleEaterPage.nameInputText} defaultValue={this.state.eater.phoneNumber} keyboardType = { 'phone-pad'} clearButtonMode={'while-editing'} returnKeyType = {'done'}
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
                                     {this.state.homeAddress != null ? this.state.homeAddress.formatted_address : ''}
                                 </Text>
                                 {aptNumberHomeView}
                             </View>
                             <TouchableHighlight style={styleEaterPage.addressEditView} underlayColor={'transparent'} onPress = {() => this.setState({ editHomeAddress: true }) }>
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
                                     {this.state.workAddress != null ? this.state.workAddress.formatted_address : ''}
                                 </Text>
                                 {aptNumberWorkView}
                             </View>
                             <TouchableHighlight style={styleEaterPage.addressEditView} underlayColor={'transparent'} onPress = {() => this.setState({ editWorkAddress: true }) }>
                                 <Text style={styleEaterPage.addressEditText}>Edit</Text>
                             </TouchableHighlight>
                         </View>
                         {otherAddressListRendered}
                         <View style={styleEaterPage.addNewAddressClickableView}>
                             <Text onPress = {() => this.setState({ addMoreAddress: true }) } style={styleEaterPage.addNewAddressClickableText}>+ Add a new address</Text>
                         </View>

                         <ActivityIndicatorIOS
                             animating={this.state.showProgress}
                             size="large"
                             style={styles.loader}/>
                     </ScrollView>
                 </View>);
         }


         var addressListRendered = [];
         if (this.state.eater.addressList.length > 0) {
             addressListRendered.push(<Text style={styleEaterPage.eaterPageGreyText}>+ OTHER</Text>);
         }

         for (let i = 0; i < this.state.eater.addressList.length; i++) {
             addressListRendered.push(
                 <Text key={i} style={styleEaterPage.eaterPageGreyText}>{this.state.eater.addressList[i].formatted_address}</Text>
             );
             addressListRendered.push(
                 <Text key={i + 'otherAddress'} style={styleEaterPage.eaterPageGreyText}>Apt/Suite#: {this.state.eater.addressList[i].apartmentNumber}</Text>
             );
         }
         var chefProfile = this.state.eater.eaterProfilePic == null ? defaultAvatar : { uri: this.state.eater.eaterProfilePic };

         var emailView = null;
         if (this.state.eater.email && this.state.principal.identityProvider !== 'Yumso') {
             emailView = <Text style={styleEaterPage.eaterPageGreyText}>{'Email: ' + this.state.eater.email}</Text>;
         }
         var photoNumberView = null;
         if (this.state.eater.phoneNumber) {
             photoNumberView = <Text style={styleEaterPage.eaterPageGreyText}>{'Phone: ' + this.state.eater.phoneNumber}</Text>;
         }

         return (
             <View style={styles.container}>
                 <View style={styles.headerBannerView}>
                     <View style={styles.headerLeftView}>
                         <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={() => this.navigateBackToChefList() }>
                             <Image source={backIcon} style={styles.backButtonIcon}/>
                         </TouchableHighlight>
                     </View>

                     <View style={styles.titleView}>
                         <Text style={styles.titleText}>My Profile</Text>
                     </View>
                     <View style={styles.headerRightView}>
                         <TouchableHighlight style={styles.headerRightTextButtonView} underlayColor={'transparent'} onPress={() => {
                             this.setState({
                                 edit: true,
                                 firstname: this.state.eater.firstname,
                                 lastname: this.state.eater.lastname,
                                 eaterAlias: this.state.eater.eaterAlias,
                                 gender: this.state.eater.gender,
                                 phoneNumber: this.state.eater.phoneNumber,
                                 homeAddress: this.state.eater.homeAddress,
                                 workAddress: this.state.eater.workAddress,
                                 addressList: this.state.eater.addressList
                             })
                         } }>

                             <Text style={styles.headerRightTextButtonText}>Edit</Text>
                         </TouchableHighlight>
                     </View>
                 </View>
                 <ScrollView>
                     <Image source={chefProfile} style={styleEaterPage.eaterProfilePic}>
                         <TouchableHighlight style={styleEaterPage.uploadPhotoButtonView} underlayColor={'transparent'} onPress={() => this.uploadPic() }>
                             <Image source={uploadPhotoIcon} style={styleEaterPage.uploadPhotoIcon}/>
                         </TouchableHighlight>
                     </Image>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterNameText}>{this.state.eater.firstname} {this.state.eater.lastname} ({this.state.eater.eaterAlias}) </Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.principal.identityProvider === 'Yumso' ? `Email: ${this.state.eater.email}` : 'Logged in using Facebook'}</Text>
                         {emailView}
                         {photoNumberView}
                     </View>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterPageGreyText}>Address: </Text>
                         <Text style={styleEaterPage.eaterPageClickableText} onPress={() => {
                             this.setState({
                                 edit: true,
                                 firstname: this.state.eater.firstname,
                                 lastname: this.state.eater.lastname,
                                 eaterAlias: this.state.eater.eaterAlias,
                                 gender: this.state.eater.gender,
                                 phoneNumber: this.state.eater.phoneNumber,
                                 homeAddress: this.state.eater.homeAddress,
                                 workAddress: this.state.eater.workAddress,
                                 addressList: this.state.eater.addressList
                             })
                         } }>+ HOME</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.eater.homeAddress != null ? this.state.eater.homeAddress.formatted_address : ''}</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.eater.homeAddress != null && this.state.eater.homeAddress.apartmentNumber != null ? 'Apt/Suite#: ' + this.state.eater.homeAddress.apartmentNumber : ''}</Text>
                         <Text style={styleEaterPage.eaterPageClickableText} onPress={() => {
                             this.setState({
                                 edit: true,
                                 firstname: this.state.eater.firstname,
                                 lastname: this.state.eater.lastname,
                                 eaterAlias: this.state.eater.eaterAlias,
                                 gender: this.state.eater.gender,
                                 phoneNumber: this.state.eater.phoneNumber,
                                 homeAddress: this.state.eater.homeAddress,
                                 workAddress: this.state.eater.workAddress,
                                 addressList: this.state.eater.addressList
                             })
                         } }>+ WORK</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.eater.workAddress != null ? this.state.eater.workAddress.formatted_address : ''}</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.eater.workAddress != null && this.state.eater.workAddress.apartmentNumber != null ? 'Apt/Suite#: ' + this.state.eater.workAddress.apartmentNumber : ''}</Text>
                         {addressListRendered}
                     </View>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterPageClickableText} onPress={this.selectPayment.bind(this) }>Payment Options</Text>
                     </View>
                 </ScrollView>
             </View>);
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
        this.setState({showProgress:true});
        return AuthService.saveEater(eater)
        .then((err)=>{
            if(!err){
                Alert.alert('Success', 'Successfully updated your profile', [{ text: 'OK' }]); 
                this.setState({ eater: eater, edit: false, showProgress: false });
                this.state.callback(eater);           
            }else {
                this.setState({showProgress:false});   
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

    renderGenderTextColor(gender){
         if(this.state.gender == gender){
             return '#ff9933';
         }else{
             return '#808080';
         }
    }
    
    toggleGender(gender){
        if(gender!=this.state.gender){
           this.setState({gender:gender});
        }
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
        right:windowWidth *0.0157,
        top:windowHeight*0.313,
    },
    uploadPhotoIcon:{
        width:windowHeight*0.06,
        height:windowHeight*0.06,
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
        color:'#4A4A4A',
    },
    eaterPageClickableText:{
        fontSize: windowHeight/46.0,
        marginBottom: windowWidth/41.4,
        color:'#FFCC33',
    },
    sectionTitleView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight*0.105,
        backgroundColor:'#ECECEC',
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    sectionTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/37.05,
        color:'#696969',
        fontWeight:'400',
    },
    nameInputView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
    },
    nameInputTitleView:{
        flex:0.25,
        flexDirection:'row',
        justifyContent:'flex-start',
        marginLeft:windowWidth*0.04,
    },
    nameInputTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/41.6875,
        color:'#808080',
    },
    nameInputTextView:{
        flex:0.75,
        flexDirection:'row',
        marginRight:windowWidth*0.022,
    },
    nameInputText:{
        flex:1,
        textAlign:'right',
        fontSize:windowHeight/41.6875,
    },
    genderSelectView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
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
        fontSize:windowHeight/44.467,
        color:'#808080',
        alignSelf:'center',
    },
    houseIcon:{
        width: windowHeight*0.0375,
        height:windowHeight*0.0375,
        alignSelf:'center',
    },
    addressView:{
        flex:1,
        flexDirection:'row',
        borderColor:'#D7D7D7',
        borderBottomWidth: 1,
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
        color:'#808080',
    },
    addressTextView:{
        marginLeft:windowWidth*0.025,
        flex:0.51,
        justifyContent:'flex-end',
        paddingVertical:windowWidth*0.0427,
    },
    addressText:{
        fontSize:windowHeight/44.467,
    },
    addressEditView:{
        flex:0.15,
        flexDirection:'row',
        marginRight:windowWidth*0.04,
        justifyContent:'flex-end',
        height:windowHeight*0.075,
    },
    addressEditText:{
        fontSize:windowHeight/44.467,
        color:'#ff9933',
        alignSelf:'center',
    },
    addNewAddressClickableView:{
        height:windowHeight*0.075,
        flexDirection:'row',
        backgroundColor:'#ECECEC',
        justifyContent:'flex-start',
        paddingLeft:windowWidth*0.04,
    },
    addNewAddressClickableText:{
        fontSize:windowHeight/44.467,
        color:'#ff9933',
        alignSelf:'center',
    },
    paymentMethodView:{
        flex:1,
        flexDirection:'row',
        height:windowHeight*0.075,
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
        height:windowHeight*0.075,
        justifyContent:'flex-start',
    },
    paymentMethodIcon:{
        width:windowWidth*0.107,
        height:windowWidth*0.067,
        alignSelf:'center',
    },
    creditCardView:{
        marginVertical:windowHeight*0.0255,
        padding:windowWidth*0.04,
        width:windowWidth*0.45,
        flexDirection:'column',
        marginRight:windowWidth*0.04,
        borderColor:'#D7D7D7',
        borderBottomWidth: 0.6,
        borderWidth:1,
        borderRadius:8,
    },
    
});

module.exports = EaterPage;