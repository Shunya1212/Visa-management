from .models import *
import factory
from factory.django import DjangoModelFactory


class UserFactory(DjangoModelFactory):
    # username = factory.Faker('bothify')
    username = factory.Faker('name')
    is_active = True

    class Meta:
        model = User

class UserProfileFactory(DjangoModelFactory):
    account_number = factory.Faker('ean10')
    # account_number = factory.Sequence 
    # # 連番で一意の値を作る
    balance = factory.Faker('pydecimal', positive=True, min_value=500.0, max_value=1000.0)
    name = factory.Faker('name')

    class Meta:
        model = UserProfile

class StudentInfoFactory(DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    student_id = factory.Faker('ean10')

    class Meta:
        model = StudentInfo

class ScheduleFactory(DjangoModelFactory):
    date = factory.Faker('date')
    class Meta:
        model = Schedule

class ReservationFactory(DjangoModelFactory):
    student = factory.SubFactory(StudentInfoFactory)
    date = factory.Faker('date')
    

    class Meta:
        model = Reservation

class RequestLetterFactory(DjangoModelFactory):
    student = factory.SubFactory(StudentInfoFactory)

    class Meta:
        model =RequestLetter

class TransactionFactory(DjangoModelFactory):
    user = factory.SubFactory(UserProfileFactory)
    amount = factory.Faker('pydecimal', positive=True, min_value=50.0, max_value=150.0)

    class Meta:
        model = Transaction

    