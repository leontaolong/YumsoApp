/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

var MOCKED_MOVIES_DATA = [
  {title: 'Title', year: '2015', posters: {thumbnail: 'http://i.imgur.com/UePbdph.jpg'}},
];

class YumsoApp extends Component {
    render() {
        var movie = MOCKED_MOVIES_DATA[0];
        var url = 'http://assets.worldwildlife.org/photos/1620/images/carousel_small/bengal-tiger-why-matter_7341043.jpg?1345548942';
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Yumso
                </Text>
                <Text style={styles.instructions}>
                    Bring you Home
                </Text>
                <Text style={styles.instructions}>
                    Loading...
                </Text>
                <Image source={{ uri: url }} style={styles.thumbnail}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
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
    }
});

AppRegistry.registerComponent('YumsoApp', () => YumsoApp);
