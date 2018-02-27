import datetime
from haystack import indexes
from posts.models import Post


class PostIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    # text = indexes.CharField(document=True, use_template=True)
    title = indexes.CharField(model_attr='title')
    timestamp = indexes.DateTimeField(model_attr='timestamp')

    def get_model(self):
        return Post

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.filter(timestamp__lte=datetime.datetime.now())