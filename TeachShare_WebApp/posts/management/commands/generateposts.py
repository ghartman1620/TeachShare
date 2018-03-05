from django.core.management.base import BaseCommand, CommandError
from posts.factories import PostFactory
from faker import Faker

RED   = "\033[1;31m"  
BLUE  = "\033[1;34m"
CYAN  = "\033[1;36m"
GREEN = "\033[0;32m"
RESET = "\033[0;0m"
BOLD    = "\033[;1m"
REVERSE = "\033[;7m"

# CONTENT_TYPES = [
#     "video_file",
#     "video_link",
#     "text",
#     "audio",
#     "image_file",
#     "file"
# ]

class Command(BaseCommand):
    help = 'Generates n fake posts (or 10 by default).'

    def add_arguments(self, parser):
        parser.add_argument('quantity', nargs='?', type=int, default=10)

    def handle(self, *args, **options):
        quantity = options.get('quantity')
        fake = Faker()
        for i in range(0, quantity):
            post = PostFactory()
            self.stdout.write('%d.)' % (i+1) + GREEN + ' Created ' + RED + 'Post: ' + CYAN + '%s (%s)' % (post.title, post.user.username) + RESET)
            
    