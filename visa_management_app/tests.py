from django.test import TestCase
from .models import UserProfile,Reservation,StudentInfo,User,CustomUserManager,RequestLetter,Schedule
import smtplib
from unittest.mock import patch
from datetime import date
from datetime import datetime
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from .factories import *
from django.urls import reverse
from rest_framework import status 
from freezegun import freeze_time


# Create your tests here.
class TestViews(TestCase):
    def test_student_creation(self):
        test_user = User.objects.create(
            username='test_student',
            password='securepassword123',
            is_staff=False,
            is_active=True,
            is_superuser=False,
            is_admin=False
        )

        self.assertEqual(test_user.username, 'test_student')
        self.assertEqual(test_user.password, 'securepassword123')
        self.assertTrue(test_user.is_active)
        self.assertFalse(test_user.is_staff)
        self.assertFalse(test_user.is_admin)
        self.assertFalse(test_user.is_superuser)


    def test_stuff_creation(self):
        test_user = User.objects.create(
            username='test_stuff',
            password='securepassword123',
            is_staff=True,
            is_active=False,
            is_superuser=True,
            is_admin=True
        )

        self.assertEqual(test_user.username, 'test_stuff')
        self.assertEqual(test_user.password, 'securepassword123')
        self.assertFalse(test_user.is_active)
        self.assertTrue(test_user.is_staff)
        self.assertTrue(test_user.is_admin)
        self.assertTrue(test_user.is_superuser)    


class TestCase01(TestCase):

    def setUp(self):
        self.user_profile=UserProfile.objects.create(
            account_number="123",
            balance=300,
            name="Test profile"
        )

    def test_save_user_profile_must_update_balance(self):

        self.assertEqual(self.user_profile.account_number, "123")
        self.assertEqual(self.user_profile.balance, 300)

        self.user_profile.deposit_amount = 30
        self.user_profile.save()
        # user_profile.increase_balance()
        self.user_profile.refresh_from_db()

        self.assertEqual(self.user_profile.balance, 330)
    
    def test_pay_token_90days_must_deduct_amount_from_balance(self):
        
        self.user_profile.pay_token(150)
        self.assertEqual(self.user_profile.balance, 150)

    def test_pay_token_extension_must_deduct_amount_from_balance(self):
        
        self.user_profile.pay_token(50)
        self.assertEqual(self.user_profile.balance,250)

class TestCase02(TestCase):
    def setUp(self):
        self.test_user = User.objects.create(
            username='test_student',
            password='securepassword123',
            is_staff=False,
            is_active=True,
            is_superuser=False
        )

        self.student = StudentInfo.objects.create(
            user_id=self.test_user.id,
            first_name="Shunya",
            last_name="Endo",
            email="receiver@receiver.com"
        )

    @patch('visa_management_app.models.EmailMessage') 
    def test_send_token_paid_for_extension_email(self, MockEmailMessage):
        mock_email_instance = MockEmailMessage.return_value

        self.student.send_token_paid_for_extension_email()

        MockEmailMessage.assert_called_once_with(
            'Your Payment and Status Notification',
            f"""
        Dear Shunya Endo,

        Your payment for Visa Extension service is now completed and status has changed. Here are the details:
        - Status: Visa extension service ON
        - Description: IAC will prepare all documents without any request before your visa extension date and you can just wait them to remind the date to go.
        
        Please contact us if there are any changes or further questions.

        Best regards,
        IAC Administration
        """,
            from_email="non-reply@IAC.jp",
            to=["receiver@receiver.com"]
        )
        mock_email_instance.send.assert_called_once()

    @patch('visa_management_app.models.EmailMessage') 
    def test_send_token_paid_for_90days_email(self, MockEmailMessage):
        mock_email_instance = MockEmailMessage.return_value

        self.student.send_token_paid_for_90days_email()

        MockEmailMessage.assert_called_once_with(
            'Your Payment and Status Notification',
            f"""
        Dear Shunya Endo,

        Your payment for 90 days report service is now completed and status has changed. Here are the details:
        - Status: 90 days report service ON
        - Description: IAC will request your passport before 90 days report submission date and IAC will bring the passport to submit the 90 days report for you.
        
        Please contact us if there are any changes or further questions.

        Best regards,
        IAC Administration
        """,
            from_email="non-reply@IAC.jp",
            to=["receiver@receiver.com"]
        )
        mock_email_instance.send.assert_called_once()


class TestCase03(TestCase):
    def setUp(self):
        self.test_user = User.objects.create(
            username='test_student',
            password='securepassword123',
            is_staff=False,
            is_active=True,
            is_superuser=False
        )

        self.student = StudentInfo.objects.create(
            user_id=self.test_user.id,
            first_name="Shunya",
            last_name="Endo",
            student_id=6430613024,
            email="receiver@receiver.com"
        )

        self.reservation = Reservation.objects.create(
            student=self.student,
            date=date(2025, 1, 8),
            is_available=True
        )

    def test_save_validated_reservation(self):
        
        self.reservation.date = date(2025,1,15)
        self.reservation.save()
        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.reservation_number, 1)  

    def test_dave_dupulivated_reservation_must_return_validation_error(self):

        with self.assertRaises(ValidationError):
            self.reservation.save()
        
class TestCase04(TestCase):

    def setUp(self):
        self.test_user = User.objects.create(
            username='test_student',
            password='securepassword123',
            is_staff=False,
            is_active=True,
            is_superuser=False
        ) 

        self.test_student = StudentInfo.objects.create(
            user_id=self.test_user.id,
            first_name="Shunya",
            last_name="Endo",
            email="receiver@receiver.com"
        )

        self.request_letter = RequestLetter.objects.create(
            student = self.test_student,
            is_requested = False
        )

    def test_save_validated_request_letter(self):
        self.request_letter.is_requested = True
        self.request_letter.save()
        
        self.request_letter.refresh_from_db()
        self.assertTrue(self.request_letter.is_requested)

    def test_save_duplicated_request_letter_must_return_validation_error(self):

        with self.assertRaises(ValidationError):
            self.request_letter.save()

class TestCase05(TestCase):
    def test_update_to_unreseravle_for_past_reservable_date(self):
        
        past_reservable_date = Schedule.objects.create(
            date=date(2024,12,22),
            is_reservable=True
        )

        Schedule.update_past_reservable()
        
        past_reservable_date.refresh_from_db()
        self.assertFalse(past_reservable_date.is_reservable)



class TestAPI(TestCase):

    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.student = StudentInfoFactory(student_id=555,first_name="TestFirst",last_name="TestLast",visa_expire_date=date(2025,1,2))
        self.student2 = StudentInfoFactory(student_id=666,first_name="TestFirst_2",last_name="TestLast_2",visa_expire_date=date(2025,1,2))

    def test_student_info_list(self):
        # GET http://localhost:8000/StudentInfo/
        response = self.client.get('/StudentInfo/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2, response.data)
        # self.assertEqual(len(self.response.data), 1, self.response.data) 

    def test_student_is_visa_expired(self):
        response = self.client.get('/StudentInfo/')
        self.assertNotEqual(datetime.now(),datetime(2024,1,18))
        with freeze_time("2024-01-18"):
            self.assertEqual(datetime.now(),datetime(2024,1,18))
        self.assertNotEqual(datetime.now(),datetime(2024,1,18))
        
        self.assertTrue(response.data[0]['is_visa_expired'])

    def test_student_retrieve(self):
        response = self.client.get(f'/StudentInfo/{self.student.student_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['student_id'], '555')
        self.assertEqual(response.data['first_name'],'TestFirst')
        self.assertEqual(response.data['last_name'],'TestLast')

    def test_student_info_create(self):
        data = {
            "student_id": 123,
            "first_name": "NewFirst",
            "last_name": "NewLast",
            "user": self.user.id
        }
        response = self.client.post('/StudentInfo/', data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        student_info_response = self.client.get(f'/StudentInfo/{data["student_id"]}/')
        self.assertEqual(student_info_response.data['student_id'], '123')
        self.assertEqual(student_info_response.data['last_name'], 'NewLast')
        self.assertEqual(student_info_response.data['first_name'], 'NewFirst')
        
    def test_student_info_updae(self):
        student_data = {
            "last_name": "UpdatedLast"
        }

        response = self.client.patch(f'/StudentInfo/{self.student.student_id}/', data=student_data, format='json')

        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        student_updated_response = self.client.get(f'/StudentInfo/{self.student.student_id}/')

        self.assertEqual(student_updated_response.data['last_name'], 'UpdatedLast')

    def test_student_info_delete(self):
        response = self.client.delete(f'/StudentInfo/{self.student.student_id}/',format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(StudentInfo.objects.filter(student_id=self.student.student_id).exists())


class TestAPI01(TestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
          

        self.schedule = ScheduleFactory(date=date(2025,1,20),is_reservable=True)
        self.schedule2 = ScheduleFactory(date=date(2025,1,25),is_reservable=True)

    def test_reservable_schedule_list(self):

        response = self.client.get('/Reservable_dates/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['date'], '2025-01-20')
        self.assertEqual(len(response.data),2)

    def test_reservable_schedule_create(self):

        reservable_data = {
            "date": "2025-02-15",
            "is_reservable": True
        }

        response = self.client.post('/Reservable_dates/', data=reservable_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_date_response = self.client.get('/Reservable_dates/')
        self.assertEqual(new_date_response.data[2]['date'], '2025-02-15')
        self.assertEqual(len(new_date_response.data),3)
    
    def test_reservable_schedule_update(self):

        updated_date = {
            "is_reservable": False
        }
    
        response = self.client.patch(f'/Reservable_dates/{self.schedule.id}/', data=updated_date, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        updated_response = self.client.get('/Reservable_dates/')
        self.assertFalse(updated_response.data[0]['is_reservable'])

    def test_reservable_schedule_delete(self):
        response = self.client.delete(f'/Reservable_dates/{self.schedule.id}/', format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Schedule.objects.filter(id=self.schedule.id).exists())
    

class TestAPI02(TestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.student = StudentInfoFactory(student_id=555,first_name="TestFirst",last_name="TestLast",visa_expire_date=date(2025,1,2))
        self.reservation = ReservationFactory(student=self.student, date=date(2025,1,20),is_available=True)
        
       

    def test_reservation_list(self):
        response = self.client.get('/create_reservation/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['date'], '2025-01-20')
    
    def test_reservation_create(self):

        new_reservation = {
            "student": self.student.student_id,
            "date":"2025-1-10",
            "is_available": True
        }

        response = self.client.post('/create_reservation/', data=new_reservation, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_reservation_response = self.client.get('/create_reservation/')
        self.assertEqual(new_reservation_response.data[1]['date'], '2025-01-10')

    def test_reservation_update(self):

        updated_reservation = {
            "date": "2025-01-15"
        }

        response = self.client.patch(f'/create_reservation/{self.reservation.id}/',data=updated_reservation, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        updated_reservation_response = self.client.get('/create_reservation/')
        self.assertEqual(updated_reservation_response.data[0]['date'], '2025-01-15')

    def test_reservation_delete(self):

        response = self.client.delete(f'/create_reservation/{self.reservation.id}/', format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        deleted_response = self.client.get(f'/create_reservation/{self.reservation.id}/', format='json')
        self.assertFalse(Reservation.objects.filter(id=self.reservation.id).exists())


class TestAPI03(TestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.student = StudentInfoFactory(student_id=555,first_name="TestFirst",last_name="TestLast",visa_expire_date=date(2025,1,2))
        self.student2 = StudentInfoFactory(student_id=666,first_name="TestFirst_2",last_name="TestLast_2",visa_expire_date=date(2025,1,2))
        self.extension_letter = RequestLetterFactory(student=self.student, is_requested=True, is_completed=False)
        self.extension_letter2 = RequestLetterFactory(student=self.student2, is_requested=True, is_completed=False)
    
    def test_request_visa_extension_list(self):
        # RequestLetterFactory(student=self.student, is_requested=True, is_completed=False)
        # response = self.client.get('/request_visa_extension/')
        response = self.client.get('/Request_visa_extension/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data),2)

    def test_request_visa_extension_create(self):
        student3 = StudentInfoFactory(student_id=777,first_name="TestFirst_3",last_name="TestLast_3",visa_expire_date=date(2025,1,2))
        new_request = {
            "student":student3.student_id,
            "is_requested":True,
            "is_completed":False
        }

        response = self.client.post('/Request_visa_extension/', data=new_request, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_response = self.client.get('/Request_visa_extension/')
        self.assertEqual(len(new_response.data),3,response.data)

    def test_request_visa_extension_delete(self):
        response = self.client.delete(f'/Request_visa_extension/{self.extension_letter.id}/',format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(RequestLetter.objects.filter(id=self.extension_letter.id).exists())

class TestAPI04(TestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.user_profile = UserProfileFactory(account_number=123456789, balance=1000)
        self.student = StudentInfoFactory(student_id=555,first_name="TestFirst",last_name="TestLast",visa_expire_date=date(2025,1,2))
        self.transaction = TransactionFactory(user=self.user_profile)
        self.transaction2 = TransactionFactory(user=self.user_profile)

        

    def test_transaction_spesific_list(self):
        response = self.client.get(f'/transactions/{self.user_profile.account_number}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data),2)

class TestAPI05(TestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.student = StudentInfoFactory(student_id=555,first_name="TestFirst",last_name="TestLast",visa_expire_date=date(2025,1,2))
        self.user_profile = UserProfileFactory(account_number=123456789, balance=1000)
    
    def test_pay_token(self):
        payment_data = {
            "amount": 150
        }

        response = self.client.post(f'/api/user/{self.user_profile.account_number}/paytoken/',data=payment_data,format='json')

        self.assertIsNotNone(self.user_profile)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user_profile.refresh_from_db()
        self.assertEqual(self.user_profile.balance, 850.00)  # 1000 - 150

        transaction = Transaction.objects.filter(user=self.user_profile, amount=150).first()
        self.assertIsNotNone(transaction)

    def test_send_email_extension_notification(self):
        
        response = self.client.get(f'/extension_token_email/{self.student.student_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_send_email_90days_notification(self):
        response = self.client.get(f'/90days_token_email/{self.student.student_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)




# from myapp.models import UserProfile
# user = UserProfile.objects.get(account_number="123456789")
# print(user)  # ユーザーが存在するか確認

# 1: Check the HTTP messege
# 2: Check the response data
# 3: Check the database if it really works