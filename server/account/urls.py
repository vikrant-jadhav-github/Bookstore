from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.Register.as_view(), name='register'),
    path('login/', views.Login.as_view(), name='login'),
    path('profile/', views.Profile.as_view(), name='profile'),
    path('updateonrole/', views.UpdateUserViaRole.as_view(), name='update'),
    path('updateuser/', views.UpdateUser.as_view(), name='update'),
    path('delete/', views.DeleteUser.as_view(), name='delete'),
    path('order/', views.OrderView.as_view(), name='order'),
    path('order/<int:pk>/', views.OrderView.as_view(), name='order'),
    path('bill/<int:pk>/', views.GenerateBill.as_view(), name='bill'),
]