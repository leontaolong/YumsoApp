var styles = require('./style');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
} from 'react-native';

class NetworkUnavailableScreen extends Component {    
    render() {  
        return (
            <View style={styles.networkUnavailableView}>
                <Text style={styles.networkUnavailableText}>Error in Network Request</Text>
                <Text style={styles.clickToReloadClickable} onPress={()=>this.props.onReload()}>Tap to reload</Text>
            </View>
        );
    }
}
    
module.exports = NetworkUnavailableScreen;

