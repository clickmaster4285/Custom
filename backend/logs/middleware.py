import requests
from user_agents import parse
from .models import UserActivityLog


class ActivityLogMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        response = self.get_response(request)

        if request.user.is_authenticated:
            ip = self.get_ip(request)

            user_agent = request.META.get('HTTP_USER_AGENT', '')
            parsed = parse(user_agent)

            device = "Mobile" if parsed.is_mobile else "PC"
            os = parsed.os.family
            browser = parsed.browser.family

            country = None
            city = None

            try:
                if ip != "127.0.1":
                 geo = requests.get(f"http://ip-api.com/json/{ip}").json()
                 country = geo.get("country")
                 city = geo.get("city")
                else:
                    country = "Pakistan"
                    city = "Local"
            except:
                pass

            UserActivityLog.objects.create(
                user=request.user,
                ip_address=ip,
                country=country,
                city=city,
                device=device,
                os=os,
                browser=browser,
                action=request.path
            )

        return response

    def get_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')