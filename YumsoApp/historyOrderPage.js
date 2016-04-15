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

class HistoryOrderPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            showCommentBox:false
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchOrderAndComments(); 
    }
    
    async fetchOrderAndComments() {
        const start = 'start='+new Date().setDate(new Date().getDate()-7);
        const end = 'end=9999999999999999';
        let eater = await AuthService.getPrincipalInfo();
        let pastOneWeekOrder = await this.client.getWithAuth(config.orderHistoryEndpoint+eater.userId+'?'+start+'&'+end);
        let pastOneWeekComment = await this.client.getWithAuth(config.orderCommentEndpoint+eater.userId+'?'+start+'&'+end);
        if(pastOneWeekOrder.statusCode!=200){
            throw new Error('Fail getting past orders');
        }
        if(pastOneWeekComment.statusCode!=200){
            throw new Error('Fail getting past comments');
        }
        let orders = pastOneWeekOrder.data.orders;
        let comments = pastOneWeekComment.data.comments;
        console.log(orders); console.log(comments);
        for(var comment of comments){
            for(var order of orders){
                if(order.orderId==comment.orderId){
                    order.comment = comment;
                }
            }
        }
        this.setState({dataSource: this.state.dataSource.cloneWithRows(orders), showProgress:false});
    }
 
    renderRow(order){
        let imageSrc =require('./ok.jpeg') ;
        if(order.chefProfilePic){
            imageSrc={uri:order.chefProfilePic};   
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
                        <Text>
                            {order.shopname}
                        </Text>
                        <Text>
                            {new Date(order.orderCreatedTime).getDate()+'/'+new Date(order.orderCreatedTime).getMonth()+'/'+new Date(order.orderCreatedTime).getFullYear()}
                        </Text>   
                    </View>  
                    <View style={{flexDirection:'row', flex:1}}>
                        <View>
                            <Text>
                                ${order.grandTotal}
                            </Text>                          
                            {this.displayCommentOrBox(order)}
                        </View>                                   
                    </View>                           
                </View>           
            </View>
        );
    }
    
    displayCommentOrBox(order){
        if (order.comment) {
            return <Text>eater comment:{order.comment.eaterComment}</Text>
        } else {
            return <TouchableHighlight style={styles.button}
                onPress={() => this.setState({ showCommentBox: true, orderTheCommentIsFor: order }) }>
                <Text style={styles.buttonText}>Leave Comment</Text>
            </TouchableHighlight>
        }
    }
    
    render() {
        if(this.state.showCommentBox==true){
            return (
                <View style={styles.container}> 
                    <TextInput placeholder="comments" style={styles.loginInput}
                        onChangeText = {(text) => this.setState({ comment: text }) }/>
                    <TouchableHighlight style={styles.button}
                        onPress={()=>this.submitComment()}>
                        <Text style={styles.buttonText}>Submit</Text>    
                    </TouchableHighlight>                                                
                    <TouchableHighlight style={styles.button}
                        onPress={()=>this.setState({showCommentBox:false, comment:undefined, orderTheCommentIsFor:undefined}) }>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableHighlight>       
                </View>
            );
        }
        return (
            <View style={styles.container}>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } />
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToChefList() }>
                    <Text style={styles.buttonText}>back to chef list</Text>
                </TouchableHighlight>                      
            </View>
        );
    }
    
    submitComment(){
        var self = this;
        var comment = this.state.comment;
        var orderTheCommentIsFor = this.state.orderTheCommentIsFor;
        var data = {
            chefId: orderTheCommentIsFor.chefId,
            orderId: orderTheCommentIsFor.orderId,
            eaterId: orderTheCommentIsFor.eaterId,
            commentText: comment,
            starRating: 5
        };
        return this.client.postWithAuth(config.leaveEaterCommentEndpoint,data)
        .then((res)=>{
            if(res.statusCode===200){
                Alert.alert(
                    'Success',
                    'Comment is left for this order',
                    [
                        { text: 'OK' }            
                    ]
                );    
            }
            orderTheCommentIsFor.comment=self.state.comment;
            self.setState({showCommentBox:false});
        });
    }

    navigateBackToChefList() {
        this.props.navigator.pop();
    }
}

module.exports = HistoryOrderPage;