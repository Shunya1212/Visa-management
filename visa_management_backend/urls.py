from django import views
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from visa_management_app.views import StudentInfoViewSet,Reservable_datesViewSet,ReservationViewSet,UserProfileViewSet,GeneratePDFView,RequestVisaExtensionView,SendTokenPaid90DaysEmail,SendEmailExtensionNotification,LogoutStudent,ScheduleView

# from visa_management_app.views import login_student, logout_student,update_student_info,toggle_schedule,schedule_view,request_visa_extension,pay_token,send_van_reservation_email,send_token_paid_for_extension_email,send_token_paid_for_90days_email1
from visa_management_app.views import login_student
# from visa_management_app.views import GeneratePDF
# from visa_management_app.views import update_student_info
from visa_management_app.views import schedule_view
# from visa_management_app.models import generate

router = DefaultRouter()
router.register(r'StudentInfo', StudentInfoViewSet)
# router.register(r'Reservation', ReservationViewSet)
router.register(r'update_student_info', StudentInfoViewSet, basename='unique_studentinfo')
# router.register(r'GeneratePDF',GeneratePDFView)
router.register(r'Reservable_dates', Reservable_datesViewSet)
router.register(r'create_reservation', ReservationViewSet,basename='create_reservation')
# router.register(r'create_reservation', Reservable_datesViewSet)
# router.register(r'Request_visa_extension', RequestVisaExtensionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    path('login/', login_student, name='login_student'),
    path('logout/', LogoutStudent.as_view(), name='logout_student'),
    # path('update_student_info/<int:student_id>/', StudentInfoViewSet.as_view({'put': 'update'}), name='update_student_info'),
    #  path('update_student_info/<int:student_id>/', update_student_info, name='update_student_info'),
    path('generate_pdf/<int:student_id>/', GeneratePDFView.as_view(), name='generate_pdf'),
    #  path('generate_pdf/<int:student_id>/', GeneratePDF, name='generate_pdf'),
    # path('create_reservation/', ReservationCreateView.as_view(), name='create_reservation'),
    # path('toggle-schedule/<int:pk>/', toggle_schedule, name='toggle_schedule'),
    # path('admin/visa_management_app/schedule/', ScheduleView.as_view(), name='schedule_view'),
    path('admin/visa_management_app/schedule/', schedule_view, name='schedule_view'),
    path('request_visa_extension/', RequestVisaExtensionView.as_view(), name='request_visa_extension'),
    path('api/user/<str:account_number>/', UserProfileViewSet.as_view(), name='user-profile'),
    # path('api/user/<str:account_number>/transactions/', TransactionViewSet.as_view(), name='user-transactions'),
    # path('api/user/<str:account_number>/paytoken', pay_token, name='user-paytoken'),
    # path('reservation_email/<int:student_id>/', send_van_reservation_email, name='send_van_reservation_email'),
    path('extension_token_email/<int:student_id>/', SendEmailExtensionNotification.as_view(), name='send_token_paid_for_extension_email'),
    # path('90days_token_email/<int:student_id>/', send_token_paid_for_90days_email, name='send_token_paid_for_90days_email'),
    path('90days_token_email/<int:student_id>/', SendTokenPaid90DaysEmail.as_view(), name='send_token_paid_for_90days_email'),
]
