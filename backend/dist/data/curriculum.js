"use strict";
/**
 * Curriculum Data
 * Default lessons seeded into the database
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRICULUM = void 0;
exports.CURRICULUM = [
    {
        id: "syntax-basics",
        title: "1. Struktur & Sintaks",
        description: "Indentasi, Case Sensitivity, dan Komentar.",
        task: "Perbaiki kode di bawah ini agar berjalan dengan benar (Perhatikan huruf 'P' pada Print dan indentasi).",
        content: `# Struktur Kode & Sintaks Dasar

Python dikenal dengan sintaksnya yang minimalis dan mudah dibaca.

### 1. Case Sensitive
Python membedakan huruf besar dan kecil.

### 2. Indentasi (PENTING!)
Spasi di awal baris digunakan untuk menandai blok kode.

### 3. Komentar
Gunakan tanda pagar (#) untuk membuat catatan.`,
        initialCode: `# Perbaiki kode ini:
if True:
print("Indentasi salah!")

# Perbaiki ini juga:
Print("Huruf besar salah!")`,
        expectedOutput: "Indentasi salah!\nHuruf besar salah!\n",
    },
    {
        id: "data-types",
        title: "2. Tipe Data Dasar",
        description: "String, Integer, Float, dan lainnya.",
        task: "Buat variabel 'nama' (String), 'umur' (Integer), dan 'tinggi' (Float). Lalu print ketiganya.",
        content: `# Tipe Data Dasar

### String (Teks)
Diapit tanda kutip tunggal atau ganda.

### Number (Angka)
- Integer: Bilangan bulat
- Float: Bilangan desimal

### Boolean
Nilai kebenaran: True atau False.

### List
Kumpulan data terurut: [1, 2, 3]`,
        initialCode: `# Buat variabel di sini
nama = "..."
umur = ...
tinggi = ...

# Print variabel
print(nama)
print(umur)
print(tinggi)`,
        expectedOutput: "",
    },
    {
        id: "operators",
        title: "3. Operator",
        description: "Aritmatika, Perbandingan, dan Logika.",
        task: "Hitung sisa bagi (modulus) dari 10 dibagi 3 dan print hasilnya.",
        content: `# Operator dalam Python

### 1. Aritmatika
+, -, *, /, //, %, **

### 2. Perbandingan
==, !=, >, <, >=, <=

### 3. Logika
and, or, not`,
        initialCode: `# Hitung 10 modulus 3
hasil = ...
print(hasil)`,
        expectedOutput: "1\n",
    },
    {
        id: "conditionals",
        title: "4. Percabangan IF",
        description: "If, Elif, dan Else.",
        task: "Buat logika: Jika angka positif print 'Positif', jika negatif print 'Negatif'. (Gunakan variabel angka = -5)",
        content: `# Percabangan IF

Digunakan untuk menjalankan kode hanya jika kondisi tertentu terpenuhi.

### Struktur
\`\`\`python
if nilai > 80:
    print("A")
elif nilai > 70:
    print("B")
else:
    print("C")
\`\`\``,
        initialCode: `angka = -5

# Tulis if-else di bawah ini:
if ...:
    ...
else:
    ...`,
        expectedOutput: "Negatif\n",
    },
    {
        id: "switch-case",
        title: "5. Switch Case (Dict)",
        description: "Alternatif Switch Case menggunakan Dictionary.",
        task: "Buat dictionary untuk konversi angka ke teks: 1='Satu', 2='Dua'. Print nilai dari key 1.",
        content: `# Switch Case (Alternatif)

Python versi lama tidak memiliki switch case. Kita bisa menirunya menggunakan Dictionary.

### Contoh:
\`\`\`python
hari = {
    1: "Senin",
    2: "Selasa"
}
print(hari.get(pilihan, "Tidak Valid"))
\`\`\``,
        initialCode: `# Buat dictionary
angka_ke_teks = {
    ...
}

# Print nilai dari key 1
print(...)`,
        expectedOutput: "Satu\n",
    },
    {
        id: "loops",
        title: "6. Loops (Perulangan)",
        description: "For Loop dan While Loop.",
        task: "Gunakan for loop dan range() untuk print angka 1 sampai 5 (inklusif).",
        content: `# Struktur Perulangan

### For Loop
\`\`\`python
for i in range(5):
    print(i)
\`\`\`

### While Loop
\`\`\`python
x = 0
while x < 5:
    print(x)
    x += 1
\`\`\``,
        initialCode: `# Tulis loop di bawah:
for i in ...:
    print(i)`,
        expectedOutput: "1\n2\n3\n4\n5\n",
    },
    {
        id: "arrays-nested",
        title: "7. Array & Nested Loop",
        description: "List dan Perulangan Bersarang.",
        task: "Buat list berisi [10, 20, 30]. Tambahkan angka 40 menggunakan .append(), lalu print seluruh list.",
        content: `# Array (List) & Nested Loop

### List (Array)
\`\`\`python
buah = ["Apel", "Jeruk", "Mangga"]
buah.append("Pisang")
buah.remove("Jeruk")
print(buah[0])
\`\`\`

### Nested Loop
Loop di dalam loop.`,
        initialCode: `# Buat list
angka = [10, 20, 30]

# Tambahkan 40
...

# Print list
print(angka)`,
        expectedOutput: "[10, 20, 30, 40]\n",
    },
    {
        id: "strings",
        title: "8. String Manipulation",
        description: "Slicing, Len, Ord, Chr.",
        task: "Ambil kata 'Python' dari string 'Belajar Python' menggunakan slicing. Print hasilnya.",
        content: `# Manipulasi String

### Slicing
Mengambil bagian string: text[start:end]

### Fungsi Bawaan
- len(text): Menghitung panjang karakter.
- ord('A'): Mengambil kode ASCII (65).
- chr(65): Mengubah kode ASCII ke karakter ('A').`,
        initialCode: `kalimat = "Belajar Python"

# Ambil kata Python (ingat indeks mulai dari 0)
kata = kalimat[...] 

print(kata)`,
        expectedOutput: "Python\n",
    }
];
//# sourceMappingURL=curriculum.js.map