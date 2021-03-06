'use strict';

var React = require('react-native');
import Dimensions from 'Dimensions';

var {
  StyleSheet
} = React;


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

module.exports = StyleSheet.create({
    container:{
      paddingTop:15,
      flex:1,
      flexDirection:'column',
      backgroundColor:'#fff',
    },
    containerNew:{
      paddingTop:0,
      flex:1,
      flexDirection:'column',
      backgroundColor:'#fff',
    },

    loaderView:{
      position:'absolute',
      top:0,
      left:0,
      right:0,
      height:windowHeight,
    },
    listLoadingView:{
      backgroundColor:'transparent',
      position:'absolute',
      top:0,
      left:0,
      right:0,
      height:windowHeight,
    },
    loader:{
      alignSelf:'center',
      marginTop:windowHeight*0.3,
    },
    greyContainer:{
      marginTop:15,
      flex:1,
      flexDirection:'column',
      backgroundColor:'#F5F5F5',
    },
    headerBannerView:{
      flexDirection:'row',
      borderBottomWidth:1,
      borderColor:'#EAEAEA',
      height:windowHeight*0.066,
      backgroundColor:'#FFFFFF',
    },
    headerLeftView:{
      flex:0.1/6.0,
      width:10,
      flexDirection:'row',
      justifyContent:'flex-start',
    },
    backButtonView:{
      justifyContent:'center',
      flexDirection:'column',
    },
    footerView:{
        flexDirection:'row',
        height:windowHeight*0.075,
        backgroundColor:'#FFCC33',
        justifyContent:'center',
    },
    footerButtonYellowView:{
       flexDirection:'row',
       justifyContent: 'center',
       height:windowHeight*0.075,
       width:windowWidth,
    },
    footerButtonText:{
       color:'#fff',
       fontSize: windowHeight/35.5,
       fontWeight:'bold',
       alignSelf: 'center',
    },
    backButtonIcon:{
      width:windowWidth*0.106,
      height:windowWidth*0.106,
    },
    refreshButtonIcon:{
      width:17,
      height:17,
      marginRight:15,
    },
    likeButtonIcon:{
      width:windowWidth/12.5,
      height:windowWidth/12.5,
    },
    shareButtonIcon:{
      width:windowWidth/12.5,
      height:windowWidth/12.5,
    },
    titleView:{
      flex:0.4/6,
      flexDirection:'row',
      width:windowWidth*4/6.0,
      justifyContent:'center',
      alignItems:'center'
    },
    titleViewNew:{
      width:windowWidth,
      height: 78 * windowHeightRatio,
      marginTop: 0,
      marginLeft: 20 * windowWidthRatio,

//backgroundColor: "#0000aa",
    },
    titleText:{
      fontSize:windowHeight/37.06,
      color:'#4A4A4A',
      fontWeight:'500',
      alignSelf:'center',
      textAlign:'center'
    },
    titleTextNew:{
      fontSize: h1,
      height:45 * windowHeightRatio,
      color:'#4A4A4A',
      fontWeight:'500',
      fontWeight: "bold",

    //  backgroundColor: "#cccccc",
      width: windowWidth - 40 * windowWidthRatio,
      marginTop: 0,


      //alignSelf:'center',
      //textAlign:'center'
    },
    headerRightView:{
      flex:0.1/6.0,
      width:windowWidth/6.0,
      justifyContent:'flex-end',
      alignItems:'center',
      flexDirection:'row',
    },
    headerRightTextButtonView:{
      justifyContent:'center',
      flexDirection:'row',
      marginRight:10,
    },
    headerRightTextButtonText:{
      fontSize:windowHeight/46.0,
      fontWeight:'600',
      color:'#FFCC33',
      alignSelf:'center',
    },
    likeShareButtonView:{
        flexDirection:'row',
        alignSelf:'center',
        marginRight:10,
    },
    menuButtonView:{
      justifyContent:'center',
      flexDirection:'column',
      marginLeft:10,
    },
    menuIcon:{
      width:windowHeight*0.0286,
      height:windowHeight*0.0235,
    },
    filterIcon:{
      width:20*windowHeight/667,
      height:20*windowHeight/667,
    },
    ballonIcon:{
      marginTop:0.8*windowHeight/667,
      width:25*windowHeight/667,
      height:25*windowHeight/667,
    },
    searchIcon:{
      width:windowHeight/24.5,
      height:windowHeight/24.5,
    },
    locationView:{
      flex:0.1/3,
      flexDirection:'row',
      width:windowWidth/3,
      justifyContent:'center',
      paddingTop:windowHeight/52.6,
    },
    locationIcon:{
      width:windowHeight/49,
      height:windowHeight/49,
    },
    locationText:{
      fontSize:18  * windowHeightRatio,
      color:'#4A4A4A',
      fontWeight:'500',
      alignSelf:'center',
    },
    searchButtonView:{
      flex:0.1/3,
      width:windowWidth/3,
      alignItems:'flex-end',
      paddingRight:windowWidth/41.4,
      paddingTop:windowHeight/105.14,
    },
    pageBackgroundImage:{
      width:windowWidth,
      height:windowHeight,
      flex:1,
      opacity:0.8,
    },
    loginInputView:{
      width:windowWidth*0.8,
      flexDirection:'row',
      justifyContent:'center',
      borderBottomWidth:2,
      borderColor:'#EAEAEA',
      alignSelf:'center',
    },
    loginInputViewNew:{
      width:windowWidth-40 * windowWidthRatio,
      flexDirection:'row',
      justifyContent:'center',
      borderBottomWidth:1,
      borderBottomColor: "#EAEAEA",
      borderColor:'#EAEAEA',
      alignSelf:'center',
      marginLeft: 0,
      height: 34 * windowHeightRatio,
    //  backgroundColor: "#00cd00",
    },
    loginInput:{
      width:windowWidth*0.8,
      height:windowHeight*0.08,
      fontSize:h3,
      fontWeight:'bold',
      color: '#4A4A4A',
      borderBottomWidth:1,
      borderColor:'#fff',
      paddingVertical:5,
      textAlign:'left',
    },
    loginInputNew:{
      width:windowWidth-40 * windowWidthRatio,
      height:34  * windowHeightRatio,
      fontSize:h2,
      fontWeight:'bold',
      color: '#4A4A4A',
      borderBottomWidth:1,
      borderColor:'#fff',
      paddingVertical:0,
      textAlign:'left',
      marginLeft: 0,
    },
    dot:{
      backgroundColor: 'rgba(0,0,0,.2)',
      width: 5,
      height: 5,
      borderRadius: 4,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 3,
      marginBottom: 3,
    },
    activeDot:{
      backgroundColor: '#FFF',
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 3,
      marginBottom: 3,
    },
    listViewEmptyText:{
      fontSize:h4,
      color:'#9B9B9B',
      justifyContent:'center',
      textAlign:'center',
      marginTop:windowHeight*0.28,
      marginHorizontal:15,
    },
    networkUnavailableView:{
      flex:1,
      flexDirection:'column',
      justifyContent:'center',
      backgroundColor:'#F5F5F5'
    },
    networkUnavailableText:{
      fontSize:16,
      color:'#979797',
      justifyContent:'center',
      textAlign:'center',
      marginBottom:20,
    },
    clickToReloadClickable:{
      fontSize:18,
      color:'#FFCC33',
      justifyContent:'center',
      textAlign:'center',
    },
    infoBannerView:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent: 'center',
        height:30,
        backgroundColor:'#F5F5F5'
    },
    infoBannerText:{
        fontSize:12,
        fontWeight:'400',
        color:'#4A4A4A',
        alignSelf:'center',
    },
    infoBannerLinkView:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        height:30,
        width:80,
    },
    infoBannerLink:{
        fontSize:12,
        fontWeight:'400',
        color:'#FFCC33',
        alignSelf:'center',
    },
    greyBorderView:{
        height:windowHeight/73.6,
        backgroundColor:'#F5F5F5',
        borderTopWidth:1.5,
        borderTopColor:'#EAEAEA',
        borderBottomWidth:1.5,
        borderBottomColor:'#F5F5F5',
    },
    greyBorderViewThin:{
        height:windowHeight/100,
        backgroundColor:'#F5F5F5',
        borderTopWidth:1,
        borderTopColor:'#EAEAEA',
        borderBottomWidth:1,
        borderBottomColor:'#F5F5F5',
    },
    refreshableListView:{
      backgroundColor:'#F5F5F5',
      fontSize:14,
      color:'#4A4A4A',
    },
    dishListView:{
        alignSelf:'stretch',
        backgroundColor:'#F5F5F5',
        paddingBottom:20,
        flexDirection:'column',
        height: windowHeight*9/10
    },
    dishListViewWhite:{
        alignSelf:'stretch',
        backgroundColor:'#FFFFFF',
        paddingBottom:20,
        flexDirection:'column',
        height: windowHeight*9/10
    },

    logo:{
      width:66,
      height:55,
    },
    heading:{
      fontSize:30,
      margin:10,
      marginBottom:20
    },
    button:{
      height: 50,
      backgroundColor:'#48BBEC'  ,
      borderColor:'#48BBEC',
      justifyContent: 'center',
    },
    buttonText:{
      color:'#fff',
      fontSize:20,
      alignSelf:'center'
    },

    error:{
        color:'red',
        paddingTop: 10
    },
    success:{
        color:'green',
        paddingTop: 10
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    thumbnail: {
        width: 53,
        height: 81,
    },
    toolbar:{
        alignSelf:'stretch',
        backgroundColor:'#81c04d',
        paddingTop:30,
        paddingBottom:10,
        flexDirection:'row',
        //justifyContent:'space-around'
    },
    toolbarTitle:{
        flex:1,
    },
    toolbarImage:{
        alignSelf:'center'
    },
    chefListView:{
        alignSelf:'stretch',
        backgroundColor:'#81c04d',
        paddingTop:30,
        paddingBottom:10,
        flexDirection:'column',
        height: windowHeight*8.7/10
    },
    chefListView_chef:{
        margin:5,
        alignSelf:'stretch',
        backgroundColor:'#FFFFFF',
    },
    chefListView_chef_Info:{
        flexDirection:'row',
        left:windowWidth/6/3,
        margin:3,
        alignSelf:'stretch',
    },
    chefListView_chef_col1:{
        padding:3,
    },
    chefListView_chef_col2:{
        padding:3,
    },
    chefListView_chef_col3:{
        padding:3,
    },
    chefListView_Chef_shopPic:{
        height:Dimensions.get('window').height/3,
        alignSelf:'stretch',
        padding:3
    },
    chefListView_Chef_profilePic: {
        height:windowWidth/6,
        width:windowWidth/6,
        top:-windowWidth/6/4,
        padding:3,
        position: 'relative',
    },

    dishListView_dish:{
        margin:5,
        alignSelf:'stretch',
        backgroundColor:'#FFFFFF',
        flexDirection:'row',
        flex:1
    },
    dishListView_dish_pic:{
        height:windowWidth/6,
        width:windowWidth/6,
        padding:3,
        position: 'relative',
    },
    lineNew: {
      backgroundColor: "#EAEAEA",
      height: 1,
      width: windowWidth - 40 * windowWidthRatio,
    },

//**** v
    backButtonViewNew:{
      paddingTop: 15,
      paddingLeft: 15  * windowWidthRatio,
      justifyContent:'center',
      flexDirection:'column',
    },

    backButtonIconNew: {
      width: windowWidth * 0.05 * 5 / 9,
      height: windowWidth * 0.05,
    },

    titleViewsNew:{
      flex:0.4/6,
      flexDirection:'row',
      paddingLeft: 20  * windowWidthRatio,
      paddingTop: 15 * windowHeightRatio,
    },

    containersNew:{
      paddingTop:20,
      flexDirection:'column',
      backgroundColor:'#fff',
      marginLeft:0,
      marginRight: 0,
      width: windowWidth - 40 * windowWidthRatio,
    },
    //***** ^
    scrollViewAddressNew:{
      alignItems:'center',
      marginTop: 8,
      paddingTop: 62 * windowHeightRatio,
      marginLeft: 20 * windowWidthRatio,
      width: windowWidth - 40 * windowWidthRatio,
    //  backgroundColor:'#F5F5F5'
    },
    headerBannerViewNew: {
      flexDirection:'row',
      borderBottomWidth:0,
      borderColor:'#EAEAEA',
    //  backgroundColor:'#000',
      height: 42* windowHeightRatio,
      marginTop : 20,
    },

    backButtonViewsNew:{
    //  paddingTop: 15,
      paddingLeft: 20* windowWidthRatio,
      justifyContent:'center',
      flexDirection:'column',
    },

    backButtonIconsNew:{
      width: windowWidth * 0.05 * 5 / 9,
      height: windowWidth * 0.05,
    },

    textFieldTitle: {
      fontSize: b2,
      color: '#979797',
      marginLeft: 0,
      textAlign: "left",
      width: windowWidth-40 * windowWidthRatio,
      marginTop: 12 * windowHeightRatio,
    },

    scrollViewSignUpNew:{
    //  alignItems:'center',
    //  backgroundColor: "#cc0000",
      marginTop: 0,
      paddingTop: 64* windowWidthRatio,
      marginLeft: 20* windowWidthRatio,
      width: windowWidth - 40* windowWidthRatio,
      flexDirection:'column',
    },

    tabBar: {
      height: 55* windowWidthRatio,
      //backgroundColor : "#000",
      width: windowWidth,
      shadowOffset:{  width: 0* windowWidthRatio,  height: -2* windowWidthRatio,  },
      shadowColor: 'black',
      shadowOpacity: 0.3,
    },
    tabBarButton: {
      flexDirection:'column',
      flex: 1,
      height: 44* windowWidthRatio,
      width:windowWidth/3,
      alignItems: 'center',

    },
    tabBarButtonImage: {
      height: 22 * windowHeightRatio,
      width:20 * windowWidthRatio,
      marginTop: 10 * windowHeightRatio,
    //  marginLeft: ((windowWidth/3)/2)- (22 * windowWidthRatio)/2,
    },
    tabBarButtonTextOff: {
        fontSize: h5,
        color: "#979797",
    },
    tabBarButtonTextOn: {
        fontSize: h5,
        color: "#FFCC33",
    },

});
