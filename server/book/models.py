from django.db import models
    
class Invoice(models.Model):
    order = models.OneToOneField('account.Order', on_delete=models.CASCADE)
    receiptnumber = models.IntegerField()
    amountpaid = models.IntegerField()
    paymentmethod = models.CharField(default='Online', max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

