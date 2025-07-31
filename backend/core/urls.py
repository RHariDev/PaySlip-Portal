from django.urls import path
from .views import (
    EmployeeLoginAPIView,
    AdminLoginAPIView,
    DashboardAPIView,
    UploadPayslipsAPIView,
    MeAPIView, 
)

urlpatterns = [
    path('api/login/', EmployeeLoginAPIView.as_view()),
    path('api/admin-login/', AdminLoginAPIView.as_view()),
    path('api/dashboard/', DashboardAPIView.as_view()),
    path('api/upload/', UploadPayslipsAPIView.as_view()),
    path('api/me/', MeAPIView.as_view()), 
]
