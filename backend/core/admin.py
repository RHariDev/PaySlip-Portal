from django.contrib import admin
from .models import Employee, Payslip 

# Register your models here.
@admin.register(Employee) 
class  EmployeeAdmin(admin.ModelAdmin):
    list_display = ('empno', 'name', 'email', 'phone_number', 'dob')
    search_fields = ('name', 'empno', 'email') 

@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'created_at')
    list_filter = ('month', 'year')
    search_fields = ('employee__name', 'employee__empno') 

