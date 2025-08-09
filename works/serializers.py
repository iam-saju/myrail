from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, Destination, TravelPost, PostTag, PostTagRelation,
    PostLike, PostComment, PostShare, UserFollow, TrendingDestination,
    UserPreference
)

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    password = serializers.CharField(write_only=True)
    followers_count = serializers.ReadOnlyField()
    following_count = serializers.ReadOnlyField()
    total_likes = serializers.ReadOnlyField()
    total_views = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'verified', 'followers_count', 'following_count',
            'total_likes', 'total_views', 'password', 'created_at'
        ]
        read_only_fields = ['id', 'verified', 'created_at']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    """Simplified user serializer for profile display"""
    is_following = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'bio', 'avatar',
            'verified', 'followers_count', 'following_count', 'total_likes',
            'is_following', 'posts_count'
        ]

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFollow.objects.filter(
                follower=request.user, following=obj
            ).exists()
        return False

    def get_posts_count(self, obj):
        return obj.posts.filter(is_public=True).count()

class DestinationSerializer(serializers.ModelSerializer):
    """Serializer for Destination model"""
    posts_count = serializers.ReadOnlyField()
    visits_count = serializers.ReadOnlyField()
    is_trending = serializers.SerializerMethodField()

    class Meta:
        model = Destination
        fields = [
            'id', 'name', 'country', 'city', 'latitude', 'longitude',
            'description', 'featured_image', 'has_3d_model', 'model_type',
            'posts_count', 'visits_count', 'is_trending', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_is_trending(self, obj):
        return hasattr(obj, 'trendingdestination')

class PostTagSerializer(serializers.ModelSerializer):
    """Serializer for PostTag model"""
    class Meta:
        model = PostTag
        fields = ['id', 'name', 'posts_count']
        read_only_fields = ['id', 'posts_count']

class PostCommentSerializer(serializers.ModelSerializer):
    """Serializer for PostComment model"""
    user = UserProfileSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = PostComment
        fields = [
            'id', 'user', 'content', 'likes_count', 'is_liked',
            'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'likes_count', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.replies.exists():
            return PostCommentSerializer(
                obj.replies.all()[:3], many=True, context=self.context
            ).data
        return []

    def get_is_liked(self, obj):
        # This would need a separate model for comment likes
        return False

class TravelPostSerializer(serializers.ModelSerializer):
    """Serializer for TravelPost model"""
    user = UserProfileSerializer(read_only=True)
    destination = DestinationSerializer(read_only=True)
    destination_id = serializers.UUIDField(write_only=True)
    tags = serializers.SerializerMethodField()
    tags_input = serializers.CharField(write_only=True, required=False)
    is_liked = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = TravelPost
        fields = [
            'id', 'user', 'destination', 'destination_id', 'video', 'thumbnail',
            'description', 'music_name', 'music_artist', 'featured_3d',
            'is_featured', 'is_public', 'likes_count', 'comments_count',
            'shares_count', 'views_count', 'duration_seconds', 'tags',
            'tags_input', 'is_liked', 'comments', 'time_ago', 'created_at'
        ]
        read_only_fields = [
            'id', 'likes_count', 'comments_count', 'shares_count',
            'views_count', 'created_at'
        ]

    def get_tags(self, obj):
        tags = obj.tag_relations.select_related('tag').all()
        return [f"#{tag.tag.name}" for tag in tags]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(
                user=request.user, post=obj
            ).exists()
        return False

    def get_comments(self, obj):
        comments = obj.comments.filter(parent=None)[:3]
        return PostCommentSerializer(
            comments, many=True, context=self.context
        ).data

    def get_time_ago(self, obj):
        from django.utils import timezone
        import datetime
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        else:
            return "Just now"

    def create(self, validated_data):
        tags_input = validated_data.pop('tags_input', '')
        destination_id = validated_data.pop('destination_id')
        
        # Get destination
        try:
            destination = Destination.objects.get(id=destination_id)
        except Destination.DoesNotExist:
            raise serializers.ValidationError("Destination not found")
        
        # Create post
        post = TravelPost.objects.create(
            user=self.context['request'].user,
            destination=destination,
            **validated_data
        )
        
        # Process tags
        if tags_input:
            tag_names = [
                tag.strip().replace('#', '') 
                for tag in tags_input.split() 
                if tag.strip().startswith('#')
            ]
            
            for tag_name in tag_names:
                tag, created = PostTag.objects.get_or_create(name=tag_name)
                PostTagRelation.objects.create(post=post, tag=tag)
                if created:
                    tag.posts_count = 1
                else:
                    tag.posts_count += 1
                tag.save()
        
        return post

class TravelPostListSerializer(serializers.ModelSerializer):
    """Simplified serializer for post lists"""
    user = UserProfileSerializer(read_only=True)
    destination = DestinationSerializer(read_only=True)
    tags = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = TravelPost
        fields = [
            'id', 'user', 'destination', 'video', 'thumbnail', 'description',
            'music_name', 'music_artist', 'featured_3d', 'likes_count',
            'comments_count', 'shares_count', 'views_count', 'tags',
            'is_liked', 'time_ago', 'created_at'
        ]

    def get_tags(self, obj):
        tags = obj.tag_relations.select_related('tag').all()
        return [f"#{tag.tag.name}" for tag in tags]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(
                user=request.user, post=obj
            ).exists()
        return False

    def get_time_ago(self, obj):
        from django.utils import timezone
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        else:
            return "Just now"

class AuthTokenSerializer(serializers.Serializer):
    """Serializer for authentication"""
    username = serializers.CharField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )

            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
            
            if not user.is_active:
                msg = 'User account is disabled.'
                raise serializers.ValidationError(msg, code='authorization')

        else:
            msg = 'Must include "username" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

class UserFollowSerializer(serializers.ModelSerializer):
    """Serializer for user follow relationships"""
    follower = UserProfileSerializer(read_only=True)
    following = UserProfileSerializer(read_only=True)

    class Meta:
        model = UserFollow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['id', 'created_at']

class TrendingDestinationSerializer(serializers.ModelSerializer):
    """Serializer for trending destinations"""
    destination = DestinationSerializer(read_only=True)

    class Meta:
        model = TrendingDestination
        fields = [
            'destination', 'score', 'posts_last_24h', 'posts_last_week',
            'engagement_rate', 'updated_at'
        ]

class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""
    class Meta:
        model = UserPreference
        fields = [
            'preferred_destinations', 'favorite_tags', 'show_3d_content',
            'auto_play_videos', 'show_trending', 'updated_at'
        ]