from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from book.models import Invoice
from book.serializers import BookSerializer, InvoiceSerializer
from .serializers import OrderSerializer, SerializeOrder, UserRegistrationSerializer, UserLoginSerializer, BuyerSerializer, SellerSerializer
from .models import Order, User, Buyer, Seller, Book
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from reportlab.pdfgen import canvas
import random
from django.db import transaction
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle


def generate_receipt_number(length=8):
    receipt_number = ''.join(random.choice('0123456789') for _ in range(length))

    return receipt_number


def getToken(User):
    genToken = RefreshToken.for_user(User)
    return {
        'refresh': str(genToken),
        'access': str(genToken.access_token)
    }

class Register(APIView):
    def post(self, request):

        userdata = request.data['userdata']
        roledata = request.data['roledata']
        buyer = True if userdata['role'] == 'Buyer' else False

        userdata['avatar'] = "https://api.dicebear.com/6.x/pixel-art/svg?seed=" + userdata['name']

        userserialize = UserRegistrationSerializer(data=userdata)
        roleserializer = None

        if userserialize.is_valid(raise_exception=True):

            if buyer:
                roleserializer = BuyerSerializer(data=roledata)
            else:
                roleserializer = SellerSerializer(data=roledata)

            if roleserializer.is_valid(raise_exception=True):
                user = userserialize.save()
                roleserializer.validated_data['user'] = user
                roleserializer.save()
                token = getToken(user)
                return Response({'token' : token, 'status': 'ok', 'message' : 'User created successfully', 'user' : userserialize.data}, status=status.HTTP_200_OK)
        
        return Response(userserialize.errors, status=status.HTTP_401_UNAUTHORIZED)
    
class Login(APIView):
    def post(self, request):
        serialize = UserLoginSerializer(data=request.data)
        serialize.is_valid(raise_exception=True)
        email = serialize.data.get('email')
        password = serialize.data.get('password')
        user = authenticate(email=email, password=password)
        if user:
            token = getToken(user)
            userserializer = UserRegistrationSerializer(user)
            return Response({'token' : token, 'status': 'ok', 'message' : 'User logged in successfully', 'user' : userserializer.data}, status=status.HTTP_200_OK)
        return Response({'status': 'error', 'message' : 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
class Profile(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if user.role == 'Buyer':
            buyer = Buyer.objects.get(user=user)
            serializer = BuyerSerializer(buyer)
            return Response({'status': 'ok', 'message' : 'User profile fetched successfully', 'data' : serializer.data}, status=status.HTTP_200_OK)
        else:
            seller = Seller.objects.get(user=user)
            serializer = SellerSerializer(seller)
            return Response({'status': 'ok', 'message' : 'User profile fetched successfully', 'data' : serializer.data}, status=status.HTTP_200_OK)
        
class UpdateUserViaRole(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        if user.role == 'Buyer':
            buyer = Buyer.objects.get(user=user)
            serializer = BuyerSerializer(buyer, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'ok', 'message' : 'User updated successfully', 'data' : serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            seller = Seller.objects.get(user=user)
            serializer = SellerSerializer(seller, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'ok', 'message' : 'User updated successfully', 'data' : serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateUser(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        if user.role == 'Buyer':
            buyer = Buyer.objects.get(user=user)
            buyerSerializer = BuyerSerializer(buyer, data=request.data['roledata'], partial=True)
            userSerializer = UserRegistrationSerializer(user, data=request.data['userdata'], partial=True)
            if buyerSerializer.is_valid() and userSerializer.is_valid():
                userSerializer.save()
                buyerSerializer.save()
                return Response({'status': 'ok', 'message' : 'User updated successfully', 'data' : userSerializer.data}, status=status.HTTP_200_OK)
            return Response(buyerSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            seller = Seller.objects.get(user=user)
            sellerSerializer = SellerSerializer(seller, data=request.data['roledata'], partial=True)
            userSerializer = UserRegistrationSerializer(user, data=request.data['userdata'], partial=True)
            if sellerSerializer.is_valid() and userSerializer.is_valid():
                userSerializer.save()
                sellerSerializer.save()
                return Response({'status': 'ok', 'message' : 'User updated successfully', 'data' : userSerializer.data}, status=status.HTTP_200_OK)
            return Response(sellerSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class DeleteUser(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'status': 'ok', 'message' : 'User deleted successfully'}, status=status.HTTP_200_OK)
    
class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        buyer = Buyer.objects.get(user=user)
        orders = Order.objects.filter(buyer=buyer)
        serializer = SerializeOrder(orders, many=True)
        return Response({'status': 'ok', 'message' : 'Orders fetched successfully', 'data' : serializer.data}, status=status.HTTP_200_OK)
        
    def post(self, request):
        user = request.user
        jsondata = request.data

        sellerid = jsondata['seller']
        bookid = jsondata['book']

        if user.role == 'Seller':
            return Response({'status': 'error', 'message': 'Seller cannot place an order'}, status=status.HTTP_400_BAD_REQUEST)

        buyer = Buyer.objects.get(user=user)
        book = Book.objects.get(pk=bookid)
        seller = Seller.objects.get(pk=sellerid)

        # Use a database transaction to ensure data consistency
        with transaction.atomic():
            seller.totalproductsold += 1
            seller.save()

            book.totalsold += jsondata['quantity']
            book.totalavailable -= jsondata['quantity']
            book.save()

            jsondata['buyer'] = buyer.id
            jsondata['seller'] = seller.id
            jsondata['book'] = book.id
            jsondata['totalamount'] = book.price * jsondata['quantity']


            serializer = OrderSerializer(data=jsondata)
            if serializer.is_valid():
                print("HELLO")
                orderdata = serializer.save()

                invoicedata = {
                    'order': orderdata.id,
                    'receiptnumber': generate_receipt_number(),
                    'amountpaid': orderdata.totalamount,
                }

                invoice_serializer = InvoiceSerializer(data=invoicedata)
                if invoice_serializer.is_valid():
                    invoice_serializer.save()
                    return Response({'status': 'ok', 'message': 'Order placed successfully', 'data': serializer.data, 'invoice': invoice_serializer.data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        user = request.user
        jsondata = request.data
        if user.role == 'Seller':
            return Response({'status': 'error', 'message' : 'Seller cannot update order'}, status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.get(pk=pk)

        if 'quantity' in jsondata:
           book = order.book
           print(book.totalavailable,book.totalsold)
           jsondata['totalamount'] = jsondata['quantity'] * order.book.price 
           if jsondata['quantity'] > order.book.totalavailable:
               return Response({'status': 'error', 'message' : 'Quantity not available'}, status=status.HTTP_400_BAD_REQUEST)
           if jsondata['quantity'] > order.quantity:
               diff = jsondata['quantity'] - order.quantity
               book.totalsold += diff
               book.totalavailable -= diff
               book.save()
           if jsondata['quantity'] < order.quantity:
               diff = order.quantity - jsondata['quantity']
               book.totalsold -= diff
               book.totalavailable += diff
               book.save()

        serializer = OrderSerializer(order, data=jsondata, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'ok', 'message' : 'Order updated successfully', 'data' : serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        user = request.user
        if user.role == 'Seller':
            return Response({'status': 'error', 'message' : 'Seller cannot delete order'}, status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.get(pk=pk)
        order.delete()
        return Response({'status': 'ok', 'message' : 'Order deleted successfully'}, status=status.HTTP_200_OK)
    
class GenerateBill(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
            
            user = request.user

            if user.role == 'Seller':
                return Response({'status': 'error', 'message' : 'Seller cannot generate bill'}, status=status.HTTP_400_BAD_REQUEST)

            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="bill.pdf"'

            p = SimpleDocTemplate(response, pagesize=letter)

            invoicedata = Invoice.objects.get(pk=pk)
            orderdata = Order.objects.get(id=invoicedata.order.pk)

            table_data = [
                ["Receipt Number", str(invoicedata.receiptnumber)],
                ["Amount Paid", "$" + str(invoicedata.amountpaid)],
                ["Date", str(invoicedata.created_at.strftime('%Y-%m-%d'))],
                ["Name", str(orderdata.buyer.user.name)],
                ["Book Title", str(orderdata.book.title)],
                ["Author", str(orderdata.book.author)],
                ["Genre", str(orderdata.book.genre)],
                ["Sold By", str(orderdata.seller.user.name)],
                ["Quantity", str(orderdata.quantity)],
                ["Price", "$" + str(orderdata.book.price)],
                ["Address", str(orderdata.address)],
                ["Status", "Dispatched"],
            ]

            table = Table(table_data, colWidths=[200, 200], rowHeights=30)

            style = TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.white),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black), 
            ])
            table.setStyle(style)

            title = "Book Purchase Invoice"
            title_style = TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 14),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ])
            title_table = Table([[title]])
            title_table.setStyle(title_style)

            elements = [title_table, table]
            p.build(elements)
            return response