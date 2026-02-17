from django.urls import path
from .views import VisitorDetailAPIView, VisitorListCreateAPIView


urlpatterns = [
    path("visitors/", VisitorListCreateAPIView.as_view(), name="visitor-list-create"),
    path("visitors/<int:pk>/", VisitorDetailAPIView.as_view(), name="visitor-detail"),
]
