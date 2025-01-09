# serializers.py
from rest_framework import serializers
from .models import StudentInfo,Reservation,Schedule,RequestLetter,Transaction,UserProfile

class StudentInfoSerializer(serializers.ModelSerializer):
    # student_fullname = serializers.CharField(source='fullname', read_only=True)
    # is_visa_expired = serializers.BooleanField(read_only=True)
    is_visa_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = StudentInfo
        fields = '__all__'

class Reservable_datesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'        

class ReservationSerializer(serializers.ModelSerializer):
    student_firstname = serializers.CharField(source='student.first_name', read_only=True)
    student_lastname = serializers.CharField(source='student.last_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    
    student = serializers.SlugRelatedField(
        queryset=StudentInfo.objects.all(),
        slug_field='student_id'
    )

    class Meta:
        model = Reservation
        unique_together = ('student', 'date')
        fields = ['id', 'date', 'is_available', 'student', 'student_firstname', 'student_lastname','student_id']
        # fields = '__all__'

class RequestVisaExtensionSerializer(serializers.ModelSerializer):
    # student = serializers.PrimaryKeyRelatedField(queryset=StudentInfo.objects.all())
    student = serializers.SlugRelatedField(
        queryset=StudentInfo.objects.all(),
        slug_field='student_id'
    )

    class Meta:
        model = RequestLetter
        # fields = ['student', 'is_requested']
        fields = '__all__'  

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['account_number', 'balance', 'name','visa_extension_status','report_status']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__' 