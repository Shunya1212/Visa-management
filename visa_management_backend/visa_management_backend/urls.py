from django import views
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from visa_management_app.views import StudentInfoViewSet,ReservationViewSet,Reservable_datesViewSet,Request_visa_extensionViewSet

from visa_management_app.views import login_student, logout_student,update_student_info,GeneratePDF,create_reservation,toggle_schedule,schedule_view,request_visa_extension

router = DefaultRouter()
router.register(r'StudentInfo', StudentInfoViewSet)
router.register(r'Reservation', ReservationViewSet)
router.register(r'Reservable_dates', Reservable_datesViewSet)
router.register(r'Request_visa_extension', Request_visa_extensionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    path('login/', login_student, name='login_student'),
    path('logout/', logout_student, name='logout_student'),
    path('update_student_info/<int:student_id>/', update_student_info, name='update_student_info'),
    path('generate_pdf/<int:student_id>/', GeneratePDF, name='generate_pdf'),
    path('create_reservation/', create_reservation, name='create_reservation'),
    path('toggle-schedule/<int:pk>/', toggle_schedule, name='toggle_schedule'),
    path('admin/visa_management_app/schedule/', schedule_view, name='schedule_view'),
    path('request_visa_extension/', request_visa_extension, name='request_visa_extension'),
]
