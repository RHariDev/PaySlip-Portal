from rest_framework import serializers
from .models import Employee, Payslip


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'empno', 'name', 'dob', 'email', 'phone_number']


# class PayslipSerializer(serializers.ModelSerializer):
#     employee = EmployeeSerializer(read_only=True)

#     class Meta:
#         model = Payslip
#         fields = ['id', 'month', 'year', 'pdf_file', 'created_at'] 

class PayslipSerializer(serializers.ModelSerializer):
    gross_salary = serializers.SerializerMethodField()
    net_salary = serializers.SerializerMethodField()
    processed_date = serializers.DateTimeField(source='created_at')
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Payslip
        fields = ['id', 'month', 'year', 'gross_salary', 'net_salary', 'processed_date', 'download_url']

    def get_gross_salary(self, obj):
        return 0  # Fill with real logic if needed

    def get_net_salary(self, obj):
        return 0  # Fill with real logic if needed

    def get_download_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.pdf_file.url)

