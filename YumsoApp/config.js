module.exports={
    
    baseUrl: 'http://192.168.1.134:8080',
    email:'xihe@yumso.com',
    password:'123',
    googleApiName:'yumsoIOS	',
    googleApiKey:'AIzaSyBQdKxM-ZRQ2r95bkQLPlY10joKJeC6slw',
    googleGeoBaseUrl: 'https://maps.googleapis.com',
    reverseGeoCoding:'/maps/api/geocode/json?latlng=',
    searchAddress:'/maps/api/geocode/json?address=',
    authEndpointEmail:'/api/v1/auth/authenticateByEmail/eater',
    createOrderEndpoint:'/api/v1/chef/order/createOrder',
    orderHistoryEndpoint:'/api/v1/chef/order/eaterOrders/',
    orderCommentEndpoint:'/api/v1/chef/order/eaterComments/',
    leaveEaterCommentEndpoint:'/api/v1/chef/order/leaveEaterComment/',
    chefListEndpoint: '/api/v1/eater/chefs',
    chefCommentsEndpoint:'/api/v1/chef/order/chefComments/',
    
}