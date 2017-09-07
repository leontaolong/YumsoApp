'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var {FBLogin} = require('react-native-facebook-login');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/icon-large-logo.png');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var commonAlert = require('./commonModules/commonAlert');
var validator = require('validator');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
import Dimensions from 'Dimensions';
var enterPic = require('./icons/enter.png');
var orange_dot = require('./icons/orange_dot.png');

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

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  PushNotificationIOS,
  AsyncStorage,
  Alert,
  ListView,
} from 'react-native';

const facebookPermissions = ["public_profile"];

class OrderPage extends Component {

  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(['row 1', 'row 2', 'row 2']),
    };
  }


    ShowHideTextComponentView = () =>{

      if(this.state.status == true)
      {
        this.setState({status: false})
      }
      else
      {
        this.setState({status: true})
      }
    }

    render(){
      return(

        <View style={styles.containerNew}>
            <View style={styles.headerBannerViewNew}>
                <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToHistoryOrderPage()}>
                  <View style={styles.backButtonViewsNew}>
                      <Image source={backIcon} style={styles.backButtonIconsNew}/>
                  </View>
                </TouchableHighlight>

                <View style={styles.headerRightView}>
                </View>
            </View>
            <View style={styles.titleViewNew}>
                    <Text style={styles.titleTextNew}>Orders</Text>
            </View>

          <View style={styless.ongoingView}>
            <TouchableOpacity style={styless.ongoingTouchable} onPress={this.ShowHideTextComponentView}>
              <Text style={styless.ongoingTextTop}>Ongoing Orders</Text>
            </TouchableOpacity>
          </View>

          {!this.state.status ? <View style={styless.listView}>
              <ListView
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) => <View>

                          <TouchableOpacity  activeOpacity={0.7}>
                              <View style={styless.cell}>
                                  <View style={styless.oneListingView}>
                                      <View style={styless.orderInfoView}>
                                          <Text style={styless.shopNameText}>Shop Name</Text>
                                          <Text style={styless.completeTimeText}>
                                                Order Placed: 10/11/2016 6:12 PM
                                          </Text>
                                          <Text style={styless.completeTimeText}>
                                                  Status: processing
                                          </Text>
                                      </View>
                                      <Image source={enterPic} style={styless.enterPicNew}/>
                                  </View>
                              </View>
                          </TouchableOpacity>
                      </View>}
              />
          </View> : null}

          <View style={styless.dividerView}><Text style={styless.dividerLineTop}></Text></View>
          <TouchableOpacity style={styless.ongoingTouchable}  onPress={() => this.onPressNeedReviewsOrdersBtn()}>
              <View style={styless.reviewsView}>
                  <Text style={styless.ongoingText}>Orders Need Reviews</Text>
                  <Image source={orange_dot} style={styless.dot} />
              </View>
          </TouchableOpacity>

          <View style={styless.dividerView}><Text style={styless.dividerLine}></Text></View>
          <TouchableOpacity style={styless.ongoingTouchable}  onPress={() => this.onPressCompleteOrdersBtn()}>
              <View style={styless.reviewsView}>
                  <Text style={styless.ongoingText}>Complete Orders</Text>
              </View>
          </TouchableOpacity>

          <View style={styless.dividerView}><Text style={styless.dividerLine}></Text></View>

        </View>

      );
    }

    navigateBackToHistoryOrderPage(){
        if(this.callback && (this.state.order.orderStatus!=this.state.orderStatus||this.state.ratingSucceed)){
           console.log(this.state.order);
           this.callback(this.state.order);
        }
        this.props.navigator.pop();
    }

    onPressCompleteOrdersBtn(){
      this.props.navigator.push({
          name: 'HistoryOrderPage',
          passProps: {
             eater: this.props.eater
          }
      });
    }

    onPressNeedReviewsOrdersBtn(){
      Alert.alert(
        'Orders',
        'Orders Need Reviews'
      )
    }

  }



  var styless = StyleSheet.create({

  container:{
    flex:1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF'
  },
  headerView:{
    flexDirection:'row',
    marginTop: 40,
    marginLeft: 20
  },
  headerText:{
    fontWeight: 'bold',
    fontSize: 30,
    color: '#000'
  },

  ongoingView:{

    marginLeft: 20
  },
  ongoingTouchable:{
    width: windowWidth,
    //height: 30
  },
  ongoingText:{
    fontWeight: 'bold',
    fontSize: h2,
    color: '#4a4a4a',
  //  backgroundColor: '#cc0000',
  },
  ongoingTextTop:{
    fontWeight: 'bold',
    fontSize: h2,
    color: '#4a4a4a',
    paddingBottom: 5 * windowHeightRatio,
  //  backgroundColor: '#cc0000',
  },
  listView:{
    height: 245 * windowHeightRatio,
    alignItems: 'center',
    width:windowWidth - 76 * windowWidthRatio,

    marginLeft: 56 * windowWidthRatio,
  },

  dividerView:{
    width: windowWidth,
    alignItems: 'center',
    //backgroundColor: '#ccccff',
  },
  dividerLine:{
    height: 1,
    backgroundColor : '#EAEAEA',
    width: windowWidth - 40 * windowWidthRatio,
    marginLeft: 20 * windowWidthRatio,
    marginRight: 20* windowWidthRatio,
    marginTop: 20 * windowHeightRatio,
    marginBottom:  20 * windowHeightRatio,
  },
  dividerLineTop:{
    height: 1,
    backgroundColor : '#EAEAEA',
    width: windowWidth - 40 * windowWidthRatio,
    marginLeft: 20 * windowWidthRatio,
    marginRight: 20* windowWidthRatio,
    marginTop: 15 * windowHeightRatio,
    marginBottom:  20 * windowHeightRatio,
  },

  reviewsView:{
  //  height: 80,
    marginLeft: 20* windowWidthRatio,
    alignItems : 'center',
    flexDirection: 'row'
  },
  dot:{
    height: 10 * windowWidthRatio,
    width: 10 * windowWidthRatio,
    marginTop:-15,
  },

  cell: {
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    width:windowWidth - 76 * windowWidthRatio,

    // marginRight:20 * windowWidthRatio,
  //  marginLeft:56 * windowWidthRatio,
  },
  oneListingView:{
      backgroundColor:'#FFFFFF',
      flexDirection:'row',
      flex:1,
      borderBottomWidth:0,
  },
  orderInfoView:{
      flex:1,
    //  height:windowWidth*0.333,
      flexDirection:'column',
      paddingLeft:0,
      paddingRight:0,
      paddingTop:10 * windowHeightRatio,
      paddingBottom:10 * windowHeightRatio,
  },
  completeTimeText:{
      fontSize:h4,
      color:'#979797',
      //marginTop:windowHeight*0.009,
  },
  enterPicNew:{
    top:35 * windowHeightRatio,
      width:6 * windowWidthRatio,
      height:13 * windowHeightRatio,
      right: 0,
  },
});

module.exports = OrderPage;
