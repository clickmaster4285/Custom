from rest_framework import generics, permissions
from .models import Visitor
from .serializers import VisitorSerializer


class VisitorListCreateAPIView(generics.ListCreateAPIView):
    queryset = Visitor.objects.all().order_by("-created_at")
    serializer_class = VisitorSerializer
    permission_classes = [permissions.AllowAny]


class VisitorDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.AllowAny]
