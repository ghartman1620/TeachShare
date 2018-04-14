from django_elasticsearch_dsl import DocType, Index, fields

from .models import Post
from math import floor
# Name of the Elasticsearch index
post = Index('posts')
# See Elasticsearch Indices API reference for available settings
post.settings(
    number_of_shards=1,
    number_of_replicas=0
)


def assembleContent(content, element):
    for k, v in element.items():
        if type(v) is dict:
            content = assembleContent(content, v)
        else:
            content = content + " " + str(v)
    return content
    
def fileNamesFromFileElement(element):
    fileNames = []
    
    try:
        for file in element['content']:
            fileNames.append(file['name'])
    except KeyError:
        print(element)
    return fileNames

def fileNamesFromImageAudioElement(element):
    fileNames = []
    for file in element['content']:
        fileNames.append(file['name'])
    return fileNames

def fileNamesFromVideoElement(element):
    return [element['content']['name']]

def fileNamesFromVideoLinkElement(element):
    return [element['content']['title']]



@post.doc_type
class PostDocument(DocType):
    title = fields.TextField()
    content = fields.TextField()
    filenames = fields.TextField()
    tags = fields.TextField()
    # updated = fields.DateField()
    # likes = fields.IntegerField()
    timestamp = fields.DateField()
    id = fields.IntegerField()

    grade = fields.IntegerField()
    content_type = fields.IntegerField()
    subject = fields.IntegerField()
    length = fields.IntegerField()

    def prepare_length(self, instance):
        return floor(instance.length.days*1440) + floor(instance.length.seconds/60)
    '''
    def prepare_tags(self, instance):
        tags = ""
        for tag in instance.tags:
            tags += tag + " "
        return tags
    '''
    def prepare_filenames(self, instance):
        files = []
        for element in instance.content:
            if element['type'] != 'text':
                #This is code golf speak for call a certain function and append it to our files list
                files.extend({
                    'image_file' : fileNamesFromImageAudioElement,
                    'audio'      : fileNamesFromImageAudioElement,
                    'video_file' : fileNamesFromVideoElement,
                    'file'       : fileNamesFromFileElement,
                    'video_link' : fileNamesFromVideoLinkElement,
                }[element['type']](element))

        # from pprint import pprint
        # print("in prepare files")
        # pprint(vars(instance))
        # print("files")  
        # print(files)

        return files
    
    def prepare_content(self, instance):
        content = ""
        if not type(instance.content) is dict:
            for element in instance.content:
                content = content + assembleContent(content, element)
        else:
            for k, v in instance.content.items():
                content = content + " " + v

        return content

    def get_queryset(self):
        return super(PostDocument, self).get_queryset().filter(draft=False)

    class Meta:
        model = Post  # The model associated with this DocType

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [

        ]

        # Ignore auto updating of Elasticsearch when a model is saved
        # or deleted:
        # ignore_signals = True
        # Don't perform an index refresh after every update (overrides global setting):
        # auto_refresh = False
        # Paginate the django queryset used to populate the index with the specified size
        # (by default there is no pagination)
        # queryset_pagination = 5000
