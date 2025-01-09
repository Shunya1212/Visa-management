from django.contrib import admin
from .models import StudentInfo,User,Reservation,Schedule,RequestLetter,UserProfile,Transaction
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserChangeForm, CustomUserCreationForm
from django.http import HttpResponse
# from .views import send_request_letter_email,send_van_reservation_email
from django.core.mail import EmailMessage
from .models import UserProfile,Transaction
from django.shortcuts import render, redirect
from django import forms
from datetime import date

class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('username', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )
    search_fields = ('username',)
    ordering = ('username',)
    filter_horizontal = ()

@admin.register(Reservation)
class ReservasionAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'is_available')
    list_filter = ('date', 'is_available')
    search_fields = ('student__student_id',)

class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('date', 'is_reservable')  # 管理画面で表示するフィールド
    list_editable = ('is_reservable',)        # リストから直接編集可能なフィールド
    list_filter = ('is_reservable',)          # フィルタリングオプションを追加
    search_fields = ('date',)                 # 検索フィールドを追加

    def changelist_view(self, request, extra_context=None):
    # """
    # 管理画面のリフレッシュ時に過去のデータを更新
    # """
        from .models import Schedule
        Schedule.update_past_reservable()
        return super().changelist_view(request, extra_context)

class RequestLetterAdmin(admin.ModelAdmin):
    list_display = ('student', 'is_requested','complete_date','is_completed')  # 管理画面で表示するフィールド
    # list_editable = ('is_completed','complete_date')        # リストから直接編集可能なフィールド
    list_filter = ('student',)          # フィルタリングオプションを追加
    search_fields = ('is_requested',)                 # 検索フィールドを追加

    def save_model(self, request, obj, form, change):
        print("save_model was called")  # ログ1
        if 'complete_date' in form.changed_data:
            print(f"Preparing to call send_request_letter_email for student ID: {obj.student.student_id}")  # ログ2
            try:
                print("Attempting to fetch student info...")
                student_info = StudentInfo.objects.get(student_id=obj.student.student_id)
                print(f"Student Info found: {student_info}")
            except StudentInfo.DoesNotExist:
                print("Student not found.")
                # return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

            print("Setting up email details...")
            email_address = student_info.email
            if not email_address:
                print("Email address is missing.")
                # return Response({'message': 'Email address not provided for the student'}, status=status.HTTP_400_BAD_REQUEST)

            mail_subject = 'Request Letter complete date Notification'
            message = f"""
            Dear {student_info.first_name} {student_info.last_name},

            Your requested letter complete date has been confirmed. Here are the details:
            - Visa extension letter complete Date: {obj.complete_date}
            - Pick up location : IAC office / 2nd floor of building 7
            - Requested by: {student_info.first_name} {student_info.last_name}
            
            Please contact us if there are any changes or further questions.

            Best regards,
            IAC Administration
            """ 
            from_email = "non-reply@IAC.jp"
            to_email = email_address

            try:
                print("Attempting to send email...")
                send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
                send_result = send_email.send()
                print(f"Email send result: {send_result}")
                if send_result == 0:
                    print("Failed to send email.")
                    # return Response({'message': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                print("Email sent successfully.")
            except Exception as e:
                print(f"Error during email sending: {e}")
                # return Response({'message': f'Error sending email: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if 'is_completed' in form.changed_data:
            try:
                print("Attempting to fetch student info...")
                student_info = StudentInfo.objects.get(student_id=obj.student.student_id)
                print(f"Student Info found: {student_info}")
            except StudentInfo.DoesNotExist:
                print("Student not found.")
                # return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

            print("Setting up email details...")
            email_address = student_info.email
            if not email_address:
                print("Email address is missing.")
                # return Response({'message': 'Email address not provided for the student'}, status=status.HTTP_400_BAD_REQUEST)

            mail_subject = 'Request Letter has completed'
            message = f"""
            Dear {student_info.first_name} {student_info.last_name},

            Your requested letter has completed and you may now come to pick it up at IAC office. 
            - Pick up location : IAC office / 2nd floor of building 7
            - Requested by: {student_info.first_name} {student_info.last_name}
            
            Please contact us if there are any changes or further questions.

            Best regards,
            IAC Administration
            """ 
            from_email = "non-reply@IAC.jp"
            to_email = email_address

            try:
                print("Attempting to send email...")
                send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
                send_result = send_email.send()
                print(f"Email send result: {send_result}")
                if send_result == 0:
                    print("Failed to send email.")
                    # return Response({'message': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                print("Email sent successfully.")
            except Exception as e:
                print(f"Error during email sending: {e}")
                # return Response({'message': f'Error sending email: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class BalanceUpdateForm(forms.Form):
    account_number = forms.CharField(max_length=20, label='Account Number')
    amount = forms.DecimalField(decimal_places=2, max_digits=10, label='Amount to Deduct')

    
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'balance', 'deposit_amount', 'name', 'visa_extension_status', 'report_status')
    list_filter = ('account_number', 'balance', 'deposit_amount', 'name', 'visa_extension_status', 'report_status')
    search_fields = ('account_number', 'name')
    
    # 入金フィールドを編集可能にする
    fieldsets = (
        (None, {
            'fields': ('account_number', 'balance', 'deposit_amount', 'name', 'visa_extension_status', 'report_status')
        }),
    )

class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user','transaction_date','service','amount','is_deposit')
    list_filter = ('user','transaction_date','amount','service','is_deposit')
    search_fields = ('user','transaction_date','amount','service') 

class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0  # 新しい取引を追加するフォームの数

admin.site.register(Schedule, ScheduleAdmin)    
admin.site.register(User,UserAdmin)
admin.site.register(StudentInfo)
admin.site.register(RequestLetter,RequestLetterAdmin)
admin.site.register(UserProfile,UserProfileAdmin)
admin.site.register(Transaction,TransactionAdmin)