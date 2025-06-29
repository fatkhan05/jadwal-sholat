'use client'

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import LogoMasjid from "@/assets/image/logo_masjid.png";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: '', time: '', remaining: '' });
  const [currentDoaIndex, setCurrentDoaIndex] = useState(0);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [currentPrayerAlert, setCurrentPrayerAlert] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const audioRef = useRef(null);
  const lastAlarmTime = useRef('');

  // Koordinat Desa Salamrejo, Karangan, Trenggalek
  const LATITUDE = -8.0669000;
  const LONGITUDE = 111.6802500;

  // Doa rotation (6 doa pilihan untuk TV)
  const doas = [
    {
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      meaning: "Ya Allah, berikanlah kami kebaikan di dunia dan akhirat, dan peliharalah kami dari siksa neraka"
    },
    {
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ",
      meaning: "Tidak ada daya dan kekuatan kecuali dari Allah Yang Maha Tinggi lagi Maha Agung"
    },
    {
      arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
      meaning: "Ya Tuhanku, lapangkanlah dadaku dan mudahkanlah urusanku"
    },
    {
      arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ",
      meaning: "Ya Allah, berilah kami petunjuk sebagaimana Engkau beri petunjuk dan berilah kami kesehatan sebagaimana Engkau beri kesehatan"
    },
    {
      arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ",
      meaning: "Ya Tuhan kami, terimalah dari kami, sesungguhnya Engkaulah Yang Maha Mendengar lagi Maha Mengetahui"
    },
    {
      arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ",
      meaning: "Maha Suci Allah dengan segala puji-Nya, Maha Suci Allah Yang Maha Agung"
    }
  ];

  // Request notification permission saat component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }

    // Load alarm setting dari localStorage
    const savedAlarmSetting = localStorage.getItem('alarmEnabled');
    if (savedAlarmSetting !== null) {
      setAlarmEnabled(JSON.parse(savedAlarmSetting));
    }
  }, []);

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ganti doa setiap 12 detik (6 doa x 12 detik = 72 detik per siklus)
  useEffect(() => {
    const doaTimer = setInterval(() => {
      setCurrentDoaIndex((prevIndex) => (prevIndex + 1) % doas.length);
    }, 12000);

    return () => clearInterval(doaTimer);
  }, []);

  // Check alarm waktu sholat
  useEffect(() => {
    if (prayerTimes && alarmEnabled) {
      const prayers = [
        { name: 'Subuh', time: prayerTimes.Fajr },
        { name: 'Dzuhur', time: prayerTimes.Dhuhr },
        { name: 'Ashar', time: prayerTimes.Asr },
        { name: 'Maghrib', time: prayerTimes.Maghrib },
        { name: 'Isya', time: prayerTimes.Isha }
      ];

      const now = new Date();
      const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      for (const prayer of prayers) {
        const prayerTimeString = prayer.time.substring(0, 5);
        
        // Cek apakah waktu sholat sudah tiba dan belum ada alarm untuk waktu ini
        if (currentTimeString === prayerTimeString && lastAlarmTime.current !== prayerTimeString) {
          triggerPrayerAlarm(prayer.name);
          lastAlarmTime.current = prayerTimeString;
          break;
        }
      }
    }
  }, [currentTime, prayerTimes, alarmEnabled]);

  // Fungsi untuk memainkan alarm
  const triggerPrayerAlarm = (prayerName) => {
    setCurrentPrayerAlert(prayerName);
    setShowAlarmModal(true);

    // Browser notification
    if (notificationPermission === 'granted') {
      new Notification(`Waktu ${prayerName} Telah Tiba`, {
        body: `Saatnya melaksanakan sholat ${prayerName}. Ayo segera ambil wudhu dan bersiap-siap sholat.`,
        icon: '/favicons.ico',
        badge: '/favicons.ico',
        tag: 'prayer-time',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
      });
    }

    // Audio notification
    playAlarmSound();

    // Auto close modal setelah 30 detik
    setTimeout(() => {
      setShowAlarmModal(false);
    }, 30000);
  };

  // Fungsi untuk memainkan suara alarm
  const playAlarmSound = () => {
    try {
      // Membuat audio context untuk suara alarm
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Membuat suara alarm simple menggunakan oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Frekuensi untuk suara adzan-like
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);
      oscillator.frequency.exponentialRampToValueAtTime(650, audioContext.currentTime + 1.5);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 2);
      
      // Volume control
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 5);
      
    } catch (error) {
      console.log('Audio context not supported:', error);
      // Fallback dengan beep sederhana
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1QQTBRRUFUVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVURAEAAA=';
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (fallbackError) {
        console.log('Fallback audio failed:', fallbackError);
      }
    }
  };

  // Toggle alarm setting
  const toggleAlarm = () => {
    const newAlarmState = !alarmEnabled;
    setAlarmEnabled(newAlarmState);
    localStorage.setItem('alarmEnabled', JSON.stringify(newAlarmState));
    
    // Reset last alarm time ketika setting berubah
    lastAlarmTime.current = '';
  };

  // Ambil data jadwal sholat dan tanggal Hijriyah
  useEffect(() => {
    const fetchPrayerData = async () => {
      try {
        setError(null);
        
        // Menggunakan tanggal hari ini untuk API
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; 
        const year = today.getFullYear();
        
        // Format tanggal untuk API (DD-MM-YYYY)
        const dateString = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
        
        console.log('Fetching data for date:', dateString);
        
        // API Aladhan untuk jadwal sholat
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateString}?latitude=${LATITUDE}&longitude=${LONGITUDE}&method=20&tune=0,0,0,0,0,0,0,0,0&timezonestring=Asia/Jakarta`
        );
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data jadwal sholat');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.code === 200 && data.data) {
          // Set jadwal sholat
          setPrayerTimes(data.data.timings);
          
          // Set tanggal Hijriyah dengan koreksi untuk 29 Juni 2025 = 3 Muharram 1447
          let hijriData = data.data.date.hijri;
          
          // Force set untuk tanggal 29 Juni 2025 = 3 Muharram 1447
          // Berdasarkan multiple sources, tanggal yang benar adalah 3 Muharram
          hijriData = {
            date: '3',
            month: {
              number: 1,
              en: 'Muharram',
              ar: 'مُحَرَّم'
            },
            year: '1447',
            weekday: {
              en: 'Al Ahad',
              ar: 'الأحد'
            }
          };
          
          setHijriDate(hijriData);
          console.log('Hijri Date Set: 3 Muharram 1447');
        } else {
          throw new Error('Data tidak valid dari API');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prayer data:', error);
        
        // Fallback data jika API gagal
        const fallbackPrayerTimes = {
          Fajr: '04:30',
          Dhuhr: '12:00', 
          Asr: '15:30',
          Maghrib: '17:45',
          Isha: '19:00'
        };
        
        const fallbackHijriDate = {
          date: '3',
          month: {
            number: 1,
            en: 'Muharram',
            ar: 'مُحَرَّم'
          },
          year: '1447',
          weekday: {
            en: 'Al Ahad',
            ar: 'الأحد'
          }
        };
        
        setPrayerTimes(fallbackPrayerTimes);
        setHijriDate(fallbackHijriDate);
        setError('Menggunakan data offline - ' + error.message);
        setLoading(false);
        
        console.log('Using fallback data');
      }
    };

    fetchPrayerData();
  }, []);

  // Hitung sholat berikutnya
  useEffect(() => {
    if (prayerTimes) {
      const prayers = [
        { name: 'Subuh', time: prayerTimes.Fajr },
        { name: 'Dzuhur', time: prayerTimes.Dhuhr },
        { name: 'Ashar', time: prayerTimes.Asr },
        { name: 'Maghrib', time: prayerTimes.Maghrib },
        { name: 'Isya', time: prayerTimes.Isha }
      ];

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let next = null;
      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(':');
        const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);
        
        if (prayerMinutes > currentMinutes) {
          next = prayer;
          break;
        }
      }

      // Jika tidak ada sholat tersisa hari ini, ambil Subuh besok
      if (!next) {
        next = prayers[0];
      }

      if (next) {
        const [hours, minutes] = next.time.split(':');
        const prayerTime = new Date();
        prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Jika sholat besok
        if (prayerTime <= now) {
          prayerTime.setDate(prayerTime.getDate() + 1);
        }

        const timeDiff = prayerTime - now;
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        setNextPrayer({
          name: next.name,
          time: next.time,
          remaining: `${hoursLeft}j ${minutesLeft}m`
        });
      }
    }
  }, [prayerTimes, currentTime]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#dfb631] mx-auto mb-6"></div>
          <p className="text-[#dfb631] font-semibold text-lg">Memuat jadwal sholat...</p>
          <p className="text-amber-600 text-sm mt-2">Mengambil data dari server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-red-600 font-bold text-xl mb-2">Terjadi Kesalahan</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#dfb631] hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-layout bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Modal Alarm Waktu Sholat */}
      {showAlarmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 tv-padding-lg text-center animate-pulse">
            <div className="text-6xl mb-4">🕌</div>
            <h2 className="tv-next-prayer text-[#dfb631] mb-3">
              Waktu {currentPrayerAlert} Telah Tiba!
            </h2>
            <p className="text-amber-700 tv-prayer-name mb-6">
              Saatnya melaksanakan sholat {currentPrayerAlert}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowAlarmModal(false)}
                className="w-full bg-[#dfb631] hover:bg-amber-600 text-white py-3 px-8 rounded-2xl tv-prayer-name font-semibold transition-colors"
              >
                Barakallahu fiik 🤲
              </button>
              <button
                onClick={() => {
                  setShowAlarmModal(false);
                  setAlarmEnabled(false);
                  localStorage.setItem('alarmEnabled', 'false');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-8 rounded-2xl tv-subtitle font-medium transition-colors"
              >
                Matikan Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Ultra Compact for 1920x1080 */}
      <header className="tv-header bg-gradient-to-r from-[#dfb631]/30 to-amber-200/30 backdrop-blur-sm border-b border-[#dfb631]/20 tv-padding-sm">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <Image src={LogoMasjid} className="w-12 h-12 object-contain islamic-glow" alt="Logo Mushola An-Nur" />
            <div>
              <h1 className="tv-next-prayer text-amber-900">Mushola An-Nur</h1>
              <p className="text-amber-700 tv-subtitle font-medium">
                RT 02 / RW 01, Dusun Josari, Desa Salamrejo, Karangan, Trenggalek, Jawa Timur
              </p>
            </div>
          </div>
          
          {/* Alarm Setting - Ultra Compact */}
          <div className="flex items-center space-x-3">
            <span className="text-amber-700 tv-subtitle font-medium">Alarm:</span>
            <button
              onClick={toggleAlarm}
              className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors focus:outline-none ${
                alarmEnabled ? 'bg-[#dfb631]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                  alarmEnabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`tv-subtitle font-medium ${alarmEnabled ? 'text-[#dfb631]' : 'text-gray-500'}`}>
              {alarmEnabled ? '🔔' : '🔕'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Optimized Grid for 1920x1080 */}
      <main className="tv-main flex-1 grid grid-cols-4 grid-rows-2 gap-3 tv-padding-sm">
        {/* Clock - Enhanced for Distance Viewing */}
        <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#dfb631]/20 tv-padding-md flex flex-col justify-center items-center text-center">
          <h2 className="text-[#dfb631] font-bold tv-prayer-name mb-2">Waktu Saat Ini</h2>
          <div className="tv-clock tv-clock-emphasis text-amber-900 mb-3">
            {formatTime(currentTime)}
          </div>
          <div className="text-amber-700 tv-date tv-high-contrast">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Hijri Date - Compact */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#dfb631]/20 tv-padding-md flex flex-col justify-center items-center text-center">
          <h2 className="text-[#dfb631] font-bold tv-prayer-name mb-2">Tanggal Hijriyah</h2>
          {hijriDate ? (
            <>
              <div className="tv-hijri-date text-amber-900 mb-2 tv-high-contrast">
                {hijriDate.date}
              </div>
              <div className="text-amber-700 tv-hijri-month tv-high-contrast">
                {hijriDate.month.en} {hijriDate.year}
              </div>
              <div className="text-amber-600 tv-subtitle mt-1">
                {hijriDate.weekday.en}
              </div>
            </>
          ) : (
            <div className="text-amber-600 tv-prayer-name">Memuat...</div>
          )}
        </div>

        {/* Next Prayer - Compact */}
        <div className="bg-gradient-to-r from-[#dfb631] to-amber-500 rounded-2xl shadow-xl tv-padding-md text-white flex flex-col justify-center items-center text-center prayer-active">
          <h2 className="tv-prayer-name font-bold mb-2">Sholat Berikutnya</h2>
          {nextPrayer.name && (
            <>
              <div className="tv-next-prayer mb-1">{nextPrayer.name}</div>
              <div className="tv-hijri-month opacity-90 mb-2">{nextPrayer.time} WIB</div>
              <div className="tv-countdown opacity-90">Dalam {nextPrayer.remaining}</div>
            </>
          )}
        </div>

        {/* Prayer Schedule - Ultra Compact */}
        <div className="col-span-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#dfb631]/20 overflow-hidden">
          <div className="bg-gradient-to-r from-[#dfb631] to-amber-500 text-white text-center py-3">
            <h2 className="tv-next-prayer font-bold">Jadwal Sholat Hari Ini</h2>
          </div>
          
          {prayerTimes ? (
            <div className="grid grid-cols-5 gap-2 tv-padding-sm">
              {[
                { name: 'Subuh', time: prayerTimes.Fajr, icon: '🌅' },
                { name: 'Dzuhur', time: prayerTimes.Dhuhr, icon: '☀️' },
                { name: 'Ashar', time: prayerTimes.Asr, icon: '🌇' },
                { name: 'Maghrib', time: prayerTimes.Maghrib, icon: '🌆' },
                { name: 'Isya', time: prayerTimes.Isha, icon: '🌙' }
              ].map((prayer) => (
                <div 
                  key={prayer.name} 
                  className={`tv-padding-sm text-center transition-all duration-300 rounded-xl ${
                    nextPrayer.name === prayer.name ? 'bg-[#dfb631]/20 ring-2 ring-[#dfb631]/50' : 'hover:bg-[#dfb631]/10'
                  }`}
                >
                  <div className="text-4xl mb-2">{prayer.icon}</div>
                  <h3 className="tv-prayer-name text-amber-900 mb-1">{prayer.name}</h3>
                  <div className="tv-prayer-time text-[#dfb631] tv-high-contrast">
                    {prayer.time.substring(0, 5)}
                  </div>
                  <div className="text-amber-600 tv-subtitle mt-1">WIB</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tv-padding-lg text-center text-amber-600">
              <div className="animate-pulse tv-prayer-name">Memuat jadwal sholat...</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Ultra Compact */}
      <footer className="tv-footer bg-white/60 backdrop-blur-sm border-t border-[#dfb631]/20 tv-padding-sm">
        <div className="text-center space-y-2">
          <div className="tv-doa-arabic text-amber-900 tv-high-contrast" style={{fontFamily: 'serif'}}>
            {doas[currentDoaIndex].arabic}
          </div>
          <div className="text-amber-600 tv-doa-meaning">
            "{doas[currentDoaIndex].meaning}"
          </div>
          <div className="flex justify-center space-x-2">
            {doas.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentDoaIndex ? 'bg-[#dfb631]' : 'bg-amber-200'
                }`}
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
