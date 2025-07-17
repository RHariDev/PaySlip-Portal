from django import forms
import calendar 

class PayslipUploadForm(forms.Form):
    # month = forms.ChoiceField(choices=[(str(i).zfill(2), calendar.month_name[i]) for i in range(1, 13)])
    # year = forms.ChoiceField(choices=[(str(y), str(y)) for y in range(2020, 2031)])
    dbf_file = forms.FileField(label="Upload UPAY DBF file")
