export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string;
    initialCode: string;
    expectedOutput?: string;
    task: string;
}

export const CURRICULUM: Lesson[] = [
    {
        id: "syntax-basics",
        title: "1. Struktur & Sintaks",
        description: "Indentasi, Case Sensitivity, dan Komentar.",
        content: `
# Struktur Kode & Sintaks Dasar

Python dikenal dengan sintaksnya yang minimalis dan mudah dibaca. Tidak seperti bahasa C atau Pascal, Python tidak memerlukan banyak kurung kurawal atau titik koma.

### 1. Case Sensitive
Python membedakan huruf besar dan kecil.
\`\`\`python
print("Halo") # Benar
Print("Halo") # Salah (Error)
\`\`\`

### 2. Indentasi (PENTING!)
Spasi di awal baris digunakan untuk menandai blok kode.
\`\`\`python
if True:
    print("Ini menjorok ke dalam (Indented)")
\`\`\`
Jika indentasi salah, program akan error (\`IndentationError\`).

### 3. Komentar
Gunakan tanda pagar (\`#\`) untuk membuat catatan yang tidak dieksekusi.
\`\`\`python
# Ini adalah komentar
print("Kode berjalan") # Komentar di baris yang sama
\`\`\`
    `,
        task: "Perbaiki kode di bawah ini agar berjalan dengan benar (Perhatikan huruf 'P' pada Print dan indentasi).",
        initialCode: `# Perbaiki kode ini:
if True:
print("Indentasi salah!")

# Perbaiki ini juga:
Print("Huruf besar salah!")
`,
        expectedOutput: "Indentasi salah!\nHuruf besar salah!\n",
    },
    {
        id: "data-types",
        title: "2. Tipe Data Dasar",
        description: "String, Integer, Float, dan lainnya.",
        content: `
# Tipe Data Dasar

Python memiliki 9 tipe data utama. Kita akan fokus pada yang paling sering digunakan:

### String (Teks)
Diapit tanda kutip tunggal (' ') atau ganda (" ").
\`\`\`python
nama = "Budi"
\`\`\`

### Number (Angka)
- **Integer**: Bilangan bulat (contoh: \`10\`, \`-5\`)
- **Float**: Bilangan desimal (contoh: \`3.14\`, \`2.5\`)

### Boolean
Nilai kebenaran: \`True\` atau \`False\`.

### List
Kumpulan data terurut: \`[1, 2, 3]\`
    `,
        task: "Buat variabel 'nama' (String), 'umur' (Integer), dan 'tinggi' (Float). Lalu print ketiganya secara berurutan.",
        initialCode: `# Buat variabel di sini
nama = "..."
umur = ...
tinggi = ...

# Print variabel
print(nama)
print(umur)
print(tinggi)
`,
        expectedOutput: "", // Loose check, expecting 3 lines of output
    },
    {
        id: "operators",
        title: "3. Operator",
        description: "Aritmatika, Perbandingan, dan Logika.",
        content: `
# Operator dalam Python

### 1. Aritmatika
- \`+\` Tambah
- \`-\` Kurang
- \`*\` Kali
- \`/\` Bagi (hasil float)
- \`//\` Bagi bulat (floor)
- \`%\` Modulus (sisa bagi)
- \`**\` Pangkat

### 2. Perbandingan
Menghasilkan \`True\` atau \`False\`:
\`==\` (Sama dengan), \`!=\` (Tidak sama), \`>\`, \`<\`, \`>=\`, \`<=\`

### 3. Logika
\`and\`, \`or\`, \`not\`
    `,
        task: "Hitung sisa bagi (modulus) dari 10 dibagi 3 dan print hasilnya.",
        initialCode: `# Hitung 10 modulus 3
hasil = ...
print(hasil)
`,
        expectedOutput: "1\n",
    },
    {
        id: "conditionals",
        title: "4. Percabangan IF",
        description: "If, Elif, dan Else.",
        content: `
# Percabangan IF

Digunakan untuk menjalankan kode hanya jika kondisi tertentu terpenuhi.

### Struktur
\`\`\`python
nilai = 75

if nilai > 80:
    print("A")
elif nilai > 70:
    print("B")
else:
    print("C")
\`\`\`

Ingat: Blok kode setelah \`:\` harus memiliki **indentasi**.
    `,
        task: "Buat logika: Jika angka positif print 'Positif', jika negatif print 'Negatif'. (Gunakan variabel angka = -5)",
        initialCode: `angka = -5

# Tulis if-else di bawah ini:
if ...:
    ...
else:
    ...
`,
        expectedOutput: "Negatif\n",
    },
    {
        id: "switch-case",
        title: "5. Switch Case (Dict)",
        description: "Alternatif Switch Case menggunakan Dictionary.",
        content: `
# Switch Case (Alternatif)

Python versi lama tidak memiliki \`switch case\`. Kita bisa menirunya menggunakan **Dictionary**.
Dictionary menyimpan pasangan \`key: value\`.

### Contoh:
\`\`\`python
hari = {
    1: "Senin",
    2: "Selasa",
    3: "Rabu"
}

pilihan = 2
print(hari.get(pilihan, "Tidak Valid"))
\`\`\`
Fungsi \`.get(key, default)\` sangat berguna jika key tidak ditemukan.
    `,
        task: "Buat dictionary untuk konversi angka ke teks: 1='Satu', 2='Dua'. Print nilai dari key 1.",
        initialCode: `# Buat dictionary
angka_ke_teks = {
    ...
}

# Print nilai dari key 1
print(...)
`,
        expectedOutput: "Satu\n",
    },
    {
        id: "loops",
        title: "6. Loops (Perulangan)",
        description: "For Loop dan While Loop.",
        content: `
# Struktur Perulangan

### For Loop
Digunakan untuk mengulang elemen dalam urutan (seperti list atau string) atau angka (\`range\`).
\`\`\`python
# Print 0 sampai 4
for i in range(5):
    print(i)
\`\`\`

### While Loop
Berjalan selama kondisi \`True\`.
\`\`\`python
x = 0
while x < 5:
    print(x)
    x += 1 # Jangan lupa increment agar tidak Infinity Loop!
\`\`\`
    `,
        task: "Gunakan for loop dan range() untuk print angka 1 sampai 5 (inklusif).",
        initialCode: `# Tulis loop di bawah:
for i in ...:
    print(i)
`,
        expectedOutput: "1\n2\n3\n4\n5\n",
    },
    {
        id: "arrays-nested",
        title: "7. Array & Nested Loop",
        description: "List dan Perulangan Bersarang.",
        content: `
# Array (List) & Nested Loop

### List (Array)
Menyimpan banyak nilai dalam satu variabel.
\`\`\`python
buah = ["Apel", "Jeruk", "Mangga"]
buah.append("Pisang") # Tambah
buah.remove("Jeruk")  # Hapus
print(buah[0])        # Akses indeks ke-0
\`\`\`

### Nested Loop
Loop di dalam loop.
\`\`\`python
for i in range(3):
    for j in range(2):
        print(i, j)
\`\`\`
    `,
        task: "Buat list berisi [10, 20, 30]. Tambahkan angka 40 ke dalamnya menggunakan .append(), lalu print seluruh list.",
        initialCode: `# Buat list
angka = [10, 20, 30]

# Tambahkan 40
...

# Print list
print(angka)
`,
        expectedOutput: "[10, 20, 30, 40]\n",
    },
    {
        id: "strings",
        title: "8. String Manipulation",
        description: "Slicing, Len, Ord, Chr.",
        content: `
# Manipulasi String

String di Python bisa diolah seperti Array (List karakter).

### Slicing
Mengambil bagian string: \`text[start:end]\`
\`\`\`python
text = "Hello World"
print(text[0:5]) # Output: Hello
\`\`\`

### Fungsi Bawaan
- \`len(text)\`: Menghitung panjang karakter.
- \`ord('A')\`: Mengambil kode ASCII (65).
- \`chr(65)\`: Mengubah kode ASCII ke karakter ('A').
    `,
        task: "Ambil kata 'Python' dari string 'Belajar Python' menggunakan slicing. Print hasilnya.",
        initialCode: `kalimat = "Belajar Python"

# Ambil kata Python (ingat indeks mulai dari 0)
kata = kalimat[...] 

print(kata)
`,
        expectedOutput: "Python\n",
    }
];
