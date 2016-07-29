'use strict';

import React, {
    Component,
    Alert
} from 'react-native';

class CommonAlert {
    //Network Error
    networkError(){
        var networkErrTitle = 'Network Error';
        var networkErrText = 'Please check your network connection.';
        Alert.alert( networkErrTitle, networkErrText,[ { text: 'OK' }]);
    }
}

module.exports = new CommonAlert();