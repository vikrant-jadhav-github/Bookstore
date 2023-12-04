from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser
from book.models import Book

#  Custom User Manager
class UserManager(BaseUserManager):
  def create_user(self, email, avatar, name, role, password=None, password2=None):
      if not email:
          raise ValueError('User must have an email address')

      user = self.model(
          email=self.normalize_email(email),
          name=name,
          role=role,
          avatar=avatar
      )

      user.set_password(password)
      user.save(using=self._db)
      return user

  def create_superuser(self, email, name, password=None, role="Admin", avatar="https://api.dicebear.com/6.x/pixel-art/svg?seed=admin"):
      user = self.create_user(
          email,
          password=password,
          name=name,
          role=role,
          avatar=avatar
      )
      user.is_admin = True
      user.save(using=self._db)
      return user

#  Custom User Model
class User(AbstractBaseUser):
  email = models.EmailField(
      verbose_name='Email',
      max_length=255,
      unique=True,
  )
  name = models.CharField(max_length=200)
  role = models.CharField(max_length=100)
  avatar = models.CharField(max_length=100)
  is_active = models.BooleanField(default=True)
  is_admin = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  objects = UserManager()

  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = ['name']

  def __str__(self):
      return self.email

  def has_perm(self, perm, obj=None):
      return self.is_admin

  def has_module_perms(self, app_label):
      return True

  @property
  def is_staff(self):
      return self.is_admin
  
class PhoneNumber(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  phone_number = models.CharField(max_length=50)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

class Buyer(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  city = models.CharField(max_length=100)
  state = models.CharField(max_length=100)
  country = models.CharField(max_length=100)
  landmark = models.CharField(max_length=100)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return str(self.id)

class Seller(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  storename = models.CharField(max_length=100)
  totalproductsold = models.IntegerField(default=0)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return str(self.id)

class Order(models.Model):
  buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE)
  seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
  book = models.ForeignKey(Book, on_delete=models.CASCADE)
  address = models.CharField(max_length=100)
  status = models.BooleanField(default=True)
  quantity = models.IntegerField()
  totalamount = models.IntegerField()
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return str(self.id)