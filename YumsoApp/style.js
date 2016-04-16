'use strict';

var React = require('react-native');
import Dimensions from 'Dimensions';

var {
  StyleSheet
} = React;

var windowHeight = Dimensions.get('window').height;
var windowsWidth = Dimensions.get('window').width;
console.log(windowHeight);
module.exports = StyleSheet.create({
    container:{
        backgroundColor: '#F5FCFF',
        paddingTop:40,
        padding:10,
        alignItems: 'center',
        flex:1
    },
    logo:{
        width:66,
        height:55
    },
    heading:{
        fontSize:30,
        margin:10,
        marginBottom:20
    },
    loginInput:{
      height:50,
      marginTop:10,
      padding:4,
      fontSize:18,
      borderWidth:1,
      borderColor: '#48BBEC' ,
      borderRadius: 0,
      color: '#48BBEC' 
    },
    button:{
      height: 50,
      backgroundColor:'#48BBEC'  ,
      borderColor:'#48BBEC',
      alignSelf:'stretch',
      justifyContent: 'center',
      marginTop:10
    },
    buttonText:{
      color:'#fff',
      fontSize:24,
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
        height: windowHeight*8.3/10
    },
    chefListView_chef:{
        margin:5,
        alignSelf:'stretch',
        backgroundColor:'#FFFFFF',   
    },
    chefListView_chef_Info:{
        flexDirection:'row', 
        left:windowsWidth/6/3,
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
        height:Dimensions.get('window').height/4,
        alignSelf:'stretch',
        padding:3
    },
    chefListView_Chef_profilePic: {
        height:windowsWidth/6,
        width:windowsWidth/6,
        top:-windowsWidth/6/5,
        padding:3,  
        position: 'relative',
    },
    dishListView:{
        alignSelf:'stretch',
        backgroundColor:'#81c04d',
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
        height:windowsWidth/6,
        width:windowsWidth/6,
        padding:3,  
        position: 'relative',
    },  
});