from django.contrib import admin
from django.test import SimpleTestCase
from django.urls import include, reverse, resolve
from book import views as bookview
from account import views as accountview

class TestUrls(SimpleTestCase):
    
    def test_bookapi_url_is_resolved(self):
        url = reverse('bookapi')
        self.assertEqual(resolve(url).func.view_class, bookview.BookView)

    def test_login_url_is_resolved(self):
        url = reverse('login')
        self.assertEqual(resolve(url).func.view_class, accountview.Login)

    def test_register_url_is_resolved(self):
        url = reverse('register')
        self.assertEqual(resolve(url).func.view_class, accountview.Register)

    def test_profile_url_is_resolved(self):
        url = reverse('profile')
        self.assertEqual(resolve(url).func.view_class, accountview.Profile)

    def test_update_url_is_resolved(self):
        url = reverse('update')
        self.assertEqual(resolve(url).func.view_class, accountview.UpdateUser)

    def test_delete_url_is_resolved(self):
        url = reverse('delete')
        self.assertEqual(resolve(url).func.view_class, accountview.DeleteUser)

    def test_order_url_is_resolved(self):
        url = reverse('order')
        self.assertEqual(resolve(url).func.view_class, accountview.OrderView)

    def test_bill_url_is_resolved(self):
        url = reverse('bill', kwargs={'pk': 1})
        self.assertEqual(resolve(url).func.view_class, accountview.GenerateBill)