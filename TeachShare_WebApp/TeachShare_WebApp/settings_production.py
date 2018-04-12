"""
Django settings for my_project project.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""
# -*- coding: utf-8 -*-

import os
import socket

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '(6dlx)23)(a%%g=8qs0b37$b+mqro=3d!i0f$mo@n4s+r*z)tt'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['testserver', '127.0.0.1',
                 'localhost', 'web', '35.197.62.167']


EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'teamteachbears@gmail.com'
EMAIL_HOST_PASSWORD = 'teachbears_cmps115'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = 'teamteachbears@gmail.com'


# Application definition.

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # additional apps:
    'corsheaders',
    'rest_framework',
    'oauth2_provider',
    'social_django',
    'rest_framework_social_oauth2',
    'django_filters',
    # 'django_elasticsearch_dsl',

    'accounts',
    'posts',
]

"""
ElasticSearch-DSL Django settings
    - Signal Processor is temporary, will likely increase server load
"""
# ELASTICSEARCH_DSL = {
#     'default': {
#         'hosts': 'search:9200'
#     },
# }
# TEMPORARY: will cause unneccesary load on the server but simplifies things for now.
# ELASTICSEARCH_DSL_SIGNAL_PROCESSOR = 'django_elasticsearch_dsl.signals.RealTimeSignalProcessor'
# ELASTICSEARCH_DSL_AUTOSYNC = False
# ELASTICSEARCH_DSL_AUTO_REFRESH = False

"""
Django Cache Backend Settings (Redis):
    - Can be used for any cacheing whatsoever
    - Example implementation for delayed/batched processing is in posts/tasks.py
"""
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://10.55.254.123:6379/0',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SERIALIZER': 'django_redis.serializers.msgpack.MSGPackSerializer',
        }
    }
}
DJANGO_REDIS_IGNORE_EXCEPTIONS = True


# CELERY:
CELERY_BROKER_URL = 'redis://10.55.254.123:6379/0'
CELERY_RESULT_BACKEND = 'redis://10.55.254.123:6379/0'
CELERY_TASK_SERIALIZER = 'msgpack'
CELERY_ACCEPT_CONTENT = ['msgpack']
CELERY_RESULT_SERIALIZER = 'msgpack'

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
        #'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'rest_framework_social_oauth2.authentication.SocialAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',)
}

AUTHENTICATION_BACKENDS = (
    'social_core.backends.open_id.OpenIdAuth',
    'social_core.backends.google.GoogleOpenId',
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.google.GoogleOAuth',
    'social_core.backends.twitter.TwitterOAuth',
    'social_core.backends.yahoo.YahooOpenId',

    'rest_framework_social_oauth2.backends.DjangoOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.social_auth.associate_by_email',  # <--- enable this one
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '232250430081-c7aicgo6hrj04074sdhruurc8dm9un2b.apps.googleusercontent.com'
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = 'UcvpIOjRuIOJ_6NT9CYUHraA'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ORIGIN_ALLOW_ALL = True
ROOT_URLCONF = 'TeachShare_WebApp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'TeachShare_WebApp.wsgi.application'

# cloud db password:
# ItOgp9BvK6jNwmEz
#
# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    # this is the google cloud SQL (postgresql) store connection settings
    #   TODO: So much...
    'google': {
            'ENGINE': 'django.db.backends.postgresql',
            'HOST': '/cloudsql/teach-share-200700:us-west1:teach-db',
            'NAME': 'teach',
            'USER': 'teachsharer',
            'PASSWORD': 'thisisabadpasasword123',
    },
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'mydatabase',
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/Los_Angeles'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

# This is the django cloud storage static files url
# 
# TODO: We need to find a way to automate:
#   1.) Collect static files
#   2.) Upload static files
#    ... do the same for MEDIA files as well to allow for uploads. Would also need to
#        fix uploads to go to the google cloud storage engine or live with /media
#        existing in the kubernetes node and not garuanteeing persistence for
#        long periods of time.
# 
STATIC_URL = 'http://storage.googleapis.com/teachshare-django-static/static/'
STATIC_ROOT = os.path.join(BASE_DIR, '', 'static')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, '', 'media')

LOGIN_REDIRECT_URL = '/account/'
LOGIN_URL = '/account/login'
