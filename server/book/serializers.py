from rest_framework import serializers
from account.models import Seller, User
from .models import Book, Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['order', 'receiptnumber', 'amountpaid']