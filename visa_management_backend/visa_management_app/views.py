# views.py

import datetime
from django.shortcuts import render
from .models import StudentInfo,Reservation,Schedule,RequestLetter
from rest_framework import viewsets
from .serializers import StudentInfoSerializer,ReservationSerializer,Reservable_datesSerializer,Request_visa_extensionSerializer
from django.contrib.auth import logout, authenticate,login
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib import auth
from django.http import JsonResponse
from django.views.decorators.http import require_POST,require_http_methods
from django.contrib.admin.views.decorators import staff_member_required
from django.http import FileResponse, HttpResponseBadRequest
import io
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
from django.conf import settings
from reportlab.lib.pagesizes import A4
from django_filters.rest_framework import DjangoFilterBackend # type: ignore

class Reservable_datesViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = Reservable_datesSerializer

class StudentInfoViewSet(viewsets.ModelViewSet):
    queryset = StudentInfo.objects.all()
    serializer_class = StudentInfoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student_id'] 
   
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student__student_id'] 

class Request_visa_extensionViewSet(viewsets.ModelViewSet):
    queryset = RequestLetter.objects.all()
    serializer_class = Request_visa_extensionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student__student_id'] 

def GeneratePDF(request, student_id):
    try:
        student_info = StudentInfo.objects.get(student_id=student_id)
    except StudentInfo.DoesNotExist:
        return HttpResponseBadRequest("Student not found.")

    output_pdf = PdfWriter()

    with open("visa_management_app/resources/TM7.pdf", "rb") as infile:
        template_pdf = PdfReader(infile)

        # for page_num in range(len(template_pdf.pages)):
        #     packet = io.BytesIO()
        #     can = canvas.Canvas(packet, pagesize=A4)

        #     # Drawing commands go here
        #     can.drawString(100, 750, student_info.first_name)
        #     # ... Add other drawing operations ...

        #     can.save()
            
        #     # Make sure to seek back to the start of the stream
        #     packet.seek(0)
        #     new_pdf = PdfReader(packet)
        #     page = template_pdf.pages[page_num]
        #     page.merge_page(new_pdf.pages[0])
        #     output_pdf.add_page(page)

        #     # It's important not to close the packet stream until you're done with it
        #     # Do not use packet.close()
            
        if len(template_pdf.pages) > 0:
            birthday = student_info.birthday
            today = date.today()
            age = today.year - birthday.year
            if (today.month, today.day) < (birthday.month, birthday.day):
                age  -= 1    
            packet_first = io.BytesIO()
            can_first = canvas.Canvas(packet_first, pagesize=A4)
            can_first.drawString(440, 705, "Phuket")
            can_first.drawString(267, 575, student_info.last_name)
            can_first.drawString(437, 575, student_info.first_name)
            can_first.drawString(295, 539, str(age))
            can_first.drawString(366, 539, str(student_info.birthday.day))
            can_first.drawString(428, 539, str(student_info.birthday.month))
            can_first.drawString(518, 539, str(student_info.birthday.year))
            can_first.drawString(142, 504, student_info.place_of_birth)
            can_first.drawString(450, 504, student_info.nationality)
            can_first.drawString(305, 470, student_info.passport_number)
            can_first.drawString(487, 470, str(student_info.passport_issue_date.day))
            can_first.drawString(99, 437, str(student_info.passport_issue_date.month))
            can_first.drawString(205, 437, str(student_info.passport_issue_date.year))
            can_first.drawString(335, 437, student_info.passport_issue_place)
            can_first.drawString(487, 437, str(student_info.passport_expiration_date.day))
            can_first.drawString(99, 401, str(student_info.passport_expiration_date.month))
            can_first.drawString(205, 401, str(student_info.passport_expiration_date.year))
            can_first.drawString(327, 401, "Non-Immigrant ED")
            can_first.drawString(174, 366, student_info.arrival_transportation_type)
            can_first.drawString(340, 366, student_info.arrival_from)
            can_first.drawString(142, 332, student_info.port_of_arrival)
            can_first.drawString(332, 332, str(student_info.arrival_date.day))
            can_first.drawString(403, 332, str(student_info.arrival_date.month))
            can_first.drawString(507, 332, str(student_info.arrival_date.year))
            can_first.drawString(263, 297, student_info.tm6_no)
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

        # Process the second page if it exists
        if len(template_pdf.pages) > 1:
            packet_second = io.BytesIO()
            can_second = canvas.Canvas(packet_second, pagesize=A4)
            can_second.drawString(170, 755, student_info.address_no)
            can_second.drawString(250, 755, student_info.road)
            can_second.drawString(300, 755, student_info.tambol)
            can_second.drawString(378, 755, student_info.amphoe)
            can_second.drawString(472, 755, student_info.province)
            can_second.drawString(215, 715, student_info.first_name)
            can_second.drawString(245, 715, student_info.last_name)
            can_second.drawString(150, 677, student_info.address_no)
            can_second.drawString(250, 677, student_info.road)
            can_second.drawString(410, 677, student_info.tambol)
            can_second.drawString(139, 639, student_info.amphoe)
            can_second.drawString(385, 639, student_info.province)
            can_second.save()

            packet_second.seek(0)
            new_pdf_second = PdfReader(packet_second)
            second_page = template_pdf.pages[1]
            second_page.merge_page(new_pdf_second.pages[0])
            output_pdf.add_page(second_page)

            packet_second.close()

        # Add remaining pages without modification
        for page_num in range(2, len(template_pdf.pages)):
            output_pdf.add_page(template_pdf.pages[page_num])

    buffer = io.BytesIO()
    output_pdf.write(buffer)
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename='TM7_filled.pdf')

# @require_http_methods(["POST"])
@api_view(['POST'])
def create_reservation(request):
    # ここでリクエストからデータを抽出する必要がある
    # リクエストがJSONを送っていると仮定します
    # data = request.POST
    student_id = request.data.get('studentId')
    date = request.data.get('selectedDate')

    print(student_id)
    print(date)

    # 生徒の情報を取得
    try:
        student = StudentInfo.objects.get(student_id=student_id)
    except StudentInfo.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)

    # 予約を作成
    reservation = Reservation.objects.create(
        student=student,
        date=date,
        is_available=True  # 初期状態は予約可能とする
    )
    return JsonResponse({'message': 'Reservation created', 'reservation': reservation.id})  

@api_view(['POST']) 
def request_visa_extension(request):
    student_id = request.data.get('studentId')
    
    try:
        student = StudentInfo.objects.get(student_id=student_id)
    except StudentInfo.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)

    requestLetter = RequestLetter.objects.create(
    student=student,
    is_requested=True  # 初期状態は予約可能とする
    )
    return JsonResponse({'message': 'Request received', 'Request': requestLetter.id})  
     
@api_view(['POST'])
def toggle_schedule(request, pk):
    schedule = Schedule.objects.get(pk=pk)
    schedule.is_reservable = not schedule.is_reservable
    schedule.save()
    return JsonResponse({'status': 'success', 'is_reservable': schedule.is_reservable})

def schedule_view(request):
    # 現在の年と月を取得する（またはフロントエンドから選択された月）
    year = datetime.now().year
    month = datetime.now().month
    _, last_day = calendar.monthrange(year, month)

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

@api_view(['POST'])
def logout_student(request):
    # Djangoのログアウト関数を呼び出してセッションをクリアします
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'})   

@api_view(['PATCH'])
def update_student_info(request,student_id):
    print(request.data) 
    # この例では、student_idがリクエストのどこかに含まれることを想定しています
    student_id = student_id
    try:
        # 該当する学生情報のインスタンスを取得
        student_info = StudentInfo.objects.get(student_id=student_id)
    except StudentInfo.DoesNotExist:
        return Response({'message': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # 受け取ったデータでシリアライザを更新
    # serializer = StudentInfoSerializer(student_info, data=request.data)
    serializer = StudentInfoSerializer(student_info, data=request.data, partial=True) 
    # データが有効であれば保存
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)