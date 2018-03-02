from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APIClient
from posts.models import Post
from accounts.models import User
from posts.serializers import PostSerializer
from django.core.management import call_command
import json

class PostSearchTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super(PostSearchTestCase, cls).setUpClass()
        u = User.objects.create(username='User1')
        u2 = User.objects.create(username='User2')
        with open('posts/testPostContent/columbus', encoding='utf8') as f:
            cls.p0 = Post.objects.create(
                user=u, 
                title='Christopher Columbus',
                content=json.loads(f.read()),
                tags=['history','columbus'],
                likes=0,
            )
        with open('posts/testPostContent/scratch', encoding='utf8') as f:
            cls.p1 = Post.objects.create(
                user=u, 
                title='Programming in Scratch',
                content=json.loads(f.read()),
                tags=['cs','programming', 'scratch'],
                likes=0,
            )
        with open('posts/testPostContent/garageband', encoding='utf8') as f:
            cls.p2 = Post.objects.create(
                user=u2, 
                title='Garage Band',
                content=json.loads(f.read()),
                tags=[],
                likes=0,
            )
        call_command('search_index', '--rebuild')
        cls.client = APIClient()

    @classmethod
    def tearDownClass(cls):
        assert(True)

    def test_search_with_no_query_params_returns_all_posts(self):
        print("in search with no query params")
        resp = self.client.get('/api/search/')
        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.data), 3)

    def test_search_with_term_parameter_returns_appropriate_post(self):
        print("in search with simple term")
        resp = self.client.get('/api/search/?term=programming')
        self.assertEqual(resp.status_code, 200)

        self.assertEqual(resp.data[0], PostSerializer(self.p1).data)
        self.assertEqual(len(resp.data), 1)

class PostCreateTestCase(TestCase):
    def setUp(self):
       
        User.objects.create_user('bryan', 'bmccoid@ucsc.edu')
        self.u = User.objects.first()
        self.client = APIClient()
        # nothing yet

    def test_can_lookup(self):
        # create a post to lookup
        Post.objects.create(title='test post', content={},
                            likes=0, user=self.u, tags =[])
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
    

    '''
    Tests the begin_index filter, which should return 10 posts beginning at the given begin index.
    i.e. if somebody were to declare 55 posts one could get them 10 at a time by providing 
    begin index 0, 10, 20, 30, 40, and 50 subsequently, with the last call returning only posts 50-54.
    use case is in post feed - don't want to load every post at once, so we'll use this filter
    to load a subset of the posts we search for at a time.
    '''
    def test_filter_by_begin_index(self):
        for i in range(0,55):
            Post.objects.create(title='lots of this post', content={}, user=self.u, tags=[])
        for i in range(0, 4):
            resp = self.client.get('/api/posts/?beginIndex=' + str(i*10))
            self.assertEqual(resp.status_code, 200)
            size=0
            for thing in resp.data:
                size+=1
            self.assertEqual(size, 10)
        resp = self.client.get('/api/posts/?beginIndex=50')
        size=0
        self.assertEqual(resp.status_code, 200)
        for thing in resp.data:
            size+=1
        self.assertEqual(size, 5)

