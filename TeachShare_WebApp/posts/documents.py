from django_elasticsearch_dsl import DocType, Index, fields
from .models import Post

# Name of the Elasticsearch index
post = Index('posts')
# See Elasticsearch Indices API reference for available settings
post.settings(
    number_of_shards=1,
    number_of_replicas=0
)


@post.doc_type
class PostDocument(DocType):
    title = fields.TextField()
    content = fields.NestedField()
    tags = fields.ObjectField()
    updated = fields.DateField()
    likes = fields.IntegerField()
    timestamp = fields.DateField()


    def prepare_content(self, instance):
        return instance.content

    class Meta:
        model = Post # The model associated with this DocType
        
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