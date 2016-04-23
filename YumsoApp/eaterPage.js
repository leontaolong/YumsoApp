var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var ImageCamera = require('./imageCamera');
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
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class EaterPage extends Component {
     constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length-1].passProps.eater;      
        let principal = routeStack[routeStack.length-1].passProps.eater;
        let callback = routeStack[routeStack.length-1].passProps.callback;
        this.state = {
            eater:eater,
            authProvider:principal.identityProvider,
            showProgress:false,
            edit:false,
            callback:callback
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
     render() {
         if (this.state.edit) {
             return (
                 <View style={styles.container}>
                     <TextInput defaultValue={this.state.eater.firstname} style={styles.loginInput}
                         onChangeText = {(text) => this.setState({ firstname: text }) }/>
                     <TextInput defaultValue={this.state.eater.lastname} style={styles.loginInput}
                         onChangeText = {(text) => this.setState({ lastname: text }) }/>
                     <TextInput defaultValue={this.state.eater.eaterAlias} style={styles.loginInput}
                         onChangeText = {(text) => this.setState({ eaterAlias: text }) }/>
                     <TouchableHighlight style={styles.button}
                         onPress = {this.submit.bind(this) }>
                         <Text style={styles.buttonText}>Submit</Text>
                     </TouchableHighlight>
                     <TouchableHighlight style={styles.button}
                         onPress = {() => { this.setState({ edit: false }) } }>
                         <Text style={styles.buttonText}>Cancel</Text>
                     </TouchableHighlight>
                     <ActivityIndicatorIOS
                         animating={this.state.showProgress}
                         size="large"
                         style={styles.loader} />
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
                     <Text key={i} style={styleEaterPage.eaterPageGreyText}>+ {this.state.eater.addressList[i]}</Text>
                 );
             }
             var chefProfile = this.state.eater.eaterProfilePic == null ? require('./TestImages/Obama.jpg') : { uri: this.state.eater.eaterProfilePic }
             return (
                 <View>
                     <View style={styleEaterPage.headerBannerView}>
                         <TouchableHighlight onPress={() => this.navigateBackToChefList() }>
                             <View style={styleEaterPage.backButtonView}>
                                 <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png') } style={styleEaterPage.iconImage}/>
                             </View>
                         </TouchableHighlight>
                         <TouchableHighlight>
                             <View style={styleEaterPage.editButtonView}>
                                 <Text onPress={() => { this.setState({ edit: true, firstname: this.state.eater.firstname, lastname: this.state.eater.lastname, eaterAlias: this.state.eater.eaterAlias }) } }
                                     style={styleEaterPage.editButtonText}>Edit</Text>
                             </View>
                         </TouchableHighlight>
                     </View>
                     <Image source={chefProfile} style={styleEaterPage.eaterProfilePic}>
                         <View style={styleEaterPage.uploadPhotoButtonView}>
                             <TouchableHighlight onPress={() => this.uploadPic() }>
                                 <Image source={require('./icons/ic_add_a_photo_48pt_3x.png') } style={styleEaterPage.iconImage}/>
                             </TouchableHighlight>
                         </View>
                     </Image>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterNameText}>{this.state.eater.firstname} {this.state.eater.lastname} ({this.state.eater.eaterAlias}) </Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>{this.state.authProvider === 'Yumso' ? `Email:${this.state.eater.email}` : 'Logged in using Facebook'}</Text>
                     </View>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterPageGreyText}>Address: </Text>
                         {addressListRendered}
                     </View>
                     <View style={styleEaterPage.eaterPageRowView}>
                         <Text style={styleEaterPage.eaterPageGreyText}>Payment: </Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>+ Credit Card: xxxx xxxx xxxx 1234</Text>
                         <Text style={styleEaterPage.eaterPageGreyText}>+ Paypal: </Text>
                     </View>
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
        console.log(eater);
        console.log(this.state.eater);
        return this.client.postWithAuth(config.eaterUpdateEndpoint,{
            eater: eater
        }).then((res)=>{
            if(res.statusCode ===200){
                Alert.alert('Success', 'Successfully updated your profile', [{ text: 'OK' }]); 
                _this.setState({eater:eater, edit:false});  
                _this.state.callback(_this.state.eater);           
            }else {
                Alert.alert('Fail', 'Failed update your profile. Please retry again later', [{ text: 'OK' }]);          
            }
        });
    }
    
    navigateBackToChefList(){
         this.props.navigator.pop();
    }
}

var styleEaterPage = StyleSheet.create({
    backButtonView:{
        position:'absolute',
        top:15,
        left:0,
    },
    editButtonText:{
        color:'#ff9933',
        fontSize:15,
    },
    uploadPhotoButtonView:{
        position:'absolute',
        right:12,
        top:windowHeight/2.63-47,
    },
    iconImage:{
        width:40,
        height:40,
    },
    editButtonView:{
        position:'absolute',
        top:25,
        right:10,
    },
    headerBannerView:{
        flex: 1,
        height:60,
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
});

module.exports = EaterPage;