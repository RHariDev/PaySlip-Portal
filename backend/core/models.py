from django.db import models

# Create your models here.
class Employee(models.Model):
    empno = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)
    dob = models.DateField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True) 

    def __str__(self):
        return f"{self.empno} - {self.name}"

class Payslip(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    month = models.CharField(max_length=10)  # e.g., "May"
    year = models.IntegerField()
    pdf_file = models.FileField(upload_to='payslips/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')

    def __str__(self):
        return f"{self.employee.name} - {self.month} {self.year}"
