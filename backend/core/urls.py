from django.urls import path 
from .views import employee_dashboard, employee_login, upload_payslips

urlpatterns = [
    path('upload/', upload_payslips, name='upload_payslips'), 
    path('login/', employee_login, name='employee_login'), 
    path('dashboard/', employee_dashboard, name='employee_dashboard') 
]