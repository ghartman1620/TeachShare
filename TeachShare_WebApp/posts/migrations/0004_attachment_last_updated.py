# Generated by Django 2.0.3 on 2018-03-11 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0003_auto_20180308_1517'),
    ]

    operations = [
        migrations.AddField(
            model_name='attachment',
            name='last_updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
