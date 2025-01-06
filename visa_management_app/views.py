# views.py

import datetime
from django.shortcuts import render
from .models import StudentInfo,Reservation,Schedule,RequestLetter,UserProfile, Transaction
from rest_framework import viewsets
from .serializers import StudentInfoSerializer,ReservationSerializer,Reservable_datesSerializer,RequestVisaExtensionSerializer,UserProfileSerializer, TransactionSerializer
from django.contrib.auth import logout, authenticate,login
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib import auth
from django.http import JsonResponse
from django.views.decorators.http import require_POST,require_http_methods
from django.contrib.admin.views.decorators import staff_member_required
from django.http import FileResponse, HttpResponseBadRequest
import io
from django.db import transaction
import calendar
from datetime import datetime
from datetime import date
from django.views import View
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
# from PyPDF2 import PdfFileReader, PdfFileWriter
from PyPDF2 import PdfReader, PdfWriter
import os
import json
from django.core.exceptions import ValidationError
from django.conf import settings
from reportlab.lib.pagesizes import A4
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from django.core.mail import EmailMessage
from django.views.generic.detail import DetailView
from rest_framework import generics

class Reservable_datesViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = Reservable_datesSerializer

# class ReservableView(generics.CreateAPIView):
#     queryset = Reservation.objects.all()
#     serializer = Reservable_datesSerializer

class StudentInfoViewSet(viewsets.ModelViewSet):
    queryset = StudentInfo.objects.all()
    serializer_class = StudentInfoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student_id']
    lookup_field = 'student_id'

# GET /StudentInfo/ -> list
# GET /StudentInfo/?student=....
# GET /StudentInfo/<student_id>/ -> one

   
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student__student_id'] 

class RequestVisaExtensionViewSet(viewsets.ModelViewSet):
    queryset = RequestLetter.objects.all()
    serializer_class = RequestVisaExtensionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student__student_id'] 

class UserProfileViewSet(generics.RetrieveAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'account_number'

# class UserProfileViewSet(APIView):
#     def get(self, request, account_number):
#         user = UserProfile.objects.get(account_number=account_number)
#         serializer = UserProfileSerializer(user)
#         return Response(serializer.data)

# class TransactionViewSet(APIView):
#     def get(self, request, account_number):
#         user = UserProfile.objects.get(account_number=account_number)
#         transactions = Transaction.objects.filter(user=user)
#         serializer = TransactionSerializer(transactions, many=True)
#         return Response(serializer.data)

# GET /transaction/
# GET /transaction/<id>/

class TransactionView(viewsets.ReadOnlyModelViewSet):
    quesryset = Transaction.objects.all()
    serializer = TransactionSerializer

# # generic is for create retrieve update delete
class UserProfileView(generics.RetrieveAPIView):
    queryset = UserProfile.objects.all()
    serializer = UserProfileSerializer
    lookup_field = 'account_number'

# class ReservationCreateView(generics.CreateAPIView):
#     queryset = Reservation.objects.all()
#     serializer_class = ReservationSerializer

# class RequestVisaExtensionView(generics.CreateAPIView):
#     # def get(self,student_id):
#     #     student = StudentInfo.objects.get(student_id=student_id)
        
#     queryset = RequestLetter.objects.all() 
#     serializer_class = RequestVisaExtensionSerializer

class RequestVisaExtensionView(generics.CreateAPIView):
    queryset = RequestLetter.objects.all()
    serializer_class = RequestVisaExtensionSerializer

    # def get(self, request, student_id):
    #     student = StudentInfo.objects.get(student_id=student_id)

    # def post(self, request,*args, **kwargs):
    #     return self.create(request, *args, **kwargs)

# class UpdateView(generics.UpdateAPIView):
#     queryset = StudentInfo.objects.all()
#     serializer = StudentInfoSerializer()  

# # apiview is completely free, can do anything you want apart from crud
# class Test(APIView):
#     def get(self, request, *args, **kwargs):
#         student_info = StudentInfo.objects.get(...)
#         result = generate_pdf(....)
#         return Response(data={'status': "success"})

class GeneratePDFView(APIView):
    def get(self,request,student_id):
        student = StudentInfo.objects.get(student_id=student_id)
        try:
            print("Generate PDF is called")
            attachment = student.generate()
            print("returned attachment : ",attachment)
            return FileResponse(attachment, as_attachment=True, filename='TM7_filled.pdf')
            # return Response({"message": "PDF generated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            print("ee => ", e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class SendEmailExtensionWarn(APIView):
    def get(self, request,student_id):
        student = StudentInfo.objects.get(student_id=student_id)
        try:
            student.send_extension_warn_email()
            return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SendTokenPaid90DaysEmail(APIView):
    def get(self, request,student_id):
        student = StudentInfo.objects.get(student_id=student_id)
        try:
            student.send_token_paid_for_90days_email()
            return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SendEmailExtensionNotification(APIView):
    def get(self, request,student_id):
        student = StudentInfo.objects.get(student_id=student_id)
        try:
            student.send_token_paid_for_extension_email()
            return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ScheduleView(APIView):
    def get(self, request):
        schedule = Schedule.objects.get()
        try:
            date_list = schedule.search_reservable_date()
            context = {'date_list': date_list}
            render(request, 'admin/visa_management_app/schedule_change_list.html', context)

            return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class LoginStudent(APIView):
#     def post(self,request):
#         student = StudentInfo.objects.get()  
#         username = request.data.get('username')
#         password = request.data.get('password')
         
#         try: 
#             student.login_student(username,password)
#             return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class LogoutStudent(APIView):
    def get(self,request):
        try:
            StudentInfo.logout_student(request)
            return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# def GeneratePDF(request, student_id):
#     try:
#         student_info = StudentInfo.objects.get(student_id=student_id)
#     except StudentInfo.DoesNotExist:
#         return HttpResponseBadRequest("Student not found.")

#     output_pdf = PdfWriter()

#     with open("visa_management_app/resources/TM7.pdf", "rb") as infile:
#         template_pdf = PdfReader(infile)
            
#         if len(template_pdf.pages) > 0:
#             birthday = student_info.birthday
#             today = date.today()
#             age = today.year - birthday.year
#             if (today.month, today.day) < (birthday.month, birthday.day):
#                 age  -= 1    
#             packet_first = io.BytesIO()
#             can_first = canvas.Canvas(packet_first, pagesize=A4)
#             can_first.drawString(440, 705, "Phuket")
#             can_first.drawString(267, 575, student_info.last_name)
#             can_first.drawString(437, 575, student_info.first_name)
#             can_first.drawString(295, 539, str(age))
#             can_first.drawString(366, 539, str(student_info.birthday.day))
#             can_first.drawString(428, 539, str(student_info.birthday.month))
#             can_first.drawString(518, 539, str(student_info.birthday.year))
#             can_first.drawString(142, 504, student_info.place_of_birth)
#             can_first.drawString(450, 504, student_info.nationality)
#             can_first.drawString(305, 470, student_info.passport_number)
#             can_first.drawString(487, 470, str(student_info.passport_issue_date.day))
#             can_first.drawString(99, 437, str(student_info.passport_issue_date.month))
#             can_first.drawString(205, 437, str(student_info.passport_issue_date.year))
#             can_first.drawString(335, 437, student_info.passport_issue_place)
#             can_first.drawString(487, 437, str(student_info.passport_expiration_date.day))
#             can_first.drawString(99, 401, str(student_info.passport_expiration_date.month))
#             can_first.drawString(205, 401, str(student_info.passport_expiration_date.year))
#             can_first.drawString(327, 401, "Non-Immigrant ED")
#             can_first.drawString(174, 366, student_info.arrival_transportation_type)
#             can_first.drawString(340, 366, student_info.arrival_from)
#             can_first.drawString(142, 332, student_info.port_of_arrival)
#             can_first.drawString(332, 332, str(student_info.arrival_date.day))
#             can_first.drawString(403, 332, str(student_info.arrival_date.month))
#             can_first.drawString(507, 332, str(student_info.arrival_date.year))
#             can_first.drawString(263, 297, student_info.tm6_no)
#             can_first.drawString(450, 262, "365")
#             can_first.drawString(428, 246, "365")
#             can_first.drawString(156, 195, "Study at Prince of Songkla University")
#             can_first.save()

#             packet_first.seek(0)
#             new_pdf_first = PdfReader(packet_first)
#             first_page = template_pdf.pages[0]
#             first_page.merge_page(new_pdf_first.pages[0])
#             output_pdf.add_page(first_page)

#             packet_first.close()

#         # Process the second page if it exists
#         if len(template_pdf.pages) > 1:
#             packet_second = io.BytesIO()
#             can_second = canvas.Canvas(packet_second, pagesize=A4)
#             can_second.drawString(170, 755, student_info.address_no)
#             can_second.drawString(250, 755, student_info.road)
#             can_second.drawString(300, 755, student_info.tambol)
#             can_second.drawString(378, 755, student_info.amphoe)
#             can_second.drawString(472, 755, student_info.province)
#             can_second.drawString(215, 715, student_info.first_name)
#             can_second.drawString(245, 715, student_info.last_name)
#             can_second.drawString(150, 677, student_info.address_no)
#             can_second.drawString(250, 677, student_info.road)
#             can_second.drawString(410, 677, student_info.tambol)
#             can_second.drawString(139, 639, student_info.amphoe)
#             can_second.drawString(385, 639, student_info.province)
#             can_second.save()

#             packet_second.seek(0)
#             new_pdf_second = PdfReader(packet_second)
#             second_page = template_pdf.pages[1]
#             second_page.merge_page(new_pdf_second.pages[0])
#             output_pdf.add_page(second_page)

#             packet_second.close()

#         # Add remaining pages without modification
#         for page_num in range(2, len(template_pdf.pages)):
#             output_pdf.add_page(template_pdf.pages[page_num])

#     buffer = io.BytesIO()
#     output_pdf.write(buffer)
#     buffer.seek(0)
#     return FileResponse(buffer, as_attachment=True, filename='TM7_filled.pdf')






# # @require_http_methods(["POST"])
# @api_view(['POST'])
# def create_reservation(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'Invalid request method'}, status=405)

#     try:
#         # リクエストボディからデータを抽出
#         data = json.loads(request.body)
#         student_id = data.get('studentId')
#         date = data.get('selectedDate')

#         # リクエストデータのバリデーション
#         if not student_id or not date:
#             return JsonResponse({'error': 'Missing required fields'}, status=400)

#         # 生徒情報の取得
#         try:
#             student = StudentInfo.objects.get(student_id=student_id)
#         except StudentInfo.DoesNotExist:
#             return JsonResponse({'error': 'Student not found'}, status=404)

#         # 予約の作成
#         reservation = Reservation(student=student, date=date)

#         # モデルのsaveでValidationErrorをキャッチ
#         try:
#             reservation.save()
#         except ValidationError as e:
#             return JsonResponse({'error': str(e.message)}, status=400)

#         # 成功レスポンス
#         return JsonResponse({'message': 'Reservation created', 'reservationId': reservation.id})

#     except json.JSONDecodeError:
#         return JsonResponse({'error': 'Invalid JSON'}, status=400)

#     except Exception as e:
#         return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    
# @api_view(['POST']) 
# def request_visa_extension(request):
#     student_id = request.data.get('studentId')
    
#     try:
#         student = StudentInfo.objects.get(student_id=student_id)
#     except StudentInfo.DoesNotExist:
#         return JsonResponse({'error': 'Student not found'}, status=404)
    
#     try:
#         requestLetter = RequestLetter.objects.create(
#         student=student,
#         is_requested=True  # 初期状態は予約可能とする
#     )
#     except ValidationError as e:
#         return JsonResponse({'error': str(e.message)}, status=400)
    
#     return JsonResponse({'message': 'Request received', 'Request': requestLetter.id})  
     
# @api_view(['POST'])
# def toggle_schedule(request, pk):
#     schedule = Schedule.objects.get(pk=pk)
#     schedule.is_reservable = not schedule.is_reservable
#     schedule.save()
#     return JsonResponse({'status': 'success', 'is_reservable': schedule.is_reservable})

def schedule_view(request):
    # 現在の年と月を取得する（またはフロントエンドから選択された月）
    year = datetime.now().year
    month = datetime.now().month
    last_day = calendar.monthrange(year, month)

    # 月内のすべての日についてリストを作成
    date_list = [{'date': datetime(year, month, day).date()} for day in range(1, last_day + 1)]

    # 予約可能な日付をデータベースから取得
    reservable_dates = Schedule.objects.filter(
        date__year=year,
        date__month=month,
        is_reservable=True
    ).values_list('date', flat=True)

    # 日付のリストを更新して、予約可能な日付をマークする
    for date_dict in date_list:
        date_obj = date_dict['date']
        date_dict['is_reservable'] = date_obj in reservable_dates

    # テンプレートに渡すためのコンテキストを作成
    context = {'date_list': date_list}
    return render(request, 'admin/visa_management_app/schedule_change_list.html', context)


@api_view(['POST'])
def login_student(request):
    username = request.data.get('username')
    password = request.data.get('password')
    print(username)
    print(password)
    user = authenticate(username=username, password=password)
    print(user)
    if user is not None:
        # # ユーザーが存在する場合の処理
        # return Response({'message': 'Login successful'})
        try:
            student_info = StudentInfo.objects.get(user=user)
            student_id = student_info.student_id
            student_firstname = student_info.first_name
            student_lastname = student_info.last_name
        except StudentInfo.DoesNotExist:
            # StudentInfoが見つからない場合のエラーハンドリング
            return Response({'message': 'Student information not found'}, status=404)

        return Response({
            'message': 'Login successful',
            'username': user.username,
            'student_id': student_id,
            'student_firstname': student_firstname,
            'student_lastname': student_lastname,
        })
    else:
        # ユーザーが存在しない場合の処理
        return Response({'message': 'Invalid credentials'}, status=400)

# @api_view(['POST'])
# def logout_student(request):
#     # Djangoのログアウト関数を呼び出してセッションをクリアします
#     logout(request)
#     return JsonResponse({'message': 'Logged out successfully'})   

# @api_view(['PATCH'])
# def update_student_info(request,student_id):
#     print(request.data) 
#     # この例では、student_idがリクエストのどこかに含まれることを想定しています
#     student_id = student_id
#     try:
#         # 該当する学生情報のインスタンスを取得
#         student_info = StudentInfo.objects.get(student_id=student_id)
#     except StudentInfo.DoesNotExist:
#         return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
#     # 受け取ったデータでシリアライザを更新
#     # serializer = StudentInfoSerializer(student_info, data=request.data)
#     serializer = StudentInfoSerializer(student_info, data=request.data, partial=True) 
#     # データが有効であれば保存
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# @api_view(['POST'])
# def pay_token(request,account_number):
#     account_number = account_number
#     try:
#         account_info = UserProfile.objects.get(account_number=account_number)
#     except UserProfile.DoesNotExist:
#         return Response({'message': 'Acount not found'}, status=status.HTTP_404_NOT_FOUND)
    
#     amount = request.data.get('amount')
#     if not amount:
#         return Response({'message': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)

#     # トークン量を整数に変換し、エラーチェックを行う
#     try:
#         amount = int(amount)
#     except ValueError:
#         return Response({'message': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

#     # 残高が十分かどうかを確認
#     if account_info.balance < amount:
#         return Response({'message': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
    

#     try:
#         # トークンの減算処理をトランザクションで行う
#         with transaction.atomic():
#             account_info.balance -= amount  # 残高からトークンを減算
#             account_info.save()  # データベースに保存

#             if amount == 50:
#                 Transaction.objects.create(
#                     user=account_info,
#                     amount=amount,
#                     service="Visa extension",  # 出金（支払い）として記録,
#                     is_deposit=False
#                 )
#                 # 既存のUserProfileのステータスを更新
#                 account_info.visa_extension_status = True
#                 account_info.save()  # データベースに保存
#             else :
#                 Transaction.objects.create(
#                     user=account_info,
#                     amount=amount,
#                     service="90 days",  # 出金（支払い）として記録,
#                     is_deposit=False
#                 )
#                 # 既存のUserProfileのステータスを更新
#                 account_info.report_status = True
#                 account_info.save()  # データベースに保存

#         # 成功メッセージを返す
#         return Response({'message': 'Token payment successful', 'remaining_balance': account_info.balance}, status=status.HTTP_200_OK)

#     except Exception as e:
#         # 何らかのエラーが発生した場合の処理
#         return Response({'message': 'Transaction failed', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # class PayToken(APIView):
    #     def get(self, request,student_id):
    #         student = StudentInfo.objects.get(student_id=student_id)
    #         student.generate(student.student_id)
    #         try:
    #             pdf_file = student.generate()
    #             return Response({"message": "PDF generated successfully."}, status=status.HTTP_200_OK)
    #         except Exception as e:
    #             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



# def send_extension_warn_email(request,student):
#     emai_addres = student.email

#     mail_subject = 'Visa Expiration Notification'

#     message = "Dear student\nYour visa will be expire in next 30 days.\nPlease go to http://localhost:3000/ and follow the steps to prepare your visa extension."

#     from_email = "<non-reply@IAC.jp>"
#     to_email = emai_addres
#     send_email = EmailMessage(mail_subject, message,from_email=from_email, to=[to_email])
#     send_email.send()

#     return Response({'succesfully sent an email'})


# @api_view(['GET'])
# def send_van_reservation_email(request, student_id):
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

#     # レスポンスの返却
#     return Response({'message': 'Successfully sent an email'}, status=status.HTTP_200_OK)


# @api_view(['GET'])
# def send_request_letter_email(request, student_id, complete_date):
#     print("send_request_letter_email was called")  # 呼び出し確認
#     print(f"Student ID: {student_id}, Complete Date: {complete_date}")

#     try:
#         print("Attempting to fetch student info...")
#         student_info = StudentInfo.objects.get(student_id=student_id)
#         print(f"Student Info found: {student_info}")
#     except StudentInfo.DoesNotExist:
#         print("Student not found.")
#         return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#     print("Setting up email details...")
#     email_address = student_info.email
#     if not email_address:
#         print("Email address is missing.")
#         return Response({'message': 'Email address not provided for the student'}, status=status.HTTP_400_BAD_REQUEST)

#     mail_subject = 'Request Letter complete date Notification'
#     message = f"""
#     Dear {student_info.first_name} {student_info.last_name},

#     Your requested letter complete date has been confirmed. Here are the details:
#     - Visa extension letter complete Date: {complete_date}
#     - Pick up location : IAC office / 2nd floor of building 7
#     - Requested by: {student_info.first_name} {student_info.last_name}
    
#     Please contact us if there are any changes or further questions.

#     Best regards,
#     IAC Administration
#     """ 
#     from_email = "non-reply@IAC.jp"
#     to_email = email_address

#     try:
#         print("Attempting to send email...")
#         send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
#         send_result = send_email.send()
#         print(f"Email send result: {send_result}")
#         if send_result == 0:
#             print("Failed to send email.")
#             return Response({'message': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#         print("Email sent successfully.")
#     except Exception as e:
#         print(f"Error during email sending: {e}")
#         return Response({'message': f'Error sending email: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     print("send_request_letter_email completed successfully.")
#     return Response({'message': 'Successfully sent an email'}, status=status.HTTP_200_OK)



# @api_view(['GET'])
# def send_token_paid_for_extension_email(request, student_id):
#     try:
#         # 該当する学生情報のインスタンスを取得
#         student_info = StudentInfo.objects.get(student_id=student_id)
#     except StudentInfo.DoesNotExist:
#         return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
#     # メールアドレスとメール内容の設定
#     email_address = student_info.email
#     mail_subject = 'Your Payment and Status Notification'
#     message = f"""
#     Dear {student_info.first_name} {student_info.last_name},

#     Your payment for Visa Extension service is now completed and status has changed. Here are the details:
#     - Status: Visa extension service ON
#     - Description: IAC will prepare all documents without any request before your visa extension date and you can just wait them to remind the date to go.
    
#     Please contact us if there are any changes or further questions.

#     Best regards,
#     IAC Administration
#     """ 
#     from_email = "non-reply@IAC.jp"
#     to_email = email_address

#     # メール送信処理
#     send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
#     send_email.send()

#     # レスポンスの返却
#     return Response({'message': 'Successfully sent an email'}, status=status.HTTP_200_OK)


# @api_view(['GET'])
# def send_token_paid_for_90days_email(request, student_id):
#     try:
#         # 該当する学生情報のインスタンスを取得
#         student_info = StudentInfo.objects.get(student_id=student_id)
#     except StudentInfo.DoesNotExist:
#         return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
#     # メールアドレスとメール内容の設定
#     email_address = student_info.email
#     mail_subject = 'Your Payment and Status Notification'
#     message = f"""
#     Dear {student_info.first_name} {student_info.last_name},

#     Your payment for 90 days report service is now completed and status has changed. Here are the details:
#     - Status: 90 days report service ON
#     - Description: IAC will request your passport before 90 days report submission date and IAC will bring the passport to submit the 90 days report for you.
    
#     Please contact us if there are any changes or further questions.

#     Best regards,
#     IAC Administration
#     """ 
#     from_email = "non-reply@IAC.jp"
#     to_email = email_address

#     # メール送信処理
#     send_email = EmailMessage(mail_subject, message, from_email=from_email, to=[to_email])
#     send_email.send()

#     # レスポンスの返却
#     return Response({'message': 'Successfully sent an email'}, status=status.HTTP_200_OK)
