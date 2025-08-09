from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class User(AbstractUser):
    """Extended User model for travel app"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    verified = models.BooleanField(default=False)
    followers_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)
    total_likes = models.PositiveIntegerField(default=0)
    total_views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"@{self.username}"

class Destination(models.Model):
    """Travel destinations with 3D visualization data"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
    description = models.TextField(blank=True)
    featured_image = models.ImageField(upload_to='destinations/', null=True, blank=True)
    
    # 3D visualization settings
    has_3d_model = models.BooleanField(default=False)
    model_type = models.CharField(
        max_length=50,
        choices=[
            ('island', 'Floating Island'),
            ('city', 'City Scene'),
            ('mountain', 'Mountain Landscape'),
            ('beach', 'Beach Scene'),
            ('temple', 'Temple/Monument'),
            ('custom', 'Custom Model')
        ],
        default='island'
    )
    
    # Popularity metrics
    posts_count = models.PositiveIntegerField(default=0)
    visits_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['name', 'country']
        indexes = [
            models.Index(fields=['country']),
            models.Index(fields=['posts_count']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.name}, {self.country}"

class TravelPost(models.Model):
    """Main travel post model - TikTok style content"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='posts')
    
    # Content
    video = models.FileField(upload_to='videos/')
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True)
    description = models.TextField(max_length=500)
    music_name = models.CharField(max_length=200, blank=True)
    music_artist = models.CharField(max_length=200, blank=True)
    
    # Features
    featured_3d = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    # Engagement metrics
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)
    
    # Metadata
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    file_size_mb = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['destination', '-created_at']),
            models.Index(fields=['-likes_count']),
            models.Index(fields=['-views_count']),
            models.Index(fields=['featured_3d']),
            models.Index(fields=['is_featured']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.destination.name}"

class PostTag(models.Model):
    """Tags for travel posts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    posts_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"#{self.name}"

class PostTagRelation(models.Model):
    """Many-to-many relationship between posts and tags"""
    post = models.ForeignKey(TravelPost, on_delete=models.CASCADE, related_name='tag_relations')
    tag = models.ForeignKey(PostTag, on_delete=models.CASCADE, related_name='post_relations')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'tag']

class PostLike(models.Model):
    """User likes on posts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_posts')
    post = models.ForeignKey(TravelPost, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['post', '-created_at']),
        ]

class PostComment(models.Model):
    """Comments on travel posts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(TravelPost, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    content = models.TextField(max_length=500)
    likes_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."

class PostShare(models.Model):
    """Track post shares"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_posts')
    post = models.ForeignKey(TravelPost, on_delete=models.CASCADE, related_name='shares')
    platform = models.CharField(
        max_length=50,
        choices=[
            ('native', 'Native Share'),
            ('instagram', 'Instagram'),
            ('twitter', 'Twitter'),
            ('facebook', 'Facebook'),
            ('whatsapp', 'WhatsApp'),
            ('telegram', 'Telegram'),
            ('copy_link', 'Copy Link'),
        ],
        default='native'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['platform']),
        ]

class PostView(models.Model):
    """Track post views for analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='viewed_posts')
    post = models.ForeignKey(TravelPost, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    view_duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

class UserFollow(models.Model):
    """User following relationships"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['follower', 'following']
        indexes = [
            models.Index(fields=['follower', '-created_at']),
            models.Index(fields=['following', '-created_at']),
        ]

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

class TrendingDestination(models.Model):
    """Track trending destinations"""
    destination = models.OneToOneField(Destination, on_delete=models.CASCADE, primary_key=True)
    score = models.FloatField(default=0.0)
    posts_last_24h = models.PositiveIntegerField(default=0)
    posts_last_week = models.PositiveIntegerField(default=0)
    engagement_rate = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score']

class UserPreference(models.Model):
    """User travel preferences for personalized feed"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    preferred_destinations = models.ManyToManyField(Destination, blank=True)
    favorite_tags = models.ManyToManyField(PostTag, blank=True)
    
    # Content preferences
    show_3d_content = models.BooleanField(default=True)
    auto_play_videos = models.BooleanField(default=True)
    show_trending = models.BooleanField(default=True)
    
    updated_at = models.DateTimeField(auto_now=True)
