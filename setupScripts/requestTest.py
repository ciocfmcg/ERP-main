import requests


# domain = "pradeepyadav.net"
domain = "127.0.0.1:8000"

csrf = "To3IoORNjW83pUxb4HXrj6cR8Zm6bL08HJ2cTc9NDAtn2k4sduURFgg7SitjvLcG"
session = "5jti9lhjlckts4wk7uvnzenu79bjk8en"

url = "http://" +domain+ "/api/HR/users/1/"

jar = requests.cookies.RequestsCookieJar()
jar.set('sessionid', session, domain=domain, path='/')
jar.set('csrftoken', csrf, domain=domain, path='/')

headerName = "X-CSRFToken"

headers = {headerName: csrf }

r = requests.patch(url , data = {'oldPassword':'indiaerp','password': 'indiaerp'}, cookies = jar , headers = headers)
print r.text

"""

"""
