from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path('auth/register/', views.register_view, name='register'),       # FBV
    path('auth/login/',    views.login_view,    name='login'),           # FBV
    path('auth/logout/',   views.logout_view,   name='logout'),          # FBV
    path('auth/me/',       views.my_profile_view, name='my-profile'),    # FBV

    # ── Stations & Readings ───────────────────────────────────────────────────
    path('stations/',          views.StationListView.as_view(),           name='stations'),          # CBV
    path('readings/',          views.AirQualityReadingListView.as_view(), name='readings'),          # CBV
    path('air-summary/',       views.AirQualitySummaryView.as_view(),     name='air-summary'),       # CBV
    path('fetch-openaq/',      views.FetchFromOpenAQView.as_view(),       name='fetch-openaq'),      # CBV

    # ── News Posts (full CRUD) ────────────────────────────────────────────────
    path('posts/',             views.NewsPostListCreateView.as_view(),    name='posts-list'),
    path('posts/<int:pk>/',    views.NewsPostDetailView.as_view(),        name='posts-detail'),

    # ── Comments ──────────────────────────────────────────────────────────────
    path('posts/<int:post_pk>/comments/', views.CommentListCreateView.as_view(), name='comments-list'),
    path('comments/<int:pk>/',            views.CommentDeleteView.as_view(),      name='comments-delete'),
]
