from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Station, AirQualityReading, NewsPost, Comment

class RegisterSerializer(serializers.Serializer):
    """Used for user registration. Plain Serializer #1."""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    password2 = serializers.CharField(min_length=6, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user)
        return user


class AirQualitySummarySerializer(serializers.Serializer):
    """A read-only summary DTO — not tied to a single model. Plain Serializer #2."""
    station_name = serializers.CharField()
    city = serializers.CharField()
    latest_aqi = serializers.IntegerField()
    category = serializers.CharField()
    pm25 = serializers.FloatField(allow_null=True)
    pm10 = serializers.FloatField(allow_null=True)
    recorded_at = serializers.DateTimeField()


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'bio', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'created_at']


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'


class AirQualityReadingSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)

    class Meta:
        model = AirQualityReading
        fields = [
            'id', 'station', 'station_name',
            'aqi', 'pm25', 'pm10', 'no2', 'o3', 'co',
            'category', 'recorded_at', 'source',
        ]
        read_only_fields = ['id', 'category', 'station_name']


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_username', 'body', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class NewsPostSerializer(serializers.ModelSerializer):
    """ModelSerializer #2 — used for list/detail views."""
    author_username = serializers.CharField(source='author.username', read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = NewsPost
        fields = [
            'id', 'title', 'slug', 'body', 'cover_image_url',
            'is_published', 'author', 'author_username',
            'comments_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_comments_count(self, obj):
        return obj.comments.filter(is_deleted=False).count()
