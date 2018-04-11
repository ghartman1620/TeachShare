#! /bin/sh
python3 manage.py makemigrations && 
python3 manage.py migrate && 
gunicorn --bind 0.0.0.0:8000 --env DJANGO_SETTINGS_MODULE='TeachShare_WebApp.settings_production' TeachShare_WebApp.wsgi:application