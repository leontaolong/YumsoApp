module.exports={
    
    baseUrl: 'http://172.31.98.111:8080',
    email:'xihe@yumso.com',
    password:'123',
    googleGeoBaseUrl: 'https://maps.googleapis.com',
    reverseGeoCoding:'/maps/api/geocode/json?latlng=',
    authEndpointEmail:'/api/v1/auth/authenticateByEmail/eater',
    createOrderEndpoint:'/api/v1/chef/order/createOrder',
    orderHistoryEndpoint:'/api/v1/chef/order/eaterOrders/',
    orderCommentEndpoint:'/api/v1/chef/order/eaterComments/',
    leaveEaterCommentEndpoint:'/api/v1/chef/order/leaveEaterComment/',
    getOneChefEndpoint:'/api/v1/eater/chef/',
    getOneEaterEndpoint:'/api/v1/eater/',
    chefList: '/api/v1/eater/chefs'
}