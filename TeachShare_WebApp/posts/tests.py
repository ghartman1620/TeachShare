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
        cls.u = User.objects.create(username='User1')
        cls.u2 = User.objects.create(username='User2')
        cls.client = APIClient()
        with open('posts/testPostContent.json', encoding='utf8') as f:
            posts = json.loads(f.read())
            for obj in posts:
                Post.objects.create(
                    title=obj['title'],
                    user=cls.u,
                    content=obj['content'],
                    tags=obj['tags'],
                )
        call_command('search_index', '--rebuild')
    

    @classmethod
    def tearDownClass(cls):
        assert(True)
    def test_search_with_no_query_params_returns_all_posts(self):
        resp = self.client.get('/api/search/')
        self.assertEqual(resp.status_code, 200, 'api call returned non-success status')
        self.assertEqual(len(resp.data), 10)


    
    def test_search_with_term_parameter_returns_appropriate_post(self):
        resp = self.client.get('/api/search/?term=programming')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)
        self.assertEqual(resp.data[1]['title'], "Programming in Python!")
        self.assertEqual(resp.data[0]['title'], "Scratch programming")
        
        resp = self.client.get('/api/search/?term=history')
        self.assertEqual(len(resp.data),3)
        titles = []
        for post in resp.data:
            titles.append(post['title'])
        self.assertIn("Origins of the Maya", titles)
        self.assertIn("Battle of Little Big Horn",titles)
        self.assertIn("Christopher Columbus", titles)

    def test_search_with_search_location_param_returns_appropriate_posts(self):
        

    # def test_search_with_term_parameter_returns_post_with_tag(self):
    #     resp = self.client.get('/api/search/?term=history')
    #     self.assertEqual(resp.status_code, 200)
    #     self.assertEqual(resp.data[0], PostSerializer(self.p0).data)
    #     self.assertEqual(len(resp.data), 1)

    # def test_search_with_multiple_parameters(self):
    #     resp = self.client.get('/api/search/?term=programming python')
    #     self.assertEqual(resp.status_code, 200)
    #     self.assertEqual(resp.data[0], PostSerializer(self.p3).data)
    #     self.assertEqual(len(resp.data), 1)

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

