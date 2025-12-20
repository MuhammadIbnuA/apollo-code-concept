import ast, json

score = 0
max_score = 10
breakdown = {}
errors = []

tree = ast.parse(__STUDENT_CODE__)

qid = globals().get("__QUESTION_ID__", "")

# ==================================================
# Q1 — print_pesan(teks)
# ==================================================
if qid == "Q1":
    has_func = has_param = has_print = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "print_pesan":
            has_func = True
            if len(n.args.args) == 1:
                has_param = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "print":
            has_print = True

    if has_func: breakdown["fungsi"] = 3; score += 3
    else: breakdown["fungsi"] = 0; errors.append("fungsi tidak dibuat")

    if has_param: breakdown["parameter"] = 3; score += 3
    else: breakdown["parameter"] = 0; errors.append("parameter salah")

    if has_print: breakdown["print"] = 4; score += 4
    else: breakdown["print"] = 0; errors.append("print tidak digunakan")

# ==================================================
# Q2 — tambah(a, b)
# ==================================================
elif qid == "Q2":
    has_func = has_return = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "tambah" and len(n.args.args) == 2:
            has_func = True
        if isinstance(n, ast.Return):
            has_return = True

    if has_func: breakdown["fungsi"] = 5; score += 5
    else: breakdown["fungsi"] = 0; errors.append("fungsi tambah salah")

    if has_return: breakdown["return"] = 5; score += 5
    else: breakdown["return"] = 0; errors.append("tidak ada return")

# ==================================================
# Q3 — Pemanggilan fungsi tambah
# ==================================================
elif qid == "Q3":
    called = assigned = False
    for n in ast.walk(tree):
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "tambah":
            called = True
        if isinstance(n, ast.Assign):
            assigned = True

    if called: breakdown["pemanggilan"] = 5; score += 5
    else: breakdown["pemanggilan"] = 0; errors.append("fungsi tidak dipanggil")

    if assigned: breakdown["penyimpanan"] = 5; score += 5
    else: breakdown["penyimpanan"] = 0; errors.append("hasil tidak disimpan")

# ==================================================
# Q4 — luas_persegi_panjang(p, l)
# ==================================================
elif qid == "Q4":
    has_func = has_mul = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "luas_persegi_panjang":
            has_func = True
        if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Mult):
            has_mul = True

    if has_func: breakdown["fungsi"] = 5; score += 5
    else: breakdown["fungsi"] = 0; errors.append("fungsi tidak ada")

    if has_mul: breakdown["perkalian"] = 5; score += 5
    else: breakdown["perkalian"] = 0; errors.append("tidak ada perkalian")

# ==================================================
# Q5 — luas_lingkaran(r)
# ==================================================
elif qid == "Q5":
    has_func = has_return = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "luas_lingkaran":
            has_func = True
        if isinstance(n, ast.Return):
            has_return = True

    if has_func: breakdown["fungsi"] = 5; score += 5
    else: breakdown["fungsi"] = 0; errors.append("fungsi tidak ada")

    if has_return: breakdown["return"] = 5; score += 5
    else: breakdown["return"] = 0; errors.append("tidak ada return")

# ==================================================
# Q6 — nilai_minimum(list)
# ==================================================
elif qid == "Q6":
    has_func = has_loop = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "nilai_minimum":
            has_func = True
        if isinstance(n, (ast.For, ast.While)):
            has_loop = True

    if has_func: breakdown["fungsi"] = 5; score += 5
    else: breakdown["fungsi"] = 0; errors.append("fungsi tidak ada")

    if has_loop: breakdown["loop"] = 5; score += 5
    else: breakdown["loop"] = 0; errors.append("tidak ada loop")

# ==================================================
# Q7 — rata_rata(list)
# ==================================================
elif qid == "Q7":
    has_loop = has_len = False
    for n in ast.walk(tree):
        if isinstance(n, (ast.For, ast.While)):
            has_loop = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "len":
            has_len = True

    if has_loop: breakdown["loop"] = 5; score += 5
    else: breakdown["loop"] = 0; errors.append("tidak ada loop")

    if has_len: breakdown["len"] = 5; score += 5
    else: breakdown["len"] = 0; errors.append("tidak pakai len")

# ==================================================
# Q8 — status_kelulusan(nilai)
# ==================================================
elif qid == "Q8":
    has_if = has_return = False
    for n in ast.walk(tree):
        if isinstance(n, ast.If):
            has_if = True
        if isinstance(n, ast.Return):
            has_return = True

    if has_if: breakdown["if"] = 5; score += 5
    else: breakdown["if"] = 0; errors.append("tidak ada if")

    if has_return: breakdown["return"] = 5; score += 5
    else: breakdown["return"] = 0; errors.append("tidak ada return")

# ==================================================
# Q9 — tampilkan_identitas()
# ==================================================
elif qid == "Q9":
    has_func = has_print = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "tampilkan_identitas":
            has_func = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "print":
            has_print = True

    if has_func: breakdown["fungsi"] = 5; score += 5
    else: breakdown["fungsi"] = 0; errors.append("fungsi tidak ada")

    if has_print: breakdown["print"] = 5; score += 5
    else: breakdown["print"] = 0; errors.append("tidak ada print")

# ==================================================
# Q10 — hitung_luas_dan_tampilkan(p, l)
# ==================================================
elif qid == "Q10":
    has_func = has_calc = has_print = False
    for n in ast.walk(tree):
        if isinstance(n, ast.FunctionDef) and n.name == "hitung_luas_dan_tampilkan":
            has_func = True
        if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Mult):
            has_calc = True
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "print":
            has_print = True

    if has_func: breakdown["fungsi"] = 4; score += 4
    else: breakdown["fungsi"] = 0; errors.append("fungsi tidak ada")

    if has_calc: breakdown["perhitungan"] = 3; score += 3
    else: breakdown["perhitungan"] = 0; errors.append("tidak ada perhitungan")

    if has_print: breakdown["print"] = 3; score += 3
    else: breakdown["print"] = 0; errors.append("tidak ada print")

# ==================================================
# OUTPUT WAJIB
# ==================================================
print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": max_score,
    "breakdown": breakdown,
    "errors": errors
}))
