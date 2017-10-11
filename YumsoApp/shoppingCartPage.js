'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var MapPage = require('./mapPage');
var plusIcon = require('./icons/plus.png');
var minusIcon = require('./icons/minus.png');
var backIcon = require('./icons/icon-back.png');
var addNoteIcon = require('./icons/icon-addNote.png');
var addPromoCodeIcon = require('./icons/icon-add.png');
var removePromoCodeIcon = require('./icons/icon-cancel.png');
var defaultDishPic = require('./icons/defaultAvatar.jpg');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var validator = require('validator');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
var receiptBottom = require('./icons/receipt_bottom.png');
var receiptTop = require('./icons/receipt_top.png');

import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 280 //Todo: get keyboard size programmatically.
var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;


var h1 = 28*windowHeight/677;
var h2 = windowHeight/35.5;
var h3 = windowHeight/33.41;
var h4 = windowHeight/47.33;
var h5 = 12;
var b1 = 15*windowHeight/677;
var b2 = 15*windowHeight/677;


import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert
} from 'react-native';

class ShoppingCartPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2
        });
        var routeStack = this.props.navigator.state.routeStack;
        let shoppingCart = routeStack[routeStack.length-1].passProps.shoppingCart;
        let selectedTime = routeStack[routeStack.length-1].passProps.selectedTime;
        this.deliverTimestamp = routeStack[routeStack.length-1].passProps.deliverTimestamp;
        let chefId = routeStack[routeStack.length-1].passProps.chefId;
        let eater = routeStack[routeStack.length-1].passProps.eater;
        let currentLocation = routeStack[routeStack.length-1].passProps.currentLocation;
        let scheduleMapping = routeStack[routeStack.length-1].passProps.scheduleMapping;
        this.defaultDeliveryAddress = routeStack[routeStack.length-1].passProps.defaultDeliveryAddress;
        let shopName = routeStack[routeStack.length-1].passProps.shopName;
        let notesToChef = routeStack[routeStack.length-1].passProps.notesToChef;
        let promotionCode = routeStack[routeStack.length-1].passProps.promotionCode;
        this.backCallback = routeStack[routeStack.length-1].passProps.backCallback;
        this.state = {
            dataSource: ds.cloneWithRows(Object.values(shoppingCart[selectedTime])),
            showProgress:false,
            scheduleMapping: scheduleMapping,
            shoppingCart:shoppingCart,
            selectedTime:selectedTime,
            currentLocation:currentLocation,
            deliveryAddress: Object.keys(this.defaultDeliveryAddress).length===0?undefined:this.defaultDeliveryAddress,
            notesToChef:notesToChef,
            chefId:chefId,
            selectDeliveryAddress:false,
            shopName:shopName,
            eater:eater,
            priceIsConfirmed:false,
            promotionCode:promotionCode,
            showPromotionCodeInput:false,
            showNoteInput:false,
            phoneNumber:eater? eater.phoneNumber:undefined,
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }

    componentDidMount(){
        this.getTotalPrice();
    }

    renderHeader(){
//this.state.ben = "bijender";
//Alert.alert("ben",this.state.quotedOrder)

      var headerNew = <View style={styles.titleViewNew}>
                          <Text style={styles.titleTextNew}>Cart</Text>
                      </View>

        var view1 = <View key={'chefShopNameView'} style={styleShoppingCartPage.chefShopNameView}>
                        <Text style={styleShoppingCartPage.chefShopNameText}>{this.state.shopName}</Text>
                    </View>

        var view2 = <View key={'deliverTimeView'} style={styleShoppingCartPage.deliverTimeView}>
                        <Text style={styleShoppingCartPage.deliverTimeText}>To be out for delivery at {dateRender.renderDate2(this.state.selectedTime)}</Text>
                    </View>

                    var addressHeader = <View key={'addressHeader'} style={styleShoppingCartPage.noteViewNew}>

                                           <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                               <Text style={styleShoppingCartPage.orderSummaryTextNew}>Delivery Address</Text>
                                              {/* <Text style={{fontSize:b2, color:"#4a4a4a", width:windowWidth - 80 * windowWidthRatio}}>{this.state.eater.addressList[0].formatted_address}</Text>
                                               <View style={styleShoppingCartPage.addressTextView}>*/}
                                               {this.state.deliveryAddress!=undefined ?
                                                 <View>
                                                      {this.state.deliveryAddress.formatted_address!=undefined ?
                                                       <Text style={styleShoppingCartPage.addressLineNew}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.formatted_address !=undefined ? this.state.deliveryAddress.formatted_address.replace(/,/g, '').split(this.state.deliveryAddress.city)[0]:''}</Text>
                                                       :
                                                       null}
                                                       {this.state.deliveryAddress.city !=undefined ?
                                                       <Text style={styleShoppingCartPage.addressLineNew}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.city !=undefined ? this.state.deliveryAddress.city:''} {this.state.deliveryAddress!=null?this.state.deliveryAddress.state:''}</Text>
                                                       :
                                                       null}
                                                       {this.state.deliveryAddress.postal !=undefined ?
                                                       <Text style={styleShoppingCartPage.addressLineNew}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.postal !=undefined ? this.state.deliveryAddress.postal:''}</Text>
                                                       :
                                                       null}
                                                       {this.state.deliveryAddress.apartmentNumber !=undefined ?
                                                       <Text style={styleShoppingCartPage.addressLineNew}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.apartmentNumber !=undefined ? 'Apt/Suite# ' + this.state.deliveryAddress.apartmentNumber:''}</Text>
                                                       :
                                                       null}
                                                  </View>
                                                   :
                                                   null}

                                           </View>
                                           <View style={styleShoppingCartPage.notesToChefTextView}>
                                               <Text style={styleShoppingCartPage.notesToChefText}></Text>
                                           </View>
                                           {this.state.deliveryAddress!=undefined ?
                                           <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} onPress={()=>this.setState({selectDeliveryAddress:true})}>
                                               <Text style={styleShoppingCartPage.viewTextNew}>    Edit</Text>
                                           </TouchableHighlight>
                                           :
                                           <TouchableHighlight style={{ flex:0.40, alignItems:'flex-end', alignSelf:'stretch', justifyContent:'center' }} underlayColor={''}  onPress={()=>this.setState({selectDeliveryAddress:true})}>
                                               <Text style={styleShoppingCartPage.addAddressViewTextNew}>  Add Address</Text>
                                           </TouchableHighlight>
                                         }

                                       </View>


        var addressEditHeader = <View key={'addressHeader'} style={styleShoppingCartPage.noteViewNew}>

                               <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                   <Text style={styleShoppingCartPage.orderSummaryTextNew}>Delivery Address</Text>
                                   <TextInput placeholder="Address" style={styleShoppingCartPage.inputText} autoCorrect={false} placeholderTextColor='#979797' returnKeyType = {'done'} maxLength={100} />
                               </View>
                               <View style={styleShoppingCartPage.notesToChefTextView}>
                                   <Text style={styleShoppingCartPage.notesToChefText}></Text>
                               </View>
                               <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={''} onPress={() => this.editAddress()}>
                                   <Text style={styleShoppingCartPage.okViewTextNew}>    Ok</Text>
                               </TouchableHighlight>
                           </View>



        var phoneNoHeader = <View key={'phoneNoHeader'} style={styleShoppingCartPage.noteViewNew}>

                               <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                   <Text style={styleShoppingCartPage.orderSummaryTextNew}>Phone</Text>
                                   <Text style={{fontSize:b2, color:"#4a4a4a", width:windowWidth - 80 * windowWidthRatio, height:22*windowHeightRatio}}>{this.state.eater && this.state.eater.phoneNumber? this.state.eater.phoneNumber:''}</Text>
                               </View>
                               <View style={styleShoppingCartPage.notesToChefTextView}>
                                   <Text style={styleShoppingCartPage.notesToChefText}></Text>
                               </View>
                               <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={''} onPress={() => this.editPhoneNo()}>
                                   <Text style={styleShoppingCartPage.viewTextNew}>    Edit</Text>
                               </TouchableHighlight>
                           </View>


        var phoneNoEditHeader = <View key={'phoneNoHeader'} style={styleShoppingCartPage.noteViewNew}>

                               <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                   <Text style={styleShoppingCartPage.orderSummaryTextNew}>Phone</Text>

                                   <TextInput style={styleShoppingCartPage.inputText} placeholder="Phone Number" placeholderTextColor='#4A4A4A' clearButtonMode={'while-editing'}
                                   maxLength={15} returnKeyType = {'done'} keyboardType = { 'phone-pad'} onChangeText = {(text) => this.setState({ phoneNumber: text })} onSubmitEditing={()=>this.scrollToShowTotalPrice()} onBlur={()=>this.scrollToShowTotalPrice()}/>
                               </View>
                               <View style={styleShoppingCartPage.notesToChefTextView}>
                                   <Text style={styleShoppingCartPage.notesToChefText}></Text>
                               </View>
                               <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={''} onPress={() => this.editPhoneNo()}>
                                   <Text style={styleShoppingCartPage.okViewTextNew}>    Ok</Text>
                               </TouchableHighlight>
                           </View>






        var orderStatusTextNew = <View style={{paddingBottom:15* windowHeightRatio, paddingLeft: 20 * windowWidthRatio, marginTop: 20 * windowWidthRatio}}>
                                    <Text style={{fontSize:h3, fontWeight:'bold', color:"#4a4a4a"}}>Order Details</Text>
                                </View>


        var deliverTimeViewNew = (<View key={'deliverTimeView'} style={styleShoppingCartPage.deliverTimeViewNew}>
                                    <View style={{flexDirection: "row"}}>
                                        <Text style={styleShoppingCartPage.deliverTimeTextNew}>
                                           Order from
                                        </Text>
                                        <Text style={styleShoppingCartPage.orderFromNameNew}> {this.state.shopName}</Text>
                                    </View>


                                    <Text style={styleShoppingCartPage.deliverTimeTextNew}>
                                       To be out for delivery at
                                       <Text style={styleShoppingCartPage.orderFromNameNew}> {dateRender.renderDate2(this.state.selectedTime)}</Text>
                                    </Text>
                               </View>);


        var addressView = null
        {this.state.isAddressEdating == true ? addressView =  addressEditHeader :  addressView =  addressHeader}

        var phoneNoView = null
        {this.state.editPhoneNo == true ? phoneNoView =  phoneNoEditHeader :  phoneNoView =  phoneNoHeader}





        return[headerNew,addressView,phoneNoView,orderStatusTextNew,deliverTimeViewNew]
    }

    renderRow(cartItem){
        var dish = cartItem.dish;
        var quantity = cartItem.quantity;
        let imageSrc = defaultDishPic ;
        if(dish.pictures && dish.pictures!=null && dish.pictures.length!=0){
            imageSrc={uri:dish.pictures[0]};
        }
        let actualQuantityText = null;
        if(this.state.dishUnavailableSet && this.state.dishUnavailableSet[dish.dishId]){
            actualQuantityText =<Text style={styleShoppingCartPage.actualQuantityText}>{this.state.dishUnavailableSet[dish.dishId].actualLeftQuantity} left now</Text>;
        }
//
        return (
            <View style={styleShoppingCartPage.oneListingViewNew}>
                <Image source={imageSrc} style={styleShoppingCartPage.dishPhotoNew}/>
                <View style={styleShoppingCartPage.orderInfoViewNew}>
                    <Text style={styleShoppingCartPage.dishNameTextNew}>{dish.dishName}</Text>
                    <View style={styleShoppingCartPage.bottomViewNew}>


                            <View style={styleShoppingCartPage.quantityView2New}>
                                  <Text style={styleShoppingCartPage.dishPriceTextNew}>${(dish.price*quantity).toFixed(2)}</Text>
                                  <Text style={styleShoppingCartPage.quantityTextNew}>10 serves left</Text>
                            </View>


                            <View style={styleShoppingCartPage.quantityViewNew}>
                                <TouchableHighlight style={styleShoppingCartPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={()=>this.removeFromShoppingCart(dish)}>
                                    <Image source={minusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                                </TouchableHighlight>
                                <View style={styleShoppingCartPage.quantityTextView}>
                                    <Text style={styleShoppingCartPage.quantityText}>{this.state.shoppingCart[this.state.selectedTime][dish.dishId]?this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity:'  '}</Text>
                                </View>

                                <TouchableHighlight style={styleShoppingCartPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={()=>this.addToShoppingCart(dish)}>
                                    <Image source={plusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                                </TouchableHighlight>
                            </View>

                        </View>


                </View>

                <View style={{backgroundColor: "#EAEAEA", height: 1,}}>
                </View>
            </View>
        );


      /*  return (
            <View style={styleShoppingCartPage.oneListingView}>
                <Image source={imageSrc} style={{ width:windowWidth/2.76,height:windowWidth/2.76,opacity:actualQuantityText ? 0.3:1}}/>
                <View style={styleShoppingCartPage.shoppingCartInfoView}>
                    <View style={styleShoppingCartPage.dishNamePriceView}>
                      <View style={styleShoppingCartPage.dishNameView}>
                        <Text style={styleShoppingCartPage.dishNameText}>{dish.dishName}</Text>
                      </View>
                      <View style={styleShoppingCartPage.dishPriceView}>
                        <Text style={styleShoppingCartPage.dishPriceText}>${dish.price}</Text>
                      </View>
                    </View>

                    <View style={styleShoppingCartPage.dishIngredientView}>
                       <Text style={styleShoppingCartPage.dishIngredientText}>{commonWidget.getTextLengthLimited(dish.ingredients,28)}</Text>
                    </View>
                    <View style={styleShoppingCartPage.quantityTotalPriceView}>
                        <View style={styleShoppingCartPage.quantityView}>
                            <TouchableHighlight style={styleShoppingCartPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={()=>this.addToShoppingCart(dish)}>
                                <Image source={plusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                            </TouchableHighlight>
                            <View style={styleShoppingCartPage.quantityTextView}>
                                <Text style={styleShoppingCartPage.quantityText}>{this.state.shoppingCart[this.state.selectedTime][dish.dishId]?this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity:'  '}</Text>
                            </View>
                            <TouchableHighlight style={styleShoppingCartPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={()=>this.removeFromShoppingCart(dish)}>
                                <Image source={minusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                            </TouchableHighlight>
                        </View>
                        <View style={styleShoppingCartPage.totalPriceView}>
                             {actualQuantityText}
                             <Text style={styleShoppingCartPage.totalPriceText}>${(dish.price*quantity).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );*/
    }

    renderFooter(){

      var notesToChefView = null;
      // if(this.state.order.notesToChef && this.state.order.notesToChef.trim()){
      if(1 == 1){   // this is for only show this filed commont this and uncomment abow "if" condition
          var notesToChefMainView = (<View key={'noteView'} style={styleShoppingCartPage.noteViewNew}>

                                <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                    <Text style={styleShoppingCartPage.orderSummaryTextNew}>Note to Chef</Text>
                                    <Text style={{fontSize:b2, color:"#4a4a4a", width:windowWidth - 80 * windowWidthRatio, height:22*windowHeightRatio}}>Please warm both croissants, thank you!</Text>

                                </View>
                                <View style={styleShoppingCartPage.notesToChefTextView}>
                                    <Text style={styleShoppingCartPage.notesToChefText}></Text>
                                </View>
                                <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={''} onPress={() => this.editChefNote()}>
                                    <Text style={styleShoppingCartPage.viewTextNew}>    Edit</Text>
                                </TouchableHighlight>
                            </View>);

        var notesToChefEditView = (<View key={'noteView'} style={styleShoppingCartPage.noteViewNew}>

                               <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                   <Text style={styleShoppingCartPage.orderSummaryTextNew}>Note to Chef</Text>
                                   <TextInput placeholder="Note to Chef" clearButtonMode={'while-editing'}  style={styleShoppingCartPage.inputText} autoCorrect={false} placeholderTextColor='#979797' returnKeyType = {'done'} maxLength={100} />

                               </View>
                               <View style={styleShoppingCartPage.notesToChefTextView}>
                                   <Text style={styleShoppingCartPage.notesToChefText}></Text>
                               </View>
                               <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={''} onPress={() => this.editChefNote()}>
                                   <Text style={styleShoppingCartPage.okViewTextNew}>    Ok</Text>
                               </TouchableHighlight>
                           </View>);



        {this.state.editChefNote == true ? notesToChefView = notesToChefEditView  :  notesToChefView =  notesToChefMainView}

      }

      var promotionDeductionView = null;
//      if(this.state.order.price && this.state.order.price.couponValue){
    if(1 == 1){  // this is for only show this filed commont this and uncomment abow "if" condition
         var promotionDeductionMainView = (<View key={'promotionDeductionView'} style={styleShoppingCartPage.subtotalViewNew}>
                                         <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                             <Text style={styleShoppingCartPage.orderSummaryTextNew}>Promotion Code</Text>
                                             {this.state.promotionCode ?
                                             <Text style={{fontSize:b2, color:"#4a4a4a", width:windowWidth - 80 * windowWidthRatio, height:22*windowHeightRatio}}>{this.state.promotionCode}</Text>
                                             :
                                             null
                                           }
                                         </View>
                                         <View style={styleShoppingCartPage.notesToChefTextView}>
                                             <Text style={styleShoppingCartPage.notesToChefText}></Text>
                                         </View>
                                         <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={''} onPress={() => this.editPromotionCode()}>
                                             <Text style={styleShoppingCartPage.viewTextNew}>    Edit</Text>
                                         </TouchableHighlight>
                                    </View>);

          var promotionDeductionEditView = (<View key={'promotionDeductionView'} style={styleShoppingCartPage.subtotalViewNew}>
                                          <View style={styleShoppingCartPage.notesToChefTitleViewNew}>
                                              <Text style={styleShoppingCartPage.orderSummaryTextNew}>Promotion Code</Text>

                                              <TextInput placeholder="Promotion Code" placeholderTextColor='#979797' defaultValue={this.state.promotionCode} style={styleShoppingCartPage.inputText} clearButtonMode={'while-editing'} returnKeyType = {'done'} onChangeText = {(text) => this.setState({ promotionCode: text.trim()})}
                                               maxLength={20} autoCorrect={false} autoCapitalize={'characters'} onSubmitEditing={()=>this.onPressAddCoupon()}/>
                                          </View>
                                          <View style={styleShoppingCartPage.notesToChefTextView}>
                                              <Text style={styleShoppingCartPage.notesToChefText}></Text>
                                          </View>
                                          <TouchableHighlight style={styleShoppingCartPage.notesToChefButtonView} underlayColor={''} onPress={() => this.editPromotionCode()}>
                                              <Text style={styleShoppingCartPage.okViewTextNew}>    Ok</Text>
                                          </TouchableHighlight>
                                     </View>);

          {this.state.editPromotionCode == true ? promotionDeductionView = promotionDeductionEditView  :  promotionDeductionView =  promotionDeductionMainView}
      }




       if(this.state.showPromotionCodeInput){
          var promotionCodeInputView = [(<View key={'promotionCodeInputView'} style={styleShoppingCartPage.showPromoCodeView}>
                                           <Text style={styleShoppingCartPage.showPromoCodeText}>{this.state.promotionCode}</Text>
                                        </View>),
                                       (<TouchableHighlight key={'RemoveCouponButtonView'} style={styleShoppingCartPage.AddRemoveCouponButtonView} underlayColor={'#F5F5F5'} onPress={()=>this.onPressRemoveCoupon()}>
                                           <Image source={removePromoCodeIcon} style={styleShoppingCartPage.removePromoCodeIcon}/>
                                        </TouchableHighlight>)];
       }else{
          var promotionCodeInputView = [(<View key={'promotionCodeInputView'} style={styleShoppingCartPage.promoCodeInputView}>
                                           <TextInput defaultValue={this.state.promotionCode} style={styleShoppingCartPage.promoCodeInput} clearButtonMode={'while-editing'} returnKeyType = {'done'} onChangeText = {(text) => this.setState({ promotionCode: text.trim()})}
                                            maxLength={20} onFocus={(()=>this._onFocusPromoCode()).bind(this)} autoCorrect={false} autoCapitalize={'characters'} onSubmitEditing={()=>this.onPressAddCoupon()}/>
                                        </View>),
                                       (<TouchableHighlight key={'AddCouponButtonView'} style={styleShoppingCartPage.AddRemoveCouponButtonView} underlayColor={'#F5F5F5'} onPress={()=>this.onPressAddCoupon()}>
                                           <Image source={addPromoCodeIcon} style={styleShoppingCartPage.addPromoCodeIcon}/>
                                        </TouchableHighlight>)];
       }


       var noteInputView = null;
       if(this.state.showNoteInput){
          noteInputView = <View key={'noteInputView'} style={styleShoppingCartPage.commentBox}>
                                <TextInput defaultValue={this.state.notesToChef} style={styleShoppingCartPage.commentInput} multiline={true} returnKeyType = {'default'} autoCorrect={false}
                                    maxLength={500} onChangeText = {(text) => this.setState({ notesToChef: text }) } onFocus={(()=>this._onFocusPromoCode()).bind(this)}/>
                          </View>;
       }

       /*var notesToChefView = [(<View key={'notesToChefView'} style={styleShoppingCartPage.notesToChefView}>
                                <View style={styleShoppingCartPage.promotionCodeTitleView}>
                                    <Text style={styleShoppingCartPage.priceTitleText}>Note to Chef</Text>
                                </View>
                                <View style={styleShoppingCartPage.showPromoCodeView}>
                                    <Text style={styleShoppingCartPage.showPromoCodeText}>{commonWidget.getTextLengthLimited(this.state.notesToChef,15)}</Text>
                                </View>
                                <TouchableHighlight key={'AddCouponButtonView'} style={styleShoppingCartPage.AddRemoveCouponButtonView} underlayColor={'#F5F5F5'} onPress={()=>this.onPressAddNote()}>
                                    <Image source={addNoteIcon} style={styleShoppingCartPage.addPromoCodeIcon}/>
                                </TouchableHighlight>
                               </View>),
                               noteInputView];*/

       if(!this.state.priceIsConfirmed){//if price not quoted
            return [
              notesToChefView,
              promotionDeductionView,
              (
            <View key={'orderSummary'} style={styleShoppingCartPage.orderSummaryNew}>
                <Text style={styleShoppingCartPage.orderSummaryTextNew}>Order Summary</Text>
            </View>),

            (
            <View key={'receiptTop'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                <Image source={receiptTop} style={styleShoppingCartPage.receiptTopImageNew} />
            </View>),



           (<View key={'subtotalView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                    <View style={styleShoppingCartPage.priceTitleView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxTitleTopNew}>Subtotal</Text>
                    </View>
                    <View style={styleShoppingCartPage.priceNumberTopView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.totalPrice ? Number(this.state.totalPrice.toFixed(2)) : '0'}</Text>
                    </View>
                </View>
                <View style={styleShoppingCartPage.lineBackgroundNew}>
                    <Text style= {styleShoppingCartPage.lineNew}></Text>
                </View>
            </View>),

            (<View key={'deliveryFeeView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                    <View style={styleShoppingCartPage.priceTitleView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Delivery Fee</Text>
                    </View>
                    <View style={styleShoppingCartPage.priceNumberView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>-</Text>
                    </View>
                </View>
                <View style={styleShoppingCartPage.lineBackgroundNew}>
                    <Text style= {styleShoppingCartPage.lineNew}></Text>
                </View>

             </View>),


             (<View key={'discountView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                 <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                     <View style={styleShoppingCartPage.priceTitleView}>
                         <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Discount</Text>
                     </View>
                     <View style={styleShoppingCartPage.priceNumberView}>
                         <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>-</Text>
                     </View>
                 </View>
                 <View style={styleShoppingCartPage.lineBackgroundNew}>
                     <Text style= {styleShoppingCartPage.lineNew}></Text>
                 </View>

              </View>),

              (<View key={'taxView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                  <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                      <View style={styleShoppingCartPage.priceTitleView}>
                          <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Tax</Text>
                      </View>
                      <View style={styleShoppingCartPage.priceNumberView}>
                          <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>-</Text>
                      </View>
                  </View>
                  <View style={styleShoppingCartPage.lineBackgroundNew}>
                      <Text style= {styleShoppingCartPage.lineNew}></Text>
                  </View>

               </View>),
            (<View key={'totalView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                    <View style={styleShoppingCartPage.priceTitleView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxTitleBottomNew}>TOTAL</Text>
                    </View>
                    <View style={styleShoppingCartPage.priceNumberBottomView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxBoldValueNew}>${this.state.totalPrice ? Number(this.state.totalPrice.toFixed(2)) : '0'}</Text>
                    </View>
                </View>

             </View>),


             (
             <View key={'receiptBottom'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                 <Image source={receiptBottom} style={styleShoppingCartPage.receiptBottomImageNew} />
             </View>),
/*
              (<View key={'subtotalView'} style={styleShoppingCartPage.subtotalView}>
                        <View style={styleShoppingCartPage.priceTitleView}>
                            <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
                        </View>
                        <View style={styleShoppingCartPage.priceNumberView}>
                            <Text style={styleShoppingCartPage.priceNumberText}>${this.state.totalPrice ? Number(this.state.totalPrice.toFixed(2)) : '0'}</Text>
                        </View>
                    </View>),

                    (<View key={'promotionCodeView'} style={styleShoppingCartPage.promotionCodeView}>
                        <View style={styleShoppingCartPage.promotionCodeTitleView}>
                            <Text style={styleShoppingCartPage.priceTitleText}>Promotion Code</Text>
                        </View>
                        {promotionCodeInputView}
                    </View>),
                    (<View key={'promotionCodeInputViewBottom'} style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}>
                    </View>),
                    (<View key={'addressView'} style={styleShoppingCartPage.addressView}>
                        <View style={styleShoppingCartPage.addressTextView}>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.formatted_address !=undefined ? this.state.deliveryAddress.formatted_address.replace(/,/g, '').split(this.state.deliveryAddress.city)[0]:''}</Text>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.city !=undefined ? this.state.deliveryAddress.city:''} {this.state.deliveryAddress!=null?this.state.deliveryAddress.state:''}</Text>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.postal !=undefined ? this.state.deliveryAddress.postal:''}</Text>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.apartmentNumber !=undefined ? 'Apt/Suite# ' + this.state.deliveryAddress.apartmentNumber:''}</Text>
                        </View>
                        <TouchableHighlight style={styleShoppingCartPage.addressChangeButtonView} underlayColor={'transparent'} onPress={()=>this.setState({selectDeliveryAddress:true})}>
                            <View style={styleShoppingCartPage.addressChangeButtonWrapper}>
                                <Text style={styleShoppingCartPage.addressChangeButtonText}>{this.state.deliveryAddress==undefined?'Add Address': 'Change Address'}</Text>
                            </View>
                        </TouchableHighlight>
                    </View>),
*/
                    ];
       }else{//if price quoted
          //  var promotionDeductionView=null;
            if(this.state.quotedOrder && this.state.quotedOrder.price && this.state.quotedOrder.price.couponValue){
                /*promotionDeductionView=(<View key={'promotionDeductionView'} style={styleShoppingCartPage.promotionDeductionView}>
                                                <View style={styleShoppingCartPage.couponTitleView}>
                                                    <Text style={styleShoppingCartPage.priceTitleText}>Coupon Deduction</Text>
                                                </View>
                                                <View style={styleShoppingCartPage.couponNumberView}>
                                                    <Text style={styleShoppingCartPage.priceNumberText}>-${this.state.quotedOrder.price.couponValue}</Text>
                                                </View>
                                        </View>);*/
            }

            return [
              notesToChefView,
              promotionDeductionView,
              (
            <View key={'orderSummary'} style={styleShoppingCartPage.orderSummaryNew}>
                <Text style={styleShoppingCartPage.orderSummaryTextNew}>Order Summary</Text>
            </View>),

            (
            <View key={'receiptTop'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                <Image source={receiptTop} style={styleShoppingCartPage.receiptTopImageNew} />
            </View>),



           (<View key={'subtotalView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                    <View style={styleShoppingCartPage.priceTitleView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxTitleTopNew}>Subtotal</Text>
                    </View>
                    <View style={styleShoppingCartPage.priceNumberTopView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.quotedOrder.price.subTotal}</Text>
                    </View>
                </View>
                <View style={styleShoppingCartPage.lineBackgroundNew}>
                    <Text style= {styleShoppingCartPage.lineNew}></Text>
                </View>
            </View>),

            (<View key={'deliveryFeeView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                    <View style={styleShoppingCartPage.priceTitleView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Delivery Fee</Text>
                    </View>
                    <View style={styleShoppingCartPage.priceNumberView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.quotedOrder.price.deliveryFee}</Text>
                    </View>
                </View>
                <View style={styleShoppingCartPage.lineBackgroundNew}>
                    <Text style= {styleShoppingCartPage.lineNew}></Text>
                </View>

             </View>),


             (<View key={'discountView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                 <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                     <View style={styleShoppingCartPage.priceTitleView}>
                         <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Discount</Text>
                     </View>
                     <View style={styleShoppingCartPage.priceNumberView}>
                         <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>-</Text>
                     </View>
                 </View>
                 <View style={styleShoppingCartPage.lineBackgroundNew}>
                     <Text style= {styleShoppingCartPage.lineNew}></Text>
                 </View>

              </View>),

              (<View key={'taxView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                  <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                      <View style={styleShoppingCartPage.priceTitleView}>
                          <Text style={styleShoppingCartPage.orderSummaryBoxTitleNew}>Tax</Text>
                      </View>
                      <View style={styleShoppingCartPage.priceNumberView}>
                          <Text style={styleShoppingCartPage.orderSummaryBoxValueNew}>${this.state.quotedOrder.price.tax}</Text>
                      </View>
                  </View>
                  <View style={styleShoppingCartPage.lineBackgroundNew}>
                      <Text style= {styleShoppingCartPage.lineNew}></Text>
                  </View>

               </View>),
            (<View key={'totalView'} style={styleShoppingCartPage.orderSummaryRowNew}>
                <View style={styleShoppingCartPage.orderSummaryBoxNew}>
                    <View style={styleShoppingCartPage.priceTitleView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxTitleBottomNew}>TOTAL</Text>
                    </View>
                    <View style={styleShoppingCartPage.priceNumberBottomView}>
                        <Text style={styleShoppingCartPage.orderSummaryBoxBoldValueNew}>${this.state.quotedOrder.price.grandTotal}</Text>
                    </View>
                </View>

             </View>),
             (
             <View key={'receiptBottom'} style={styleShoppingCartPage.receiptTopBottomImageViewNew}>
                 <Image source={receiptBottom} style={styleShoppingCartPage.receiptBottomImageNew} />
             </View>),





/*



              (<View key={'subtotalView'} style={styleShoppingCartPage.subtotalView}>
                        <View style={styleShoppingCartPage.priceTitleView}>
                            <Text style={styleShoppingCartPage.priceTitleText}>Subtotal</Text>
                        </View>
                        <View style={styleShoppingCartPage.priceNumberView}>
                            <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.subTotal}</Text>
                        </View>
                    </View>),

                    (<View key={'promotionCodeView'} style={styleShoppingCartPage.promotionCodeView}>
                        <View style={styleShoppingCartPage.promotionCodeTitleView}>
                            <Text style={styleShoppingCartPage.priceTitleText}>Promotion Code</Text>
                        </View>
                        {promotionCodeInputView}
                    </View>),

                    (<View key={'deliveryFeeView'} style={styleShoppingCartPage.deliveryFeeView}>
                        <View style={styleShoppingCartPage.priceTitleView}>
                            <Text style={styleShoppingCartPage.priceTitleText}>Delivery Fee</Text>
                        </View>
                        <View style={styleShoppingCartPage.priceNumberView}>
                            <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.deliveryFee}</Text>
                        </View>
                    </View>),
                    (<View key={'addressView'} style={styleShoppingCartPage.addressView}>
                        <View style={styleShoppingCartPage.addressTextView}>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.formatted_address!=undefined ? this.state.deliveryAddress.formatted_address.replace(/,/g, '').split(this.state.deliveryAddress.city)[0]:''}</Text>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.city!=undefined ? this.state.deliveryAddress.city:''} {this.state.deliveryAddress!=null?this.state.deliveryAddress.state:''}</Text>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.postal!=undefined ? this.state.deliveryAddress.postal:''}</Text>
                            <Text style={styleShoppingCartPage.addressLine}>{this.state.deliveryAddress!=undefined && this.state.deliveryAddress.apartmentNumber!=undefined ? 'Apt/Suite# ' + this.state.deliveryAddress.apartmentNumber:''}</Text>
                            <Text style={styleShoppingCartPage.addressLine}>Phone </Text>
                            <View style={styleShoppingCartPage.phoneNumberInputView}>
                                <TextInput style={styleShoppingCartPage.phoneNumberInput} placeholder={this.state.eater && this.state.eater.phoneNumber? this.state.eater.phoneNumber:''} placeholderTextColor='#4A4A4A' clearButtonMode={'while-editing'}
                                maxLength={15} returnKeyType = {'done'} keyboardType = { 'phone-pad'} onChangeText = {(text) => this.setState({ phoneNumber: text })} onFocus={(()=>this._onFocus()).bind(this)} onSubmitEditing={()=>this.scrollToShowTotalPrice()} onBlur={()=>this.scrollToShowTotalPrice()}/>
                            </View>
                        </View>
                        <View style={styleShoppingCartPage.addressChangeButtonView}>
                            <TouchableHighlight underlayColor={'transparent'} style={styleShoppingCartPage.addressChangeButtonWrapper} onPress={()=>this.setState({selectDeliveryAddress:true})}>
                                <Text style={styleShoppingCartPage.addressChangeButtonText}>{this.state.deliveryAddress==undefined?'Add delivery address': 'Change Address'}</Text>
                            </TouchableHighlight>
                            <View style={styleShoppingCartPage.ETATextView}>
                                <Text style={styleShoppingCartPage.ETAText}>
                                Expect arrival between {dateRender.formatTime2StringShort(this.state.quotedOrder.estimatedDeliverTimeRange.min)} and {dateRender.formatTime2StringShort(this.state.quotedOrder.estimatedDeliverTimeRange.max)}
                                </Text>
                            </View>
                        </View>
                    </View>),
                    (<View key={'taxView'} style={styleShoppingCartPage.taxView}>
                        <View style={styleShoppingCartPage.priceTitleView}>
                            <Text style={styleShoppingCartPage.priceTitleText}>Tax</Text>
                        </View>
                        <View style={styleShoppingCartPage.priceNumberView}>
                            <Text style={styleShoppingCartPage.priceNumberText}>${this.state.quotedOrder.price.tax}</Text>
                        </View>
                    </View>),
                    (<View key={'totalView'} style={styleShoppingCartPage.totalView}>
                        <View style={styleShoppingCartPage.priceTitleView}>
                            <Text style={styleShoppingCartPage.totalPriceTitleText}>Total</Text>
                        </View>
                        <View style={styleShoppingCartPage.priceNumberView}>
                            <Text style={styleShoppingCartPage.totalPriceNumberText}>${this.state.quotedOrder.price.grandTotal}</Text>
                        </View>
                    </View>)*/];
        }
    }

    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<LoadingSpinnerViewFullScreen/>;
        }
        if(this.state.selectDeliveryAddress){
            return(<MapPage onSelectAddress={this.mapDone.bind(this)} onCancel={this.onCancelMap.bind(this)} eater={this.state.eater} specificAddressMode={true} currentAddress={this.state.currentLocation} showHouseIcon={true}/>);
        }

        if(!this.state.priceIsConfirmed){
           var payNowButtonView = <TouchableOpacity activeOpacity={1}>
                                    <View style={styleShoppingCartPage.checkOutButtonGreyView}>
                                        <Text style={styleShoppingCartPage.bottomButtonTextGreyed}>Pay Now</Text>
                                    </View>
                                 </TouchableOpacity>;
        }else{
           var payNowButtonView = <TouchableHighlight onPress={() => this.navigateToPaymentPage() }>
                                    <View style={styleShoppingCartPage.checkOutButtonView}>
                                        <Text style={styleShoppingCartPage.bottomButtonText}>Pay Now</Text>
                                    </View>
                                  </TouchableHighlight>;
        }

        return (
            <View style={styles.containerNew}>
               {/*<View style={styles.headerBannerView}>
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToDishList()}>
                       <View style={styles.backButtonView}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </View>
                    </TouchableHighlight>
                    <View style={styles.headerRightView}>
                    </View>
               </View>*/}
               <View style={styles.headerBannerViewNew}>
                   <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToDishList()}>
                     <View style={styles.backButtonViewsNew}>
                         <Image source={backIcon} style={styles.backButtonIconsNew}/>
                     </View>
                   </TouchableHighlight>

                   <View style={styles.headerRightView}>
                   </View>
               </View>

               <ListView style={styles.dishListViewWhite} ref="listView"
                                dataSource = {this.state.dataSource}
                                renderHeader={this.renderHeader.bind(this)}
                                renderRow={this.renderRow.bind(this) }
                                renderFooter={this.renderFooter.bind(this)}/>
               {loadingSpinnerView}
               <View style={styleShoppingCartPage.footerView}>
                    <TouchableHighlight onPress={() => this.getPrice() }>
                        <View style={styleShoppingCartPage.getPriceButtonView}>
                            <Text style={styleShoppingCartPage.bottomButtonText}>Get Price</Text>
                        </View>
                    </TouchableHighlight>
                    {payNowButtonView}
               </View>
               {/*
               <TouchableOpacity activeOpacity={0.7} style={styles.footerView}>
                    <Text style={styles.footerText}>Check Out</Text>
               </TouchableOpacity>*/}
            </View>
        );
    }

    _onLayout(event) {
        this.y = event.nativeEvent.layout.y;
    }

    _onFocus() {
        let listViewLength = this.y+0.5*windowHeight;
        let listViewBottomToScreenBottom = windowHeight - (listViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        this.refs.listView.scrollTo({x:0, y:keyboardHeight - listViewBottomToScreenBottom, animated: true})
    }

    _onFocusPromoCode() {
        let listViewLength = this.y;
        let listViewBottomToScreenBottom = windowHeight - (listViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        this.refs.listView.scrollTo({x:0, y:25+keyboardHeight - listViewBottomToScreenBottom, animated: true})
    }

    scrollToShowTotalPrice(){
        let listViewLength = this.y+0.5*windowHeight;
        if(this.state.quotedOrder && this.state.quotedOrder.price && this.state.quotedOrder.price.couponValue){
           listViewLength +=0.075*windowHeight;
        }
        let listViewBottomToScreenBottom = windowHeight - (listViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        if(listViewBottomToScreenBottom < 0 && this.state.priceIsConfirmed){
           this.refs.listView.scrollTo({x:0, y:windowHeight*0.075-listViewBottomToScreenBottom, animated: true})
        }
    }

    mapDone(address){
         let aptmentNumberText = address.apartmentNumber ? ' Apt/Suite# '+address.apartmentNumber : '';
         if(address){
             Alert.alert( '', 'Your delivery location is set to '+address.formatted_address+aptmentNumberText,[ { text: 'OK' }]);
         }
         if(this.state.deliveryAddress && this.state.deliveryAddress.formatted_address!==address.formatted_address){
             this.setState({priceIsConfirmed:false});
         }
         this.setState({selectDeliveryAddress:false, deliveryAddress:address});
    }

    onCancelMap(){
         this.setState({selectDeliveryAddress:false});
    }

    addToShoppingCart(dish){
        if(this.state.selectedTime==='All Dishes'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;
        }
        if(this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity <= 0){
            Alert.alert( 'Warning', 'No more ' + dish.dishName +' available',[ { text: 'OK' }]);
            return;
        }
        this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity-=1;
        if(!this.state.shoppingCart[this.state.selectedTime]){
            this.state.shoppingCart[this.state.selectedTime] = {};
        }
        if(this.state.shoppingCart[this.state.selectedTime][dish.dishId]){
            this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity+=1;
        }else{
            this.state.shoppingCart[this.state.selectedTime][dish.dishId] = {dish:dish, quantity:1};
        }
        this.getTotalPrice();
    }

    removeFromShoppingCart(dish){
        if(this.state.selectedTime==='All Dishes'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;
        }
        if(!this.state.shoppingCart[this.state.selectedTime]){
            return;
        }
        if(this.state.shoppingCart[this.state.selectedTime][dish.dishId] && this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity>0){
            this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity-=1;
            this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity+=1;
            if(this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity>=0){
                if(this.state.dishUnavailableSet && this.state.dishUnavailableSet[dish.dishId]){
                    delete this.state.dishUnavailableSet[dish.dishId];   //todo: need setstate to ensure dish actualy quantity text is gone?
                }
            }
            if(this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity===0){
                delete this.state.shoppingCart[this.state.selectedTime][dish.dishId];
                if(Object.keys(this.state.shoppingCart[this.state.selectedTime])===0){
                    delete this.state.shoppingCart[this.state.selectedTime];
                }
            }
        }
        this.getTotalPrice();
    }

    getTotalPrice(){
        var total = 0;
        var deliverTime = this.state.selectedTime;
        for(var cartItemId in this.state.shoppingCart[deliverTime]){
            var cartItem = this.state.shoppingCart[deliverTime][cartItemId];
            total+=cartItem.dish.price * cartItem.quantity;
        }
        let newShoppingCart = JSON.parse(JSON.stringify(this.state.shoppingCart));
        this.setState({shoppingCart:this.state.shoppingCart, totalPrice:total, priceIsConfirmed:false, dataSource:this.state.dataSource.cloneWithRows(newShoppingCart[this.state.selectedTime])});
    }

    onPressRemoveCoupon(){
        this.setState({promotionCode:'',showPromotionCodeInput:false});
        if(this.state.priceIsConfirmed){
           this.getPrice();
        }
    }

    onPressAddNote(){
        this.setState({showNoteInput:!this.state.showNoteInput});
        this._onFocusPromoCode();
    }

    onPressAddCoupon(){
        if(!this.state.promotionCode || !this.state.promotionCode.trim()){
          return;
        }
        this.setState({showPromotionCodeInput:true});
        if(this.state.priceIsConfirmed){
           this.getPrice();
        }
    }

    editAddress() {
        if (this.state.isAddressEdating == true) {
            this.setState({isAddressEdating: false})
        }
        else{
          this.setState({isAddressEdating: true})
        }
    }

    editPhoneNo() {
        if (this.state.editPhoneNo == true) {
            this.setState({editPhoneNo: false})
        }
        else{
          this.setState({editPhoneNo: true})
        }
    }
    editChefNote() {
        if (this.state.editChefNote == true) {
            this.setState({editChefNote: false})
        }
        else{
          this.setState({editChefNote: true})
        }
    }
    editPromotionCode() {
        if (this.state.editPromotionCode == true) {
            this.setState({editPromotionCode: false})
        }
        else{
          this.setState({editPromotionCode: true})
        }
    }


    changeDeliveryAddress(){
        //todo: onSelect address list and assign it to deliveryAddress set State.
        //todo: shall we have a sepreate component for displaying saved addresses?
    }

    getPrice(){
        if(this.state.dishUnavailableSet && Object.keys(this.state.dishUnavailableSet).length!=0){
           Alert.alert('Warning','Please fix your order items',[{ text: 'OK' }]);
           return;
        }
        if(!this.state.deliveryAddress){
           Alert.alert('Warning','You do not have a delivery address',[{ text: 'OK' }]);
           return;
        }
        // else{
        //    let address = this.state.deliveryAddress; //todo: do this or should just make a disapear? which better UX?
        //    if (!address.streetName || address.streetName == 'unknown' || !address.streetNumber || address.streetNumber == 'unknown'
        //    || !address.city || address.city == 'unknown' || !address.state || address.state == 'unknown' || !address.postal || address.postal == 'unknown') {
        //         Alert.alert('Warning', 'Pleas set a specific address for delivery', [{ text: 'OK' }]);
        //         return;
        //    }
        // }
        if(!this.state.shoppingCart || !this.state.shoppingCart[this.state.selectedTime] || Object.keys(this.state.shoppingCart[this.state.selectedTime]).length===0){
           Alert.alert('Warning','You do not have any item in shopping cart',[{ text: 'OK' }]);
           return;
        }
        //To handle the case when the eater step into the shop before latest order time but try to add after latest order time.
        if(commonWidget.alertWhenGracePeriodTimeOut(this.state.shoppingCart,this.state.scheduleMapping,this.state.selectedTime)){
           return;
        }
        this.setState({showProgress:true});
        var orderList = {};
        for (var cartItemKey in this.state.shoppingCart[this.state.selectedTime]) {
             var dishItem = this.state.shoppingCart[this.state.selectedTime][cartItemKey];
             orderList[cartItemKey] = { quantity: dishItem.quantity, price: dishItem.dish.price };
        }
        var orderQuote = {
            chefId: this.state.chefId,
            orderDeliverTime: this.deliverTimestamp,
            orderList: orderList,
            shippingAddress: this.state.deliveryAddress,
            couponCode:this.state.promotionCode,
        };
        var eaterId = this.state.eater ? this.state.eater.eaterId : null;
        return this.client.postWithoutAuth(config.priceQuoteEndpoint, {orderDetail:orderQuote, eaterId: eaterId})
        .then((response)=>{
            if(response.statusCode==200 || response.statusCode==202){
                if(response.data.result===true){
                    console.log(response.data.detail.orderQuote)
                    this.setState({quotedOrder:response.data.detail.orderQuote, priceIsConfirmed:true});
                }else{
                   console.log(response.data.detail);
                   let detailError = response.data.detail;
                   if(detailError.type==='NoAvailableDishQuantityException'){
                       Alert.alert('Warning', 'Oops, one or more ordered items in your shopping cart has just been sold out. Please update your shopping cart', [{ text: 'OK' }]);
                       this.handleDishNotAvailable(detailError.deliverTimestamp,  detailError.quantityFact);
                   }else if(detailError.type==='PaymentException'){
                       Alert.alert('Warning', 'Payment failed.' + detailError.message, [{ text: 'OK' }]);
                   }else if(detailError.type==='NoDeliveryRouteFoundException'){
                       Alert.alert('Warning', 'Delivery address is not reachable. ' + detailError.message, [{ text: 'OK' }]);
                   }else{
                       Alert.alert('Warning', 'Failed creating order. Please try again later.' [{ text: 'OK' }]);
                   }
                   this.setState({priceIsConfirmed:false});
                }
            }else if(response.statusCode==400){
                Alert.alert('Warning', 'Price quote failed. '+response.data, [{ text: 'OK' }]);
                this.setState({priceIsConfirmed:false});
            }else {
                Alert.alert('Warning', 'Price quote failed. Please make sure delivery location is reachable.', [{ text: 'OK' }]);
                this.setState({ priceIsConfirmed: false });
            }
            this.scrollToShowTotalPrice();
            this.setState({showProgress:false});
        }).catch((err)=>{
            this.setState({showProgress: false});
            commonAlert.networkError(err);
        });
    }

    handleDishNotAvailable(deliverTimestamp, quantityFact){
        let dishUnavailableSet = {};
        for(let fact of quantityFact){
            this.state.scheduleMapping[new Date(deliverTimestamp).toString()][fact.dishId].leftQuantity = fact.actualLeftQuantity - fact.orderQuantity;
            dishUnavailableSet[fact.dishId] = {
                actualLeftQuantity: fact.actualLeftQuantity
            };
        }
        let newShoppingCart = JSON.parse(JSON.stringify(this.state.shoppingCart));
        this.setState({priceIsConfirmed:false, dishUnavailableSet : dishUnavailableSet, dataSource:this.state.dataSource.cloneWithRows(newShoppingCart[this.state.selectedTime])});
    }

    async navigateToPaymentPage(){
        if(!this.state.priceIsConfirmed){
            return;
        }
        // if(!this.state.deliveryAddress){
        //     Alert.alert('Warning','You do not have a delivery address',[{ text: 'OK' }]);
        //     return;
        // }
        // if(!this.state.shoppingCart || Object.keys(this.state.shoppingCart).length==0){
        //     Alert.alert('Warning','You do not have any item in your shopping cart',[{ text: 'OK' }]);
        //     return;
        // }

        //To handle the case when the eater step into the shop before latest order time but try to add after latest order time.
        if(commonWidget.alertWhenGracePeriodTimeOut(this.state.shoppingCart,this.state.scheduleMapping,this.state.selectedTime)){
           return;
        }
        let eater = this.state.eater;
        if(!eater){
            eater = await AuthService.getEater();
        }
        if (!eater) {
            this.props.navigator.push({
                name: 'LoginPage',
                passProps: {
                    callback: function (eater) {
                        this.setState({ eater: eater });
                    }.bind(this)
                }
            });
            return;
        }

        if(!this.state.phoneNumber){
           this.setState({phoneNumber:eater.phoneNumber});
        }
        //todo: Best practise is not to get eater here but cache it somewhere, but have to ensure the cached user is indeed not expired.
        if(!this.state.phoneNumber){
            Alert.alert('Warning','Please add a phone number',[{ text: 'OK' }]);
            return;
        }
        if (this.state.phoneNumber && !validator.isMobilePhone(this.state.phoneNumber, 'en-US')) {
            Alert.alert('Error', 'Phone number is not valid', [{ text: 'OK' }]);
            return;
        }
        var orderList ={};
        for(var cartItemKey in this.state.shoppingCart[this.state.selectedTime]){
            var dishItem=this.state.shoppingCart[this.state.selectedTime][cartItemKey];
            orderList[cartItemKey]={quantity:dishItem.quantity, price:dishItem.dish.price};
        }
        var order = this.state.quotedOrder;
        order.quotedGrandTotal = this.state.quotedOrder.price.grandTotal;
        order.eaterId = eater.eaterId;
        order.notesToChef = this.state.notesToChef;
        order.phoneNumber = this.state.phoneNumber;
        console.log(order);
        this.props.navigator.push({
            name: 'PaymentPage',
            passProps:{
                orderDetail: order,
                eater: this.state.eater,
                context:this,
                shoppingCart:this.state.shoppingCart,
                selectedTime:this.state.selectedTime,
                scheduleMapping: this.state.scheduleMapping,
            }
        });
    }

    navigateBackToDishList(){
        if(this.state.deliveryAddress){
            for(var key in this.state.deliveryAddress){
                this.defaultDeliveryAddress[key] = this.state.deliveryAddress[key];
            }
        }

        if(this.state.dishUnavailableSet && Object.keys(this.state.dishUnavailableSet).length!=0){
            Alert.alert('Warning','You have invalid order currently. Your cart will be cleared if conitune go back',[{ text: 'OK', onPress:()=>{
                for(let dishId in this.state.dishUnavailableSet){
                    this.state.scheduleMapping[this.state.selectedTime][dishId].leftQuantity = this.state.dishUnavailableSet[dishId].actualLeftQuantity;
                }
                delete this.state.shoppingCart[this.state.selectedTime];
                this.props.navigator.pop();
                this.backCallback(this.state.totalPrice,this.state.notesToChef,this.state.promotionCode);
            }}, {text:'Cancel'}]);
            return;
        }

        this.props.navigator.pop();
        console.log(this.state.promotionCode);
        this.backCallback(this.state.totalPrice,this.state.notesToChef,this.state.promotionCode);
    }
}

var styleShoppingCartPage = StyleSheet.create({
    chefShopNameView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight/14.72,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
    },
    chefShopNameText:{
        color:'#FFCC33',
        fontSize:windowHeight/36.8,
        fontWeight:'500',
        marginTop:windowHeight/73.6,
    },
    deliverTimeView:{
        flexDirection:'row',
        justifyContent:'center',
        height:windowHeight/18.4,
    },
    deliverTimeText:{
        color:'#4A4A4A',
        fontSize:windowHeight/49.06,
        marginTop:windowHeight/73.6,
    },
    subtotalView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center'
    },
    notesToChefView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center'
    },
    commentBox:{
        alignSelf:'center',
        backgroundColor:'#F5F5F5',
        width:windowWidth*0.93,
        marginBottom:windowHeight*0.0224,
    },
    commentInput:{
        height:90,
        padding:windowHeight*0.0224,
        fontSize:14,
    },
    commentText:{
        padding:15,
        fontSize:14,
        color:'#4A4A4A',
    },
    submitCommentButton:{
        backgroundColor:'#FFCC33',
        height:windowHeight*0.058,
        justifyContent:'center',
    },
    submitCommentButtonText:{
        color:'#FFF',
        fontWeight:'bold',
        alignSelf:'center',
    },
    taxView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center',
    },
    promotionDeductionView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center',
    },
    deliveryFeeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingHorizontal:windowWidth/27.6,
        justifyContent:'center'
    },
    addressView:{
        marginLeft:windowWidth/9,
        flexDirection:'row',
        flex:1,
        paddingVertical:10,
        justifyContent:'flex-end'
    },
    phoneNumberInputView:{
        height:30,
        flexDirection:'row',
        borderColor:'#9B9B9B',
        backgroundColor:'#F5F5F5',
        borderWidth:0,
        borderRadius:5,
        marginTop:windowHeight/147.2,
        width:windowWidth*0.4,
    },
    phoneNumberInput:{
        paddingLeft:7,
        fontSize:14,
        color:'#4A4A4A',
        width:windowWidth*0.4,
    },
    promoCodeInput:{
        paddingLeft:3,
        fontSize:14,
        color:'#4A4A4A',
        width:windowWidth*0.5,
    },
    promotionCodeView:{
        flexDirection:'row',
        height:windowHeight/14.72,
        paddingLeft:windowWidth/27.6,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:'#F5F5F5',
        justifyContent:'center'
    },
    totalView:{
        flexDirection:'row',
        height:windowHeight/10,
        paddingHorizontal:windowWidth/27.6,
        paddingTop:windowHeight/20.0,
        borderColor:'#F5F5F5',
        justifyContent:'center',
        marginBottom:20,
    },
    totalPriceTitleText:{
        fontSize:windowHeight/36.8,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    totalPriceNumberText:{
        fontSize:windowHeight/36.66,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    addressTextView:{
        flex:0.57,
        flexDirection:'column',
    },
    addressLine:{
        color:'#4A4A4A',
        fontSize:windowHeight/49.06,
        marginTop:windowHeight/147.2,
    },
    addressChangeButtonWrapper:{
        width:windowWidth*0.34375,
        height:windowWidth*0.34375*3.0/13.0,
        borderColor:'#ffcc33',
        borderWidth:1,
        borderRadius:6,
        overflow: 'hidden',
        alignSelf:'flex-start',
        justifyContent:'center',
        marginRight:windowWidth*0.003,
    },
    addressChangeButtonText:{
        fontSize:windowHeight/49.06,
        color:'#ffcc33',
        fontWeight:'500',
        alignSelf:'center',
    },
    addressChangeButtonView:{
        flex:0.43,
        flexDirection:'column',
        justifyContent:'flex-start',
        alignItems:'flex-end',
    },
    ETAText:{
        fontSize:windowHeight/49.06,
        color:'#7BCBBE',
        fontWeight:'500',
        marginTop:10,
        flexWrap: 'wrap',
        flex:1,
    },
    ETATextView:{
        flex:1,
        width:windowWidth*8/9*0.43,
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'flex-start',
        paddingRight:windowWidth/27.6,
    },
    priceTitleView:{
        flex:1/2.0,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    couponTitleView:{
        flex:0.75,
        flexDirection:'row',
        alignItems:'flex-start',
        alignSelf:'center',
    },
    couponNumberView:{
        flex:0.25,
        alignItems:'flex-end',
        alignSelf:'center',
    },
    priceTitleText:{
        fontSize:windowHeight/40.89,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    priceNumberView:{
        flex:1/2.0,
        alignItems:'flex-end',
        alignSelf:'center',
    },
    priceNumberTopView:{
        flex:1/2.0,
        alignItems:'flex-end',
        //alignSelf:'center',
        marginTop: 46 * windowHeightRatio,
    },
    priceNumberBottomView:{
        flex:1/2.0,
        alignItems:'flex-end',
      //  alignSelf:'center',
      marginBottom: 46 * windowHeightRatio,
      marginTop: 20 * windowHeightRatio,
    },
    promotionCodeTitleView:{
        flex:0.375,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    showPromoCodeView:{
        flexDirection:'row',
        width:windowWidth*0.5,
        justifyContent:'center',
    },
    showPromoCodeText:{
        fontSize:windowHeight/47.33,
        color:'#9B9B9B',
        alignSelf:'center',
    },
    promoCodeInputView:{
        height:28,
        flexDirection:'row',
        borderColor:'#F2F2F2',
        backgroundColor:'#F5F5F5',
        borderWidth:0,
        borderRadius:5,
        flex:0.52,
        alignSelf:'center',
    },
    AddRemoveCouponButtonView:{
        flex:0.15,
        alignItems:'flex-end',
        alignSelf:'stretch',
        justifyContent:'center',
    },
    priceNumberText:{
        fontSize:windowHeight/33.45,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    oneListingView:{
        backgroundColor:'#FFFFFF',
        flexDirection:'row',
        flex:1,
    },
    dishPhoto:{
        width:windowWidth/2.76,
        height:windowWidth/2.76,
    },
    shoppingCartInfoView:{
        flex:1,
        height:windowWidth/2.76,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingVertical:windowHeight/73.6,
    },
    dishNamePriceView:{
        height:windowHeight/16.23,
        flexDirection:'row',
    },
    dishNameView:{
        flex:0.7,
        alignItems:'flex-start',
        flexDirection:'row',
    },
    dishNameText:{
        fontSize:windowHeight/40.89,
        fontWeight:'500',
        color:'#4A4A4A',
        flex: 1,
        flexWrap: 'wrap',
    },
    dishPriceView:{
        flex:0.3,
        alignItems:'flex-end',
    },
    dishPriceText:{
        fontSize:windowHeight/40.89,
        fontWeight:'600',
        color:'#9B9B9B',
    },
    dishIngredientView:{
        height:windowHeight*0.065,
    },
    dishIngredientText:{
        fontSize:windowHeight/47.33,
        color:'#9B9B9B',
    },
    actualQuantityView:{
        height:windowHeight*0.032,
    },
    actualQuantityText:{
        fontSize:windowHeight/47.33,
        color:'#FF6347',
    },
    quantityTotalPriceView:{
      //  flex:1,
        flexDirection:'row',
       backgroundColor: "#aaccaa",
      width: 155 * windowWidthRatio,
    },
    quantityView:{
        flex:0.6,
        flexDirection:'row',
    },
    totalPriceView:{
        flex:0.4,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'flex-end',
    },
    totalPriceText:{
        fontSize:windowHeight/33.45,
        fontWeight:'500',
        color:'#4A4A4A'
    },
    plusMinusIcon:{
        width: windowHeight/27.6,
        height: windowHeight/27.6,
    },
    plusMinusIconView:{
        flex:0.4,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        paddingLeft:7 * windowWidthRatio,
        paddingRight:7* windowWidthRatio,
    },
    quantityText:{
        fontSize:h3,
      //  fontWeight:'500',
        color:'#4A4A4A',
    },
    quantityTextView:{
        flex:0.2,
        justifyContent:'flex-end',
        alignItems:'center',
        flexDirection:'column',
        // marginLeft: 7* windowWidthRatio,
        // marginRight: 7* windowWidthRatio,
    },
    addPromoCodeIcon:{
        width: windowHeight/23.0,
        height: windowHeight/23.0,
        alignSelf:'center',
    },
    removePromoCodeIcon:{
        width: windowHeight/21.64,
        height: windowHeight/21.64,
        alignSelf:'center',
    },
    footerView:{
        flexDirection:'row',
        height:windowHeight*0.075,
    },
    getPriceButtonView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',
        justifyContent: 'center',
        backgroundColor:'#7BCBBE',
    },
    checkOutButtonView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',
        justifyContent: 'center',
        backgroundColor:'#FFCC33',
    },
    checkOutButtonGreyView:{
        width:windowWidth*0.5,
        flex:1,
        flexDirection:'row',
        justifyContent: 'center',
        backgroundColor:'#9B9B9B',
    },
    bottomButtonText:{
        fontSize:windowHeight/30.6,
        fontWeight:'400',
        color:'#fff',
        alignSelf:'center',
    },
    bottomButtonTextGreyed:{
        fontSize:windowHeight/30.6,
        fontWeight:'400',
        color:'#D5D5D5',
        alignSelf:'center',
    },


// new

    noteViewNew:{
        flexDirection:'row',
        //height:70 * windowHeightRatio,
        //paddingLeft:windowWidth/27.6,
        borderBottomWidth:1,
        borderColor:'#EAEAEA',
        justifyContent:'center',
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
    },

    notesToChefTitleViewNew:{
        flex:0.35,
        alignItems:'flex-start',
        alignSelf:'center',
        marginBottom: 20 * windowHeightRatio,
        marginTop: 20 * windowHeightRatio,
    },
    orderSummaryTextNew:{
      fontSize: h3,
      fontWeight:"bold",
      color:"#4A4A4A",
    },
    notesToChefTextView:{
        flex:0.5,
        alignItems:'flex-start',
        alignSelf:'center',
    },
    notesToChefText:{
        fontSize:windowHeight/47.33,
        color:'#979797',
        alignSelf:'center',
    },
    notesToChefButtonView:{
        flex:0.14,
        alignItems:'flex-end',
        alignSelf:'stretch',
        justifyContent:'center',
        paddingHorizontal:windowWidth/27.6,
    },
    viewTextNew:{
        fontSize: h2,
        color:'#7bcbbe',
        alignSelf:'center',
        // marginBottom: 20 * windowHeightRatio,
         marginTop: 30 * windowHeightRatio,
        height:60 * windowHeightRatio

      //  backgroundColor: "#aaaa00",
    },
    addAddressViewTextNew:{
        fontSize: h2,
        color:'#7bcbbe',
        alignSelf:'center',
        // marginBottom: 20 * windowHeightRatio,
         marginTop: 35 * windowHeightRatio,
        height:60 * windowHeightRatio

      //  backgroundColor: "#aaaa00",
    },

    okViewTextNew:{
        fontSize: h2,
        color:'#7bcbbe',
        alignSelf:'center',
        // marginBottom: 20 * windowHeightRatio,
         marginTop: 20 * windowHeightRatio,
        height:60 * windowHeightRatio

      //  backgroundColor: "#aaaa00",
    },

    deliverTimeViewNew:{
        flexDirection:'column',
        justifyContent:'center',
        //alignItems:'center',
        height:windowHeight*0.0974,
        backgroundColor:'#FFF3D1',
        marginRight: 20 * windowWidthRatio,
        marginLeft: 20 * windowWidthRatio,
        paddingLeft: 15 * windowWidthRatio,
        paddingRight : 15 * windowWidthRatio,
        marginBottom : 20 * windowWidthRatio,
    },

    deliverTimeTextNew:{
        color:'#4A4A4A',
        fontSize:windowHeight/51.64,
    },
    orderFromNameNew:{
        color:'#4A4A4A',
        fontWeight:'bold',
        fontSize:windowHeight/51.64,
    },
    oneListingViewNew:{
        backgroundColor:'#FFFFFF',
        flexDirection:'row',
        flex:1,
        borderColor:'#EAEAEA',
        //borderTopWidth:1,
        marginRight: 20 * windowWidthRatio,
        marginLeft:20 * windowWidthRatio,
        borderColor:"#EAEAEA",
        borderBottomWidth:1,
        paddingTop:10*windowHeightRatio,
    },
    dishPhotoNew:{
        width:162 * windowWidthRatio,
        height:112 * windowHeightRatio,
    },
    orderInfoViewNew:{
        flex:1,
        height: 112 * windowHeightRatio,
        flexDirection:'column',
        paddingLeft:10 * windowWidthRatio,
        //paddingRight:windowWidth/27.6,
        marginBottom: 10 * windowHeightRatio,
        paddingBottom: 10 * windowHeightRatio,
        position: "relative",
        //paddingVertical:windowHeight/73.6,
    },
    dishNameTextNew:{
        fontSize:h2,
        fontWeight:'bold',
        color:'#4A4A4A',
        height: 70*windowHeightRatio,
    },
    bottomViewNew: {
      position: "absolute",
      bottom:0,
    //  backgroundColor:"#000",
      right:0,
      left:0,
      flexDirection:'row',
      paddingLeft:10 * windowWidthRatio,
    },

    dishPriceTextNew:{
        fontSize:b1,
        fontWeight:'bold',
        color:'#4A4A4A',
    },

    quantityTextNew:{
        fontSize:h5,
        color:'#9B9B9B',
    },
    actualQuantityViewNew:{
        height:windowHeight*0.032,
    },



    quantityView2New:{
        //flex:1,
        flexDirection:'column',
      //  height : windowHeight*0.062,
      //  backgroundColor : "#ffaacc",
      // width: 170 * windowWidthRatio,
        alignItems:'flex-start',
        //left: 0 ,
    },

    quantityViewNew:{
        flex:1,
        flexDirection:'row',
        height : windowHeight*0.048,
      // backgroundColor : "#ccaacc",
        // width: 80 * windowWidthRatio,
        alignItems:'flex-end',
        //left: 0 ,
        right:0,
    },

    subtotalViewNew:{
        flexDirection:'row',
        //height:70 * windowHeightRatio,
        //paddingHorizontal:windowWidth/27.6,
        borderBottomWidth:1,
        borderColor:'#EAEAEA',
        justifyContent:'center',
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        marginBottom:24 * windowHeightRatio,
    },

    orderSummaryBoxBoldValueNew:{
        fontSize:h4,
        color:'#4A4A4A',
        marginRight: 15 * windowWidthRatio,
        fontWeight: "bold",
    },

    orderSummaryNew: {
      backgroundColor: "#F5F5F5",
      paddingLeft:20 * windowWidthRatio,
      height: 54 * windowHeightRatio,
      justifyContent: "center",
    },
    receiptTopBottomImageViewNew: {
        backgroundColor: "#F5F5F5",

    },
    receiptTopImageNew: {
      height:8 * windowHeightRatio,
      width: windowWidth - (20 * windowWidthRatio)*2,
      backgroundColor: "#F5F5F5",
     marginLeft:20 * windowWidthRatio,
     marginRight:20 * windowWidthRatio,
    },
    orderSummaryRowNew: {
      backgroundColor: "#F5F5F5",
      justifyContent: "center",

    },

    //*****

    orderSummaryBoxNew: {
        backgroundColor: "#FFFFFF",
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        flexDirection:'row',
        justifyContent:'center',
        //height: 65 * windowHeightRatio,
        // borderColor: "#EAEAEA",
        // borderBottomWidth: 3,
        width: windowWidth - (20 * windowWidthRatio)*2,
    },

    orderSummaryBoxTitleNew:{
        fontSize:h4,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginLeft: 15 * windowWidthRatio,
        marginTop:20 * windowHeightRatio,
        marginBottom: 20 * windowHeightRatio,

    },
    orderSummaryBoxTitleTopNew:{
        fontSize:h4,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginLeft: 15 * windowWidthRatio,
        marginTop:46 * windowHeightRatio,
        marginBottom: 20 * windowHeightRatio,

    },
    orderSummaryBoxTitleBottomNew:{
        fontSize:h4,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginLeft: 15 * windowWidthRatio,
        marginTop:20 * windowHeightRatio,
        marginBottom: 46 * windowHeightRatio,

    },

    orderSummaryBoxValueNew:{
        fontSize:h4,
        color:'#4A4A4A',
        marginRight: 15 * windowWidthRatio,
    },
    orderSummaryBoxValueAddressTopNew:{
        fontSize:h4,
        color:'#4A4A4A',
        marginRight: 15 * windowWidthRatio,
        marginTop:20 * windowHeightRatio,
    },
    orderSummaryBoxValueAddressBottomNew:{
        fontSize:h4,
        color:'#4A4A4A',
        marginRight: 15 * windowWidthRatio,
        marginBottom: 20 * windowHeightRatio,

    },


    addressMoreButtonTextNew:{
        fontSize:h4,
        color:'#7bcbbe',
        alignSelf:'center',
        paddingTop: 23* windowWidthRatio,
    },

    orderSummaryBoxValueAddressNew:{
        fontSize:h4,
        color:'#4A4A4A',
    },
    orderSummaryBoxViewAddressNew:{
        flex:1/2.0,
        alignItems:'flex-end',
        alignSelf:'center',

    },
    lineBackgroundNew: {
        backgroundColor: "#FFFFFF",
        marginLeft:20 * windowWidthRatio,
        marginRight:20 * windowWidthRatio,
        flexDirection:'row',
        justifyContent:'center',
    },

    lineNew: {
      backgroundColor: "#EAEAEA",
      height: 1,
      width:windowWidth - (35 * windowWidthRatio)*2,

    },
    receiptBottomImageNew: {
      height:8 * windowHeightRatio,
      width: windowWidth - (20 * windowWidthRatio)*2,
      backgroundColor: "#F5F5F5",
     marginLeft:20 * windowWidthRatio,
     marginRight:20 * windowWidthRatio,
     marginBottom: 30 * windowHeightRatio,
    },

    inputText: {fontSize:b2,
      color:"#4a4a4a",
      marginTop: 5 * windowHeightRatio,
      backgroundColor: "#EAEAEA",
      width:windowWidth - 40 * windowWidthRatio,
      height:34  * windowHeightRatio,
      paddingLeft: 15 * windowWidthRatio,
    },

    addressLineNew: {
      fontSize:b2,
      color:"#4a4a4a",
      width:windowWidth - 80 * windowWidthRatio
    }


});

module.exports = ShoppingCartPage;
