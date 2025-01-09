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
    account_number = factory.Faker('')
    balance = factory.Faker('pydecimal', positive=True, min_value=500.0, max_value=1000.0)
    class Meta:
        model = UserProfile

class StudentInfoFactory(DjangoModelFactory):
    user = factory.SubFactory(UserFactory)

    class Meta:
        model = StudentInfo

class ScheduleFactory(DjangoModelFactory):
    class Meta:
        model = Schedule

class ReservationFactory(DjangoModelFactory):
    student = factory.SubFactory(StudentInfoFactory)

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

    