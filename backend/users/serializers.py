from rest_framework import serializers
from .models import User, Staff, Attendance
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password


# -----------------------------
# Login Serializers
# -----------------------------
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            raise serializers.ValidationError("Username and password are required.")
        user = authenticate(request=self.context.get("request"), username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        if getattr(user, "is_deleted", False):
            raise serializers.ValidationError("User account is disabled.")
        data["user"] = user
        return data


class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField(read_only=True)
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        user = obj["user"]
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "phone": user.phone,
        }


# -----------------------------
# Staff Create Serializer
# -----------------------------
class StaffCreateSerializer(serializers.ModelSerializer):
    # User fields (input only; we create User from these — do NOT send "user")
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, write_only=True)
    phone = serializers.CharField(write_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Staff
        fields = [
            "username",
            "password",
            "email",
            "role",
            "phone",
            "full_name",
            "cnic",
            "address",
            "date_of_birth",
            "joining_date",
            "department",
            "designation",
            "profile_image",
            "emergency_contact",
        ]

    def create(self, validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        role = validated_data.pop("role")
        phone = validated_data.pop("phone")

        user = User.objects.create(
            username=username,
            email=email,
            role=role,
            phone=phone,
            password=make_password(password),
        )

        staff = Staff.objects.create(user=user, **validated_data)
        return staff


# -----------------------------
# Staff Serializer (Update / List)
# -----------------------------
class StaffSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Show username
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    role = serializers.CharField(source="user.role")
    email = serializers.CharField(source="user.email")
    phone = serializers.CharField(source="user.phone")

    class Meta:
        model = Staff
        fields = "__all__"


# -----------------------------
# Attendance Serializers
# -----------------------------
class AttendanceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "user", "username", "date", "check_in", "check_out", "image"]
