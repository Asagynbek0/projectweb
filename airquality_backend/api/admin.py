from django.contrib import admin
from .models import UserProfile, Station, AirQualityReading, NewsPost, Comment


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'is_active', 'openaq_location_id']
    list_filter = ['is_active', 'city']
    fields = ['name', 'city', 'latitude', 'longitude', 'openaq_location_id', 'is_active']


@admin.register(AirQualityReading)
class AirQualityReadingAdmin(admin.ModelAdmin):
    list_display = ['station', 'aqi', 'category', 'pm25', 'recorded_at', 'source']
    list_filter = ['category', 'source', 'station']
    ordering = ['-recorded_at']


@admin.register(NewsPost)
class NewsPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'created_at']
    list_filter = ['is_published']
    exclude = ['slug']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'is_deleted', 'created_at']
    list_filter = ['is_deleted']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']