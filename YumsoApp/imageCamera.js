 'use strict';
 var styles = require('./style');
//   import React, {
//     Component,
//     View,
//     Image,
//     Text
// } from 'react-native';

var ImagePickerManager = require('NativeModules').ImagePickerManager;

var options = {
  title: 'Select a photo', // specify null or empty string to remove the title
  cancelButtonTitle: 'Cancel',
  takePhotoButtonTitle: 'Take Photo...', // specify null or empty string to remove this button
  chooseFromLibraryButtonTitle: 'Choose from Library...', // specify null or empty string to remove this button
//   customButtons: {
//     'Choose Photo from Facebook': 'fb', // [Button Text] : [String returned upon selection]
//   },
  cameraType: 'back', // 'front' or 'back'
  mediaType: 'photo', // 'photo' or 'video'
  videoQuality: 'high', // 'low', 'medium', or 'high'
  durationLimit: 10, // video recording max time in seconds
  maxWidth: 500, // photos only
  maxHeight: 500, // photos only
  aspectX: 2, // android only - aspectX:aspectY, the cropping image's ratio of width to height
  aspectY: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
  quality: 1, // 0 to 1, photos only
  angle: 0, // android only, photos only
  allowsEditing: false, // Built in functionality to resize/reposition the image after selection
  noData: false, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
  storageOptions: { // if this key is provided, the image will get saved in the documents directory on ios, and the pictures directory on android (rather than a temporary directory)
    skipBackup: true, // ios only - image will NOT be backed up to icloud
    path: 'images' // ios only - will save image at /Documents/images rather than the root
  }
};

class ImageCamera{
    // constructor(props){
    //     super(props);
    //     //this.state={};
    // }
    
    // render(){
    //     return (
    //     <View style={styles.container}>
    //         <Image source={this.state.avatarSource} style={styles.thumbnail} />
    //         <Text onPress={()=>this.PickImage()}>Click me</Text>
    //     </View>);
    // }

    PickImage(callback){     
        ImagePickerManager.showImagePicker(options, (response) => {
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePickerManager Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                // You can display the image using either data:
                const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};
                // // uri (on iOS)
                // const source = {uri: response.uri.replace('file://', ''), isStatic: true};
                // // uri (on android)
                // const source = {uri: response.uri, isStatic: true};

                // this.setState({
                //     avatarSource: source
                // });
                if(callback){
                    callback(source);
                }
            }
        });                    
    }
}
 
module.exports = new ImageCamera();