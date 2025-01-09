from django.conf import settings
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser,PermissionsMixin
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils.translation import gettext_lazy as _
import uuid
from django.core.exceptions import ValidationError
from datetime import date
from datetime import datetime
from django.utils.timezone import now
import io
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
# from reportlab.lib.pagesizes import letter
from django.db import transaction
import calendar
from django.shortcuts import render
from django.http import FileResponse
from reportlab.pdfgen import canvas
from django.contrib.auth import authenticate,logout,login
from django.core.mail import EmailMessage

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

class UserProfile(models.Model):
    account_number = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    name = models.CharField(max_length=100)
    visa_extension_status = models.BooleanField(default=False)
    report_status = models.BooleanField(default=False)
    # student_info = models.OneToOneField(StudentInfo, on_delete=models.CASCADE, null=True, blank=True)

    # 入金フィールド
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name
    
    def increase_balance(self):
        if self.deposit_amount > 0:
            deposit = self.deposit_amount
            self.balance += self.deposit_amount  # 入金額をbalanceに加算
            self.deposit_amount = 0  # 入金後、deposit_amountをリセット
            # 取引を保存
            self.record_transaction(deposit)

    def pay_token(self,amount):
        # account_number = self.account_number
        amount = int(amount)
        if self.balance > amount:
            with transaction.atomic():
                self.balance -= amount  # 残高からトークンを減算
                self.save()  # データベースに保存

                if amount == 50:
                    Transaction.objects.create(
                        user=self,
                        amount=amount,
                        service="Visa extension",  # 出金（支払い）として記録,
                        is_deposit=False
                    )
                    # 既存のUserProfileのステータスを更新
                    self.visa_extension_status = True
                    self.save()  # データベースに保存
                else :
                    Transaction.objects.create(
                        user=self,
                        amount=amount,
                        service="90 days",  # 出金（支払い）として記録,
                        is_deposit=False
                    )
                    # 既存のUserProfileのステータスを更新
                    self.report_status = True
                    self.save()  # データベースに保存
                    
    # saveメソッドをオーバーライドして、deposit_amountをbalanceに加算し、取引を記録
    def save(self, *args, **kwargs):
        self.increase_balance()
        super(UserProfile, self).save(*args, **kwargs)

    # 取引履歴を保存するメソッド
    def record_transaction(self, amount):
        transaction = Transaction(
            user=self,
            amount=amount,
            service=Transaction.Deposit_from_IAC,  # サービス選択がない場合
            is_deposit=True  # 入金のためis_deposit=True
        )
        transaction.save()

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

    # id = AutoField
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50)
    student_id = models.CharField(max_length=20, unique=True)
    address_no = models.CharField(max_length=100, blank=True)
    road = models.CharField(max_length=100, blank=True)
    tambol = models.CharField(max_length=100, blank=True)
    amphoe = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=100, blank=True)
    nationality = models.CharField(max_length=50, blank=True)
    birthday = models.DateField(blank=True, null=True)
    place_of_birth = models.CharField(max_length=100, blank=True)
    sex = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    passport_number = models.CharField(max_length=9, blank=True)
    passport_issue_date = models.DateField(blank=True, null=True)
    passport_issue_place = models.CharField(max_length=100, blank=True)
    passport_expiration_date = models.DateField(blank=True, null=True)
    visa_expire_date = models.DateField(blank=True, null=True)
    arrival_transportation_type = models.CharField(max_length=4, choices=TRANSPORTATION_CHOICES, blank=True, null=True)
    arrival_from = models.CharField(max_length=100, blank=True)
    port_of_arrival = models.CharField(max_length=100, blank=True)
    arrival_date = models.DateField(blank=True, null=True)
    tm6_no = models.CharField(max_length=20, blank=True)
    report_90_days_date = models.DateField(null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    account = models.OneToOneField(UserProfile, on_delete=models.CASCADE,null=True)
    email = models.EmailField(max_length=254, unique=True, null=True, blank=True)

    # @property
    # def fullname(self):
    #     return f"{self.first_name} {self.last_name}"
    
    @property
    def is_visa_expired(self):
        # return self.visa_expire_date < datetime.now()
        return self.visa_expire_date and self.visa_expire_date < now().date()

    def generate(self):
        print("generate function is called in model.py")
        print("selected self.first_name = ",self.first_name)
        output_pdf = PdfWriter()
        with open("visa_management_app/resources/TM7.pdf", "rb") as infile:
            template_pdf = PdfReader(infile)
        print(template_pdf.pages)
        print("PDF file is opened")
        if len(template_pdf.pages) > 0:
            print("if loop entered")
            birthday = self.birthday
            print(type(birthday))
            today = datetime.today()
            age = today.year - birthday.year
            if (today.month, today.day) < (birthday.month, birthday.day):
                age  -= 1    
            print("age is succesfully calculated")
            packet_first = io.BytesIO()
            can_first = canvas.Canvas(packet_first, pagesize=A4)
            can_first.drawString(440, 705, "Phuket")
            can_first.drawString(267, 575, self.last_name)
            can_first.drawString(437, 575, self.first_name)
            can_first.drawString(295, 539, str(age))
            can_first.drawString(366, 539, str(self.birthday.day))
            can_first.drawString(428, 539, str(self.birthday.month))
            can_first.drawString(518, 539, str(self.birthday.year))
            can_first.drawString(142, 504, self.place_of_birth)
            can_first.drawString(450, 504, self.nationality)
            can_first.drawString(305, 470, self.passport_number)
            can_first.drawString(487, 470, str(self.passport_issue_date.day))
            can_first.drawString(99, 437, str(self.passport_issue_date.month))
            can_first.drawString(205, 437, str(self.passport_issue_date.year))
            can_first.drawString(335, 437, self.passport_issue_place)
            can_first.drawString(487, 437, str(self.passport_expiration_date.day))
            can_first.drawString(99, 401, str(self.passport_expiration_date.month))
            can_first.drawString(205, 401, str(self.passport_expiration_date.year))
            can_first.drawString(327, 401, "Non-Immigrant ED")
            can_first.drawString(174, 366, self.arrival_transportation_type)
            can_first.drawString(340, 366, self.arrival_from)
            can_first.drawString(142, 332, self.port_of_arrival)
            can_first.drawString(332, 332, str(self.arrival_date.day))
            can_first.drawString(403, 332, str(self.arrival_date.month))
            can_first.drawString(507, 332, str(self.arrival_date.year))
            can_first.drawString(263, 297, self.tm6_no)
            can_first.drawString(450, 262, "365")
            can_first.drawString(428, 246, "365")
            can_first.drawString(156, 195, "Study at Prince of Songkla University")
            can_first.save()

            packet_first.seek(0)
            new_pdf_first = PdfReader(packet_first)
            first_page = template_pdf.pages[0]
            first_page.merge_page(new_pdf_first.pages[0])
            output_pdf.add_page(first_page)

            packet_first.close()
        
        print("1st page is succesfully generated")
        # Process the second page if it exists
        if len(template_pdf.pages) > 1:
            packet_second = io.BytesIO()
            can_second = canvas.Canvas(packet_second, pagesize=A4)
            can_second.drawString(170, 755, self.address_no)
            can_second.drawString(250, 755, self.road)
            can_second.drawString(300, 755, self.tambol)
            can_second.drawString(378, 755, self.amphoe)
            can_second.drawString(472, 755, self.province)
            can_second.drawString(215, 715, self.first_name)
            can_second.drawString(245, 715, self.last_name)
            can_second.drawString(150, 677, self.address_no)
            can_second.drawString(250, 677, self.road)
            can_second.drawString(410, 677, self.tambol)
            can_second.drawString(139, 639, self.amphoe)
            can_second.drawString(385, 639, self.province)
            can_second.save()

            packet_second.seek(0)
            new_pdf_second = PdfReader(packet_second)
            second_page = template_pdf.pages[1]
            second_page.merge_page(new_pdf_second.pages[0])
            output_pdf.add_page(second_page)

            packet_second.close()

        print("Page is filled")    
        # Add remaining pages without modification
        for page_num in range(2, len(template_pdf.pages)):
            output_pdf.add_page(template_pdf.pages[page_num])

        buffer = io.BytesIO()
        output_pdf.write(buffer)
        buffer.seek(0)
        return buffer
        # FileResponse(buffer, as_attachment=True, filename='TM7_filled.pdf')

    # def login_student(self,username,password):
    #     username = username
    #     password = password

    #     user = authenticate(username=username, password=password)
    #     login(user)

    def logout_student(request):
        logout(request) 

    def send_token_paid_for_extension_email(self):
        email_address = self.email
        mail_subject = 'Your Payment and Status Notification'
        message = f"""
        Dear {self.first_name} {self.last_name},

        Your payment for Visa Extension service is now completed and status has changed. Here are the details:
        - Status: Visa extension service ON
        - Description: IAC will prepare all documents without any request before your visa extension date and you can just wait them to remind the date to go.
        
        Please contact us if there are any changes or further questions.

        Best regards,
        IAC Administration
        """ 
        from_email = "non-reply@IAC.jp"
        to_email = email_address

        # メール送信処理
        send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
        send_email.send()

    def send_token_paid_for_90days_email(self):
        email_address = self.email
        mail_subject = 'Your Payment and Status Notification'
        message = f"""
        Dear {self.first_name} {self.last_name},

        Your payment for 90 days report service is now completed and status has changed. Here are the details:
        - Status: 90 days report service ON
        - Description: IAC will request your passport before 90 days report submission date and IAC will bring the passport to submit the 90 days report for you.
        
        Please contact us if there are any changes or further questions.

        Best regards,
        IAC Administration
        """ 
        from_email = "non-reply@IAC.jp"
        to_email = email_address

        # メール送信処理
        send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
        send_email.send()   

    def send_extension_warn_email(self):
        emai_addres = self.email

        mail_subject = 'Visa Expiration Notification'

        message = "Dear student\nYour visa will be expire in next 30 days.\nPlease go to http://localhost:3000/ and follow the steps to prepare your visa extension."

        from_email = "<non-reply@IAC.jp>"
        to_email = emai_addres
        send_email = EmailMessage(mail_subject, message,from_email=from_email, to=[to_email])
        send_email.send()       
        
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"
    
# def send_van_reservation_email(self):
#     try:
#         # 該当する学生情報のインスタンスを取得
#         student_info = StudentInfo.objects.get(student_id=student_id)
#     except StudentInfo.DoesNotExist:
#         return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
#     try:
#         # 最新の予約情報を取得
#         reservation = Reservation.objects.filter(student=student_info).latest('date')
#     except Reservation.DoesNotExist:
#         return Response({'message': 'No reservation found for this student'}, status=status.HTTP_404_NOT_FOUND)

#     # メールアドレスとメール内容の設定
#     email_address = student_info.email
#     mail_subject = 'Van Reservation Notification'
#     message = f"""
#     Dear {student_info.first_name} {student_info.last_name},

#     Your van reservation has been confirmed. Here are the details:
#     - Reservation Date: {reservation.date}
#     - Reservation Number: {reservation.reservation_number}
#     - Reservation time: 9:00 AM
#     - Location : Front of building 7
#     - Reserved By: {student_info.first_name} {student_info.last_name}
    
#     Please contact us if there are any changes or further questions.

#     Best regards,
#     IAC Administration
#     """ 
#     from_email = "non-reply@IAC.jp"
#     to_email = email_address

#     # メール送信処理
#     send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
#     send_email.send()
    
class Reservation(models.Model):
    student = models.ForeignKey(StudentInfo, on_delete=models.CASCADE)
    date = models.DateField()
    is_available = models.BooleanField(default=True)
    reservation_number = models.IntegerField(null=True, blank=True)

    # def clean(self):
    #     if Reservation.objects.filter(student=self.student, date=self.date).exists():
    #         raise ValidationError('この生徒は既にこの日に予約を持っています。')

    def save(self, *args, **kwargs):

        if Reservation.objects.filter(student=self.student, date=self.date).exists():
            raise ValidationError('この生徒は既にこの日に予約を持っています。')

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

    # def save(self, *args, **kwargs):
    #     # 今日以前の日付の場合、is_reservableをFalseに設定
    #     if self.date < date.today():
    #         self.is_reservable = False
    #     # 親クラスのsaveメソッドを呼び出して保存処理を実行
    #     super().save(*args, **kwargs)

    @classmethod
    def update_past_reservable(cls):
        cls.objects.filter(date__lt=date.today(), is_reservable=True).update(is_reservable=False) 
        
        # """
        # 今日以前のis_reservableをFalseに設定
        # """


    def __str__(self):
        return f"{self.date} - {'Reservable' if self.is_reservable else 'Not reservable'}"    

class RequestLetter(models.Model):
    student = models.ForeignKey(StudentInfo, on_delete=models.CASCADE)
    is_requested = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    complete_date = models.DateField(null=True, blank=True) 

    def save(self, *args, **kwargs):
        if RequestLetter.objects.filter(student=self.student, is_requested=self.is_requested).exists():
            raise ValidationError('この生徒は既にリクエストしています。')
        super().save(*args, **kwargs)       

# class UserProfile(models.Model):
#     account_number = models.CharField(max_length=20)
#     balance = models.DecimalField(max_digits=10, decimal_places=2)
#     name = models.CharField(max_length=100)
#     visa_extension_status = models.BooleanField(default=False)
#     report_status = models.BooleanField(default=False)
#     student_info = models.OneToOneField(StudentInfo, on_delete=models.CASCADE, null=True, blank=True)

#     # 入金フィールド
#     deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

#     def __str__(self):
#         return self.name

#     # saveメソッドをオーバーライドして、deposit_amountをbalanceに加算し、取引を記録
#     def save(self, *args, **kwargs):
#         if self.deposit_amount > 0:
#             deposit = self.deposit_amount
#             self.balance += self.deposit_amount  # 入金額をbalanceに加算
#             self.deposit_amount = 0  # 入金後、deposit_amountをリセット
#             # 取引を保存
#             self.record_transaction(deposit)
#         super(UserProfile, self).save(*args, **kwargs)

#     # 取引履歴を保存するメソッド
#     def record_transaction(self, amount):
#         transaction = Transaction(
#             user=self,
#             amount=amount,
#             service=Transaction.Deposit_from_IAC,  # サービス選択がない場合
#             is_deposit=True  # 入金のためis_deposit=True
#         )
#         transaction.save()

# class UserProfile(models.Model):
#     account_number = models.CharField(max_length=20)
#     balance = models.DecimalField(max_digits=10, decimal_places=2)
#     name = models.CharField(max_length=100)
#     visa_extension_status = models.BooleanField(default=False) 
#     report_status = models.BooleanField(default=False) 
#     student_info = models.OneToOneField(StudentInfo, on_delete=models.CASCADE, null=True, blank=True)

#     deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

#     def __str__(self):
#             return self.name

#         # saveメソッドをオーバーライドして、deposit_amountをbalanceに加算
#     def save(self, *args, **kwargs):
#         if self.deposit_amount > 0:                self.balance += self.deposit_amount  # 入金額をbalanceに加算
#         self.deposit_amount = 0  # 入金後、deposit_amountをリセット
#         super(UserProfile, self).save(*args, **kwargs)
        
#     def record_transaction(self, amount):
#         # Transactionの作成
#         transaction = Transaction(
#             user=self,
#             amount=amount,
#             service=Transaction.No_Selection,  # サービス選択がない場合
#             is_deposit=True  # 入金のためis_deposit=True
#         )
#         transaction.save()        

class Transaction(models.Model):
    Visa_Extension = 'Visa-extension'
    Report_Submission = '90-days-report'
    No_Selection = "No-Selection"
    Deposit_from_IAC = "Deposit-from-IAC"

    Service_Choise = [
        (Visa_Extension, 'Visa Extension'),
        (Report_Submission, 'Report Submission'),
        (No_Selection, 'No Selection'),
        (Deposit_from_IAC,'Deposit-from-IAC')
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    transaction_date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    service = models.CharField(max_length=20, choices=Service_Choise,default=No_Selection, blank=True)
    is_deposit = models.BooleanField(default=True)  # True for deposit, False for withdrawal    

    