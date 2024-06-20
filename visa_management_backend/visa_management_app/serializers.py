# serializers.py
from rest_framework import serializers
from .models import StudentInfo,Reservation,Schedule,RequestLetter

class StudentInfoSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = Reservation
        unique_together = ('student', 'date')
        # fields = ['id', 'date', 'is_available', 'student', 'student_firstname', 'student_lastname','student_id']
        fields = '__all__'

class Request_visa_extensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestLetter
        fields = '__all__'        