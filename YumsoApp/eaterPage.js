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
  Navigator
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class EaterPage extends Component {
     constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = routeStack[routeStack.length-1].passProps.eater;      
        let principal = routeStack[routeStack.length-1].passProps.eater;
        this.state = {
            eater:eater,
            authProvider:principal.identityProvider,
            showProgress:false
        };
        this.client = new HttpsClient(config.baseUrl);
    }
    
    render() {
            if(this.state.showProgress){
                return (
                <View>
                    <ActivityIndicatorIOS
                        animating={this.state.showProgress}
                        size="large"
                        style={styles.loader}/>
                </View>);
            }else{
              var addressListRendered=[];
              for(let i=0;i<this.state.eater.addressList.length;i++){
                  addressListRendered.push(
                    <Text key={i} style={styleEaterPage.eaterPageGreyText}>+ {this.state.eater.addressList[i]}</Text>  
                  );
              }
              var chefProfile = this.state.eater.eaterProfilePic==null? require('./TestImages/Obama.jpg'):{uri: this.state.eater.eaterProfilePic}
              return(
              <View>
                <View style={styleEaterPage.headerBannerView}>
                <TouchableHighlight onPress={() => this.navigateBackToChefList()}>
                   <View style={styleEaterPage.backButtonView}>
                     <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png')} style={styleEaterPage.iconImage}/>
                   </View>
                </TouchableHighlight>
                <TouchableHighlight>
                   <View style={styleEaterPage.editButtonView}>
                     <Text style={styleEaterPage.editButtonText}>Edit</Text>
                   </View>
                </TouchableHighlight>
                </View>
                <Image source={chefProfile} style={styleEaterPage.eaterProfilePic}>
                   <View style={styleEaterPage.uploadPhotoButtonView}>
                     <TouchableHighlight onPress={()=>this.uploadPic()}>
                        <Image source={require('./icons/ic_add_a_photo_48pt_3x.png')} style={styleEaterPage.iconImage}/>                      
                     </TouchableHighlight>
                   </View>
                </Image>
                <View style={styleEaterPage.eaterPageRowView}>
                   <Text style={styleEaterPage.eaterNameText}>{this.state.eater.firstname} {this.state.eater.lastname} ({this.state.eater.eaterAlias})</Text>
                   <Text style={styleEaterPage.eaterPageGreyText}>{this.state.authProvider==='Yumso'?`Email:${this.state.eater.email}`:'Logged in using Facebook'}</Text>
                </View>
                <View style={styleEaterPage.eaterPageRowView}>
                   <Text style={styleEaterPage.eaterPageGreyText}>Address:</Text>
                   {addressListRendered}
                </View>
                <View style={styleEaterPage.eaterPageRowView}>
                   <Text style={styleEaterPage.eaterPageGreyText}>Payment:</Text>
                   <Text style={styleEaterPage.eaterPageGreyText}>+ Credit Card: xxxx xxxx xxxx 1234</Text>
                    <Text style={styleEaterPage.eaterPageGreyText}>+ Paypal:</Text>
                </View> 
              </View>
              );     
            }                      
    }
    
    uploadPic(){
           ImageCamera.PickImage((source)=>{
               this.state.eater.eaterProfilePic = source.uri;
               this.setState({eater:this.state.eater});
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