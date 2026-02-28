from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "role", "phone"]

    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("INSPECTOR", "Inspector"),
        ("COLLECTOR", "Collector"),
        ("DEPUTY_COLLECTOR", "Deputy Collector"),
        ("ASSISTANT_COLLECTOR", "Assistant Collector"),
        ("RECEPTIONIST", "Receptionist"),
        ("HR", "Human Resource"),
        ("WAREHOUSE_OFFICER", "Warehouse Officer"),
        ("DETECTION_OFFICER", "Detection Officer"),
    ]
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} - {self.role}"


class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="staff_profile")
    full_name = models.CharField(max_length=150)
    cnic = models.CharField(max_length=15, unique=True)
    address = models.TextField()
    date_of_birth = models.DateField(null=True, blank=True)
    joining_date = models.DateField(default=timezone.now)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    profile_image = models.ImageField(upload_to="staff/", null=True, blank=True)
    emergency_contact = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.designation})"


class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField(auto_now_add=True)
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(upload_to="attendance/", null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.date}"
