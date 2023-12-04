from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework import serializers
from account.models import User, Buyer, Seller, Order
from book.models import Book
from book.serializers import BookSerializer, SerializeSeller

class UserRegistrationSerializer(serializers.ModelSerializer):
  # We are writing this becoz we need confirm password field in our Registratin Request
  password2 = serializers.CharField(style={'input_type':'password'}, write_only=True)
  class Meta:
    model = User
    fields=['email', 'name', 'password', 'password2', 'role', 'avatar']
    extra_kwargs={
      'password':{'write_only':True}
    }

  # Validating Password and Confirm Password while Registration
  def validate(self, attrs):
    password = attrs.get('password')
    password2 = attrs.get('password2')
    if password != password2:
      raise serializers.ValidationError("Password and Confirm Password doesn't match")
    return attrs

  def create(self, validate_data):
    return User.objects.create_user(**validate_data)

class BuyerSerializer(serializers.ModelSerializer):
  user = UserRegistrationSerializer(required=False)
  class Meta:
    model = Buyer
    fields = ['user','city','state','country','landmark']

class SellerSerializer(serializers.ModelSerializer):
  user = UserRegistrationSerializer(required=False)
  class Meta:
    model = Seller
    fields = ['user','storename','totalproductsold']
  
class UserLoginSerializer(serializers.ModelSerializer):
  email = serializers.EmailField(max_length=255)
  class Meta:
    model = User
    fields = ['email', 'password']

class SerializeOrder(serializers.ModelSerializer):
  seller = SerializeSeller()
  book = BookSerializer()
  buyer = BuyerSerializer()

  class Meta:
    model = Order
    fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
  class Meta:
    model = Order
    fields = ['buyer', 'seller', 'book', 'address','quantity', 'totalamount']