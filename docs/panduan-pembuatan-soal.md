# Panduan Pembuatan Soal Ujian
## Untuk Guru - Apollo Learning Platform

---

## Akses Halaman Editor

1. Login sebagai guru
2. Buka `/teacher/exams`
3. Klik **Create Exam** atau **Edit** pada exam yang ada

---

## Dua Jenis Grading

| Jenis | Hasil | Cocok Untuk |
|-------|-------|-------------|
| **Simple (Assertion)** | Pass/Fail (0 atau full score) | Soal dengan jawaban pasti |
| **Breakdown (Rubric)** | Partial credit dengan detail | Soal yang dinilai per aspek |

---

## 1. Simple Grading (Assertion)

### Pengaturan di Editor
- **Grading Type**: Simple Assertion *(default)*
- **Points**: Nilai maksimal (misal: 10)

### Contoh Validation Code
```python
# Cek variabel dan nilai
assert total == 30, "Total harus 30"
assert isinstance(total, int), "Harus bilangan bulat"
print("✅ Benar!")
```

### Cara Kerja
- Jika SEMUA assert berhasil → **Full score**
- Jika ADA assert gagal → **0 poin**

### Template Soal Simple

**Judul**: Hitung Total
**Deskripsi**: Buat program yang menjumlahkan bilangan 1 sampai 5 ke variabel `total`
**Initial Code**:
```python
# Tulis kode kamu di sini

```
**Validation Code**:
```python
assert total == 15, "Total seharusnya 15"
print("Benar!")
```

---

## 2. Breakdown Grading (Rubric)

### Pengaturan di Editor
- **Grading Type**: Rubric Scoring (Breakdown)
- **Points**: Total nilai maksimal
- **Hints**: Petunjuk kriteria untuk siswa *(opsional)*

### Template Validation Code

```python
import ast
import json

score = 0
breakdown = {}
errors = []

# ===================================
# ANALISIS STRUKTUR KODE (AST)
# ===================================
try:
    tree = ast.parse(__STUDENT_CODE__)
    
    # Cek penggunaan for loop
    has_for = any(isinstance(n, ast.For) for n in ast.walk(tree))
    if has_for:
        breakdown['loop'] = 3
        score += 3
    else:
        breakdown['loop'] = 0
        errors.append('Tidak ada for loop')
    
    # Cek penggunaan if
    has_if = any(isinstance(n, ast.If) for n in ast.walk(tree))
    if has_if:
        breakdown['kondisi'] = 2
        score += 2
    else:
        breakdown['kondisi'] = 0
        errors.append('Tidak ada if statement')

except SyntaxError as e:
    errors.append(f'Syntax error: {e}')

# ===================================
# CEK RUNTIME (Hasil Eksekusi)
# ===================================
if 'total' in globals() and total == 30:
    breakdown['output'] = 5
    score += 5
else:
    breakdown['output'] = 0
    errors.append('Hasil salah atau variabel tidak ada')

# ===================================
# OUTPUT (WAJIB)
# ===================================
print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
```

---

## Contoh Soal Lengkap dengan Rubric

### Soal: Jumlah Bilangan Genap

**Deskripsi**:
```
Buatlah program Python yang:
1. Inisialisasi variabel `total` dengan nilai 0
2. Lakukan perulangan dari 1 sampai 10
3. Jika bilangan genap, tambahkan ke `total`
4. Tampilkan nilai `total`
```

**Initial Code**:
```python
# Tulis jawaban kamu di sini

```

**Grading Type**: Rubric Scoring

**Points**: 10

**Hints** *(opsional)*:
```
Kriteria penilaian:
- Inisialisasi variabel (2 poin)
- Penggunaan for loop (3 poin)
- Kondisi genap yang benar (3 poin)
- Hasil benar: 30 (2 poin)
```

**Validation Code**:
```python
import ast
import json

score = 0
breakdown = {}
errors = []

try:
    tree = ast.parse(__STUDENT_CODE__)
    
    # 1. Inisialisasi total = 0 (2 pts)
    has_init = any(
        isinstance(n, ast.Assign) and 
        any(isinstance(t, ast.Name) and t.id == 'total' for t in n.targets) and
        isinstance(n.value, ast.Constant) and n.value.value == 0
        for n in ast.walk(tree)
    )
    if has_init:
        breakdown['inisialisasi'] = 2
        score += 2
    else:
        breakdown['inisialisasi'] = 0
        errors.append('total tidak diinisialisasi dengan 0')
    
    # 2. For loop (3 pts)
    has_for = any(isinstance(n, ast.For) for n in ast.walk(tree))
    if has_for:
        breakdown['loop'] = 3
        score += 3
    else:
        breakdown['loop'] = 0
        errors.append('tidak ada for loop')
    
    # 3. Kondisi genap: % 2 == 0 (3 pts)
    has_even = False
    for node in ast.walk(tree):
        if isinstance(node, ast.Compare):
            if isinstance(node.left, ast.BinOp) and isinstance(node.left.op, ast.Mod):
                if isinstance(node.left.right, ast.Constant) and node.left.right.value == 2:
                    for op, comp in zip(node.ops, node.comparators):
                        if isinstance(op, ast.Eq) and isinstance(comp, ast.Constant) and comp.value == 0:
                            has_even = True
    if has_even:
        breakdown['kondisi_genap'] = 3
        score += 3
    else:
        breakdown['kondisi_genap'] = 0
        errors.append('kondisi genap tidak tepat (harus % 2 == 0)')

except SyntaxError as e:
    errors.append(f'syntax error: {e}')

# 4. Hasil benar (2 pts)
if 'total' in globals() and total == 30:
    breakdown['hasil'] = 2
    score += 2
else:
    breakdown['hasil'] = 0
    errors.append(f'hasil salah: seharusnya 30')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
```

---

## Pengecekan AST yang Umum

| Cek | Kode |
|-----|------|
| Ada `for` loop | `any(isinstance(n, ast.For) for n in ast.walk(tree))` |
| Ada `while` loop | `any(isinstance(n, ast.While) for n in ast.walk(tree))` |
| Ada `if` statement | `any(isinstance(n, ast.If) for n in ast.walk(tree))` |
| Ada `print()` | `any(isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == 'print' for n in ast.walk(tree))` |
| Ada modulo `%` | `any(isinstance(n, ast.BinOp) and isinstance(n.op, ast.Mod) for n in ast.walk(tree))` |

---

## Tips

1. **Gunakan Simple Grading** untuk soal sederhana dengan satu jawaban benar
2. **Gunakan Rubric Grading** untuk soal yang ingin dinilai bertahap
3. **Selalu test** validation code sebelum publish exam
4. **Tulis hints** agar siswa tahu kriteria penilaian
5. **Hati-hati dengan spasi** - kode Python sensitif indentasi

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Score selalu 0 | Cek validation code, pastikan ada `print('__RUBRIC__...')` |
| Error `__STUDENT_CODE__ not defined` | Pastikan pakai Rubric Scoring |
| Variabel siswa tidak terdeteksi | Gunakan `globals()` untuk cek, misal: `'total' in globals()` |
