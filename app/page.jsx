import Image from "next/image";
import TimerLoggo from "@/assets/image/timera-logo.png"
import LogoMasjid from "@/assets/image/logo_masjid.png"

export default function Home() {
  return (
    <>
    <main>
      <header className=" w-full bg-[#dfb631]/20 p-8">
        <div className="flex items-center justify-center">
          {/* <Image
            src={TimerLoggo}
            className="w-[70px]"
          /> */}
          <Image src={LogoMasjid} className="w-32"/>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-6xl">Mushola An-Nur</h1>
            {/* <p className="font-semibold text-lg">RT 02/RW 01, Dusun Josari, Desa Salamrejo, Kecamatan Karangan, Kabupaten Trenggalek</p> */}
          </div>
        </div>
      </header>
    </main>
    </>
  );
}
