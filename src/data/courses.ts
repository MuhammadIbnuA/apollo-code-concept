/**
 * Course definitions for multi-language learning
 */

import type { Course, Lesson, CourseLanguage } from '@/lib/types';

// ============================================================
// COURSE DEFINITIONS
// ============================================================

export const COURSES: Course[] = [
    {
        id: 'python',
        title: 'Python Basics',
        description: 'Dasar-dasar pemrograman Python: variabel, tipe data, loop, dan fungsi',
        language: 'python',
        icon: '🐍',
        color: 'from-yellow-500 to-green-500'
    },
    {
        id: 'html',
        title: 'HTML Basics',
        description: 'Struktur dasar halaman web dengan HTML: elemen, tag, dan atribut',
        language: 'html',
        icon: '📄',
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 'css',
        title: 'CSS Basics',
        description: 'Styling halaman web: warna, font, layout, dan animasi',
        language: 'css',
        icon: '🎨',
        color: 'from-blue-500 to-purple-500'
    },
    {
        id: 'html-css',
        title: 'HTML + CSS',
        description: 'Membangun halaman web lengkap dengan HTML dan CSS',
        language: 'html-css',
        icon: '🌐',
        color: 'from-pink-500 to-violet-500'
    },
    {
        id: 'javascript',
        title: 'JavaScript Basics',
        description: 'Dasar-dasar JavaScript: variabel, fungsi, DOM, dan events',
        language: 'javascript',
        icon: '⚡',
        color: 'from-yellow-400 to-orange-500'
    },
    {
        id: 'react',
        title: 'React Frontend',
        description: 'Membangun UI modern dengan React: komponen, state, props, dan hooks',
        language: 'react',
        icon: '⚛️',
        color: 'from-cyan-400 to-blue-500'
    },
    {
        id: 'tailwind',
        title: 'Tailwind CSS',
        description: 'CSS utility-first framework untuk styling cepat dan responsif',
        language: 'tailwind',
        icon: '💨',
        color: 'from-teal-400 to-cyan-600'
    }
];

// ============================================================
// SAMPLE LESSONS - HTML
// ============================================================

export const HTML_LESSONS: Lesson[] = [
    {
        id: 'html-01-intro',
        title: 'Pengenalan HTML',
        description: 'Apa itu HTML dan struktur dasar dokumen HTML',
        task: 'Buat halaman HTML pertamamu dengan heading "Hello World"',
        content: `# Apa itu HTML?

HTML (HyperText Markup Language) adalah bahasa markup standar untuk membuat halaman web.

## Struktur Dasar HTML

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Judul Halaman</title>
</head>
<body>
    <h1>Heading</h1>
    <p>Paragraf</p>
</body>
</html>
\`\`\`

## Tag Penting

- \`<html>\` - Root element
- \`<head>\` - Informasi halaman
- \`<body>\` - Konten yang terlihat
- \`<h1>\` - Heading utama
- \`<p>\` - Paragraf`,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <title>Halaman Pertama</title>
</head>
<body>
    <!-- Tambahkan heading h1 dengan teks "Hello World" di sini -->
    
</body>
</html>`,
        validationCode: `h1:Hello World`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'html',
        language: 'html'
    },
    {
        id: 'html-02-headings',
        title: 'Heading & Paragraf',
        description: 'Menggunakan heading h1-h6 dan paragraf',
        task: 'Buat heading h1, h2, h3 dan satu paragraf',
        content: `# Heading & Paragraf

## Heading (h1 - h6)

HTML memiliki 6 level heading:

\`\`\`html
<h1>Heading 1 (Terbesar)</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6 (Terkecil)</h6>
\`\`\`

## Paragraf

\`\`\`html
<p>Ini adalah paragraf pertama.</p>
<p>Ini adalah paragraf kedua.</p>
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<body>
    <!-- Buat h1 dengan teks "Judul Utama" -->
    
    <!-- Buat h2 dengan teks "Sub Judul" -->
    
    <!-- Buat h3 dengan teks "Bagian" -->
    
    <!-- Buat paragraf dengan teks apapun -->
    
</body>
</html>`,
        validationCode: `h1:Judul Utama|h2:Sub Judul|h3:Bagian|p`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'html',
        language: 'html'
    },
    {
        id: 'html-03-links',
        title: 'Link & Gambar',
        description: 'Membuat hyperlink dan menampilkan gambar',
        task: 'Buat link ke Google dan tampilkan gambar',
        content: `# Link & Gambar

## Hyperlink

\`\`\`html
<a href="https://www.google.com">Klik di sini</a>
\`\`\`

Atribut penting:
- \`href\` - URL tujuan
- \`target="_blank"\` - Buka di tab baru

## Gambar

\`\`\`html
<img src="gambar.jpg" alt="Deskripsi gambar">
\`\`\`

Atribut penting:
- \`src\` - Sumber gambar
- \`alt\` - Teks alternatif`,
        initialCode: `<!DOCTYPE html>
<html>
<body>
    <h1>Link dan Gambar</h1>
    
    <!-- Buat link ke https://www.google.com dengan teks "Google" -->
    
    
    <!-- Buat gambar dengan src "https://picsum.photos/200" dan alt "Random" -->
    
</body>
</html>`,
        validationCode: `a[href="https://www.google.com"]|img[src]`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'html',
        language: 'html'
    },
    {
        id: 'html-04-lists',
        title: 'Daftar (Lists)',
        description: 'Membuat ordered list dan unordered list',
        task: 'Buat daftar belanja dengan unordered list',
        content: `# Daftar (Lists)

## Unordered List (Bullet Points)

\`\`\`html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>
\`\`\`

## Ordered List (Nomor)

\`\`\`html
<ol>
    <li>Langkah 1</li>
    <li>Langkah 2</li>
    <li>Langkah 3</li>
</ol>
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<body>
    <h1>Daftar Belanja</h1>
    
    <!-- Buat unordered list dengan 3 item: Apel, Jeruk, Mangga -->
    
</body>
</html>`,
        validationCode: `ul|li:Apel|li:Jeruk|li:Mangga`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'html',
        language: 'html'
    },
    {
        id: 'html-05-tables',
        title: 'Tabel',
        description: 'Membuat tabel dengan header dan data',
        task: 'Buat tabel dengan 3 kolom: Nama, Umur, Kota',
        content: `# Tabel

## Struktur Tabel

\`\`\`html
<table>
    <tr>
        <th>Header 1</th>
        <th>Header 2</th>
    </tr>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
    </tr>
</table>
\`\`\`

- \`<table>\` - Container tabel
- \`<tr>\` - Table Row
- \`<th>\` - Table Header
- \`<td>\` - Table Data`,
        initialCode: `<!DOCTYPE html>
<html>
<body>
    <h1>Data Siswa</h1>
    
    <!-- Buat tabel dengan header: Nama, Umur, Kota -->
    <!-- Isi dengan 1 baris data -->
    
</body>
</html>`,
        validationCode: `table|th:Nama|th:Umur|th:Kota|td`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'html',
        language: 'html'
    }
];

// ============================================================
// SAMPLE LESSONS - CSS
// ============================================================

export const CSS_LESSONS: Lesson[] = [
    {
        id: 'css-01-intro',
        title: 'Pengenalan CSS',
        description: 'Apa itu CSS dan cara menggunakannya',
        task: 'Ubah warna heading menjadi biru',
        content: `# Apa itu CSS?

CSS (Cascading Style Sheets) digunakan untuk styling halaman web.

## 3 Cara Menggunakan CSS

### 1. Inline Style
\`\`\`html
<h1 style="color: blue;">Heading</h1>
\`\`\`

### 2. Internal CSS
\`\`\`html
<style>
    h1 { color: blue; }
</style>
\`\`\`

### 3. External CSS
\`\`\`html
<link rel="stylesheet" href="style.css">
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* Ubah warna h1 menjadi blue */
        h1 {
            
        }
    </style>
</head>
<body>
    <h1>Hello CSS!</h1>
</body>
</html>`,
        validationCode: `h1{color:blue}`,
        validationType: 'css',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'css',
        language: 'css'
    },
    {
        id: 'css-02-colors',
        title: 'Warna & Background',
        description: 'Mengatur warna teks dan background',
        task: 'Buat box dengan background merah dan teks putih',
        content: `# Warna & Background

## Warna Teks
\`\`\`css
p {
    color: red;
    color: #ff0000;
    color: rgb(255, 0, 0);
}
\`\`\`

## Background
\`\`\`css
div {
    background-color: blue;
    background-image: url('gambar.jpg');
}
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        .box {
            padding: 20px;
            /* Tambahkan background-color: red */
            
            /* Tambahkan color: white */
            
        }
    </style>
</head>
<body>
    <div class="box">
        Ini adalah box
    </div>
</body>
</html>`,
        validationCode: `.box{background-color:red;color:white}`,
        validationType: 'css',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'css',
        language: 'css'
    },
    {
        id: 'css-03-fonts',
        title: 'Font & Tipografi',
        description: 'Mengatur jenis font, ukuran, dan style',
        task: 'Ubah font heading menjadi Arial, ukuran 32px',
        content: `# Font & Tipografi

## Font Family
\`\`\`css
p {
    font-family: Arial, sans-serif;
}
\`\`\`

## Font Size
\`\`\`css
h1 {
    font-size: 24px;
    font-size: 2rem;
}
\`\`\`

## Font Weight & Style
\`\`\`css
p {
    font-weight: bold;
    font-style: italic;
    text-align: center;
}
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        h1 {
            /* Ubah font-family menjadi Arial */
            
            /* Ubah font-size menjadi 32px */
            
        }
    </style>
</head>
<body>
    <h1>Judul dengan Font Custom</h1>
</body>
</html>`,
        validationCode: `h1{font-family:Arial;font-size:32px}`,
        validationType: 'css',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'css',
        language: 'css'
    },
    {
        id: 'css-04-box-model',
        title: 'Box Model',
        description: 'Padding, margin, dan border',
        task: 'Buat box dengan padding 20px, margin 10px, dan border',
        content: `# Box Model

Setiap elemen HTML adalah "box" dengan:

\`\`\`
+------------------------+
|       Margin           |
|  +------------------+  |
|  |    Border        |  |
|  |  +------------+  |  |
|  |  |  Padding   |  |  |
|  |  |  +------+  |  |  |
|  |  |  |Content| |  |  |
|  |  |  +------+  |  |  |
|  |  +------------+  |  |
|  +------------------+  |
+------------------------+
\`\`\`

## Properti
\`\`\`css
.box {
    padding: 20px;
    margin: 10px;
    border: 2px solid black;
}
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        .box {
            background-color: lightblue;
            /* Tambahkan padding: 20px */
            
            /* Tambahkan margin: 10px */
            
            /* Tambahkan border: 2px solid black */
            
        }
    </style>
</head>
<body>
    <div class="box">Box Model</div>
</body>
</html>`,
        validationCode: `.box{padding:20px;margin:10px;border}`,
        validationType: 'css',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'css',
        language: 'css'
    },
    {
        id: 'css-05-flexbox',
        title: 'Flexbox Layout',
        description: 'Layout modern dengan Flexbox',
        task: 'Buat container flex dengan 3 item sejajar',
        content: `# Flexbox

Flexbox adalah cara modern untuk membuat layout.

## Container
\`\`\`css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
\`\`\`

## Properti Container
- \`flex-direction\`: row | column
- \`justify-content\`: center | space-between | space-around
- \`align-items\`: center | flex-start | flex-end
- \`gap\`: jarak antar item`,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        .container {
            /* Tambahkan display: flex */
            
            /* Tambahkan justify-content: center */
            
            /* Tambahkan gap: 20px */
            
        }
        .item {
            padding: 20px;
            background: coral;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
    </div>
</body>
</html>`,
        validationCode: `.container{display:flex;justify-content:center;gap:20px}`,
        validationType: 'css',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'css',
        language: 'css'
    }
];

// ============================================================
// SAMPLE LESSONS - JAVASCRIPT
// ============================================================

export const JS_LESSONS: Lesson[] = [
    {
        id: 'js-01-intro',
        title: 'Pengenalan JavaScript',
        description: 'Apa itu JavaScript dan output pertama',
        task: 'Cetak "Hello JavaScript!" ke console',
        content: `# Apa itu JavaScript?

JavaScript adalah bahasa pemrograman untuk membuat website interaktif.

## Output
\`\`\`javascript
console.log("Hello World!");
alert("Welcome!");
\`\`\`

## Variabel
\`\`\`javascript
let nama = "Budi";
const umur = 25;
\`\`\``,
        initialCode: `// Cetak "Hello JavaScript!" ke console
`,
        expectedOutput: 'Hello JavaScript!',
        validationType: 'output',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'javascript',
        language: 'javascript'
    },
    {
        id: 'js-02-variables',
        title: 'Variabel & Tipe Data',
        description: 'let, const, dan tipe data dasar',
        task: 'Buat variabel nama dan umur, lalu cetak keduanya',
        content: `# Variabel & Tipe Data

## Deklarasi Variabel
\`\`\`javascript
let x = 10;      // Bisa diubah
const y = 20;    // Tidak bisa diubah
\`\`\`

## Tipe Data
- String: "Hello"
- Number: 42
- Boolean: true/false
- Array: [1, 2, 3]
- Object: {nama: "Budi"}`,
        initialCode: `// Buat variabel nama (string) dan umur (number)
let nama = "";
let umur = 0;

// Cetak: "Nama: [nama], Umur: [umur]"
console.log();
`,
        expectedOutput: 'Nama:',
        validationType: 'output',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'javascript',
        language: 'javascript'
    },
    {
        id: 'js-03-functions',
        title: 'Fungsi',
        description: 'Membuat dan memanggil fungsi',
        task: 'Buat fungsi tambah(a, b) yang mengembalikan a + b',
        content: `# Fungsi

## Syntax Fungsi
\`\`\`javascript
function namaFungsi(param1, param2) {
    return hasil;
}
\`\`\`

## Arrow Function
\`\`\`javascript
const tambah = (a, b) => a + b;
\`\`\``,
        initialCode: `// Buat fungsi tambah yang menerima a dan b
function tambah(a, b) {
    // return hasil penjumlahan
}

// Cetak hasil tambah(5, 3)
console.log(tambah(5, 3));
`,
        expectedOutput: '8',
        validationType: 'output',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'javascript',
        language: 'javascript'
    }
];

// ============================================================
// SAMPLE LESSONS - REACT
// ============================================================

export const REACT_LESSONS: Lesson[] = [
    {
        id: 'react-01-intro',
        title: 'Pengenalan React',
        description: 'Apa itu React dan cara membuat komponen pertama',
        task: 'Buat komponen React yang menampilkan "Hello React!"',
        content: `# Apa itu React?

React adalah library JavaScript untuk membangun user interface.

## Komponen Dasar

\`\`\`jsx
function Welcome() {
    return <h1>Hello React!</h1>;
}
\`\`\`

## Mengapa React?
- Deklaratif - Mudah dibaca
- Komponen - Reusable
- Virtual DOM - Cepat

## JSX
JSX adalah syntax yang mirip HTML dalam JavaScript:

\`\`\`jsx
const element = <h1>Hello World</h1>;
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        // Buat komponen Welcome yang return <h1>Hello React!</h1>
        function Welcome() {
            return (
                // Tulis JSX di sini
                
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Welcome />);
    </script>
</body>
</html>`,
        validationCode: `h1:Hello React!`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'react',
        language: 'react'
    },
    {
        id: 'react-02-props',
        title: 'Props: Mengirim Data',
        description: 'Menggunakan props untuk mengirim data ke komponen',
        task: 'Buat komponen Greeting dengan props name',
        content: `# Props

Props adalah cara mengirim data ke komponen.

## Menggunakan Props

\`\`\`jsx
function Greeting(props) {
    return <h1>Halo, {props.name}!</h1>;
}

// Penggunaan
<Greeting name="Budi" />
\`\`\`

## Destructuring Props

\`\`\`jsx
function Greeting({ name }) {
    return <h1>Halo, {name}!</h1>;
}
\`\`\`

Props bersifat **read-only** - tidak boleh diubah di dalam komponen.`,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        // Buat komponen Greeting yang menerima props "name"
        // dan menampilkan "Halo, [name]!"
        function Greeting(props) {
            return (
                // Gunakan props.name di sini
                
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Greeting name="Budi" />);
    </script>
</body>
</html>`,
        validationCode: `h1:Halo`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'react',
        language: 'react'
    },
    {
        id: 'react-03-state',
        title: 'State: Data Dinamis',
        description: 'Menggunakan useState untuk data yang berubah',
        task: 'Buat counter dengan tombol + dan -',
        content: `# State dengan useState

State adalah data yang bisa berubah dalam komponen.

## useState Hook

\`\`\`jsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                +1
            </button>
        </div>
    );
}
\`\`\`

## Aturan Hooks
- Panggil di level atas komponen
- Hanya di dalam komponen React`,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        button { padding: 10px 20px; margin: 5px; font-size: 18px; }
        .count { font-size: 48px; text-align: center; }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState } = React;
        
        function Counter() {
            // Buat state count dengan nilai awal 0
            const [count, setCount] = useState(0);
            
            return (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="count">{count}</div>
                    {/* Buat tombol - untuk mengurangi count */}
                    <button onClick={() => setCount(count - 1)}>-</button>
                    {/* Buat tombol + untuk menambah count */}
                    <button onClick={() => setCount(count + 1)}>+</button>
                </div>
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Counter />);
    </script>
</body>
</html>`,
        validationCode: `button|div`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'react',
        language: 'react'
    },
    {
        id: 'react-04-list',
        title: 'Rendering List',
        description: 'Menampilkan array sebagai list komponen',
        task: 'Render array nama sebagai list item',
        content: `# Rendering Lists

Gunakan \`map()\` untuk render array sebagai elemen.

## Contoh

\`\`\`jsx
function TodoList() {
    const items = ['Belajar React', 'Buat project', 'Deploy'];
    
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
}
\`\`\`

## Key Prop
Setiap item dalam list harus memiliki \`key\` yang unik:

\`\`\`jsx
{users.map(user => (
    <User key={user.id} name={user.name} />
))}
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        function FriendList() {
            const friends = ['Andi', 'Budi', 'Citra', 'Dewi'];
            
            return (
                <div>
                    <h2>Daftar Teman</h2>
                    <ul>
                        {/* Gunakan map() untuk render setiap nama sebagai <li> */}
                        {friends.map((name, index) => (
                            // Lengkapi di sini
                            <li key={index}>{name}</li>
                        ))}
                    </ul>
                </div>
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<FriendList />);
    </script>
</body>
</html>`,
        validationCode: `ul|li:Andi|li:Budi|li:Citra`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'react',
        language: 'react'
    },
    {
        id: 'react-05-card',
        title: 'Komponen Card UI',
        description: 'Membuat komponen Card yang reusable dengan styling',
        task: 'Buat komponen Card dengan title, description, dan image',
        content: `# Komponen Card

Komponen Card adalah pola umum untuk menampilkan konten.

## Struktur Card

\`\`\`jsx
function Card({ title, description, image }) {
    return (
        <div className="card">
            <img src={image} alt={title} />
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}
\`\`\`

## Styling dengan Inline Styles

\`\`\`jsx
const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

<div style={cardStyle}>...</div>
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        // Buat komponen Card dengan props: title, description, image
        function Card({ title, description, image }) {
            const cardStyle = {
                border: '1px solid #ddd',
                borderRadius: '12px',
                overflow: 'hidden',
                maxWidth: '300px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            };
            
            const imgStyle = {
                width: '100%',
                height: '150px',
                objectFit: 'cover'
            };
            
            const contentStyle = {
                padding: '16px'
            };
            
            return (
                <div style={cardStyle}>
                    {/* Tambahkan img dengan src={image} dan style={imgStyle} */}
                    <img src={image} alt={title} style={imgStyle} />
                    <div style={contentStyle}>
                        {/* Tambahkan h3 untuk title */}
                        <h3>{title}</h3>
                        {/* Tambahkan p untuk description */}
                        <p>{description}</p>
                    </div>
                </div>
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
            <Card 
                title="React Card" 
                description="Ini adalah contoh Card component"
                image="https://picsum.photos/300/150"
            />
        );
    </script>
</body>
</html>`,
        validationCode: `div|img[src]|h3:React Card|p`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'react',
        language: 'react'
    }
];

// ============================================================
// SAMPLE LESSONS - TAILWIND CSS
// ============================================================

export const TAILWIND_LESSONS: Lesson[] = [
    {
        id: 'tw-01-intro',
        title: 'Pengenalan Tailwind CSS',
        description: 'Apa itu Tailwind dan konsep utility-first',
        task: 'Buat teks dengan warna biru dan ukuran besar menggunakan Tailwind',
        content: `# Apa itu Tailwind CSS?

Tailwind adalah CSS framework yang menggunakan pendekatan **utility-first**.

## Utility Classes
- \`text-{color}-{shade}\` - Warna teks
- \`bg-{color}-{shade}\` - Background
- \`text-{size}\` - Ukuran font (sm, base, lg, xl, 2xl...)
- \`font-{weight}\` - Bold, semibold, normal...`,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8">
    <!-- Tambahkan class: text-blue-600 text-2xl font-bold -->
    <p>Hello Tailwind!</p>
</body>
</html>`,
        validationCode: `p[class]`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'tailwind',
        language: 'tailwind'
    },
    {
        id: 'tw-02-colors',
        title: 'Warna & Background',
        description: 'Menggunakan color palette Tailwind',
        task: 'Buat card dengan background gradient dan teks putih',
        content: `# Warna di Tailwind

## Gradient
\`\`\`html
<div class="bg-gradient-to-r from-blue-500 to-purple-500">
    Gradient!
</div>
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8">
    <!-- Tambahkan: bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg -->
    <div>Gradient Card</div>
</body>
</html>`,
        validationCode: `div[class]`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'tailwind',
        language: 'tailwind'
    },
    {
        id: 'tw-03-flexbox',
        title: 'Flexbox Layout',
        description: 'Layout dengan flex utilities',
        task: 'Buat navbar dengan flex layout',
        content: `# Flexbox di Tailwind

## Container Flex
\`\`\`html
<div class="flex justify-between items-center">
    <div>Left</div>
    <div>Right</div>
</div>
\`\`\``,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Tambahkan: flex justify-between items-center bg-gray-800 text-white px-6 py-4 -->
    <nav>
        <div class="text-xl font-bold">Logo</div>
        <div class="flex gap-4">
            <a href="#">Home</a>
            <a href="#">About</a>
        </div>
    </nav>
</body>
</html>`,
        validationCode: `nav[class]`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'tailwind',
        language: 'tailwind'
    },
    {
        id: 'tw-04-responsive',
        title: 'Responsive Design',
        description: 'Breakpoints dan responsive utilities',
        task: 'Buat grid responsif',
        content: `# Responsive di Tailwind

## Breakpoints
- \`sm:\` - 640px+
- \`md:\` - 768px+
- \`lg:\` - 1024px+`,
        initialCode: `<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8">
    <!-- Tambahkan: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 -->
    <div>
        <div class="bg-blue-500 text-white p-4 rounded">Card 1</div>
        <div class="bg-green-500 text-white p-4 rounded">Card 2</div>
        <div class="bg-purple-500 text-white p-4 rounded">Card 3</div>
    </div>
</body>
</html>`,
        validationCode: `div[class]`,
        validationType: 'html',
        isPublic: true,
        createdAt: new Date().toISOString(),
        courseId: 'tailwind',
        language: 'tailwind'
    }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getCourseById(id: string): Course | undefined {
    return COURSES.find(c => c.id === id);
}

export function getLessonsByCourse(courseId: string): Lesson[] {
    switch (courseId) {
        case 'html':
            return HTML_LESSONS;
        case 'css':
            return CSS_LESSONS;
        case 'javascript':
            return JS_LESSONS;
        case 'react':
            return REACT_LESSONS;
        case 'tailwind':
            return TAILWIND_LESSONS;
        default:
            return [];
    }
}

export function getLanguageConfig(language: CourseLanguage) {
    const configs: Record<CourseLanguage, { judge0Id?: number; usePreview: boolean }> = {
        'python': { judge0Id: 71, usePreview: false },
        'javascript': { judge0Id: 63, usePreview: false },
        'html': { usePreview: true },
        'css': { usePreview: true },
        'html-css': { usePreview: true },
        'react': { usePreview: true },
        'tailwind': { usePreview: true }
    };
    return configs[language];
}
