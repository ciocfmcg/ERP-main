import requests
from requests.auth import HTTPBasicAuth
#
appID = '12b548b775b158938ba68161a39a01a443343';
appSecret = '1862d87355a28680764175a978a7579b0';
#
# # curl -u <appid>:<app-secret> https://api.flipkart.net/oauth-service/oauth/token\?grant_type\=client_credentials\&scope=Seller_Api
#
res = requests.get( 'https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials' , auth=HTTPBasicAuth(appID, appSecret))
#
tokenS = res.json()['access_token']
print tokenS
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

print "---------------------"

# resSearch = requests.get( 'https://api.flipkart.net/sellers/v3/shipments/5da7da04-7f90-44b4-b08a-66c7d349cf9d' , headers = {"Authorization" : "Bearer " + token} )
# resSearch = requests.get( 'https://api.flipkart.net/sellers/orders/search?orderIds=', data =filtr , headers = {"Authorization" : "Bearer " + token} )
#


# print resSearch
# # # print resSearch.text
# print resSearch.json()
#
# with open('metadata.pdf', 'wb') as f:
#     f.write(resSearch.content)
#
# a = b

#
# # curl -H"Authorization:Bearer <token>"-H"Content-Type: application/json" -d '{"filter" :{}}'https://sandbox-api.flipkart.net/sellers/orders/search
#
#

from flipkartFolder import FlipkartAPI, Authentication
import requests


ERPServer = 'http://192.168.1.109:8000'

import time, threading

orderIds = []

def fetchAndCheck():
    try:
        auth = Authentication(appID, appSecret, sandbox=False)
        token = auth.get_token_from_client_credentials()

        flipkart = FlipkartAPI(token['access_token'], sandbox=False, debug=False)
        orders = flipkart.search_orders(filters={'states': ['Approved']} , page_size=20)

        # dataToSend =[]

        for o in orders:
            print str(o.attributes['orderId'])
            orderIds.append(o.attributes['orderId'])
            # print o.get_label()

            # requests.post(ERPServer + '/api/POS/externalEmailOrders/' , data = {"sku" : str(o.attributes['sku']) , "orderId" : str(o.attributes['orderId']) ,  "quantity" : str(o.attributes['quantity']) , "price" : str(o.attributes['price']) })
        for oi in orderIds:
            print oi
            resSearch = requests.get( 'https://api.flipkart.net/sellers/v3/shipments?orderIds=' + str(oi) , headers = {"Authorization" : "Bearer " + tokenS} )

            print resSearch
            # # print resSearch.text
            for s in resSearch.json()['shipments']:
                # print "shipmenet id : " , s['shipmentId']
                resSearch = requests.get( 'https://api.flipkart.net/sellers/v3/shipments/' + s['shipmentId'] , headers = {"Authorization" : "Bearer " + tokenS} )
                # print resSearch

                for ss in resSearch.json()['shipments']:
                    print ss['buyerDetails']
                    print ss['billingAddress']['contactNumber']

                    requests.post(ERPServer + '/api/marketing/contactsScraped/' , data = {"name" : ss['buyerDetails']['firstName'] + ' ' + ss['buyerDetails']['lastName'] , "mobile" : ss['billingAddress']['contactNumber'] , "pincode" : ss['billingAddress']['pinCode'] , "source" : "skinstore" , "tag" : "skin care products"})
    except:
        pass




def foo():
    print(time.ctime())
    while True:
        fetchAndCheck()
        time.sleep(300)

if __name__ == '__main__':
    # fetchAndCheck()
    foo()
