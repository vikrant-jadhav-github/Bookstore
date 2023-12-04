from django.http import QueryDict
import requests
from rest_framework.response import Response
from rest_framework import status
from account.models import Seller
from account.serializers import SellerSerializer
from .serializers import BookSerializer, SerializeBook
from rest_framework.views import APIView
from .models import Book
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.parsers import MultiPartParser, FormParser

mircoUrl = 'http://13.126.195.107:3000'

class IsAuthenticatedOrReadOnly(IsAuthenticated):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        return super().has_permission(request, view)

class BookView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    def post(self, request):
        
        user = request.user

        try:
            seller = Seller.objects.get(user=user)
        except Seller.DoesNotExist:
            return Response({'status': 'error', 'message': 'Seller not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.role == 'Buyer':
            return Response({'status': 'error', 'message': 'Buyer cannot create book'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.POST.copy() 
        data['seller'] = seller.id

        files = {
            'cover': request.FILES.get('cover')
        }

        try:
            microserviceresponse = requests.post(mircoUrl+'/create', data=data, files=files)
            microserviceresponse.raise_for_status()
            return Response(microserviceresponse.json(), status=status.HTTP_200_OK)
        except requests.RequestException as e:
            return Response({'status': 'error', 'message': f'Microservice request failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, pk):
        print("HELLO")
        user = request.user
        if user.role == 'Buyer':
            return Response({'status': 'error', 'message' : 'Buyer cannot update book'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.POST.copy() 
        
        files = {
            'cover': request.FILES.get('cover')
        }

        try:
            microserviceresponse = requests.put(mircoUrl+"/update/"+str(pk), data=data, files=files)
            microserviceresponse.raise_for_status()
            return Response(microserviceresponse.json(), status=status.HTTP_200_OK)
        except requests.RequestException as e:
            return Response({'status': 'error', 'message': f'Microservice request failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, pk):
        print("HELLO")
        user = request.user
        if user.role == 'Buyer':
            return Response({'status': 'error', 'message' : 'Buyer cannot delete book'}, status=status.HTTP_400_BAD_REQUEST)
        microserviceresponse = requests.delete(mircoUrl+'/delete/'+str(pk))
        return Response(microserviceresponse.json(), status=status.HTTP_200_OK)
    
    def get(self, request, pk=None):
        
        if pk is not None:
            microserviceresponse = requests.get(mircoUrl+'/'+str(pk))
            return Response(microserviceresponse.json(), status=status.HTTP_200_OK)

        query_params = request.query_params

        title = query_params.get('title', '').strip()
        author = query_params.get('author', '').strip()
        genre = query_params.get('genre', '').strip()

        if title or author or genre:
            microserviceresponse = requests.get(mircoUrl+'/search?title='+title+'&author='+author+'&genre='+genre)
            return Response(microserviceresponse.json(), status=status.HTTP_200_OK)

        microserviceresponse = requests.get(mircoUrl+'/')
        return Response(microserviceresponse.json(), status=status.HTTP_200_OK)

class BookSeller(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'Buyer':
            return Response({'status': 'error', 'message' : 'Buyer cannot fetch books'}, status=status.HTTP_400_BAD_REQUEST)
        seller = Seller.objects.get(user=user)
        microserviceresponse = requests.get(mircoUrl+'/sellerbooks/'+str(seller.id))
        return Response(microserviceresponse.json(), status=status.HTTP_200_OK)
    