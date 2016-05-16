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
    headerBannerView:{
      flexDirection:'row',
      borderBottomWidth:1,
      borderColor:'#D7D7D7',
      height:windowHeight*0.066,
    },
    headerLeftView:{
      flex:0.1/3.0,
      width:windowWidth/3.0,
      flexDirection:'row',
      justifyContent:'flex-start',
    },
    backButtonView:{
      justifyContent:'center',
      flexDirection:'column',
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
      flex:0.1/3, 
      width:windowWidth/3.0,
      justifyContent:'center',     
    },
    titleText:{
      fontSize:18,
      color:'#4A4A4A',
      fontWeight:'500',
      alignSelf:'center',
    },
    headerRightView:{
      flex:0.1/3.0,
      width:windowWidth/3.0,
      justifyContent:'flex-end',
      flexDirection:'row',
    },
    headerRightTextButtonView:{
      justifyContent:'center',
      flexDirection:'row',
      marginRight:10,
    },
    headerRightTextButtonText:{
      fontSize:12,
      fontWeight:'bold',
      color:'#FFCC33',
      alignSelf:'center',
    },
    likeShareButtonView:{
        flexDirection:'row',
        alignSelf:'center',
        marginRight:10,
    },
    menuButtonView:{
      flex:0.1/3,
      width:windowWidth/3,
      alignItems:'flex-start',
      paddingLeft:windowWidth/27.6,
      paddingTop:windowHeight/73.6,
    },
    menuIcon:{
      width:windowHeight/29.4,
      height:windowHeight/29.4,
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


    logo:{
      width:66,
      height:55,
    },
    heading:{
      fontSize:30,
      margin:10,
      marginBottom:20
    },
    loginInput:{
      height:windowHeight/14.72,
      fontSize:windowHeight/36.8,
      color: '#A9A9A9',
    },
    loginInputView:{
      borderBottomWidth:0.8,
      borderColor: '#D7D7D7',
      justifyContent: 'center',
      paddingVertical:5,
      paddingHorizontal:windowHeight/49.0,
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
    loader:{
        marginTop:20
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
        paddingTop:30,
        paddingBottom:10,
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