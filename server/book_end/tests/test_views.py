from django.test import TestCase
from django.urls import reverse
from account.models import Buyer, Seller, User, Book
from rest_framework_simplejwt.tokens import RefreshToken
import json
from django.core.files.uploadedfile import SimpleUploadedFile

class TestViews(TestCase):

    def setUp(self):
        self.buyer = User.objects.create_user(name='testuser', email='testuser@gmail.com', password='testpassword', password2='testpassword', role='Buyer', avatar='https://api.dicebear.com/6.x/pixel-art/svg?seed=testuser')
        self.seller = User.objects.create_user(name='testuser', email='test2user@gmail.com', password='testpassword', password2='testpassword', role='Seller', avatar='https://api.dicebear.com/6.x/pixel-art/svg?seed=testuser')
        self.buyerinst = Buyer.objects.create(user=self.buyer, city='Dewas', state='M.P', country='India', landmark='Awas Nagar')
        self.sellerinst = Seller.objects.create(user=self.seller, storename='teststore', totalproductsold=311)
        
        file_content = b'This is the content of the file.'
        file = SimpleUploadedFile('test_file.txt', file_content, content_type='text/plain')

        self.book = Book.objects.create(
            title='Test Book',
            author='Test Author',
            price=10,
            cover=file,
            seller=self.sellerinst,
            totalsold=10,
            totalavailable=10,
            genre='Test Genre'
        )

        refresh1 = RefreshToken.for_user(self.buyer)
        refresh2 = RefreshToken.for_user(self.seller)
        self.seller_access_token = str(refresh2.access_token)
        self.buyer_access_token = str(refresh1.access_token)

    def test_register_view(self):
        url = reverse('register')
        data = {
        "userdata" : {
            "email" : "vikrant@gmail.com",
            "name" : "vikrant",
            "password" : 1234,
            "password2" : 1234,
            "role" : "Buyer"
        },
        "roledata" : {
            "city" : "Dewas",
            "state" : "M.P",
            "country" : "India",
            "landmark" : "Awas Nagar"
        }
    }
        response = self.client.post(url, data = json.dumps(data), content_type = 'application/json')
        self.assertEqual(response.status_code, 200)

    def test_login_view(self):
        url = reverse('login')
        data = {
        "email" : "vikrant@gmail.com",
        "password" : 1234
    }
        response = self.client.post(url, data = json.dumps(data), content_type = 'application/json')
        self.assertEqual(response.status_code, 201)

    def test_profile_view(self):
        url = reverse('profile')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.buyer_access_token}'}
        response = self.client.get(url, **headers)
        self.assertEqual(response.status_code, 200)

    def test_updaterole_view(self):
        url = reverse('updateonrole')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.seller_access_token}'}
        response = self.client.put(url, {
            "storename" : "teststore22",
            "totalproductsold" : 3132,
        }, **headers, content_type = 'application/json')
        self.assertEqual(response.status_code, 200)

    def test_delete_view(self):
        url = reverse('delete')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.buyer_access_token}'}
        response = self.client.delete(url, **headers)
        self.assertEqual(response.status_code, 200)

    def test_create_order_view(self):
        url = reverse('order')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.buyer_access_token}'}
        response = self.client.post(url, {
            "bookid" : 1,
            "quantity" : 1,
            "seller" : self.sellerinst.id,
            "book" : self.book.id
        }, **headers, content_type = 'application/json')
        self.assertEqual(response.status_code, 200)

    def test_get_orders_view(self):
        url = reverse('order')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.buyer_access_token}'}
        response = self.client.get(url, **headers)
        self.assertEqual(response.status_code, 200)