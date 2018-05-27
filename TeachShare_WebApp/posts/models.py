from django.db import models
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.auth.models import User
from django.conf import settings
from django.utils.timezone import now as timezone_now
import random
import string
from uuid import uuid4
import os
from datetime import timedelta

#django channels
#tornado
#aio http python
#websockets python
#which one good not just from websocket perspective but also from async perspective



#how to make this available to frontend without having to port over the enum manually?

GRADES = (
    (0, 'Preschool'),
    (1, 'Kindergarten'),
    (2, 'First Grade'),
    (3, 'Second Grade'),
    (4, 'Third Grade'),
    (5, 'Fourth Grade'),
    (6, 'Fifth Grade'),
    (7, 'Sixth Grade'),
    (8, 'Seventh Grade'),
    (9, 'Eighth Grade'),
    (10, 'High School'),
) 

SCIENCE_PRACTICES = (
    (-1, 'not science'),
    (0, 'Asking questions and defining problems'),
    (1, 'Developing and using models'),
    (2, 'Planning and carrying out investigations'),
    (3, 'Analyzing and interpreting data'),
    (4, 'Using mathematics and computational thinking'),
    (5, 'Constructing explanations and designing solutions'),
    (6, 'Engaging in argument from evidence'),
    (7, 'Obtaining, evaluating, and communicating information')
)

SCIENCE_DISCIPLINARY_CORE_IDEAS = (
    (-1, 'not science'),
    (0, 'PS1A: Structure and properties of matter'),
    (1, 'PS1B: Chemical Reactions'),
    (2, 'PS1C: Nuclear Processes'),
    (3, 'PS2A: Forces and Motion'),
    (4, 'PS2B: Types of Interactions'),
    (5, 'PS3A: Definitions of Energy'),
    (6, 'PS3B: Conservation of Energy and Energy Transfer'),
    (7, 'PS3C: Relationship Between Energy and Forces'),
    (8, 'PS3D: Energy in Chemical Processes and Everday Life'),
    (9, 'PS4A: Wave Properties'),
    (10, 'PS4B: Electromagnetic Radiation'),
    (11, 'PS4C: Information Technologies and Instrumentation'),
    (12, 'LS1A: Structure and Function'),
    (13, 'LS1B: Growth and Development of Organisms'),
    (14, 'LS1C: Organization for Matter and Energy Flow in Organisms'),
    (15, 'LS1D: Information Processing'),
    (16, 'LS2A: Interdependent Relationships in Ecosystems'),
    (17, 'LS2B: Cycles of Matter and Energy Transfer in Ecosystems'),
    (18, 'LS2C: Ecosystems Dynamics, Functioning and Resilience'),
    (19, 'LS2D: Social Interactions and Group Behavior'),
    (20, 'LS3A: Inheritance of Traits'),
    (21, 'LS3B: Variation of Traits'),
    (22, 'LS4A: Evidence of Common Ancestry and Diversity'),
    (23, 'LS4B: Natural Selection'),
    (24, 'LS4C: Adaptation'),
    (25, 'LS4D: Biodiversity and Humans'),
    (26, 'ESS1A: The Universe and its Stars'),
    (27, 'ESS1B: Earth and the Solar System'),
    (28, 'ESS1C: The History of Planet Earth'),
    (29, 'ESS2A: Earth Materials and Systems'),
    (30, 'ESS2B: Plate Tectonics and Large-Scale Systems'),
    (31, 'ESS2C: The Role of Water in Earth’s Surface Processes'),
    (32, 'ESS2D: Weather and Climate'),
    (33, 'ESS2E: Biogeology'),
    (34, 'ESS3A: Natural Resources'),
    (35, 'ESS3B: Natural Hazards'),
    (36, 'ESS3C: Human Impacts on Earth Systems'),
    (37, 'ESS3D: Global Climate Change'),
    (38, 'ETS1A: Defining and Delimiting and Engineering Problem'),
    (39, 'ETS1B: Developing Possible Solutions'),
    (40, 'ETS1C: Optimizing the Design Solution')
)

SCIENCE_CROSSCUTTING_CONCEPTS = (
    (0, 'Patterns'),
    (1, 'Cause and Effect'),
    (2, 'Scale, Proportion, and Quantity'),
    (3, 'Systems and System Models'),
    (4, 'Energy and Matter'),
    (5, 'Structure and Function'),
    (6, 'Stability and Change'),
    (7, 'Interdependence of Science, Engineering, and Technology'),
    (8, 'Influence of Engineering, Technology, \
    and Science on Society and the Natural World'),
    
)

SUBJECTS = (
    (0, 'Math'),
    (1, 'English Language Arts'),
    (2, 'Physical Sciences'),
    (3, 'Life Sciences'),
    (4, 'Earth and Space Sciences'),
    (5, 'Engineering, Technology, and the Applications of Science'),
)


#some python shell code I ran to load in all the standards from Math.json.
#Saved here for posterity incase we need to repeat the process at some point
#Perhaps for ELA standards?
'''
In [27]: for std in obj:
    ...:     Standard.objects.create(
    ...:         name=std['title'],
    ...:         code=std['standard_codes'][0] if len(std['standard_codes']) > 0 else 'N/A',
    ...:         category=std['subject_domains'][0] if len(std['subject_domains']) > 0 else 'N/A',
    ...:         grade=(1 if std['grades'][0]=='K' else
    ...:             (0 if std['grades'][0]=='Pre-K' else int(std['grades'][0])+1)),
    ...:         description=std['goal_text'],
    ...:         subject=0,
    ...:     )
    ...:
    ...:
'''

class Standard(models.Model):
    
    name= models.CharField(max_length=100, default='')
    code = models.CharField(max_length=100, default='')
    category = models.CharField(max_length=100, default='') #???? maybe
    grade = models.IntegerField(choices=GRADES)
    description = models.TextField(default='')
    subject = models.IntegerField(choices=SUBJECTS, default=0)
    
    #i mistakenly created some duplicates, so I used this method to remove them:
    def __eq__(self, other):
        return self.name == other.name and self.code == other.code and self.category == other.category\
            and self.grade == other.grade and self.description == other.description and self.subject == other.subject
    


class Post(models.Model):


    CONTENT_TYPE = (
        (0, 'Game'),
        (1, 'Lab'),
        (2, 'Lecture')
    )
    class Meta:
        permissions = (
            ('view_post', 'Can view post'),
        )

    practices = ArrayField(
        models.IntegerField(blank=True, 
                    choices=SCIENCE_PRACTICES, default=-1),
        blank=True, default=[])


    crosscutting_concepts = ArrayField(
        models.IntegerField(blank=True,\
                    choices=SCIENCE_CROSSCUTTING_CONCEPTS, default=-1),\
        blank=True, default=[])
    disciplinary_core_ideas = ArrayField(
        models.IntegerField(blank=True, \
                    choices=SCIENCE_DISCIPLINARY_CORE_IDEAS, default=-1),\
        blank=True, default=[])

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    original_user = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.CASCADE
    )
    original_post = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE
    )


    title = models.CharField(max_length=100, default='', blank=True)
    content = JSONField()
    updated = models.DateTimeField(auto_now=True, auto_now_add=False)
    likes = models.IntegerField(default=0)
    draft = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)
    tags = JSONField(blank=True, default=[])
    color = models.CharField(max_length=7, blank=True, default="#96e6b3")
    layout = JSONField(default=[{"x":0, "y":0, "w":2, "h":30, "i":"0"}])
    grade = models.IntegerField(choices=GRADES, default=0)
    subject = models.IntegerField(choices=SUBJECTS, default=0)
    length = models.DurationField(blank=True, default=timedelta(0))
    content_type = models.IntegerField(choices=CONTENT_TYPE,default=0)

    standards = models.ManyToManyField(Standard, blank=True)    


class Comment(models.Model):
    post = models.ForeignKey(
        Post, related_name='comments',
        on_delete=models.CASCADE)
    text = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='comments',
                             default=1, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)

    def __str__(self):
        return self.text


def upload_to(instance, filename):
    now = timezone_now()
    # filename_base, filename_ext = os.path.splitext(filename)
    return '../media/uploads/{}{}/{}'.format(
        now.strftime("%Y/%m/%d/"),
        str(uuid4()),
        filename)


class Attachment(models.Model):
    post = models.ForeignKey(
        Post, related_name='attachments', on_delete=models.SET_NULL, null=True)
    file = models.FileField(null=True, blank=True, upload_to=upload_to)
    last_updated = models.DateTimeField(auto_now=True, auto_now_add=False)
# Creates list of tags for every post
