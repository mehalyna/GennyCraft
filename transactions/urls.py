from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'transactions'

router = DefaultRouter()
router.register('', views.TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
