# Generated by Django 5.0.4 on 2024-09-17 06:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visa_management_app', '0008_userprofile_transaction'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='student_info',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='visa_management_app.studentinfo'),
        ),
    ]
