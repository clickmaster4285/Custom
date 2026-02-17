from rest_framework import permissions


class IsAdminOrHR(permissions.BasePermission):
    """Allow access only to users with role ADMIN or HR."""

    allowed_roles = ("ADMIN", "HR")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, "role", None) in self.allowed_roles
