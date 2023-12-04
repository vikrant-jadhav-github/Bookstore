from django.urls import path
from . import views

urlpatterns = [
    path('bookapi/<int:pk>', views.BookView.as_view()),
    path('bookapi/', views.BookView.as_view()),
    path('bookapi/seller/', views.BookSeller.as_view()),
]