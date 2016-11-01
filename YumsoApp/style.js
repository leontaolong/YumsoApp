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
      backgroundColor:'#fff', 
      position:'absolute',
      top:0,
      left:0,
      right:0, 
      height:windowHeight,
      opacity:0.3,
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
      borderColor:'#F5F5F5',
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
    },
    footerView:{ 
        flexDirection:'row', 
        height:windowHeight*0.075, 
        backgroundColor:'#FFCC33',
        justifyContent:'center',
    },
    backButtonIcon:{
      width:windowWidth*0.106,
      height:windowWidth*0.106,
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
      width:windowWidth*4/6.0,
      justifyContent:'center',     
    },
    titleText:{
      fontSize:windowHeight/37.06,
      color:'#4A4A4A',
      fontWeight:'500',
      alignSelf:'center',
      textAlign:'center'
    },
    headerRightView:{
      flex:0.1/6.0,
      width:windowWidth/6.0,
      justifyContent:'flex-end',
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
      width:windowHeight*0.0352,
      height:windowHeight*0.0264,
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
      borderColor:'#D7D7D7',
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
    },
    networkUnavailableText:{
      fontSize:16,
      color:'#9B9B9B',
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
    passwordRequirementText:{
      fontSize:12,
      color:'#F5F5F5',
      textAlign:'justify',
      paddingTop:8,
      fontWeight:'600'
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
    dishListView:{
        alignSelf:'stretch',
        backgroundColor:'#fff',
        paddingBottom:20,
        flexDirection:'column',
        height: windowHeight*9/10
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
});