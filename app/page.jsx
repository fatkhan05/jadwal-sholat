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

  // Doa-doa pendek
  const doas = [
    {
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      latin: "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa 'azaaban-naar",
      meaning: "Ya Allah, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka"
    },
    {
      arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
      latin: "Rabbish-rahli shadri wa yassirli amri",
      meaning: "Ya Allah, lapangkanlah dadaku dan mudahkanlah urusanku"
    },
    {
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      latin: "Laa hawla wa laa quwwata illa billah",
      meaning: "Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah"
    },
    {
      arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا",
      latin: "Allahumma baarik lanaa fiimaa razaqtanaa",
      meaning: "Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan kepada kami"
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

  // Ganti doa setiap 10 detik
  useEffect(() => {
    const doaTimer = setInterval(() => {
      setCurrentDoaIndex((prevIndex) => (prevIndex + 1) % doas.length);
    }, 10000);

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
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1QQTBRRUFUVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVURAEAAA=';
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
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        // API Aladhan untuk jadwal sholat dan tanggal Hijriyah
        const response = await fetch(
          `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${LATITUDE}&longitude=${LONGITUDE}&method=20&tune=0,0,0,0,0,0,0,0,0`
        );
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data jadwal sholat');
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data[day - 1]) {
          // Ambil data hari ini
          const todayData = data.data[day - 1];
          setPrayerTimes(todayData.timings);
          setHijriDate(todayData.date.hijri);
        } else {
          throw new Error('Data jadwal sholat tidak valid');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prayer data:', error);
        setError(error.message);
        setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Modal Alarm Waktu Sholat */}
      {showAlarmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-pulse">
            <div className="text-6xl mb-4">🕌</div>
            <h2 className="text-2xl font-bold text-[#dfb631] mb-2">
              Waktu {currentPrayerAlert} Telah Tiba!
            </h2>
            <p className="text-amber-700 mb-6">
              Saatnya melaksanakan sholat {currentPrayerAlert}.<br/>
              Ayo segera ambil wudhu dan bersiap-siap sholat.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowAlarmModal(false)}
                className="w-full bg-[#dfb631] hover:bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Barakallahu fiik 🤲
              </button>
              <button
                onClick={() => {
                  setShowAlarmModal(false);
                  setAlarmEnabled(false);
                  localStorage.setItem('alarmEnabled', 'false');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium transition-colors"
              >
                Matikan Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-gradient-to-r from-[#dfb631]/30 to-amber-200/30 backdrop-blur-sm border-b border-[#dfb631]/20 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-6">
          <Image src={LogoMasjid} className="w-20 h-20 object-contain islamic-glow" alt="Logo Mushola An-Nur" />
          <div className="text-center">
            <h1 className="font-bold text-4xl md:text-5xl text-amber-900 mb-1">Mushola An-Nur</h1>
            <p className="text-amber-700 text-sm md:text-base font-medium">
              RT 02/RW 01, Dusun Josari, Desa Salamrejo, Kec. Karangan, Kab. Trenggalek
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Alarm Setting */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#dfb631]/20 p-4">
            <div className="flex items-center space-x-3">
              <span className="text-amber-700 font-medium">Alarm Pengingat Sholat:</span>
              <button
                onClick={toggleAlarm}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                  alarmEnabled ? 'bg-[#dfb631]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    alarmEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${alarmEnabled ? 'text-[#dfb631]' : 'text-gray-500'}`}>
                {alarmEnabled ? '🔔 Aktif' : '🔕 Nonaktif'}
              </span>
            </div>
            {alarmEnabled && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                Alarm akan berbunyi tepat saat waktu sholat tiba
              </p>
            )}
          </div>
        </div>

        {/* Waktu Saat Ini & Tanggal Hijriyah */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Jam Digital */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#dfb631]/20 p-6 md:p-8 text-center">
            <h2 className="text-[#dfb631] font-bold text-xl mb-4">Waktu Saat Ini</h2>
            <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-amber-900 mb-2 font-mono">
              {formatTime(currentTime)}
            </div>
            <div className="text-amber-700 font-semibold text-base md:text-lg">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Tanggal Hijriyah */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#dfb631]/20 p-6 md:p-8 text-center">
            <h2 className="text-[#dfb631] font-bold text-xl mb-4">Tanggal Hijriyah</h2>
            {hijriDate ? (
              <>
                <div className="text-4xl md:text-5xl font-bold text-amber-900 mb-2">
                  {hijriDate.day}
                </div>
                <div className="text-amber-700 font-semibold text-base md:text-lg">
                  {hijriDate.month.en} {hijriDate.year}
                </div>
                <div className="text-amber-600 text-sm mt-1">
                  {hijriDate.weekday.en}
                </div>
              </>
            ) : (
              <div className="text-amber-600">Memuat...</div>
            )}
          </div>
        </div>

        {/* Sholat Berikutnya */}
        {nextPrayer.name && (
          <div className="bg-gradient-to-r from-[#dfb631] to-amber-500 rounded-2xl shadow-xl p-6 mb-8 text-white text-center prayer-active">
            <h2 className="text-xl font-bold mb-2">Sholat Berikutnya</h2>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{nextPrayer.name}</div>
                <div className="text-lg opacity-90">{nextPrayer.time} WIB</div>
              </div>
              <div className="text-2xl hidden md:block">•</div>
              <div>
                <div className="text-lg opacity-90">Dalam</div>
                <div className="text-xl md:text-2xl font-bold">{nextPrayer.remaining}</div>
              </div>
            </div>
          </div>
        )}

        {/* Jadwal Sholat */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#dfb631]/20 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#dfb631] to-amber-500 text-white text-center py-6">
            <h2 className="text-2xl font-bold">Jadwal Sholat Hari Ini</h2>
            <p className="opacity-90 mt-1">Lima Waktu Sholat</p>
          </div>
          
          {prayerTimes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1">
              {[
                { name: 'Subuh', time: prayerTimes.Fajr, icon: '🌅' },
                { name: 'Dzuhur', time: prayerTimes.Dhuhr, icon: '☀️' },
                { name: 'Ashar', time: prayerTimes.Asr, icon: '🌇' },
                { name: 'Maghrib', time: prayerTimes.Maghrib, icon: '🌆' },
                { name: 'Isya', time: prayerTimes.Isha, icon: '🌙' }
              ].map((prayer, index) => (
                <div 
                  key={prayer.name} 
                  className={`p-4 md:p-6 text-center transition-all duration-300 hover:bg-[#dfb631]/10 ${
                    nextPrayer.name === prayer.name ? 'bg-[#dfb631]/20 ring-2 ring-[#dfb631]/50' : ''
                  }`}
                >
                  <div className="text-2xl md:text-3xl mb-3">{prayer.icon}</div>
                  <h3 className="font-bold text-lg md:text-xl text-amber-900 mb-2">{prayer.name}</h3>
                  <div className="text-xl md:text-2xl font-bold text-[#dfb631] font-mono">
                    {prayer.time.substring(0, 5)}
                  </div>
                  <div className="text-amber-600 text-sm mt-1">WIB</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-amber-600">
              <div className="animate-pulse">Memuat jadwal sholat...</div>
            </div>
          )}
        </div>

        {/* Doa Harian */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#dfb631]/20 p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-[#dfb631] font-bold text-2xl mb-2">Doa Pilihan</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#dfb631] to-amber-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="text-2xl md:text-3xl font-bold text-amber-900 leading-relaxed" style={{fontFamily: 'serif'}}>
              {doas[currentDoaIndex].arabic}
            </div>
            <div className="text-amber-700 italic text-lg">
              {doas[currentDoaIndex].latin}
            </div>
            <div className="text-amber-600 font-medium">
              "{doas[currentDoaIndex].meaning}"
            </div>
            <div className="flex justify-center space-x-2 mt-4">
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
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 inline-block">
            <p className="text-amber-700 text-sm">
              🕌 <strong>Mushola An-Nur</strong> • 📍 Desa Salamrejo, Karangan, Trenggalek
            </p>
            <p className="text-amber-600 text-xs mt-1">
              "Dan dirikanlah sholat, tunaikanlah zakat, dan ruku'lah beserta orang-orang yang ruku'" - QS. Al-Baqarah: 43
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
