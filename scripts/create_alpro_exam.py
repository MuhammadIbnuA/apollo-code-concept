"""
Script to create Alpro Exam with 10 questions via API
"""
import requests
import json

BASE_URL = "http://localhost:3000"

# Validation code template - each question has its own validation
def make_validation(qid, checks):
    """Generate validation code for a specific question"""
    return f'''import ast, json

score = 0
breakdown = {{}}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
{checks}

except SyntaxError as e:
    errors.append(f'Syntax error: {{e}}')

print('__RUBRIC__' + json.dumps({{
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}}))
'''

# Question definitions
QUESTIONS = [
    {
        "id": "Q1",
        "title": "Fungsi print_pesan(teks)",
        "description": """Buatlah fungsi bernama `print_pesan` yang:
- Menerima satu parameter bernama `teks`
- Mencetak isi dari parameter tersebut menggunakan `print()`

Contoh pemanggilan:
```python
print_pesan("Halo Dunia")
# Output: Halo Dunia
```""",
        "initialCode": "# Buat fungsi print_pesan di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_func = has_param = has_print = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "print_pesan":
            has_func = True
            if len(n.args.args) == 1:
                has_param = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "print":
            has_print = True

    if has_func:
        breakdown["fungsi"] = 3
        score += 3
    else:
        breakdown["fungsi"] = 0
        errors.append("Fungsi print_pesan tidak ditemukan")

    if has_param:
        breakdown["parameter"] = 3
        score += 3
    else:
        breakdown["parameter"] = 0
        errors.append("Parameter tidak sesuai")

    if has_print:
        breakdown["print"] = 4
        score += 4
    else:
        breakdown["print"] = 0
        errors.append("Tidak menggunakan print()")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Fungsi (3), Parameter (3), Print (4)"
    },
    {
        "id": "Q2",
        "title": "Fungsi tambah(a, b)",
        "description": """Buatlah fungsi bernama `tambah` yang:
- Menerima dua parameter `a` dan `b`
- Mengembalikan hasil penjumlahan a + b menggunakan `return`

Contoh:
```python
hasil = tambah(3, 5)
print(hasil)  # Output: 8
```""",
        "initialCode": "# Buat fungsi tambah di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_func = has_return = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "tambah" and len(n.args.args) == 2:
            has_func = True
        if isinstance(n, ast.Return):
            has_return = True

    if has_func:
        breakdown["fungsi"] = 5
        score += 5
    else:
        breakdown["fungsi"] = 0
        errors.append("Fungsi tambah dengan 2 parameter tidak ditemukan")

    if has_return:
        breakdown["return"] = 5
        score += 5
    else:
        breakdown["return"] = 0
        errors.append("Tidak ada return statement")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Fungsi dengan 2 parameter (5), Return (5)"
    },
    {
        "id": "Q3",
        "title": "Pemanggilan Fungsi",
        "description": """Diberikan fungsi `tambah(a, b)` yang sudah ada.

Tugasmu:
1. Panggil fungsi `tambah` dengan argumen 10 dan 20
2. Simpan hasilnya ke variabel bernama `hasil`
3. Cetak nilai `hasil`

```python
def tambah(a, b):
    return a + b

# Tulis kode kamu di bawah ini
```""",
        "initialCode": "def tambah(a, b):\n    return a + b\n\n# Panggil fungsi dan simpan hasilnya\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    called = assigned = False
    for n in ast.walk(tree):
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "tambah":
            called = True
        if isinstance(n, ast.Assign):
            for target in n.targets:
                if isinstance(target, ast.Name) and target.id == "hasil":
                    assigned = True

    if called:
        breakdown["pemanggilan"] = 5
        score += 5
    else:
        breakdown["pemanggilan"] = 0
        errors.append("Fungsi tambah tidak dipanggil")

    if assigned:
        breakdown["penyimpanan"] = 5
        score += 5
    else:
        breakdown["penyimpanan"] = 0
        errors.append("Hasil tidak disimpan ke variabel 'hasil'")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Pemanggilan fungsi (5), Penyimpanan ke variabel (5)"
    },
    {
        "id": "Q4",
        "title": "Fungsi luas_persegi_panjang(p, l)",
        "description": """Buatlah fungsi `luas_persegi_panjang` yang:
- Menerima parameter `p` (panjang) dan `l` (lebar)
- Menghitung luas dengan rumus: panjang × lebar
- Mengembalikan hasilnya

Contoh:
```python
luas = luas_persegi_panjang(5, 3)
print(luas)  # Output: 15
```""",
        "initialCode": "# Buat fungsi luas_persegi_panjang di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_func = has_mul = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "luas_persegi_panjang":
            has_func = True
        if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Mult):
            has_mul = True

    if has_func:
        breakdown["fungsi"] = 5
        score += 5
    else:
        breakdown["fungsi"] = 0
        errors.append("Fungsi luas_persegi_panjang tidak ditemukan")

    if has_mul:
        breakdown["perkalian"] = 5
        score += 5
    else:
        breakdown["perkalian"] = 0
        errors.append("Tidak ada operasi perkalian")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Fungsi (5), Perkalian p*l (5)"
    },
    {
        "id": "Q5",
        "title": "Fungsi luas_lingkaran(r)",
        "description": """Buatlah fungsi `luas_lingkaran` yang:
- Menerima parameter `r` (jari-jari)
- Menghitung luas dengan rumus: 3.14 × r × r
- Mengembalikan hasilnya dengan `return`

Contoh:
```python
luas = luas_lingkaran(7)
print(luas)  # Output: 153.86
```""",
        "initialCode": "# Buat fungsi luas_lingkaran di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_func = has_return = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "luas_lingkaran":
            has_func = True
        if isinstance(n, ast.Return):
            has_return = True

    if has_func:
        breakdown["fungsi"] = 5
        score += 5
    else:
        breakdown["fungsi"] = 0
        errors.append("Fungsi luas_lingkaran tidak ditemukan")

    if has_return:
        breakdown["return"] = 5
        score += 5
    else:
        breakdown["return"] = 0
        errors.append("Tidak ada return statement")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Fungsi (5), Return (5)"
    },
    {
        "id": "Q6",
        "title": "Fungsi nilai_minimum(daftar)",
        "description": """Buatlah fungsi `nilai_minimum` yang:
- Menerima parameter `daftar` (list angka)
- Mencari nilai terkecil menggunakan **perulangan** (for/while)
- Mengembalikan nilai minimum tersebut

**Tidak boleh** menggunakan fungsi `min()` bawaan Python.

Contoh:
```python
angka = [5, 2, 8, 1, 9]
hasil = nilai_minimum(angka)
print(hasil)  # Output: 1
```""",
        "initialCode": "# Buat fungsi nilai_minimum di sini\n# Gunakan loop, jangan pakai min()\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_func = has_loop = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "nilai_minimum":
            has_func = True
        if isinstance(n, (ast.For, ast.While)):
            has_loop = True

    if has_func:
        breakdown["fungsi"] = 5
        score += 5
    else:
        breakdown["fungsi"] = 0
        errors.append("Fungsi nilai_minimum tidak ditemukan")

    if has_loop:
        breakdown["loop"] = 5
        score += 5
    else:
        breakdown["loop"] = 0
        errors.append("Tidak menggunakan perulangan (for/while)")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Fungsi (5), Perulangan (5)"
    },
    {
        "id": "Q7",
        "title": "Fungsi rata_rata(daftar)",
        "description": """Buatlah fungsi `rata_rata` yang:
- Menerima parameter `daftar` (list angka)
- Menghitung rata-rata dengan loop dan `len()`
- Mengembalikan nilai rata-rata

Contoh:
```python
angka = [10, 20, 30]
hasil = rata_rata(angka)
print(hasil)  # Output: 20.0
```""",
        "initialCode": "# Buat fungsi rata_rata di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_loop = has_len = False
    for n in ast.walk(tree):
        if isinstance(n, (ast.For, ast.While)):
            has_loop = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "len":
            has_len = True

    if has_loop:
        breakdown["loop"] = 5
        score += 5
    else:
        breakdown["loop"] = 0
        errors.append("Tidak menggunakan perulangan")

    if has_len:
        breakdown["len"] = 5
        score += 5
    else:
        breakdown["len"] = 0
        errors.append("Tidak menggunakan len()")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Perulangan (5), Menggunakan len() (5)"
    },
    {
        "id": "Q8",
        "title": "Fungsi status_kelulusan(nilai)",
        "description": """Buatlah fungsi `status_kelulusan` yang:
- Menerima parameter `nilai`
- Jika nilai >= 75, return `"Lulus"`
- Jika nilai < 75, return `"Tidak Lulus"`

Contoh:
```python
print(status_kelulusan(80))  # Output: Lulus
print(status_kelulusan(60))  # Output: Tidak Lulus
```""",
        "initialCode": "# Buat fungsi status_kelulusan di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_if = has_return = False
    for n in ast.walk(tree):
        if isinstance(n, ast.If):
            has_if = True
        if isinstance(n, ast.Return):
            has_return = True

    if has_if:
        breakdown["if"] = 5
        score += 5
    else:
        breakdown["if"] = 0
        errors.append("Tidak menggunakan if statement")

    if has_return:
        breakdown["return"] = 5
        score += 5
    else:
        breakdown["return"] = 0
        errors.append("Tidak ada return statement")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Kondisi if (5), Return (5)"
    },
    {
        "id": "Q9",
        "title": "Fungsi tampilkan_identitas()",
        "description": """Buatlah fungsi `tampilkan_identitas` yang:
- Tidak menerima parameter
- Mencetak nama dan NIM kamu menggunakan print()

Contoh output:
```
Nama: Budi Santoso
NIM: 12345678
```""",
        "initialCode": "# Buat fungsi tampilkan_identitas di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_func = has_print = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "tampilkan_identitas":
            has_func = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "print":
            has_print = True

    if has_func:
        breakdown["fungsi"] = 5
        score += 5
    else:
        breakdown["fungsi"] = 0
        errors.append("Fungsi tampilkan_identitas tidak ditemukan")

    if has_print:
        breakdown["print"] = 5
        score += 5
    else:
        breakdown["print"] = 0
        errors.append("Tidak menggunakan print()")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Fungsi (5), Print (5)"
    },
    {
        "id": "Q10",
        "title": "Fungsi hitung_luas_dan_tampilkan(p, l)",
        "description": """Buatlah fungsi `hitung_luas_dan_tampilkan` yang:
- Menerima parameter `p` (panjang) dan `l` (lebar)
- Menghitung luas (panjang × lebar)
- Langsung mencetak hasilnya (tidak perlu return)

Contoh:
```python
hitung_luas_dan_tampilkan(4, 5)
# Output: 20
```""",
        "initialCode": "# Buat fungsi hitung_luas_dan_tampilkan di sini\n\n",
        "validationCode": '''import ast, json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    has_func = has_calc = has_print = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "hitung_luas_dan_tampilkan":
            has_func = True
        if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Mult):
            has_calc = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "print":
            has_print = True

    if has_func:
        breakdown["fungsi"] = 4
        score += 4
    else:
        breakdown["fungsi"] = 0
        errors.append("Fungsi hitung_luas_dan_tampilkan tidak ditemukan")

    if has_calc:
        breakdown["perhitungan"] = 3
        score += 3
    else:
        breakdown["perhitungan"] = 0
        errors.append("Tidak ada operasi perkalian")

    if has_print:
        breakdown["print"] = 3
        score += 3
    else:
        breakdown["print"] = 0
        errors.append("Tidak menggunakan print()")

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
''',
        "points": 10,
        "hints": "Kriteria: Fungsi (4), Perkalian (3), Print (3)"
    }
]

def create_exam():
    """Create the Alpro exam via API"""
    
    # Add gradingType to all questions
    for q in QUESTIONS:
        q["gradingType"] = "rubric"
    
    exam_data = {
        "id": "alpro-functions",
        "title": "Ujian Algoritma & Pemrograman: Fungsi Python",
        "description": "Ujian tentang konsep fungsi dalam Python: membuat fungsi, parameter, return, dan pemanggilan fungsi.",
        "durationMinutes": 90,
        "questions": QUESTIONS,
        "isPublic": True
    }
    
    print("=" * 60)
    print("Creating Alpro Exam...")
    print("=" * 60)
    print(f"ID: {exam_data['id']}")
    print(f"Title: {exam_data['title']}")
    print(f"Questions: {len(QUESTIONS)}")
    print(f"Total Points: {sum(q['points'] for q in QUESTIONS)}")
    print()
    
    # Create via API
    response = requests.post(
        f"{BASE_URL}/api/admin/exams",
        json=exam_data,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    if response.status_code == 200:
        print("✅ Exam created successfully!")
        print(f"   URL: {BASE_URL}/exam/{exam_data['id']}")
        print(f"   Edit: {BASE_URL}/teacher/exams/{exam_data['id']}/edit")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    create_exam()
