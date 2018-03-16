from django.test import TestCase

from rest_framework.test import APIRequestFactory, APIClient, force_authenticate

from posts.models import Post
from accounts.models import User
from posts.serializers import PostSerializer
from django.core.management import call_command
from datetime import timedelta
from oauth2_provider.models import Application 

import json


class PostSearchTestCase(TestCase):

    @classmethod
    def setUpClass(cls):
        super(PostSearchTestCase, cls).setUpClass()
        call_command('search_index', '--delete', '-f')
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
                    grade=0,
                    content_type=0,
                    length=timedelta(seconds=0),
                    draft=False
                )   
        call_command('search_index', '--rebuild', '-f')
    

        
    def test_search_with_no_query_params_returns_all_posts(self):
        resp = self.client.get('/api/search/')
        self.assertEqual(resp.status_code, 200, 'api call returned non-success status')
        self.assertEqual(len(resp.data), 10)

    def test_search_with_term_type_and_returns_appropriate_posts(self):
        resp = self.client.get('/api/search/?term=history%20maya&termtype=and')
        self.assertEqual(resp.status_code, 200, 'api non-success')
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['title'], 'Origins of the Maya')

    def test_search_with_term_type_or_returns_appropriate_posts(self):
        resp = self.client.get('/api/search/?term=history%20maya&termtype=or')
        self.assertEqual(resp.status_code, 200, 'api non-success')
        self.assertEqual(len(resp.data), 3)
        titles = []
        for post in resp.data:
            titles.append(post['title'])
        self.assertIn('Origins of the Maya', titles)
        self.assertIn('Christopher Columbus', titles)
        self.assertIn('Battle of Little Big Horn', titles)

    def test_search_with_exclude_type_and_returns_appropriate_posts(self):
        resp = self.client.get('/api/search/?term=history&exclude=maya%20columbus&excludetype=and')
        self.assertEqual(resp.status_code, 200, 'api non-success')
        self.assertEqual(len(resp.data), 3)
        titles = []
        for post in resp.data:
            titles.append(post['title'])
        self.assertIn('Origins of the Maya', titles)
        self.assertIn('Christopher Columbus', titles)
        self.assertIn('Battle of Little Big Horn', titles)

    def test_search_with_exclude_type_or_returns_appropriate_posts(self):
        resp = self.client.get('/api/search/?term=history&exclude=maya%20columbus&excludetype=or')
        self.assertEqual(resp.status_code, 200, 'api non-success')
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['title'], 'Battle of Little Big Horn')

    def test_search_excludes_doesnt_return_post_with_exclusionary_term(self):
        resp = self.client.get('/api/search/?term=programming&exclude=python')
        self.assertEqual(resp.status_code, 200, 'api non-success')
        self.assertEqual(len(resp.data), 1, 'only one post fits these parameters')
        self.assertEqual(resp.data[0]['title'], 'Scratch programming')

    def test_search_in_parameter_returns_appropriate_post(self):
        resp = self.client.get('/api/search/?term=history&in=title')
        self.assertEqual(resp.status_code, 200, 'api non-success')
        self.assertEqual(len(resp.data), 0, 'no posts fit this parameter')

    def test_search_with_term_parameter_returns_appropriate_post(self):
        resp = self.client.get('/api/search/?term=programming')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)
        titles = []
        for post in resp.data:
            titles.append(post['title'])
        self.assertIn('Programming in Python!', titles)
        self.assertIn('Scratch programming', titles)
        
        resp = self.client.get('/api/search/?term=history')
        self.assertEqual(len(resp.data),3)
        titles = []
        for post in resp.data:
            titles.append(post['title'])
        self.assertIn("Origins of the Maya", titles)
        self.assertIn("Battle of Little Big Horn",titles)
        self.assertIn("Christopher Columbus", titles)

    #def test_search_with_search_location_param_returns_appropriate_posts(self):
        

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

def registerApplication(user):
    from accounts.views import client_id
    from accounts.views import client_secret
    Application.objects.create(
        client_id=client_id,
        user=user,
        client_type="Confidential",
        authorization_grant_type="Resource owner password-based",
        name="teachshare",
        client_secret=client_secret
    )

class PostCreateAndLoginTestCase(TestCase):
    def setUp(self):
        User.objects.create_user(is_staff=True, username='bryan', email='bmccoid@ucsc.edu', password="abc123")
        self.u = User.objects.first()
        self.client = APIClient()
        self.factory = APIRequestFactory()
        '''from accounts.views import client_id
        from accounts.views import client_secret
        Application.objects.create(
            client_id=client_id,
            user=self.u,
            client_type="Confidential",
            authorization_grant_type="Resource owner password-based",
            name="teachshare",
            client_secret=client_secret
        )
        #registerApplication(self.u)
        resp = self.client.post('/auth/token', {
            'grant_type' : 'password', 
            'username': 'bryan', 
            'password' : 'password123',
        })
        print(resp.data)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + resp.data['access_token'])
        '''

    def test_can_lookup(self):
        # create a post to lookup
        Post.objects.create(title='test post', content={},
                            likes=0, user=self.u, tags =[])
        p = Post.objects.first()

        request = self.factory.get('/api/posts/{}'.format(p.pk))
        force_authenticate(request)
        from posts.views import PostViewSet
        
        resp = PostViewSet.as_view({'get' : 'list'})(request)
        # test get request
        
        #resp = self.client.get('/api/posts/{}/'.format(p.pk))
       
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
            Post.objects.create(title='lots of this post', content={}, user=self.u, tags=[], content_type=0, grade=0,draft=false)
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

