from django.core.management.base import BaseCommand, CommandError
from accounts.models import User as U
from faker import Faker

RED   = "\033[1;31m"  
BLUE  = "\033[1;34m"
CYAN  = "\033[1;36m"
GREEN = "\033[0;32m"
RESET = "\033[0;0m"
BOLD    = "\033[;1m"
REVERSE = "\033[;7m"

class Command(BaseCommand):
    help = 'Generates n fake users (or 10 by default).'

    def add_arguments(self, parser):
        parser.add_argument('quantity', nargs='?', type=int, default=10)

    def handle(self, *args, **options):
        quantity = options.get('quantity')
        fake = Faker()
        for i in range(0, quantity):
            prof = fake.profile()
            username = prof['username']
            email = prof['mail']
            U.objects.create_user(username, email)
            self.stdout.write('%d.)' % (i+1) + GREEN + ' Created ' + RED + 'User: ' + CYAN + '%s (%s)' % (username, email) + RESET)
    