from django.db import models

class Book(models.Model):
    seller = models.ForeignKey('account.Seller', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    price = models.IntegerField()
    cover = models.FileField(upload_to='book_covers/')
    totalsold = models.IntegerField()
    totalavailable = models.IntegerField()
    genre = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)
    
class Invoice(models.Model):
    order = models.OneToOneField('account.Order', on_delete=models.CASCADE)
    receiptnumber = models.IntegerField()
    amountpaid = models.IntegerField()
    paymentmethod = models.CharField(default='Online', max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

