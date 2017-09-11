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
var enterPic = require('./icons/enter.png');
var orange_dot = require('./icons/orange_dot.png');
var meOff = require('./icons/me_off.png');
var meOn = require('./icons/me_on.png');

var ordersOff = require('./icons/orders_off.png');
var ordersOn = require('./icons/orders_on.png');

var shopsOff = require('./icons/shops_off.png');
var shopsOn = require('./icons/shops_on.png');

import Dimensions from 'Dimensions';
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

var newMessage = '';

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

  constructor(props) {
    super(props);
    var routeStack = this.props.navigator.state.routeStack;
    let eater = routeStack[routeStack.length-1].passProps.eater;
    let principal = routeStack[routeStack.length-1].passProps.principal;
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      eater: eater,
      principal:principal,
      dataSource: ds.cloneWithRows(['row 1', 'row 2', 'row 2']),
    };

       newMessage = <Image source={orange_dot} style={styleOrderPage.dot} />
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

          <View style={styleOrderPage.ongoingView}>
            <TouchableOpacity style={styleOrderPage.ongoingTouchable} onPress={this.ShowHideTextComponentView}>
              <Text style={styleOrderPage.ongoingTextTop}>Ongoing Orders</Text>
            </TouchableOpacity>
          </View>

          {!this.state.status ? <View style={styleOrderPage.listView}>
              <ListView
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) => <View>

                          <TouchableOpacity  activeOpacity={0.7}>
                              <View style={styleOrderPage.cell}>
                                  <View style={styleOrderPage.oneListingView}>
                                      <View style={styleOrderPage.orderInfoView}>
                                          <Text style={styleOrderPage.shopNameText}>Shop Name</Text>
                                          <Text style={styleOrderPage.completeTimeText}>
                                                Order Placed: 10/11/2016 6:12 PM
                                          </Text>
                                          <Text style={styleOrderPage.completeTimeText}>
                                                  Status: processing
                                          </Text>
                                      </View>
                                      <Image source={enterPic} style={styleOrderPage.enterPicNew}/>
                                  </View>
                              </View>
                          </TouchableOpacity>
                      </View>}
              />
          </View> : null}

          <View style={styleOrderPage.dividerView}><Text style={styleOrderPage.dividerLineTop}></Text></View>
          <TouchableOpacity style={styleOrderPage.ongoingTouchable}  onPress={() => this.onPressNeedReviewsOrdersBtn()}>
              <View style={styleOrderPage.reviewsView}>
                  <Text style={styleOrderPage.ongoingText}>Orders Need Review</Text>
                  {(1 == 1)?newMessage:null}
              </View>
          </TouchableOpacity>

          <View style={styleOrderPage.dividerView}><Text style={styleOrderPage.dividerLine}></Text></View>
          <TouchableOpacity style={styleOrderPage.ongoingTouchable}  onPress={() => this.onPressCompleteOrdersBtn()}>
              <View style={styleOrderPage.reviewsView}>
                  <Text style={styleOrderPage.ongoingText}>Completed Orders</Text>
                  {(1 == 0)?newMessage:null}
              </View>
          </TouchableOpacity>

          <View style={styleOrderPage.dividerView}><Text style={styleOrderPage.dividerLine}></Text></View>

          <View style={styleOrderPage.placeHolderView}></View>
          <View style = {styles.tabBarNew}>
            <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{width: windowWidth/3, height: 44}}>
                      <TouchableHighlight underlayColor={'#F5F5F5'}  onPress={() => this.onPressShopsTabBtn()}>
                        <View style={styles.tabBarButtonNew}>
                          <Image source={shopsOff}  style={styles.tabBarButtonImageNew}/>
                          <View>
                            <Text style={styles.tabBarButtonTextOffNew}>Shops</Text>
                          </View>
                        </View>
                      </TouchableHighlight>
                  </View>
                  <View style={{width: windowWidth/3, height: 44}}>
                      <TouchableHighlight underlayColor={'#F5F5F5'}>
                        <View style={styles.tabBarButtonNew}>
                          <Image source={ordersOn}  style={styles.tabBarButtonImageNew}/>
                          <View>
                            <Text style={styles.tabBarButtonTextOnNew}>Orders</Text>
                          </View>
                        </View>
                      </TouchableHighlight>
                  </View>
                  <View style={{width: windowWidth/3, height: 44}}>
                      <TouchableHighlight underlayColor={'#F5F5F5'}  onPress={() => this.onPressMeTabBtn()}>
                        <View style={styles.tabBarButtonNew}>
                          <Image source={meOff}  style={styles.tabBarButtonImageNew}/>
                          <View>
                            <Text style={styles.tabBarButtonTextOffNew}>Me</Text>
                          </View>
                        </View>
                      </TouchableHighlight>
                  </View>
            </View>
        </View>

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
             eater: this.props.eater,
             orderType:'orderCompleted'
          }
      });
    }

    onPressNeedReviewsOrdersBtn(){
      this.props.navigator.push({
          name: 'HistoryOrderPage',
          passProps: {
             eater: this.props.eater,
             orderType:'orderNeedReview'
          }
      });
    }

    onPressShopsTabBtn(){
        this.props.navigator.push({
          name: 'ChefListPage',
        });
    }

    onPressMeTabBtn(){
      this.props.navigator.push({
          name: 'EaterPage',
          passProps:{
              eater:this.state.eater,
              principal:this.state.principal,
              callback: function(eater){
                  this.props.caller.setState({eater:eater});
              }.bind(this)
          }
      });
    }
  }



  var styleOrderPage = StyleSheet.create({

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
  placeHolderView:{
    flex:1,
  }
});

module.exports = OrderPage;
