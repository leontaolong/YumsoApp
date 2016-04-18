var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');

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
        return this.client.getWithAuth(config.chefCommentsEndpoint + this.state.chefId + '?' + start + '&' + end)
            .then((res) => {
                if (res.statusCode != 200) {
                    throw new Error('Fail getting past comments');
                }
                let comments = res.data.comments;
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(comments), showProgress: false });
            });
    }

    renderRow(comment){
        let imageSrc =require('./ok.jpeg') ;
        if(comment.eaterProfilePic){
            imageSrc={uri:comment.eaterProfilePic};   
        }
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        }   
        return (
            <View style={styles.dishListView_dish}>
                <Image source={imageSrc} style={styles.dishListView_dish_pic}/>
                <View >
                    <View>
                        <Text> {comment.eaterAlias}</Text>
                        <Text> {comment.eaterComment==undefined?'no comment':comment.eaterComment}</Text>
                        <Text> rating: {comment.starRating}</Text>
                        <Text>{comment.eaterCommentTime==undefined? '':this.parseTime(comment.eaterCommentTime)}</Text>     
                        <Text>Chef reply:</Text>
                        <Text>{comment.chefComment==undefined? 'no reply':comment.chefComment}</Text>
                        <Text>{comment.chefCommentTime==undefined? '':this.parseTime(comment.chefCommentTime)}</Text>
                    </View>                          
                </View>           
            </View>
        );
    }
    
    render() {
        return (
            <View style={styles.container}>
               <Text>Chef's ratig & comments</Text>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } />
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToChefPage() }>
                    <Text style={styles.buttonText}>back to dish list</Text>
                </TouchableHighlight>                      
            </View>
        );
    }

    parseTime(timeNumber){
       return new Date(timeNumber).getDate()+'/'+new Date(timeNumber).getMonth()+'/'+new Date(timeNumber).getFullYear(); 
    }
    
    navigateBackToChefPage() {
        this.props.navigator.pop();
    }
}

module.exports = ChefCommentsPage;