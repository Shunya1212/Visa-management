# Generated by Django 5.0.4 on 2024-04-27 18:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visa_management_app', '0002_reservation'),
    ]

    operations = [
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
                ('is_reservable', models.BooleanField(default=False)),
            ],
        ),
    ]
