#! /bin/sh
python3 manage.py makemigrations && 
python3 manage.py migrate && 
gunicorn --bind 0.0.0.0:8000 TeachShare_WebApp.wsgi:application