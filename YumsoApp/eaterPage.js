var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
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
                
        this.state = {
            showProgress:true,
        };
    }
    
    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchEaterProfile(); 
    }
    
    fetchEaterProfile(){
        var self = this;
        return AuthService.getPrincipalInfo().then(function(res){
           if(res){
              var eaterId = res.userId;
              console.log('eaterPrinciple: ');
              console.log(res);
            //   this.client.getWithAuth(config.getOneChefEndpoint+eaterId).then(function(res){
            //      if(res.statusCode===200){
            //         var chef=res.data.chef;
            //         console.log("chef:");
            //         console.log(chef); 
            //         self.setState({chef:chef, showProgress:false});
            //     }
            //  });
              var eater = res;
              eater['eaterAlias'] = 'xihe';
              eater['telephoneNumber'] = '(425)802-4885';
              eater['addressList'] = ['10715 NE37 Ct, Apt.227,Kirkland,WA 98033','1306 17th Ave SE,Seattle, WA 98108'];
              eater['creditCard'] = '1234 4567 7890 1234';
              eater['paypal'] = null; 
              eater['eaterProfilePic'] = './TestImages/Obama.jpg';
              self.setState({eater:eater, showProgress:false});
           }
        });
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
                <Image source={require('./TestImages/Obama.jpg')} style={styleEaterPage.eaterProfilePic}>
                   <View style={styleEaterPage.uploadPhotoButtonView}>
                     <Image source={require('./icons/ic_add_a_photo_48pt_3x.png')} style={styleEaterPage.iconImage}/>                      
                   </View>
                </Image>
                <View style={styleEaterPage.eaterPageRowView}>
                   <Text style={styleEaterPage.eaterNameText}>{this.state.eater.firstname} {this.state.eater.lastname}({this.state.eater.eaterAlias})</Text>
                   <Text style={styleEaterPage.eaterPageGreyText}>Email:{this.state.eater.email}</Text>
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
    
    navigateBackToChefList(){
         this.props.navigator.pop();
    }
}

var styleEaterPage = StyleSheet.create({
    backButtonView:{
        position:'absolute',
        top:18,
        left:0,
    },
    editButtonText:{
        color:'#ff9933',
    },
    uploadPhotoButtonView:{
        position:'absolute',
        right:12,
        top:windowHeight/2.63-40,
    },
    iconImage:{
        width:30,
        height:30
    },
    editButtonView:{
        position:'absolute',
        top:25,
        right:10
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