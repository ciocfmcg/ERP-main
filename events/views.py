from django.shortcuts import render
from .models import Event, Subscription
# Create your views here.
def eventHome(request):
    evnt = Event.objects.filter(active = True)[0]
    contactPerson = evnt.contactPerson
    adrs = evnt.venue
    print evnt
    return render(request , 'indexEvent.html', {'event': evnt, 'contact' : contactPerson , 'address' : adrs})

def subscribe(request):
    if request.method == 'POST':
        name = request.POST["name"]
        email = request.POST["email"]
        phone = request.POST["phone"]
        # evnt = Event.objects.get(pk = int(request.POST["event"]))
        # subs = Subscription(name = name , email = email , phone = phone, event = evnt)
        subs = Subscription(name = name , email = email , phone = phone)
        try:
            subs.comments = request.POST["comments"]
        except:
            pass
        subs.active = True
        subs.save()
    return render(request , 'thankyou.html')
