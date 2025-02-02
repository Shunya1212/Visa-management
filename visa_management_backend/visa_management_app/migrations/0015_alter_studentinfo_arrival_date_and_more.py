# Generated by Django 5.0.4 on 2024-12-01 15:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visa_management_app', '0014_alter_studentinfo_address_no_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentinfo',
            name='arrival_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='studentinfo',
            name='arrival_transportation_type',
            field=models.CharField(blank=True, choices=[('AIR', 'Airplane'), ('SEA', 'Sea'), ('LAND', 'Land')], max_length=4, null=True),
        ),
        migrations.AlterField(
            model_name='studentinfo',
            name='birthday',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='studentinfo',
            name='passport_expiration_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='studentinfo',
            name='passport_issue_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='studentinfo',
            name='sex',
            field=models.CharField(blank=True, choices=[('M', 'Male'), ('F', 'Female')], max_length=1, null=True),
        ),
        migrations.AlterField(
            model_name='studentinfo',
            name='visa_expire_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
