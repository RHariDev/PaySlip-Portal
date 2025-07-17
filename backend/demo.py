import os
import django
import pandas as pd
from datetime import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "payslip_portal_backend.settings")
django.setup()

from core.models import Employee

df = pd.read_excel(r"C:\Users\rhari\Desktop\Projects\PaySlip Portal\backend\gmail.xlsx")

created = 0

for _, row in df.iterrows():
    empno = int(row['EMPNO'])
    name = str(row['NAME']).strip() if pd.notnull(row['NAME']) else None

    dob_raw = row['DOB']
    dob_clean = None

    # ✅ Check the raw value type directly
    print(f"Raw DOB: {dob_raw}  Type: {type(dob_raw)}")

    if pd.isnull(dob_raw):
        dob_clean = None
    elif isinstance(dob_raw, (pd.Timestamp, datetime)):
        dob_clean = dob_raw.date()
    elif isinstance(dob_raw, str):
        dob_raw = dob_raw.strip()
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
            try:
                dob_clean = datetime.strptime(dob_raw, fmt).date()
                break
            except ValueError:
                continue
    else:
        dob_clean = None

    print(f"✅ Final DOB parsed: {dob_clean}")

    email = str(row['EMAIL']).strip() if pd.notnull(row['EMAIL']) else None

    phone_number = None
    if pd.notnull(row['MOBILE_NO']):
        number = row['MOBILE_NO']
        if isinstance(number, float):
            phone_number = str(int(number))
        else:
            phone_number = str(number).strip()

    emp, created_flag = Employee.objects.get_or_create(
        empno=empno,
        defaults={
            'name': name,
            'dob': dob_clean,
            'email': email,
            'phone_number': phone_number
        }
    )
    if created_flag:
        created += 1

print(f"✅ Imported {created} employees successfully.")
