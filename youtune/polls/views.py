# Create your views here.
# to je dejansko controler, pac tle se imenuje views,
# tukej handlas vse podatke/zahteve/itd,/http
# zahteve/pripravis podatke na izris
# tukej hanlas http zahtevo in vrnes http odgovor, za zahtevan url,
# vrnes stran,
# ce strani ni, django avtomatsko sam vrne 404.html, ki mu ga pa MORS
# prpravt kot template, kaksna bo oblika msg-ja


from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. You're at the poll index.")
