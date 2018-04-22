from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APIClient
from posts.models import Post, Standard
from accounts.models import User
from posts.serializers import PostSerializer
from django.core.management import call_command
from datetime import timedelta
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
        



        cls.s = Standard.objects.create(
            grade=5, #fourth grade
            code="TestStandard.ELA.4.A",
            category="Doing things",
            description="Students should be able to write unit tests using PyUnit.",
            subject=1, #ELA
            name="PyUnit"
        )
        cls.s1 = Standard.objects.create(
            grade=5, #fourth grade
            code="TestStandard.ELA.4.B",
            category="American History",
            description="Students should know the origins of the maya.",
            subject=1, #ELA
            name="Mayan History"
        )
    
        p = Post.objects.get(title="Required Tuesday Videos")
        p.grade = 7 #sixth grade
        p.content_type = 2 #lecture
        p.length = timedelta(minutes=30) #30 minutes

        p.save()
        p1 = Post.objects.get(title="Battle of Little Big Horn")
        p1.grade = 7 #seventh grade

        

        Post.objects.get(title="Origins of the Maya").standards.add(cls.s1)
        Post.objects.get(title="Programming in Python!").standards.add(cls.s)

        call_command('search_index', '--rebuild', '-f')
    
    def test_search_with_standard_param_returns_appropriate_post(self):
        resp = self.client.get('/api/search/?standard=' + str(self.s1.pk))
        self.assertEqual(resp.status_code, 200, 'api call returned non-success')
        self.assertEqual(len(resp.data),1)
        self.assertEqual(resp.data[0]['title'], 'Origins of the Maya')
        
        

    def test_search_with_multiple_standard_params_returns_all_posts_with_any_of_those_standards(self):
        resp = self.client.get('/api/search/?standard=' + str(self.s1.pk) + '%20' + str(self.s.pk))
        self.assertEqual(resp.status_code, 200, 'api call returned non-success')
        self.assertEqual(len(resp.data),2)
        titles = [resp.data[0]['title'], resp.data[1]['title']]
        self.assertIn('Origins of the Maya', titles)

        self.assertIn('Programming in Python!', titles)
        
        
    def test_search_with_no_query_params_returns_all_posts(self):
        resp = self.client.get('/api/search/')
        self.assertEqual(resp.status_code, 200, 'api call returned non-success status')
        self.assertEqual(len(resp.data), 9)

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



# Currently commenting this out due to errors with authenticating test API requests. 
# @TODO fix this.

# class PostCreateTestCase(TestCase):
#     def setUp(self):
#         User.objects.create_user('bryan', 'bmccoid@ucsc.edu')
#         self.u = User.objects.first()
#         self.client = APIClient()
#         # nothing yet

#     def test_can_lookup(self):
#         # create a post to lookup
#         Post.objects.create(title='test post', content={},
#                             likes=0, user=self.u, tags =[], length=0)
#         p = Post.objects.first()

#         # test get request
#         resp = self.client.get('/api/posts/{}/'.format(p.pk))

#         self.assertEqual(resp.status_code, 200)
#         self.assertEqual(resp.data, PostSerializer(p).data)

#     def test_can_create(self):
#         resp = self.client.post('/api/posts/', {
#             'title': 'test post',
#             'content': {},
#             'likes': 0,
#             'user': self.u.pk,
#             'comments': [],
#             'attachments': [],
#             'tags': [],
#         }, format='json')
#         self.assertEqual(resp.status_code, 201)
    

    
#     #Tests the begin_index filter, which should return 10 posts beginning at the given begin index.
#     #i.e. if somebody were to declare 55 posts one could get them 10 at a time by providing 
#     #begin index 0, 10, 20, 30, 40, and 50 subsequently, with the last call returning only posts 50-54.
#     #use case is in post feed - don't want to load every post at once, so we'll use this filter
#     #to load a subset of the posts we search for at a time.
    
#     def test_filter_by_begin_index(self):
#         for i in range(0,55):
#             Post.objects.create(title='lots of this post', content={}, user=self.u, tags=[])
#         for i in range(0, 4):
#             resp = self.client.get('/api/posts/?beginIndex=' + str(i*10))
#             self.assertEqual(resp.status_code, 200)
#             size=0
#             for thing in resp.data:
#                 size+=1
#             self.assertEqual(size, 10)
#         resp = self.client.get('/api/posts/?beginIndex=50')
#         size=0
#         self.assertEqual(resp.status_code, 200)
#         for thing in resp.data:
#             size+=1
#         self.assertEqual(size, 5)

