import re
regex = re.compile('^HTTP_')

class simple_middleware(object):
    def process_request(self, request):
        print dict((regex.sub('', header), value) for (header, value)
               in request.META.items() if header.startswith('HTTP_'))
        return None
