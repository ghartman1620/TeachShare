# Generated by Django 2.0.2 on 2018-03-08 23:17

from django.db import migrations, models
from datetime import timedelta
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0002_auto_20180308_1339'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.AutoField(auto_created=True,
                                        primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80)),
            ],
        ),
        migrations.AddField(
            model_name='post',
            name='content_type',
            field=models.IntegerField(
                choices=[(0, 'Game'), (1, 'Lab'), (2, 'Lecture')], default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='post',
            name='grade',
            field=models.IntegerField(
                choices=[(0, 'Preschool'), (1, 'Kindergarten'), (2, 'First Grade')], default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='post',
            name='length',
            field=models.DurationField(default=timedelta(seconds=10)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='post',
            name='subject',
            field=models.ForeignKey(
                null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='posts.Subject'),
        ),
    ]
