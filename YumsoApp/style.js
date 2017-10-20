'use strict';

var React = require('react-native');
import Dimensions from 'Dimensions';

var {
  StyleSheet
} = React;

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
module.exports = StyleSheet.create({
    container:{
      paddingTop:15,
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
      // borderBottomWidth:1,
      // borderColor:'#EAEAEA', //07/15/2017: remove banner border for V2 UI update
      height:windowHeight*0.066,
      backgroundColor:'#FFFFFF',
    },
    headerLeftView:{
      flex:0.1/6.0,
      width:windowWidth/6.0,
      flexDirection:'row',
      justifyContent:'flex-start',
    },
    backButtonView:{
      justifyContent:'center',
      flexDirection:'column',
      paddingLeft:windowWidth/20.7,
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
       fontSize:windowHeight/37.056,
       fontWeight:'bold',
       alignSelf: 'center',
    },
    backButtonIcon:{
      width:windowWidth*0.050,
      height:windowWidth*0.050,
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
    upperLeftBtnView:{
      flex:0.4/6, 
      flexDirection:'row',
      width:windowWidth*4/6.0,
      alignItems:'center',
    },
    titleView:{
      flex:0.4/6, 
      flexDirection:'row',
      width:windowWidth*4/6.0,
      justifyContent:'center',  
      alignItems:'center' 
    },
    titleText:{
      fontSize:windowHeight/37.06,
      color:'#4A4A4A',
      fontWeight:'200',
      alignSelf:'center',
      textAlign:'center'
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
      marginTop:11*windowHeight/667,
      marginRight:5*windowHeight/667,
      width:18*windowHeight/667,
      height:18*windowHeight/667,
    },
    likeIcon: {
      marginTop:11*windowHeight/667,
      marginRight:5*windowHeight/667,
      width:22*windowHeight/667,
      height:17.5*windowHeight/667,    
    },
    ballonIcon:{
      marginVertical:2*windowHeight/667,
      marginRight:8*windowHeight/667,
      marginLeft:0,
      width:18*windowHeight/667,
      height:22*windowHeight/667,
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
      fontSize:18,
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
      alignSelf:'center'
    },
    loginInput:{
      width:windowWidth*0.8,
      height:windowHeight*0.08,
      fontSize:20,
      fontWeight:'bold',
      color: '#fff',
      borderBottomWidth:1,
      borderColor:'#fff',
      paddingVertical:5,
      textAlign:'left',
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
      fontSize:16,
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
    pageTitle: {
        fontSize:28*windowHeight/677,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginVertical:windowHeight*0.005,
    },
    pageTitleView: {
        marginBottom:windowHeight*0.0540,
    },
    pageSubTitle: {
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        color:'#4A4A4A',
        marginVertical:windowHeight*0.0200,
    },
    scrollViewContainer: {
        paddingHorizontal:windowWidth/20.7,
    },
    pageText: {
        fontSize:15*windowHeight/677,
        fontWeight:'500',
        color:'#9B9B9B',
        textAlign:'justify', 
    },
    greyBox: {
        flex:1,
        flexDirection:'column',
        backgroundColor:'#F5F5F5',
        paddingVertical:windowHeight*0.025,
    },
    greyBoxText: {
        fontSize:15*windowHeight/677,
        color:'#9B9B9B',
        textAlign:'center', 
    },
    pageWrapper:{
      marginTop:15,
      flex:1,
      flexDirection:'column',
      backgroundColor:"#FFFFFF",
    },
    promoBannerView:{
        flexDirection:'row',   
        alignItems:'center',     
        justifyContent: 'center',
        height:100, 
        backgroundColor:'#F5F5F5'
    },    
    iconCircle:{
      //TODO: make the shadow, it's just a circle for now
      marginLeft:windowWidth*0.015,
      height:windowWidth*0.1,
      width:windowWidth*0.1,
      borderWidth:windowWidth*0.001,
      borderRadius: windowWidth*0.1 / 2, 
      alignItems:"center",
      justifyContent:"center",
      borderColor:"#bbb",
    },
    likeIconCircled:{
      height:windowHeight*0.02,
      width:windowWidth*0.04,
    },
    shareIconCircled: {
      height:windowHeight*0.025,
      width:windowWidth*0.025, 
    },
    listViewBorder:{
      marginHorizontal:windowWidth/20.7,
      height:windowHeight*0.0005,
      backgroundColor:'#fff',
      borderBottomWidth:1,
      borderBottomColor:'#eee',
  },
});