# import os
# import calendar
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# from rest_framework.parsers import MultiPartParser
# from django.shortcuts import render, redirect
# from django.contrib import messages
# from django.conf import settings
# from django.contrib.admin.views.decorators import staff_member_required 
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_POST 
# from django.views.decorators.http import require_GET
# from django.utils.decorators import method_decorator
# from django.http import JsonResponse
# import json 
# from dbfread import DBF
# from datetime import datetime

# from backend.core.serializers import EmployeeSerializer, PayslipSerializer
# from .forms import PayslipUploadForm
# from .models import Employee, Payslip
# from fpdf import FPDF

# # === PDF Generator ===
# class PayslipPDF(FPDF):
#     def __init__(self, month_name, year):
#         super().__init__()
#         self.month_name = month_name
#         self.year = year

#     def header(self):
#         self.set_font("Courier", "B", 16)
#         self.cell(0, 10, "ST.JOSEPH'S HIGHER SECONDARY SCHOOL, CUDDALORE-1", ln=True, align="C")
#         self.set_font("Courier", "B", 14)
#         self.cell(0, 10, f"Payslip for the month of {self.month_name} {self.year}", ln=True, align="C")
#         self.ln(2.5)
#         self.set_line_width(0.5)
#         self.line(10, self.get_y(), 200, self.get_y())
#         self.ln(2.5)

#     def generate_body(self, data):
#         self.set_font("Courier", "", 12)
#         self.cell(100, 10, f"Name: {data['name']}")
#         self.cell(0, 10, f"Pay: {data['pay']}", ln=True, align="R")

#         self.cell(50, 10, f"Basic: {data['basic']}")
#         self.cell(50, 10, f"DA: {data['da']}")
#         self.cell(0, 10, f"OA: {data['oa']}", ln=True)

#         if data['days'] != "-":
#             self.cell(63, 10, f"{data['days']} days salary", ln=True)

#         info_table = data.get("info_table", [])
#         for i in range(0, len(info_table), 2):
#             label1, value1 = info_table[i]
#             text1 = f"{label1:<15} : {value1:>3}"
#             text2 = ""
#             if i + 1 < len(info_table):
#                 label2, value2 = info_table[i + 1]
#                 text2 = f"{label2:<17} : {value2:>3}"
#             self.cell(95, 8, text1, border=0)
#             self.cell(95, 8, text2, border=0, ln=True)

#         self.set_x(110)
#         self.cell(0, 8, f"Deductions: {data['total_deductions']}", ln=True, align="R")
#         self.set_x(110)
#         self.cell(0, 8, f"Net Pay: {data['net_pay']}", ln=True, align="R")
#         self.ln(2.5)
#         self.set_line_width(0.5)
#         self.line(10, self.get_y(), 200, self.get_y())
#         self.ln(2.5)


# def extract_employee_data(row):
#     def parse_amount(val):
#         try:
#             return int(float(str(val).replace(",", "").strip()))
#         except (ValueError, TypeError):
#             return 0

#     def format_amount(val):
#         return f"{val:,}" if val else "-"

#     pay = parse_amount(row.get("GROSS"))
#     basic = parse_amount(row.get("BASIC_P"))
#     da = parse_amount(row.get("DA_P"))
#     oa = parse_amount(row.get("SPPAY_P"))
#     days = parse_amount(row.get("DAYS"))

#     deduction_items = [
#         ("P.F", row.get("PF")), ("Teacher's Loan 1", row.get("TEACH")), ("Paddy Loan", row.get("PADDY")),
#         ("Teacher's Loan 2", row.get("TEACH2")), ("T.R.F", row.get("MADURA_2")), ("Teacher's Loan 3", row.get("TEACH3")),
#         ("Tour", row.get("TOUR")), ("Teacher's Loan 4", row.get("TEACH4")), ("PMSSS", row.get("XX")),
#         ("Church Contri.", row.get("CHURCH")), ("Mess Deduction", row.get("MESS")), ("ESIC", row.get("MADURA_1")),
#         ("OD Recovered", None), ("Arrear", row.get("ARREAR")),
#     ]

#     total_deductions = sum(parse_amount(value) for _, value in deduction_items)
#     net_pay = pay - total_deductions

#     formatted_info_table = []
#     for label, value in deduction_items:
#         if label == "Tour":
#             tour_val = parse_amount(row.get("TOUR"))
#             tour_ins_val = parse_amount(row.get("TOUR_INS"))
#             display = f"{tour_val:,} / {tour_ins_val:,}" if tour_val or tour_ins_val else "-"
#         elif label[:14] == "Teacher's Loan":
#             num = label[15:]
#             if num == "1": num = ""
#             loan_val = parse_amount(row.get("TEACH" + num))
#             loan_tins_val = parse_amount(row.get("TEA_TINS" + num))
#             loan_ins_val = loan_tins_val - parse_amount(row.get("TEACH" + num + "_INS")) + 1
#             display = f"{loan_val:,} / {loan_ins_val:,} / {loan_tins_val:,}" if loan_val else "-"
#         else:
#             display = format_amount(parse_amount(value))
#         formatted_info_table.append((label, display))

#     return {
#         "name": row.get("NAME", "-") or "-",
#         "pay": format_amount(pay),
#         "basic": format_amount(basic),
#         "da": format_amount(da),
#         "oa": format_amount(oa),
#         "days": format_amount(days),
#         "total_deductions": format_amount(total_deductions),
#         "net_pay": format_amount(net_pay),
#         "info_table": formatted_info_table
#     }

# # === Main Payslip Upload View === 
# # @csrf_exempt
# # @staff_member_required 
# # @require_POST 
# # def upload_payslips(request):
#     # if request.method == 'POST':
#     #     form = PayslipUploadForm(request.POST, request.FILES)
#     #     if form.is_valid():
#     #         dbf_file = request.FILES['dbf_file']

#     #         # Save uploaded file to a temporary location
#     #         file_path = os.path.join(settings.MEDIA_ROOT, 'temp.dbf')
#     #         with open(file_path, 'wb+') as destination:
#     #             for chunk in dbf_file.chunks():
#     #                 destination.write(chunk)

#     #         try:
#     #             filename = dbf_file.name
#     #             mm, yy = filename[4:6], filename[6:8]
#     #             year = int(f"20{yy}")
#     #             month = int(mm)
#     #             month_name = calendar.month_name[month]

#     #             payslip_dir = os.path.join(settings.MEDIA_ROOT, 'payslips', f"{year}_{mm}")
#     #             os.makedirs(payslip_dir, exist_ok=True)

#     #             table = DBF(file_path, load=True, encoding='utf-8')
#     #             count = 0
#     #             for row in table:
#     #                 empno = int(row.get("EMPNO", 0))
#     #                 employee = Employee.objects.filter(empno=empno).first()
#     #                 if not employee:
#     #                     continue

#     #                 emp_data = extract_employee_data(row)
#     #                 pdf = PayslipPDF(month_name, str(year))
#     #                 pdf.add_page()
#     #                 pdf.generate_body(emp_data)

#     #                 filename = f"payslip_{empno}_{mm}_{yy}.pdf"
#     #                 filepath = os.path.join(payslip_dir, filename)
#     #                 pdf.output(filepath)

#     #                 Payslip.objects.update_or_create(
#     #                     employee=employee,
#     #                     month=month_name,
#     #                     year=year,
#     #                     defaults={"pdf_file": os.path.join('payslips', f"{year}_{mm}", filename)}
#     #                 )

#     #                 count += 1

#     #             messages.success(request, f"{count} payslips uploaded and generated successfully.")
#     #         except Exception as e:
#     #             messages.error(request, f"Failed to process file: {e}")
#     #         finally:
#     #             if os.path.exists(file_path):
#     #                 os.remove(file_path)

#     #         return redirect('upload_payslips')
#     # else:
#     #     form = PayslipUploadForm()
#     # return render(request, 'core/upload_payslips.html', {'form': form}) 
#     # try:
#     #     dbf_file = request.FILES.get('dbf_file')

#     #     if not dbf_file:
#     #         return JsonResponse({'success': False, 'message': 'No DBF file provided.'}, status=400)

#     #     # Save temporarily
#     #     temp_path = os.path.join(settings.MEDIA_ROOT, 'temp.dbf')
#     #     with open(temp_path, 'wb+') as dest:
#     #         for chunk in dbf_file.chunks():
#     #             dest.write(chunk)

#     #     filename = dbf_file.name
#     #     mm, yy = filename[4:6], filename[6:8]
#     #     year = int(f"20{yy}")
#     #     month = int(mm)
#     #     month_name = calendar.month_name[month]

#     #     payslip_dir = os.path.join(settings.MEDIA_ROOT, 'payslips', f"{year}_{mm}")
#     #     os.makedirs(payslip_dir, exist_ok=True)

#     #     table = DBF(temp_path, load=True, encoding='utf-8')

#     #     count = 0
#     #     for row in table:
#     #         empno = int(row.get("EMPNO", 0))
#     #         employee = Employee.objects.filter(empno=empno).first()
#     #         if not employee:
#     #             continue

#     #         emp_data = extract_employee_data(row)
#     #         pdf = PayslipPDF(month_name, str(year))
#     #         pdf.add_page()
#     #         pdf.generate_body(emp_data)

#     #         pdf_filename = f"payslip_{empno}_{mm}_{yy}.pdf"
#     #         pdf_filepath = os.path.join(payslip_dir, pdf_filename)
#     #         pdf.output(pdf_filepath)

#     #         Payslip.objects.update_or_create(
#     #             employee=employee,
#     #             month=month_name,
#     #             year=year,
#     #             defaults={"pdf_file": os.path.join('payslips', f"{year}_{mm}", pdf_filename)}
#     #         )

#     #         count += 1

#     #     os.remove(temp_path)
#     #     return JsonResponse({'success': True, 'message': f'{count} payslips uploaded and generated.'})

#     # except Exception as e:
#     #     return JsonResponse({'success': False, 'message': str(e)}, status=500)

# # @csrf_exempt
# # @require_POST
# # def employee_login(request):
# #     try:
# #         # Parse JSON body
# #         body = json.loads(request.body.decode('utf-8'))
# #         empno = body.get('empno')
# #         dob_str = body.get('dob')

# #         if not empno or not dob_str:
# #             return JsonResponse({'success': False, 'message': 'Employee number and DOB required'}, status=400)

# #         # Convert empno to int
# #         empno = int(empno)

# #         # ✅ Convert dob string to Python date
# #         dob = datetime.strptime(dob_str, "%Y-%m-%d").date()

# #         # Find employee
# #         employee = Employee.objects.get(empno=empno, dob=dob)

# #         request.session['employee_id'] = employee.id
# #         request.session.modified = True  # Ensure session is saved
# #         print("Login session key:", request.session.session_key)

# #         response = JsonResponse({
# #             'success': True,
# #             'employee': {
# #                 'id': employee.id,
# #                 'name': employee.name
# #             }
# #         })
# #         # Optionally, explicitly set sessionid cookie for JS clients
# #         if hasattr(request, 'session') and hasattr(request.session, 'session_key'):
# #             response.set_cookie(
# #                 key=settings.SESSION_COOKIE_NAME,
# #                 value=request.session.session_key,
# #                 httponly=True,
# #                 samesite='Lax'
# #             )
# #         return response

# #     except ValueError:
# #         return JsonResponse({'success': False, 'message': 'Invalid DOB format'}, status=400)
# #     except Employee.DoesNotExist:
# #         return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)
# #     except Exception as e:
# #         return JsonResponse({'success': False, 'message': str(e)}, status=400)

# # def employee_dashboard(request):
# #     emp_id = request.session.get('employee_id')
# #     if not emp_id:
# #         return redirect('employee_login')

# #     employee = Employee.objects.get(id=emp_id)
# #     payslips = Payslip.objects.filter(employee=employee)

# #     # Apply filter if present
# #     month = request.GET.get('month')
# #     year = request.GET.get('year')

# #     if month:
# #         month_num = list(calendar.month_name).index(month)
# #         payslips = payslips.filter(month=month_num)
# #     if year:
# #         payslips = payslips.filter(year=year)

# #     # Always order by most recent
# #     payslips = payslips.order_by('-year', '-month')

# #     months_list = [
# #         "January", "February", "March", "April", "May", "June",
# #         "July", "August", "September", "October", "November", "December" 
# #     ]

# #     return render(request, "core/employee_dashboard.html", {
# #         "employee": employee,
# #         "payslips": payslips, 
# #         "months_list": months_list 
# #     }) 

# # @csrf_exempt
# # @require_GET
# # def employee_dashboard(request):
# #     emp_id = request.session.get('employee_id')
# #     if not emp_id:
# #         return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

# #     try:
# #         employee = Employee.objects.get(id=emp_id)
# #     except Employee.DoesNotExist:
# #         return JsonResponse({'success': False, 'message': 'Employee not found'}, status=404)

# #     payslips = Payslip.objects.filter(employee=employee)

# #     month = request.GET.get('month')
# #     year = request.GET.get('year')

# #     if month:
# #         # Convert numeric month to name if needed
# #         if month.isdigit():
# #             month = calendar.month_name[int(month)]
# #         payslips = payslips.filter(month=month)
# #     if year:
# #         payslips = payslips.filter(year=year)

# #     payslips = payslips.order_by('-year', '-month')

# #     payslip_list = [{
# #         'month': p.month,
# #         'year': p.year,
# #         'pdf_url': p.pdf_file.url
# #     } for p in payslips]

# #     return JsonResponse({'success': True, 'payslips': payslip_list})

# class EmployeeLoginAPIView(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         data = request.data
#         empno = data.get('empno')
#         dob = data.get('dob')

#         try:
#             employee = Employee.objects.get(empno=empno, dob=dob)
#             serializer = EmployeeSerializer(employee)
#             request.session['employee_id'] = employee.id
#             return Response({
#                 "success": True,
#                 "employee": serializer.data
#             })
#         except Employee.DoesNotExist:
#             return Response({"success": False, "message": "Invalid credentials"}, status=401) 
        
# class AdminLoginAPIView(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         data = request.data
#         username = data.get('username')
#         password = data.get('password')

#         # Hardcoded admin check
#         if username == 'admin' and password == 'admin123':
#             request.session['is_admin'] = True
#             return Response({"success": True, "isAdmin": True})
#         return Response({"success": False, "message": "Invalid admin credentials"}, status=401) 
    
# class DashboardAPIView(APIView):
#     def get(self, request):
#         emp_id = request.session.get('employee_id')
#         if not emp_id:
#             return Response({"detail": "Unauthorized"}, status=401)

#         employee = Employee.objects.get(id=emp_id)
#         payslips = Payslip.objects.filter(employee=employee).order_by('-year', '-month')
#         serializer = PayslipSerializer(payslips, many=True)
#         return Response({"payslips": serializer.data}) 
    
# class UploadPayslipsAPIView(APIView):
#     parser_classes = [MultiPartParser]

#     def post(self, request):
#         if not request.session.get('is_admin'):
#             return Response({"detail": "Unauthorized"}, status=401)

#         dbf_file = request.FILES.get('dbf_file')
#         if not dbf_file:
#             return Response({"detail": "No file provided"}, status=400)

#         temp_path = os.path.join(settings.MEDIA_ROOT, 'temp.dbf')
#         with open(temp_path, 'wb+') as dest:
#             for chunk in dbf_file.chunks():
#                 dest.write(chunk)

#         filename = dbf_file.name
#         mm, yy = filename[4:6], filename[6:8]
#         year = int(f"20{yy}")
#         month = int(mm)
#         month_name = calendar.month_name[month]

#         payslip_dir = os.path.join(settings.MEDIA_ROOT, 'payslips', f"{year}_{mm}")
#         os.makedirs(payslip_dir, exist_ok=True)

#         table = DBF(temp_path, load=True, encoding='utf-8')
#         count = 0

#         for row in table:
#             empno = int(row.get("EMPNO", 0))
#             employee = Employee.objects.filter(empno=empno).first()
#             if not employee:
#                 continue

#             emp_data = extract_employee_data(row)
#             pdf = PayslipPDF(month_name, str(year))
#             pdf.add_page()
#             pdf.generate_body(emp_data)

#             pdf_filename = f"payslip_{empno}_{mm}_{yy}.pdf"
#             pdf_filepath = os.path.join(payslip_dir, pdf_filename)
#             pdf.output(pdf_filepath)

#             Payslip.objects.update_or_create(
#                 employee=employee,
#                 month=month_name,
#                 year=year,
#                 defaults={"pdf_file": os.path.join('payslips', f"{year}_{mm}", pdf_filename)}
#             )

#             count += 1

#         os.remove(temp_path)
#         return Response({"success": True, "message": f"{count} payslips generated."}) 



import os
import calendar
from datetime import datetime

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser

from django.conf import settings
from django.http import JsonResponse

from dbfread import DBF
from fpdf import FPDF

from .models import Employee, Payslip
from .serializers import EmployeeSerializer, PayslipSerializer

# === PDF Generator ===
class PayslipPDF(FPDF):
    def __init__(self, month_name, year):
        super().__init__()
        self.month_name = month_name
        self.year = year

    def header(self):
        self.set_font("Courier", "B", 16)
        self.cell(0, 10, "ST.JOSEPH'S HIGHER SECONDARY SCHOOL, CUDDALORE-1", ln=True, align="C")
        self.set_font("Courier", "B", 14)
        self.cell(0, 10, f"Payslip for the month of {self.month_name} {self.year}", ln=True, align="C")
        self.ln(2.5)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(2.5)

    def generate_body(self, data):
        self.set_font("Courier", "", 12)
        self.cell(100, 10, f"Name: {data['name']}")
        self.cell(0, 10, f"Pay: {data['pay']}", ln=True, align="R")
        self.cell(50, 10, f"Basic: {data['basic']}")
        self.cell(50, 10, f"DA: {data['da']}")
        self.cell(0, 10, f"OA: {data['oa']}", ln=True)

        if data['days'] != "-":
            self.cell(63, 10, f"{data['days']} days salary", ln=True)

        info_table = data.get("info_table", [])
        for i in range(0, len(info_table), 2):
            label1, value1 = info_table[i]
            text1 = f"{label1:<15} : {value1:>3}"
            text2 = ""
            if i + 1 < len(info_table):
                label2, value2 = info_table[i + 1]
                text2 = f"{label2:<17} : {value2:>3}"
            self.cell(95, 8, text1, border=0)
            self.cell(95, 8, text2, border=0, ln=True)

        self.set_x(110)
        self.cell(0, 8, f"Deductions: {data['total_deductions']}", ln=True, align="R")
        self.set_x(110)
        self.cell(0, 8, f"Net Pay: {data['net_pay']}", ln=True, align="R")
        self.ln(2.5)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(2.5)

def extract_employee_data(row):
    def parse_amount(val):
        try:
            return int(float(str(val).replace(",", "").strip()))
        except (ValueError, TypeError):
            return 0

    def format_amount(val):
        return f"{val:,}" if val else "-"

    pay = parse_amount(row.get("GROSS"))
    basic = parse_amount(row.get("BASIC_P"))
    da = parse_amount(row.get("DA_P"))
    oa = parse_amount(row.get("SPPAY_P"))
    days = parse_amount(row.get("DAYS"))

    deduction_items = [
        ("P.F", row.get("PF")), ("Teacher's Loan 1", row.get("TEACH")), ("Paddy Loan", row.get("PADDY")),
        ("Teacher's Loan 2", row.get("TEACH2")), ("T.R.F", row.get("MADURA_2")), ("Teacher's Loan 3", row.get("TEACH3")),
        ("Tour", row.get("TOUR")), ("Teacher's Loan 4", row.get("TEACH4")), ("PMSSS", row.get("XX")),
        ("Church Contri.", row.get("CHURCH")), ("Mess Deduction", row.get("MESS")), ("ESIC", row.get("MADURA_1")),
        ("OD Recovered", None), ("Arrear", row.get("ARREAR")),
    ]

    total_deductions = sum(parse_amount(value) for _, value in deduction_items)
    net_pay = pay - total_deductions

    formatted_info_table = []
    for label, value in deduction_items:
        display = format_amount(parse_amount(value))
        formatted_info_table.append((label, display))

    return {
        "name": row.get("NAME", "-") or "-",
        "pay": format_amount(pay),
        "basic": format_amount(basic),
        "da": format_amount(da),
        "oa": format_amount(oa),
        "days": format_amount(days),
        "total_deductions": format_amount(total_deductions),
        "net_pay": format_amount(net_pay),
        "info_table": formatted_info_table
    }

@method_decorator(csrf_exempt, name='dispatch')
class EmployeeLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        empno = data.get('empno')
        dob = data.get('dob')

        # try:
        #     empno = int(empno)
        #     dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        # except (ValueError, TypeError):
        #     return Response({"success": False, "message": "Invalid empno or dob format."}, status=400) 

        try:
            employee = Employee.objects.get(empno=empno, dob=dob)
            serializer = EmployeeSerializer(employee)
            request.session['employee_id'] = employee.id
            request.session.modified = True  # Ensure session is saved
            return Response({
                "success": True,
                "employee": serializer.data
            })
        except Employee.DoesNotExist:
            return Response({"success": False, "message": "Invalid credentials"}, status=401)

@method_decorator(csrf_exempt, name='dispatch')
class AdminLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')

        if username == 'rajan' and password == 'Rajan.0208':
            request.session['is_admin'] = True
            request.session.modified = True  # Ensure session is saved
            return Response({"success": True, "isAdmin": True})
        return Response({"success": False, "message": "Invalid admin credentials"}, status=401)

@method_decorator(csrf_exempt, name='dispatch') 
class DashboardAPIView(APIView):
    def get(self, request):
        emp_id = request.session.get('employee_id')
        if not emp_id:
            return Response({"detail": "Unauthorized"}, status=401)

        employee = Employee.objects.get(id=emp_id)
        payslips = Payslip.objects.filter(employee=employee).order_by('-year', '-month')
        serializer = PayslipSerializer(payslips, many=True)
        return Response({"payslips": serializer.data})


@method_decorator(csrf_exempt, name='dispatch') 
class UploadPayslipsAPIView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        if not request.session.get('is_admin'):
            return Response({"detail": "Unauthorized"}, status=401)

        dbf_file = request.FILES.get('dbf_file')
        if not dbf_file:
            return Response({"detail": "No file provided"}, status=400)

        temp_path = os.path.join(settings.MEDIA_ROOT, 'temp.dbf')
        with open(temp_path, 'wb+') as dest:
            for chunk in dbf_file.chunks():
                dest.write(chunk)

        filename = dbf_file.name
        mm, yy = filename[4:6], filename[6:8]
        year = int(f"20{yy}")
        month = int(mm)
        month_name = calendar.month_name[month]

        payslip_dir = os.path.join(settings.MEDIA_ROOT, 'payslips', f"{year}_{mm}")
        os.makedirs(payslip_dir, exist_ok=True)

        table = DBF(temp_path, load=True, encoding='utf-8')
        count = 0

        for row in table:
            empno = int(row.get("EMPNO", 0))
            employee = Employee.objects.filter(empno=empno).first()
            if not employee:
                continue

            emp_data = extract_employee_data(row)
            pdf = PayslipPDF(month_name, str(year))
            pdf.add_page()
            pdf.generate_body(emp_data)

            pdf_filename = f"payslip_{empno}_{mm}_{yy}.pdf"
            pdf_filepath = os.path.join(payslip_dir, pdf_filename)
            pdf.output(pdf_filepath)

            Payslip.objects.update_or_create(
                employee=employee,
                month=month_name,
                year=year,
                defaults={"pdf_file": os.path.join('payslips', f"{year}_{mm}", pdf_filename)}
            )

            count += 1

        os.remove(temp_path)
        return Response({"success": True, "message": f"{count} payslips generated."}) 
    
@method_decorator(csrf_exempt, name='dispatch')
class MeAPIView(APIView):
    def get(self, request):
        emp_id = request.session.get('employee_id')
        is_admin = request.session.get('is_admin')

        if emp_id:
            employee = Employee.objects.get(id=emp_id)
            serializer = EmployeeSerializer(employee)
            return Response({"success": True, "employee": serializer.data})

        if is_admin:
            return Response({"success": True, "admin": {"username": "admin"}})

        return Response({"success": False}, status=401)


