from django.urls import path, include
from . import views

urlpatterns = [
    # Authentication
    path('auth/login/', views.CustomAuthToken.as_view(), name='auth_login'),
    path('auth/register/', views.UserCreateView.as_view(), name='auth_register'),
    
    # User management
    path('users/profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<uuid:user_id>/follow/', views.follow_user, name='follow_user'),
    path('users/preferences/', views.UserPreferenceView.as_view(), name='user_preferences'),
    
    # Destinations
    path('destinations/', views.DestinationListView.as_view(), name='destination_list'),
    path('destinations/<uuid:pk>/', views.DestinationDetailView.as_view(), name='destination_detail'),
    path('destinations/trending/', views.TrendingDestinationsView.as_view(), name='trending_destinations'),
    
    # Travel posts
    path('posts/', views.TravelPostListView.as_view(), name='post_list'),
    path('posts/<uuid:pk>/', views.TravelPostDetailView.as_view(), name='post_detail'),
    path('posts/<uuid:post_id>/like/', views.like_post, name='like_post'),
    path('posts/<uuid:post_id>/share/', views.share_post, name='share_post'),
    path('posts/<uuid:post_id>/comments/', views.PostCommentListView.as_view(), name='post_comments'),
    
    # Feed and discovery
    path('feed/', views.feed_view, name='main_feed'),
    path('search/', views.search_view, name='global_search'),
    path('tags/popular/', views.PopularTagsView.as_view(), name='popular_tags'),
]
