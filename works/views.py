# Create your views here.
from django.shortcuts import render
from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import (
    User, Destination, TravelPost, PostTag, PostLike, 
    PostComment, PostShare, UserFollow, TrendingDestination,
    PostView, UserPreference
)
from .serializers import (
    UserSerializer, UserProfileSerializer, DestinationSerializer,
    TravelPostSerializer, TravelPostListSerializer, PostTagSerializer,
    PostCommentSerializer, AuthTokenSerializer, UserFollowSerializer,
    TrendingDestinationSerializer, UserPreferenceSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CustomAuthToken(ObtainAuthToken):
    """Custom authentication view"""
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class UserCreateView(generics.CreateAPIView):
    """User registration view"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserDetailView(generics.RetrieveAPIView):
    """Public user profile view"""
    serializer_class = UserProfileSerializer
    queryset = User.objects.all()
    lookup_field = 'username'

class DestinationListView(generics.ListCreateAPIView):
    """List and create destinations"""
    serializer_class = DestinationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'city']
    ordering_fields = ['name', 'posts_count', 'created_at']
    ordering = ['-posts_count']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Destination.objects.all()
        
        # Filter by country
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(country__icontains=country)
        
        # Filter destinations with 3D models
        has_3d = self.request.query_params.get('has_3d')
        if has_3d and has_3d.lower() == 'true':
            queryset = queryset.filter(has_3d_model=True)
        
        return queryset

class DestinationDetailView(generics.RetrieveAPIView):
    """Destination detail view"""
    serializer_class = DestinationSerializer
    queryset = Destination.objects.all()

class TravelPostListView(generics.ListCreateAPIView):
    """List and create travel posts"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'user__username', 'destination__name']
    filterset_fields = ['featured_3d', 'destination__country']
    ordering_fields = ['created_at', 'likes_count', 'views_count']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TravelPostSerializer
        return TravelPostListSerializer

    def get_queryset(self):
        queryset = TravelPost.objects.filter(is_public=True).select_related(
            'user', 'destination'
        ).prefetch_related('tag_relations__tag')
        
        # Filter by user
        username = self.request.query_params.get('user')
        if username:
            queryset = queryset.filter(user__username=username)
        
        # Filter by destination
        destination_id = self.request.query_params.get('destination')
        if destination_id:
            queryset = queryset.filter(destination_id=destination_id)
        
        # Filter by tags
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [tag.strip().replace('#', '') for tag in tags.split(',')]
            queryset = queryset.filter(
                tag_relations__tag__name__in=tag_list
            ).distinct()
        
        # Feed algorithm - personalized or trending
        feed_type = self.request.query_params.get('feed', 'latest')
        
        if feed_type == 'trending':
            # Show trending posts (high engagement in last 24h)
            last_24h = timezone.now() - timedelta(hours=24)
            queryset = queryset.filter(created_at__gte=last_24h).annotate(
                engagement_score=F('likes_count') + F('comments_count') * 2 + F('shares_count') * 3
            ).order_by('-engagement_score', '-created_at')
        
        elif feed_type == 'following' and self.request.user.is_authenticated:
            # Show posts from followed users
            following_users = UserFollow.objects.filter(
                follower=self.request.user
            ).values_list('following', flat=True)
            queryset = queryset.filter(user__in=following_users)
        
        elif feed_type == '3d':
            # Show only posts with 3D features
            queryset = queryset.filter(featured_3d=True)
        
        return queryset

class TravelPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Travel post detail view"""
    serializer_class = TravelPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return TravelPost.objects.filter(is_public=True).select_related(
            'user', 'destination'
        ).prefetch_related('tag_relations__tag', 'comments__user')

    def get_object(self):
        obj = super().get_object()
        
        # Track view
        if self.request.user.is_authenticated:
            PostView.objects.get_or_create(
                user=self.request.user,
                post=obj,
                defaults={'ip_address': self.get_client_ip()}
            )
        else:
            PostView.objects.create(
                post=obj,
                ip_address=self.get_client_ip()
            )
        
        # Update view count
        obj.views_count = F('views_count') + 1
        obj.save(update_fields=['views_count'])
        
        return obj

    def get_client_ip(self):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    """Like or unlike a post"""
    try:
        post = TravelPost.objects.get(id=post_id, is_public=True)
    except TravelPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    like, created = PostLike.objects.get_or_create(
        user=request.user, post=post
    )
    
    if created:
        # Liked
        post.likes_count = F('likes_count') + 1
        post.save(update_fields=['likes_count'])
        return Response({'liked': True, 'likes_count': post.likes_count + 1})
    else:
        # Unliked
        like.delete()
        post.likes_count = F('likes_count') - 1
        post.save(update_fields=['likes_count'])
        return Response({'liked': False, 'likes_count': max(0, post.likes_count - 1)})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_post(request, post_id):
    """Share a post"""
    try:
        post = TravelPost.objects.get(id=post_id, is_public=True)
    except TravelPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    platform = request.data.get('platform', 'native')
    
    PostShare.objects.create(
        user=request.user,
        post=post,
        platform=platform
    )
    
    # Update share count
    post.shares_count = F('shares_count') + 1
    post.save(update_fields=['shares_count'])
    
    return Response({'shared': True, 'shares_count': post.shares_count + 1})

class PostCommentListView(generics.ListCreateAPIView):
    """List and create comments for a post"""
    serializer_class = PostCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return PostComment.objects.filter(
            post_id=post_id, parent=None
        ).select_related('user').prefetch_related('replies__user').order_by('-created_at')

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = TravelPost.objects.get(id=post_id, is_public=True)
        
        serializer.save(user=self.request.user, post=post)
        
        # Update comment count
        post.comments_count = F('comments_count') + 1
        post.save(update_fields=['comments_count'])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    """Follow or unfollow a user"""
    try:
        user_to_follow = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if user_to_follow == request.user:
        return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    follow, created = UserFollow.objects.get_or_create(
        follower=request.user, following=user_to_follow
    )
    
    if created:
        # Followed
        user_to_follow.followers_count = F('followers_count') + 1
        user_to_follow.save(update_fields=['followers_count'])
        
        request.user.following_count = F('following_count') + 1
        request.user.save(update_fields=['following_count'])
        
        return Response({'following': True})
    else:
        # Unfollowed
        follow.delete()
        
        user_to_follow.followers_count = F('followers_count') - 1
        user_to_follow.save(update_fields=['followers_count'])
        
        request.user.following_count = F('following_count') - 1
        request.user.save(update_fields=['following_count'])
        
        return Response({'following': False})

class TrendingDestinationsView(generics.ListAPIView):
    """List trending destinations"""
    serializer_class = TrendingDestinationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return TrendingDestination.objects.select_related('destination').order_by('-score')

class PopularTagsView(generics.ListAPIView):
    """List popular tags"""
    serializer_class = PostTagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return PostTag.objects.filter(posts_count__gt=0).order_by('-posts_count')

class UserPreferenceView(generics.RetrieveUpdateAPIView):
    """User preferences view"""
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        preference, created = UserPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_view(request):
    """Global search for users, destinations, and posts"""
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'error': 'Query parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Search users
    users = User.objects.filter(
        Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query)
    )[:10]
    
    # Search destinations
    destinations = Destination.objects.filter(
        Q(name__icontains=query) | Q(country__icontains=query) | Q(city__icontains=query)
    )[:10]
    
    # Search posts
    posts = TravelPost.objects.filter(
        Q(description__icontains=query) | Q(user__username__icontains=query),
        is_public=True
    ).select_related('user', 'destination')[:10]
    
    # Search tags
    tags = PostTag.objects.filter(name__icontains=query.replace('#', ''))[:10]
    
    return Response({
        'users': UserProfileSerializer(users, many=True, context={'request': request}).data,
        'destinations': DestinationSerializer(destinations, many=True).data,
        'posts': TravelPostListSerializer(posts, many=True, context={'request': request}).data,
        'tags': PostTagSerializer(tags, many=True).data
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def feed_view(request):
    """Main feed endpoint - TikTok style"""
    page_size = min(int(request.GET.get('page_size', 10)), 20)
    offset = int(request.GET.get('offset', 0))
    
    # Get personalized feed based on user preferences
    queryset = TravelPost.objects.filter(is_public=True).select_related(
        'user', 'destination'
    ).prefetch_related('tag_relations__tag')
    
    # Apply feed algorithm
    if request.user.is_authenticated:
        # Personalized feed
        try:
            preferences = request.user.userpreference
            if not preferences.show_3d_content:
                queryset = queryset.filter(featured_3d=False)
        except UserPreference.DoesNotExist:
            pass
    
    # Get posts with offset
    posts = queryset[offset:offset + page_size]
    
    return Response({
        'results': TravelPostListSerializer(posts, many=True, context={'request': request}).data,
        'has_next': len(posts) == page_size
    })
