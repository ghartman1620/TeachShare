from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APIClient
from posts.models import Post
from accounts.models import User
from posts.serializers import PostSerializer


class PostCreateTestCase(TestCase):
    def setUp(self):
        print("PostCreate [setUp]")
        User.objects.create_user('bryan', 'bmccoid@ucsc.edu')
        self.u = User.objects.first()
        self.client = APIClient()
        # nothing yet

    def test_can_lookup(self):
        # create a post to lookup
        Post.objects.create(title='test post', content={},
                            likes=0, user=self.u)
        p = Post.objects.first()

        # test get request
        resp = self.client.get('/api/posts/{}/'.format(p.pk))

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, PostSerializer(p).data)

    def test_can_create(self):
        resp = self.client.post('/api/posts/', {
            'title': 'test post',
            'content': {},
            'likes': 0,
            'user': self.u.pk,
            'comments': [],
            'attachments': [],
            'tags': [],
        }, format='json')
        self.assertEqual(resp.status_code, 201)
