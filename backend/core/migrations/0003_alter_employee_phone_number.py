# Generated by Django 5.2.3 on 2025-06-27 18:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_alter_employee_dob_alter_employee_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employee',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]
