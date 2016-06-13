var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var backIcon = require('./icons/icon-back.png')
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  Picker
} from 'react-native';

class ChefCommentsPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        var chefId = routeStack[routeStack.length-1].passProps.chefId;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            showCommentBox:false,
            chefId: chefId
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchComments(); 
    }
    
    fetchComments() {
        const start = 'start=' + new Date().setDate(new Date().getDate() - 7);
        const end = 'end=9999999999999999';
        return this.client.getWithoutAuth(config.chefCommentsEndpoint + this.state.chefId + '?' + start + '&' + end)
            .then((res) => {
                if (res.statusCode != 200) {
                    throw new Error('Fail getting past comments');
                }
                let comments = res.data.comments;
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(comments), showProgress: false });
            });
    }

    renderRow(comment){
        let imageSrc =require('./icons/dishImageUnavailable.png') ;
        if(comment.eaterProfilePic){
            imageSrc={uri:comment.eaterProfilePic};   
        }
               
        return (
            <View style={styleChefCommentsPage.oneListingView}>
                <View style={styleChefCommentsPage.eaterPhotoView}>
                   <Image source={imageSrc} style={styleChefCommentsPage.eaterPhoto}/>
                </View>
                <View style={styleChefCommentsPage.eaterChefCommetView}>
                   <View style={styleChefCommentsPage.eaterNameRatingView}>
                      <View style={styleChefCommentsPage.eaterNameView}>
                          <Text style={styleChefCommentsPage.eaterNameText}>{comment.eaterAlias}</Text>
                      </View>
                      <View style={styleChefCommentsPage.orderRatingView}>
                          {rating.renderRating(comment.starRating)}
                      </View>
                   </View>
                   
                   <View style={styleChefCommentsPage.eaterCommentView}>
                        <Text style={styleChefCommentsPage.commentText}>{comment.eaterComment && comment.eaterComment.trim()? comment.eaterComment.trim():'No Comment'}</Text>
                        <View style={styleChefCommentsPage.commentTimeView}>
                            <Text style={styleChefCommentsPage.commentTimeText}>{comment.eaterCommentTime==undefined? '':dateRender.renderDate1(comment.eaterCommentTime)}</Text>
                        </View>
                   </View>
                   {this.displayChefComment(comment)}                         
                </View>
                                
            </View>
        );
    }
    
    displayChefComment(comment){
         if(comment.chefComment){
            var chefCommentSection=(<View style={styleChefCommentsPage.chefCommentView}>
                                      <View style={styleChefCommentsPage.CHEFView}>
                                         <Text style={styleChefCommentsPage.CHEFText}>CHEF</Text>
                                      </View>
                                      <Text style={styleChefCommentsPage.commentText}>{comment.chefComment}</Text>                                  
                                      <View style={styleChefCommentsPage.commentTimeView}>
                                         <Text style={styleChefCommentsPage.commentTimeText}>{comment.eaterCommentTime==undefined? '':dateRender.renderDate1(comment.chefCommentTime)}</Text>
                                      </View>
                                    </View>);
           return chefCommentSection;
        }
        return[];
   }
    
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                   <View style={styles.headerLeftView}>
                   <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={() => this.navigateBackToChefPage()}>
                     <Image source={backIcon} style={styles.backButtonIcon}/>
                   </TouchableHighlight>
                   </View>    
                   <View style={styles.titleView}>
                     <Text style={styles.titleText}>Reviews</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) }/>
               {loadingSpinnerView}                  
            </View>
        );
    }

    navigateBackToChefPage() {
        this.props.navigator.pop();
    }
}

var styleChefCommentsPage = StyleSheet.create({
    headerBannerView:{
        flex:0.1,
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#D7D7D7',
    },
    backButtonView:{
        flex:0.1/3,
        width:windowWidth/3,
        paddingTop:6,
    },
    backButtonIcon:{
        width:30,
        height:30,
    },
    historyOrderTitleView:{
        flex:0.1/3, 
        width:windowWidth/3,
        alignItems:'center',     
    },
    historyOrderTitleText:{
        marginTop:12,
    },
    commentListView:{
        alignSelf:'stretch',
        flexDirection:'column',
        height: windowHeight*9/10
    },
    oneListingView:{
       flex:1,
       flexDirection:'row',
       paddingHorizontal:10,
       paddingVertical:20,
       borderBottomWidth:1,
       borderColor: '#f5f5f5',
    },
    eaterChefCommetView:{
        flex:1,
        flexDirection:'column',
        marginLeft:10,
    },
    shopNameTimePriceView:{
        flex:1,
        flexDirection:'row',
        marginBottom:7,
    },
    eaterNameRatingView:{
        flex:1,
        flexDirection:'row',
    },
    eaterNameView:{
        flex:0.75,
        flexDirection:'row',
    },
    eaterNameText:{
        fontSize:15,
        fontWeight:'600',
    },
    orderRatingView:{
        flex:0.25,
        flexDirection:'row',
        marginBottom:10,
    },
    eaterCommentView:{
        flex:1,
        paddingRight:10,
        paddingVertical:6,
        borderRadius: 6, 
        borderWidth: 0, 
        backgroundColor: '#f5f5f5',
        overflow: 'hidden', 
        marginBottom:10,
    },
    eaterPhotoView:{
        borderRadius: 8, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    eaterPhoto:{
        width:windowHeight/13.8,
        height:windowHeight/13.8,
    },
    CHEFView:{
        backgroundColor:'#FF4500',
        width:55,
        paddingLeft:12,
        marginVertical:5,
    },
    CHEFText:{
        fontSize:13,
        color:'#fff',
    },
    chefCommentView:{
        flex:1,
        flexDirection:'column',
        backgroundColor: '#DCDCDC',
        paddingRight:12,
        paddingVertical:6,
        borderRadius: 6, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    commentText:{
        fontSize:12,
        color:'#696969',
        marginBottom:5,
        marginLeft:12,
    },
    commentTimeView:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    commentTimeText:{
        fontSize:12,
        color:'#696969',
    },
    eaterNoCommentView:{
        flex:1,
        flexDirection:'row',
        paddingHorizontal:10,
        paddingVertical:6,
        borderRadius: 6, 
        borderWidth: 0, 
        backgroundColor: '#f5f5f5',
        overflow: 'hidden', 
    },
    addCommentTextClickable:{
        color:'#FFCC33',
        fontSize:13,
    }
}); 

module.exports = ChefCommentsPage;