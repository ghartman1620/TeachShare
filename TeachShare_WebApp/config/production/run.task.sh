#! /bin/sh
DJANGO_SETTINGS_MODULE='TeachShare_WebApp.settings_production' celery -A TeachShare_WebApp worker -l info -B