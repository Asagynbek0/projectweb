import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.text import slugify
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import Station, AirQualityReading, NewsPost, Comment, UserProfile
from .serializers import (
    RegisterSerializer, AirQualitySummarySerializer,
    StationSerializer, AirQualityReadingSerializer,
    NewsPostSerializer, CommentSerializer, UserProfileSerializer,
)


# ════════════════════════════════════════════════════════════════════════════════
# AUTH  —  Function-Based Views  (FBV #1 and FBV #2)
# ════════════════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """FBV #1 — Register a new user and return their token."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """FBV #2 — Login with username/password, returns auth token."""
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Please provide username and password.'},
                        status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials.'},
                        status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """FBV #3 — Delete the user's token (logout)."""
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile_view(request):
    """FBV #4 — Return the authenticated user's profile."""
    profile = get_object_or_404(UserProfile, user=request.user)
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)


# ════════════════════════════════════════════════════════════════════════════════
# AIR QUALITY  —  Class-Based Views  (CBV #1)
# ════════════════════════════════════════════════════════════════════════════════

class StationListView(APIView):
    """CBV #1 — List all stations or create one (admin only)."""
    permission_classes = [IsAuthenticatedOrReadOnlyCustom := __import__(
        'rest_framework.permissions', fromlist=['IsAuthenticatedOrReadOnly']
    ).IsAuthenticatedOrReadOnly]

    def get(self, request):
        stations = Station.objects.filter(is_active=True)
        serializer = StationSerializer(stations, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = StationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AirQualityReadingListView(APIView):
    """CBV #2 — List readings for a station, or create a manual reading."""

    def get(self, request):
        station_id = request.query_params.get('station')
        qs = AirQualityReading.objects.all()
        if station_id:
            qs = qs.filter(station_id=station_id)
        qs = qs[:50]  # last 50 readings
        serializer = AirQualityReadingSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Manually add a reading (admin/staff only)."""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'},
                            status=status.HTTP_401_UNAUTHORIZED)
        serializer = AirQualityReadingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AirQualitySummaryView(APIView):
    """CBV #3 — Returns a human-friendly summary for each active station."""
    permission_classes = [AllowAny]

    def get(self, request):
        summaries = []
        stations = Station.objects.filter(is_active=True)
        for station in stations:
            latest = station.readings.first()  # ordered by -recorded_at
            if latest:
                summaries.append({
                    'station_name': station.name,
                    'city': station.city,
                    'latest_aqi': latest.aqi,
                    'category': latest.category,
                    'pm25': latest.pm25,
                    'pm10': latest.pm10,
                    'recorded_at': latest.recorded_at,
                })
        serializer = AirQualitySummarySerializer(summaries, many=True)
        return Response(serializer.data)


# ════════════════════════════════════════════════════════════════════════════════
# AQICN REAL DATA INTEGRATION  —  CBV #4
# ════════════════════════════════════════════════════════════════════════════════

class FetchFromOpenAQView(APIView):
    """CBV #4 — Fetches REAL live air quality data from AQICN API for Almaty
    and saves it to all active stations in the database."""
    permission_classes = [IsAuthenticated]

    # AQICN stations to fetch — these are real Almaty monitoring points
    AQICN_STATIONS = [
        {'feed': 'almaty',            'name': 'Алмалинский район'},
        {'feed': '@9892',             'name': 'Бостандыкский район'},
        {'feed': '@9893',             'name': 'Медеуский район'},
        {'feed': 'kazakhstan/almaty', 'name': 'Ауэзовский район'},
    ]

    TOKEN = '26e1428f79a83269e0fada4badb34388e5e79728'

    def post(self, request):
        saved = []
        errors = []

        # Get all active stations from DB
        stations = Station.objects.filter(is_active=True)
        if not stations.exists():
            return Response({'error': 'No active stations in database. Run: python manage.py seed'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Fetch real data from AQICN for Almaty
        url = f'https://api.waqi.info/feed/almaty/?token={self.TOKEN}'
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            if data.get('status') != 'ok':
                return Response({'error': f"AQICN error: {data.get('data', 'unknown error')}"},
                                status=status.HTTP_502_BAD_GATEWAY)

            d = data['data']
            iaqi = d.get('iaqi', {})

            # Extract pollutant values
            aqi     = d.get('aqi', 50)
            pm25    = iaqi.get('pm25', {}).get('v')
            pm10    = iaqi.get('pm10', {}).get('v')
            no2     = iaqi.get('no2',  {}).get('v')
            o3      = iaqi.get('o3',   {}).get('v')
            co      = iaqi.get('co',   {}).get('v')

            # Save a reading for EVERY active station using the same real Almaty data
            for station in stations:
                reading = AirQualityReading.objects.create(
                    station=station,
                    aqi=int(aqi) if aqi else 50,
                    pm25=float(pm25) if pm25 is not None else None,
                    pm10=float(pm10) if pm10 is not None else None,
                    no2=float(no2)   if no2  is not None else None,
                    o3=float(o3)     if o3   is not None else None,
                    co=float(co)     if co   is not None else None,
                    recorded_at=timezone.now(),
                    source='aqicn',
                )
                saved.append(AirQualityReadingSerializer(reading).data)

        except requests.RequestException as e:
            errors.append(f'Network error fetching AQICN: {str(e)}')

        return Response({
            'source': 'AQICN — Real Almaty Air Quality Data',
            'saved_count': len(saved),
            'saved': saved,
            'errors': errors,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def _pm25_to_aqi(pm25: float) -> int:
        """Approximate PM2.5 (µg/m³) to US AQI. Breakpoints from EPA."""
        breakpoints = [
            (0.0, 12.0, 0, 50),
            (12.1, 35.4, 51, 100),
            (35.5, 55.4, 101, 150),
            (55.5, 150.4, 151, 200),
            (150.5, 250.4, 201, 300),
            (250.5, 500.4, 301, 500),
        ]
        for c_lo, c_hi, i_lo, i_hi in breakpoints:
            if c_lo <= pm25 <= c_hi:
                aqi = ((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo
                return round(aqi)
        return 500


# ════════════════════════════════════════════════════════════════════════════════
# NEWS POSTS — Full CRUD  (requirement: full CRUD on at least 1 model)
# ════════════════════════════════════════════════════════════════════════════════

class NewsPostListCreateView(APIView):
    """List published posts (public) or create a new post (authenticated)."""

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticatedOrReadOnly
        return [IsAuthenticatedOrReadOnly()]

    def get(self, request):
        posts = NewsPost.objects.filter(is_published=True)
        serializer = NewsPostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NewsPostSerializer(data=request.data)
        if serializer.is_valid():
            # Auto-generate slug from title
            base_slug = slugify(serializer.validated_data['title'])
            slug = base_slug
            counter = 1
            while NewsPost.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            # Link to authenticated user (requirement: link to request.user)
            serializer.save(author=request.user, slug=slug)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NewsPostDetailView(APIView):
    """Retrieve, update, or delete a single NewsPost."""

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticatedOrReadOnly
        return [IsAuthenticatedOrReadOnly()]

    def _get_post(self, pk):
        return get_object_or_404(NewsPost, pk=pk)

    def get(self, request, pk):
        post = self._get_post(pk)
        serializer = NewsPostSerializer(post)
        return Response(serializer.data)

    def put(self, request, pk):
        post = self._get_post(pk)
        if post.author != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = NewsPostSerializer(post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        post = self._get_post(pk)
        if post.author != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = NewsPostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        post = self._get_post(pk)
        if post.author != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ════════════════════════════════════════════════════════════════════════════════
# COMMENTS
# ════════════════════════════════════════════════════════════════════════════════

class CommentListCreateView(APIView):
    """List comments for a post or create one."""

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticatedOrReadOnly
        return [IsAuthenticatedOrReadOnly()]

    def get(self, request, post_pk):
        # Uses the custom manager
        comments = Comment.published.for_post(post_pk)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, post_pk):
        post = get_object_or_404(NewsPost, pk=post_pk)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            # Link to authenticated user
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDeleteView(APIView):
    """Soft-delete a comment (sets is_deleted=True)."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        if comment.author != request.user and not request.user.is_staff:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        comment.is_deleted = True
        comment.save()
        return Response({'message': 'Comment deleted.'}, status=status.HTTP_200_OK)