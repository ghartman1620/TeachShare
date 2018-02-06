from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APIClient
from posts.models import Post
from accounts.models import User


class PostCreateTestCase(TestCase):
    def setUp(self):
        print("PostCreate [setUp]")
        # nothing yet

    def test_can_create(self):
        # factory = APIRequestFactory()
        # request = factory.get('/posts/1/')
        # print(request)

        User.objects.create_user('bryan', 'bmccoid@ucsc.edu')
        u = User.objects.first()
        # Post.objects.create(title='test post', content={}, likes=0, user=u)
        # p = Post.objects.first()
        # print(Post.objects.all())

        client = APIClient()
        resp = client.post('/api/posts/', {
            'title': 'test post',
            'content': {},
            'likes': 0,
            'user': u.pk,
        }, format='json')
        # resp = client.get('/api/posts/1/')
        print(dir(resp))
        print(resp.content)
        print(resp.data)
        print(resp.items)
        self.assertEqual(resp.status_code, 201)
