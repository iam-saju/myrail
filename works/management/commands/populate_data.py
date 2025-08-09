from django.core.management.base import BaseCommand
from django.utils import timezone
from works.models import User, Destination, TravelPost, PostTag, PostTagRelation
import random

class Command(BaseCommand):
    help = 'Populate database with sample travel data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating sample data...'))

        # Create sample users
        users_data = [
            {'username': 'wanderlust_sarah', 'email': 'sarah@example.com', 'first_name': 'Sarah', 'verified': True},
            {'username': 'adventure_alex', 'email': 'alex@example.com', 'first_name': 'Alex', 'verified': False},
            {'username': 'tokyo_tales', 'email': 'tokyo@example.com', 'first_name': 'Yuki', 'verified': True},
            {'username': 'mountain_mike', 'email': 'mike@example.com', 'first_name': 'Mike', 'verified': False},
            {'username': 'beach_bella', 'email': 'bella@example.com', 'first_name': 'Bella', 'verified': True},
        ]

        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'verified': user_data['verified'],
                    'followers_count': random.randint(1000, 50000),
                    'following_count': random.randint(100, 2000),
                }
            )
            user.set_password('password123')
            user.save()
            users.append(user)
            if created:
                self.stdout.write(f'Created user: {user.username}')

        # Create sample destinations
        destinations_data = [
            {
                'name': 'Santorini',
                'country': 'Greece',
                'city': 'Oia',
                'latitude': 36.3932,
                'longitude': 25.4615,
                'has_3d_model': True,
                'model_type': 'island',
                'description': 'Beautiful Greek island known for stunning sunsets and white-washed buildings.'
            },
            {
                'name': 'Machu Picchu',
                'country': 'Peru',
                'city': 'Cusco',
                'latitude': -13.1631,
                'longitude': -72.5450,
                'has_3d_model': True,
                'model_type': 'mountain',
                'description': 'Ancient Inca citadel located in the Eastern Cordillera of southern Peru.'
            },
            {
                'name': 'Tokyo',
                'country': 'Japan',
                'city': 'Tokyo',
                'latitude': 35.6895,
                'longitude': 139.6917,
                'has_3d_model': True,
                'model_type': 'city',
                'description': 'Bustling metropolis blending traditional culture with modern innovation.'
            },
            {
                'name': 'Bali',
                'country': 'Indonesia',
                'city': 'Ubud',
                'latitude': -8.3405,
                'longitude': 115.0920,
                'has_3d_model': True,
                'model_type': 'temple',
                'description': 'Tropical paradise known for temples, beaches, and rice terraces.'
            },
            {
                'name': 'Iceland',
                'country': 'Iceland',
                'city': 'Reykjavik',
                'latitude': 64.1466,
                'longitude': -21.9426,
                'has_3d_model': False,
                'model_type': 'island',
                'description': 'Land of fire and ice with stunning natural phenomena.'
            },
        ]

        destinations = []
        for dest_data in destinations_data:
            destination, created = Destination.objects.get_or_create(
                name=dest_data['name'],
                country=dest_data['country'],
                defaults=dest_data
            )
            destinations.append(destination)
            if created:
                self.stdout.write(f'Created destination: {destination.name}')

        # Create sample tags
        tag_names = [
            'travel', 'adventure', 'wanderlust', 'sunset', 'mountains',
            'beach', 'culture', 'food', 'nature', 'architecture',
            'photography', 'backpacking', 'luxury', 'budget', 'solo'
        ]

        tags = []
        for tag_name in tag_names:
            tag, created = PostTag.objects.get_or_create(name=tag_name)
            tags.append(tag)

        # Create sample posts
        posts_data = [
            {
                'description': 'Sunset vibes in Santorini 🌅 The most magical place on earth! #santorini #greece #sunset #travel',
                'music_name': 'Summer Vibes',
                'music_artist': 'Chill Mix',
                'featured_3d': True,
                'tags': ['travel', 'sunset', 'adventure']
            },
            {
                'description': 'Finally made it to Machu Picchu! 4-day trek was worth every step 🏔️ #machupicchu #peru #hiking #adventure',
                'music_name': 'Adventure Awaits',
                'music_artist': 'Epic Mix',
                'featured_3d': True,
                'tags': ['adventure', 'mountains', 'travel']
            },
            {
                'description': 'Cherry blossom season in Tokyo is unreal! 🌸 Traditional meets modern everywhere you look ✨ #tokyo #japan #sakura #culture',
                'music_name': 'Japanese Lofi',
                'music_artist': 'Peaceful',
                'featured_3d': True,
                'tags': ['culture', 'travel', 'photography']
            },
            {
                'description': 'Temple hopping in Bali never gets old! Each one tells a unique story 🏛️ #bali #indonesia #temple #spirituality',
                'music_name': 'Balinese Meditation',
                'music_artist': 'Spiritual Sounds',
                'featured_3d': True,
                'tags': ['culture', 'architecture', 'travel']
            },
            {
                'description': 'Northern lights dancing across the Icelandic sky! Nature\'s greatest show 💫 #iceland #northernlights #nature #magic',
                'music_name': 'Arctic Dreams',
                'music_artist': 'Nature Sounds',
                'featured_3d': False,
                'tags': ['nature', 'photography', 'travel']
            },
        ]

        for i, post_data in enumerate(posts_data):
            user = users[i % len(users)]
            destination = destinations[i % len(destinations)]
            
            post = TravelPost.objects.create(
                user=user,
                destination=destination,
                description=post_data['description'],
                music_name=post_data['music_name'],
                music_artist=post_data['music_artist'],
                featured_3d=post_data['featured_3d'],
                likes_count=random.randint(1000, 200000),
                comments_count=random.randint(50, 5000),
                shares_count=random.randint(10, 1000),
                views_count=random.randint(10000, 5000000),
            )

            # Add tags to post
            for tag_name in post_data['tags']:
                tag = next((t for t in tags if t.name == tag_name), None)
                if tag:
                    PostTagRelation.objects.create(post=post, tag=tag)
                    tag.posts_count += 1
                    tag.save()

            self.stdout.write(f'Created post by {user.username} at {destination.name}')

        # Update destination post counts
        for destination in destinations:
            destination.posts_count = destination.posts.count()
            destination.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created:\n'
                f'- {len(users)} users\n'
                f'- {len(destinations)} destinations\n'
                f'- {len(posts_data)} posts\n'
                f'- {len(tags)} tags'
            )
        )