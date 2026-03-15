from django.urls import path

from . import views

app_name = 'reports'

urlpatterns = [
    path('summary/', views.summary, name='summary'),
    path('category-breakdown/', views.category_breakdown, name='category-breakdown'),
    path('trends/', views.trends, name='trends'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
