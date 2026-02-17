from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from .models import Staff, Attendance
from .permissions import IsAdminOrHR
from .serializers import (
    StaffCreateSerializer,
    StaffSerializer,
    LoginSerializer,
    LoginResponseSerializer,
    AttendanceSerializer,
)


class LoginView(APIView):
    """POST /api/auth/login/ with username & password. Returns token and user info. No auth required."""
    permission_classes = [AllowAny]
    authentication_classes = []  # No token/session needed for login

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            LoginResponseSerializer({"token": token.key, "user": user}).data,
            status=status.HTTP_200_OK,
        )


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    permission_classes = [IsAdminOrHR]  # Only Admin and HR can create/edit staff

    def get_serializer_class(self):
        if self.action in ["create"]:
            return StaffCreateSerializer
        return StaffSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by("-date", "-check_in")
    permission_classes = [IsAdminOrHR]
    serializer_class = AttendanceSerializer

    def perform_create(self, serializer):
        # Default check_in to now when marking attendance (e.g. with camera)
        extra = {}
        if not serializer.validated_data.get("check_in"):
            extra["check_in"] = timezone.now()
        serializer.save(**extra)
