from django.contrib import admin
from . models import Book, Invoice

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'seller', 'title', 'author', 'created_at', 'cover', 'updated_at')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'receiptnumber', 'amountpaid', 'paymentmethod', 'created_at')

    