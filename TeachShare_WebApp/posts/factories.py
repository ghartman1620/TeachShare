import factory
from posts.models import Post
from accounts.models import User
import random
from faker import Faker
from datetime import timedelta


def generate_video_link_dict():
    t = 'video_link'
    f = Faker()
    return {
        'type': t,
        'content': {
            'description': f.text(max_nb_chars=1000, ext_word_list=None),
            'height': 480,
            'width': 640,
            'id': f.uuid4(),
            'post': random.randint(1, Post.objects.count()) if Post.objects.count() >= 1 else 1,
            'title': f.sentence(nb_words=12, variable_nb_words=True),
            'type': t,
            # 'thumbnail': {
            #     'height': 90,
            #     'width': 120,
            #     'url': 'https://i.ytimg.com/vi/0X5xql1G4QY/default.jpg'
            # },
            'url': YOUTUBE_LIST[random.randint(0, len(YOUTUBE_LIST)-1)]
        }
    }


def generate_video_file_dict():
    t = 'video_file'
    f = Faker()
    return {
        'type': t,
        'content': {
            'description': f.text(max_nb_chars=1000, ext_word_list=None),
            'height': 480,
            'width': 640,
            'post': random.randint(1, Post.objects.count()) if Post.objects.count() >= 1 else 1,
            'title': f.sentence(nb_words=12, variable_nb_words=True),
            'name': f.file_name(category='video'),
            'type': t,
            'url': f.url()
        }
    }


def generate_text_dict():
    f = Faker()
    return {
        'type': 'text',
        'content': f.text(max_nb_chars=1000)
    }


def generate_audio_file_dict():
    f = Faker()
    return {
        'type': 'audio',
        'content': [{
            'description': f.text(max_nb_chars=1000, ext_word_list=None),
            'post': random.randint(1, Post.objects.count()) if Post.objects.count() >= 1 else 1,
            'title': f.sentence(nb_words=12, variable_nb_words=True),
            'name': f.file_name(category='audio'),
            'type': 'audio_file',
            'filetype': f.mime_type(category='audio'),
            'url': f.url()
        }, ]
    }


def generate_image_file_dict():
    t = 'image_file'
    f = Faker()
    return {
        'type': t,
        'content': [{
            'id': a,
            'height': 480,
            'width': 640,
            'url': f.image_url(),
            'description': f.text(max_nb_chars=1000, ext_word_list=None),
            'post': random.randint(1, Post.objects.count()) if Post.objects.count() >= 1 else 1,
            'title': f.sentence(nb_words=12, variable_nb_words=True),
            'name': f.file_name(category='image'),
            'type': t,
            'filetype': f.mime_type(category='image')
        } for a in range(1, random.randint(2, 10))]  # create between 1 and 10 of these
    }


def generate_file_dict():
    f = Faker()
    return {
        'type': 'file',
        'files': [{
            'post': random.randint(1, Post.objects.count()) if Post.objects.count() >= 1 else 1,
            'name': f.file_name(),
            'type': 'file',
            'url': f.url()
        } for a in range(1, random.randint(2, 20))]
    }


YOUTUBE_LIST = [
    'https://www.youtube.com/watch?v=DsuTwV0jwaY',
    'https://www.youtube.com/watch?v=z6hQqgvGI4Y',
    'https://www.youtube.com/watch?v=Fa4cRMaTDUI',
    'https://www.youtube.com/watch?v=IUgstalu6zo',
    'https://www.youtube.com/watch?v=yDv5FIAeyoY',
    'https://www.youtube.com/watch?v=2yXfUPwlZTw',
    'https://www.youtube.com/watch?v=we4zuQIXmnw',
    'https://www.youtube.com/watch?v=1j8xTOmR8pw',
    'https://www.youtube.com/watch?v=5LYrN_cAJoA&list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa',
    'https://www.youtube.com/watch?v=XK9N5d_ORN4',
    'https://www.youtube.com/watch?v=5Bi-Mcg_2Y0',
    'https://www.youtube.com/watch?v=gyuP-DztlmM',
    'https://www.youtube.com/watch?v=FNQxxpM1yOs',
    'https://www.youtube.com/watch?v=D6esTdOLXh4',
    'https://www.youtube.com/watch?v=0Jo_Q8NYd3I',
    'https://www.youtube.com/watch?v=jgWnccjXR4I'

]

FUNCTION_LIST = [
    generate_video_link_dict,
    generate_text_dict,
    generate_audio_file_dict,
    generate_file_dict,
    generate_image_file_dict,
    generate_video_file_dict
]


class PostFactory(factory.DjangoModelFactory):
    class Meta:
        model = Post

    title = factory.Faker('sentence')
    likes = factory.lazy_attribute(lambda x: random.randint(0, 1000))
    user = factory.lazy_attribute(lambda x: User.objects.all()[
                                  random.randint(0, User.objects.count()-1)])
    timestamp = factory.Faker('date_time_this_century',
                              before_now=True, after_now=False)
    tags = factory.Faker('words', nb=random.randint(0, 30))
    content = factory.lazy_attribute(lambda x: [FUNCTION_LIST[random.randint(
        0, len(FUNCTION_LIST)-1)]() for a in range(random.randint(1, 10))])
    content_type = factory.lazy_attribute(
        lambda x: Post.CONTENT_TYPE[random.randint(0, len(Post.CONTENT_TYPE)-1)][0])
    grade = factory.lazy_attribute(
        lambda x: Post.GRADES[random.randint(0, len(Post.GRADES)-1)][0])
    length = factory.Faker('time_delta')
    draft = False
