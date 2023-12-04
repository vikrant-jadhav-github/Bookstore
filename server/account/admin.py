from django.contrib import admin
from .models import User, PhoneNumber, Buyer, Seller, Order

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id','email', 'avatar', 'role', 'name', 'created_at', 'updated_at')

@admin.register(PhoneNumber)
class PhoneNumberAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'phone_number', 'created_at', 'updated_at')

@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'city', 'state', 'country', 'landmark', 'created_at', 'updated_at')

@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'storename', 'totalproductsold', 'created_at', 'updated_at')

@admin.register(Order)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ('id','buyer', 'seller', 'book', 'address', 'status', 'quantity', 'created_at', 'updated_at')