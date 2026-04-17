from django.db import models
from django.contrib.auth.models import User


# ─── Custom Manager (requirement: at least 1) ──────────────────────────────────
class PublishedCommentManager(models.Manager):
    """Returns only non-deleted comments. Custom manager requirement."""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def for_post(self, post_id):
        return self.get_queryset().filter(post_id=post_id).order_by('-created_at')


# ─── Model 1: UserProfile ──────────────────────────────────────────────────────
class UserProfile(models.Model):
    """Extends the built-in User with extra fields."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Profile of {self.user.username}'


# ─── Model 2: Station ──────────────────────────────────────────────────────────
class Station(models.Model):
    """An air quality monitoring station (real or virtual)."""
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100, default='Almaty')
    latitude = models.FloatField()
    longitude = models.FloatField()
    openaq_location_id = models.IntegerField(null=True, blank=True,
        help_text='Corresponding location ID on OpenAQ API')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} ({self.city})'


# ─── Model 3: AirQualityReading ────────────────────────────────────────────────
class AirQualityReading(models.Model):
    """A single air quality data point linked to a Station.
    ForeignKey #1: station -> Station
    """
    CATEGORY_CHOICES = [
        ('good', 'Good'),
        ('moderate', 'Moderate'),
        ('unhealthy_sensitive', 'Unhealthy for Sensitive Groups'),
        ('unhealthy', 'Unhealthy'),
        ('very_unhealthy', 'Very Unhealthy'),
        ('hazardous', 'Hazardous'),
    ]

    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name='readings'
    )
    # Core pollutants (µg/m³ unless noted)
    aqi = models.IntegerField(help_text='Air Quality Index (0-500)')
    pm25 = models.FloatField(null=True, blank=True, help_text='PM2.5 µg/m³')
    pm10 = models.FloatField(null=True, blank=True, help_text='PM10 µg/m³')
    no2 = models.FloatField(null=True, blank=True, help_text='NO2 µg/m³')
    o3 = models.FloatField(null=True, blank=True, help_text='O3 µg/m³')
    co = models.FloatField(null=True, blank=True, help_text='CO mg/m³')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, blank=True)
    recorded_at = models.DateTimeField(help_text='When this reading was recorded')
    source = models.CharField(max_length=50, default='openaq',
        help_text='Data source: openaq or manual')

    class Meta:
        ordering = ['-recorded_at']

    def save(self, *args, **kwargs):
        """Auto-assign category from AQI on save."""
        if self.aqi <= 50:
            self.category = 'good'
        elif self.aqi <= 100:
            self.category = 'moderate'
        elif self.aqi <= 150:
            self.category = 'unhealthy_sensitive'
        elif self.aqi <= 200:
            self.category = 'unhealthy'
        elif self.aqi <= 300:
            self.category = 'very_unhealthy'
        else:
            self.category = 'hazardous'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'AQI {self.aqi} at {self.station.name} on {self.recorded_at:%Y-%m-%d %H:%M}'


# ─── Model 4: NewsPost ─────────────────────────────────────────────────────────
class NewsPost(models.Model):
    """News/blog articles. Full CRUD is provided for this model.
    ForeignKey #2: author -> User
    """
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts'
    )
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    body = models.TextField()
    cover_image_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ─── Model 5: Comment ──────────────────────────────────────────────────────────
class Comment(models.Model):
    """Comments on a NewsPost.
    ForeignKey #3: post -> NewsPost
    ForeignKey #4: author -> User
    Uses custom manager.
    """
    post = models.ForeignKey(
        NewsPost,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='comments'
    )
    body = models.TextField()
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Managers
    objects = models.Manager()          # default — returns ALL comments
    published = PublishedCommentManager()  # custom — excludes soft-deleted

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.author} on "{self.post.title}"'
