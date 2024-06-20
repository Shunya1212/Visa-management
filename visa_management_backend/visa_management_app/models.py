from django.conf import settings
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser,PermissionsMixin
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils.translation import gettext_lazy as _
import uuid
from django.core.exceptions import ValidationError


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None):
        if not username:
            raise ValueError('username is required')

        user = self.model(
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password):
        user = self.create_user(
            username=username,
            password=password
        )

        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=128, unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        "Checks if the user has a specific permission."
        return super().has_perm(perm, obj=obj)

    def has_module_perms(self, app_label):
        "Checks if the user has permissions to view the app `app_label`."
        return super().has_module_perms(app_label)


class StudentInfo(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female')
    )

    TRANSPORTATION_CHOICES = (
        ('AIR', 'Airplane'),
        ('SEA', 'Sea'),
        ('LAND', 'Land'),
    )

    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50)
    student_id = models.CharField(max_length=20, unique=True)
    address_no = models.CharField(max_length=100)
    road = models.CharField(max_length=100, blank=True)
    tambol = models.CharField(max_length=100)
    amphoe = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    nationality = models.CharField(max_length=50)
    birthday = models.DateField()
    place_of_birth = models.CharField(max_length=100)
    sex = models.CharField(max_length=1, choices=GENDER_CHOICES)
    passport_number = models.CharField(max_length=9)
    passport_issue_date = models.DateField()
    passport_issue_place = models.CharField(max_length=100)
    passport_expiration_date = models.DateField()
    visa_expire_date = models.DateField()
    arrival_transportation_type = models.CharField(max_length=4, choices=TRANSPORTATION_CHOICES)
    arrival_from = models.CharField(max_length=100)
    port_of_arrival = models.CharField(max_length=100)
    arrival_date = models.DateField()
    tm6_no = models.CharField(max_length=20, blank=True)  # TM6番号はオプションで空白を許可
    report_90_days_date = models.DateField(null=True, blank=True)  # 90日レポート日はオプション
    user = models.OneToOneField(User, on_delete=models.CASCADE)   

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"
    
class Reservation(models.Model):
    student = models.ForeignKey(StudentInfo, on_delete=models.CASCADE)
    date = models.DateField()
    is_available = models.BooleanField(default=True)
    reservation_number = models.IntegerField(null=True, blank=True)

    def clean(self):
        if Reservation.objects.filter(student=self.student, date=self.date).exists():
            raise ValidationError('この生徒は既にこの日に予約を持っています。')

    def save(self, *args, **kwargs):
        if not self.reservation_number:
            # 現存する最後の予約番号を取得
            last_reservation = Reservation.objects.all().order_by('reservation_number').last()
            if last_reservation and last_reservation.reservation_number:
                self.reservation_number = last_reservation.reservation_number + 1
            else:
                # 予約がまだない場合は0から始める
                self.reservation_number = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.student_id} - {self.date}"

class Schedule(models.Model):
    date = models.DateField(unique=True)
    is_reservable = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.date} - {'Reservable' if self.is_reservable else 'Not reservable'}"    

class RequestLetter(models.Model):
    student = models.ForeignKey(StudentInfo, on_delete=models.CASCADE)
    is_requested = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    complete_date = models.DateField(null=True, blank=True)        