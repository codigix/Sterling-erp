import re

file_path = r'd:\codigix-projects\Sterling-ERP\frontend\src\components\admin\SalesOrderForm.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the length === 0 conditions to allow multiple selections
content = re.sub(
    r'currentMaterial\.steelSection &&\s+materialDetailsTable\.steelSection\.length === 0 &&',
    'currentMaterial.steelSection &&',
    content
)

content = re.sub(
    r'currentMaterial\.plateType &&\s+materialDetailsTable\.plateType\.length === 0 &&',
    'currentMaterial.plateType &&',
    content
)

content = re.sub(
    r'currentMaterial\.materialGrade &&\s+materialDetailsTable\.materialGrade\.length === 0 &&',
    'currentMaterial.materialGrade &&',
    content
)

content = re.sub(
    r'currentMaterial\.fastenerType &&\s+materialDetailsTable\.fastenerType\.length === 0 &&',
    'currentMaterial.fastenerType &&',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully')
