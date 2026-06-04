import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero-lamine.webp";
import { PlayerNavBar } from "../layouts/player/PlayerNavBar";


const featureCards = [
  "Đặt sân trực tuyến",
  "Theo dõi lịch thi đấu",
  "Quản lý đơn đặt sân",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />

      <section className="relative h-[90vh] min-h-[620px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="MIXIFOOT hero"
          loading="eager"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#05110A]/45" />

        <div className="absolute inset-0 flex items-start p-6 sm:p-10 lg:p-14">
          <div className="mt-14 flex max-w-[560px] flex-col items-start gap-10 sm:mt-16 lg:mt-20">
            <h2 className="text-3xl font-bold uppercase leading-[1.1] text-white md:text-5xl lg:text-6xl">
              CHÁY CÙNG
              <br />
              NIỀM ĐAM
              <br />
              MÊ BÓNG
              <br />
              ĐÁ!
            </h2>
            {/* Nút "Đặt sân ngay" → /booking */}
            <Link
              to="/booking"
              className="inline-flex rounded-md border-4 border-[#2D0B0B] bg-white px-16 py-6 text-3xl font-bold text-[#1E160C] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:scale-105 hover:brightness-95 md:text-4xl"
            >
              Đặt sân ngay !
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="mt-2 rounded-[20px] border border-white/15 bg-[#005E2E]/32 p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)] sm:p-7">
          <div className="flex flex-col items-center gap-3 text-center">
            <h3 className="text-3xl font-bold uppercase text-white sm:text-4xl">
              Chức năng chính
            </h3>
            <div className="h-[2px] w-[180px] bg-white/70" />
            <p className="text-sm text-white/80">
              Nền tảng quản lý tập trung cho vận hành sân bóng và đặt sân theo
              thời gian thực.
            </p>
          </div>

          <div className="mt-6 space-y-7">
            <div>
              <div className="inline-flex rounded-xl bg-[#84e30f] px-5 py-2.5">
                <span className="text-2xl font-bold text-[#0d0355]">
                  Phần mềm quản lý
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featureCards.map((title) => (
                  <article
                    key={title}
                    className="flex h-[210px] flex-col justify-between rounded-[20px] border-2 border-black/55 bg-white/95 p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)]"
                  >
                    <h4 className="text-xl font-bold text-[#0d0355]">{title}</h4>
                    <p className="text-sm text-[#113520]">
                      Dữ liệu realtime, dễ vận hành và đồng bộ xuyên suốt khu sân.
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="inline-flex rounded-xl bg-[#84e30f] px-5 py-2.5">
                <span className="text-2xl font-bold text-[#0d0355]">
                  Đội ngũ AMIXI
                </span>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <article className="h-[230px] rounded-[20px] border-2 border-black/55 bg-white/95 p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)]">
                  <h4 className="text-xl font-bold text-[#0d0355]">Vận hành trực quầy</h4>
                  <p className="mt-2 text-sm text-[#113520]">
                    Nhóm hỗ trợ check-in, xử lý ca, khóa sân bảo trì và điều phối lịch.
                  </p>
                </article>

                <article className="h-[230px] rounded-[20px] border-2 border-black/55 bg-white/95 p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)]">
                  <h4 className="text-xl font-bold text-[#0d0355]">Điều hành chuỗi khu sân</h4>
                  <p className="mt-2 text-sm text-[#113520]">
                    Theo dõi doanh thu, nhân sự và hiệu suất các khu sân trên cùng một màn hình.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}