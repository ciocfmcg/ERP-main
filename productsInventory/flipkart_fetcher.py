# import requests
# from requests.auth import HTTPBasicAuth
#
appID = '12b548b775b158938ba68161a39a01a443343';
appSecret = '1862d87355a28680764175a978a7579b0';
#
# # curl -u <appid>:<app-secret> https://api.flipkart.net/oauth-service/oauth/token\?grant_type\=client_credentials\&scope=Seller_Api
#
# res = requests.get( 'https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials' , auth=HTTPBasicAuth(appID, appSecret))
#
# token = res.json()['access_token']
# print token
#
# filtr = {
#   "filter": {
#   },
#   "pagination": {
#     "pageSize": "int"
#   },
#   "sort": {
#     "field": "dispatchByDate",
#     "order": "asc"
#   }
# }
#
# # resSearch = requests.get( 'https://api.flipkart.net/sellers/v2/orders?orderItemIds=OD212304533368615000,OD212305853029385000' , headers = {"Authorization" : "Bearer " + token} )
# resSearch = requests.get( 'https://api.flipkart.net/sellers/orders/search', data =filtr , headers = {"Authorization" : "Bearer " + token} )
#
# print resSearch
# print resSearch.text
# print resSearch.json()
#
# # curl -H"Authorization:Bearer <token>"-H"Content-Type: application/json" -d '{"filter" :{}}'https://sandbox-api.flipkart.net/sellers/orders/search
#
#

from flipkart import FlipkartAPI, Authentication
import requests

ERPServer = 'http://skinstore.monomerce.com:9001'

import time, threading


def fetchAndCheck():
    try:
        auth = Authentication(appID, appSecret, sandbox=False)
        token = auth.get_token_from_client_credentials()

        flipkart = FlipkartAPI(token['access_token'], sandbox=False, debug=False)
        orders = flipkart.search_orders(filters={'states': ['Approved']} , page_size=20)

        # dataToSend =[]

        for o in orders:
            print o.attributes['sku']
            print o.attributes['orderId']
            print o.attributes['quantity']
            print o.attributes
            print o.attributes['price']
            requests.post(ERPServer + '/api/POS/externalEmailOrders/' , data = {"sku" : str(o.attributes['sku']) , "orderId" : str(o.attributes['orderId']) ,  "quantity" : str(o.attributes['quantity']) , "price" : str(o.attributes['price']) })
    except:
        pass

def foo():
    print(time.ctime())
    while True:
        time.sleep(300)
        fetchAndCheck()

if __name__ == '__main__':
    foo()
