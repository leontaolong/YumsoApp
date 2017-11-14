var ChefListPage = require('./chefListPage');
var ShoppingCartPage = require('./shoppingCartPage');
var PaymentPage = require('./paymentPage');
var ShopPage = require('./shopPage');
var ChefPage = require('./chefPage');
var ChefIntroPage = require('./chefIntroPage');
var HistoryOrderPage = require('./historyOrderPage');
var EaterPage = require('./eaterPage');
var AddressBookPage = require('./addressBookPage');
var ChefCommentsPage = require('./chefCommentsPage');
var OrderConfirmation = require('./orderConfirmation');
var PaymentOptionPage = require('./paymentOptionPage');
var DishPage = require('./dishPage');
var MapPage = require('./mapPage');
var AuthService = require('./authService');
var LoginPage = require('./loginPage');
var SignUpPage = require('./signupPage');
var OrderDetailPage = require('./orderDetailPage');
var AboutPage = require('./aboutPage');
var ContactUsPage = require('./contactUsPage');
var TermsPage = require('./termsPage');
var ChefIntroPage = require('./chefIntroPage');
var styles = require('./style');
var VerificationPage = require('./verificationPage');
var InvitePage = require('./invitePage');
var OrderPage = require('./orderPage');
var WelcomePage = require('./welcomePage');
var CouponWalletPage = require('./couponWalletPage');
var OnBoardPage = require('./onBoardPage.js');

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  Navigator,
  PushNotificationIOS,
  AppStateIOS,
  Alert
} from 'react-native';

console.disableYellowBox = true;
let sceneConfig = Navigator.SceneConfigs.HorizontalSwipeJump;
sceneConfig.gestures.pop = {};
sceneConfig.gestures = null;

class YumsoApp extends Component {
    constructor(props){
        super(props);
        this.state={eater:undefined}
    }
    registerNotification() {
        return new Promise((resolve,reject) => {
            PushNotificationIOS.addEventListener('register', function(token){
               if(token){
                  console.log('You are registered and the device token is: ',token);
                  resolve(token);
               }else{
                  reject(new Error('Failed registering notification service'))
               }
            })
        });
    }

    // appOpenedByNotificationTap(notification) {
    //         // This is your handler. The tapped notification gets passed in here.
    //         // Do whatever you like with it.
    //         console.log("By Tap! : " + notification);
    // }

    async componentWillMount(){
        this.registerNotification().then(function (token) {
            return AuthService.updateCacheDeviceToken(token);
        });
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
        // PushNotificationIOS.getInitialNotification();
        // .then(function (notification) {
        //        if (notification != null) {
        //            this.appOpenedByNotificationTap(notification);
        //        }
        // });
        //let backgroundNotification;
        PushNotificationIOS.addEventListener('notification', function(notification){
           console.log('You have received a new notification!', notification);
           if(AppStateIOS.currentState !== 'active'){
              PushNotificationIOS.setApplicationIconBadgeNumber(notification.getBadgeCount());
           }
           Alert.alert( 'Notification', notification.getMessage(),[ { text: 'OK'}]);
        });

        // PushNotificationIOS.addEventListener('notification', function(notification){
        //    if (React.AppStateIOS.currentState === 'background') {
        //         backgroundNotification = notification;
        //    }

        // PushNotificationIOS.getApplicationIconBadgeNumber(function(count){
        //        if('Your order is out for delivery'==notification.getMessage()){
        //           console.log('Out-for-delivery count: '+count);
        //           console.log('getBadgeCount: '+notification.getBadgeCount())
        //           PushNotificationIOS.setApplicationIconBadgeNumber(count+notification.getBadgeCount());
        //        }
        //    });
        // });

        // PushNotificationIOS.addEventListener('notification', function(notification){
        //    PushNotificationIOS.getApplicationIconBadgeNumber(function(count){
        //        if('Your order is delivered'==notification.getMessage()){
        //            console.log('delivered count: '+count);
        //            console.log('getBadgeCount: '+notification.getBadgeCount())
        //            PushNotificationIOS.setApplicationIconBadgeNumber(count+notification.getBadgeCount());
        //        }
        //    });
        // });

        AppStateIOS.addEventListener('change', function (new_state) {
            if (new_state === 'active') {
                PushNotificationIOS.setApplicationIconBadgeNumber(0);
            }
        });
        let eaterStr = await AuthService.getEater();
        this.setState({eater:eaterStr,doneGettingEater:true});
    }

    getInitialState(){
        this.setState({doneGettingEater:false});
    }

    render() {
        if(!this.state.doneGettingEater){
           //return <Image style={styles.pageBackgroundImage} source={backgroundImage}></Image>
           return <View style={{flex:1,backgroundColor:"#FFFFFF"}}></View>
        }else{
           if(!this.state.eater){
               return (<Navigator initialRoute={{ name: 'WelcomePage' }} renderScene={this.renderScene} configureScene={(route, routeStack) => sceneConfig}/>);
           }else{
               return (<Navigator initialRoute={{ name: 'ChefListPage' }} renderScene={this.renderScene} configureScene={(route, routeStack) => sceneConfig}/>);
           }
        }
    }

    renderScene(route, navigator) {
        if(route.name === 'ChefListPage') {
            return <ChefListPage navigator={navigator} />
        }else if(route.name==='ShoppingCartPage'){
            return <ShoppingCartPage navigator={navigator}/>
        }else if (route.name==='PaymentPage'){
            return <PaymentPage navigator={navigator}/>
        }else if(route.name==='ShopPage'){
            return <ShopPage navigator={navigator}/>
        }else if (route.name==='HistoryOrderPage'){
            return <HistoryOrderPage navigator={navigator}/>
        }else if (route.name==='EaterPage'){
            return <EaterPage navigator={navigator}/>
        }else if (route.name==='AddressBookPage'){
            return <AddressBookPage navigator={navigator}/>
        }else if (route.name==='ChefCommentsPage'){
            return <ChefCommentsPage navigator={navigator}/>
        }else if (route.name==='OrderConfirmation'){
            return <OrderConfirmation navigator={navigator}/>
        }else if (route.name==='LoginPage'){
            return <LoginPage navigator={navigator}/>
        }else if (route.name==='SignUpPage'){
            return <SignUpPage navigator={navigator}/>
        }else if (route.name==='DishPage'){
            return <DishPage navigator={navigator}/>
        }else if (route.name==='MapPage'){
            return <MapPage navigator={navigator}/>
        }else if (route.name==='PaymentOptionPage'){
            return <PaymentOptionPage navigator={navigator}/>
        }else if (route.name==='OrderDetailPage'){
            return <OrderDetailPage navigator={navigator}/>
        }else if (route.name==='ChefPage'){
            return <ChefPage navigator={navigator}/>
        }else if (route.name==='ChefIntroPage'){
            return <ChefIntroPage navigator={navigator}/>
        }else if (route.name==='ContactUsPage'){
            return <ContactUsPage navigator={navigator}/>
        }else if (route.name==='AboutPage'){
            return <AboutPage navigator={navigator}/>
        }else if (route.name==='TermsPage'){
            return <TermsPage navigator={navigator}/>
        }else if (route.name==='ChefIntroPage'){
            return <ChefIntroPage navigator={navigator}/>
        }else if (route.name==='VerificationPage'){
            return <VerificationPage navigator={navigator}/>
        }else if (route.name==='InvitePage') {
            return <InvitePage navigator={navigator}/>
        }else if (route.name==='OrderPage'){
            return <OrderPage navigator={navigator}/>
        }else if (route.name==='WelcomePage'){
            return <WelcomePage navigator={navigator}/>
        }else if(route.name==='CouponWalletPage'){
            return <CouponWalletPage navigator={navigator}/>
        }else if(route.name ==='OnBoardPage'){
            return <OnBoardPage navigator={navigator} />
        }
    }
}

AppRegistry.registerComponent('YumsoApp', () => YumsoApp);
