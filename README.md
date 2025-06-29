# 🕌 Jadwal Sholat Mushola An-Nur

Aplikasi web modern untuk menampilkan jadwal sholat lima waktu, tanggal Hijriyah, dan informasi keagamaan untuk Mushola An-Nur, Desa Salamrejo, Karangan, Trenggalek.

![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?style=for-the-badge&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## ✨ Fitur Utama

- **🕐 Real-time Clock** - Jam digital yang update setiap detik
- **🕌 Jadwal Sholat 5 Waktu** - Data akurat dari API Aladhan
- **📅 Tanggal Hijriyah** - Kalender Islam otomatis
- **⏰ Countdown Sholat Berikutnya** - Reminder waktu sholat yang akan datang
- **🤲 Doa-doa Pilihan** - Doa harian yang berganti otomatis
- **🎨 Design Islamic** - Tema warna emas dan layout elegan
- **📱 Responsive Design** - Optimal di semua perangkat
- **⚡ Performance Optimized** - Loading cepat dan smooth

## 🗺️ Lokasi

**Mushola An-Nur**
- 📍 RT 02/RW 01, Dusun Josari
- 🏘️ Desa Salamrejo, Kecamatan Karangan
- 🏙️ Kabupaten Trenggalek, Jawa Timur
- 🌐 Koordinat: -8.0669000°S, 111.6802500°E

## 🚀 Memulai Development

### Prerequisites

- Node.js 18+ dan npm
- Browser modern (Chrome, Firefox, Safari, Edge)

### Instalasi

```bash
# Clone repository
git clone [repository-url]
cd jadwal-sholat-mushola-annur

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

### Build untuk Production

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

## 🏗️ Teknologi Stack

- **Framework**: [Next.js 14](https://nextjs.org/) dengan App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Font**: Geist Sans & Geist Mono
- **API**: [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)
- **Language**: JavaScript/JSX
- **Package Manager**: npm

## 📂 Struktur Proyek

```
jadwal-sholat-mushola-annur/
├── app/
│   ├── fonts/           # Custom fonts
│   ├── favicons.ico     # Favicon
│   ├── globals.css      # Global styling + Tailwind
│   ├── layout.jsx       # Root layout
│   └── page.jsx         # Homepage dengan semua fitur
├── assets/
│   ├── image/           # Logo dan background images
│   └── icon/            # Icons
├── .cursor/
│   └── rules/           # Cursor AI rules untuk development
├── package.json         # Dependencies dan scripts
├── tailwind.config.js   # Konfigurasi Tailwind
├── next.config.mjs      # Konfigurasi Next.js
└── README.md           # Dokumentasi ini
```

## 🎨 Design System

### Color Palette
- **Primary**: `#dfb631` (Emas Islamic)
- **Secondary**: Amber variations
- **Background**: Gradient warm tones
- **Text**: Amber-900, Amber-700, Amber-600

### Typography
- **Headers**: Geist Sans Bold
- **Body**: Geist Sans Regular
- **Arabic Text**: Serif fonts
- **Time Display**: Geist Mono (monospace)

## 🔌 API Integration

### Aladhan Prayer Times API
- **Endpoint**: `https://api.aladhan.com/v1/calendar/`
- **Method**: Calculation method 20 (custom)
- **Location**: Menggunakan koordinat GPS Desa Salamrejo
- **Data**: Jadwal sholat, tanggal Hijriyah, dan informasi tambahan

### Error Handling
- Network failure detection
- API response validation
- User-friendly error messages
- Retry functionality

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🤲 Fitur Islamic

### Jadwal Sholat
- Subuh, Dzuhur, Ashar, Maghrib, Isya
- Waktu dalam format WIB
- Highlighting untuk sholat berikutnya

### Doa-doa Pilihan
1. Doa kebaikan dunia akhirat
2. Doa lapang dada dan mudah urusan
3. La hawla wa la quwwata illa billah
4. Doa berkah rezeki

### Kalender Hijriyah
- Hari, tanggal, bulan, tahun Hijriyah
- Sinkronisasi dengan API Aladhan

## 🔧 Development Guidelines

### Code Style
- Gunakan bahasa Indonesia untuk komentar
- Follow Next.js App Router conventions
- Consistent Tailwind CSS usage
- PropTypes untuk component validation (future)

### Performance Best Practices
- Image optimization dengan Next.js Image component
- Lazy loading untuk content
- API caching dan error handling
- Minimal bundle size

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Manual Deployment
```bash
npm run build
# Upload folder .next/ dan static files ke hosting
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

**Mushola An-Nur**
- Lokasi: RT 02/RW 01, Dusun Josari, Desa Salamrejo
- Kecamatan: Karangan, Kabupaten Trenggalek
- Provinsi: Jawa Timur, Indonesia

---

<div align="center">

**"Dan dirikanlah sholat, tunaikanlah zakat, dan ruku'lah beserta orang-orang yang ruku'"**
<br>
*QS. Al-Baqarah: 43*

</div>
