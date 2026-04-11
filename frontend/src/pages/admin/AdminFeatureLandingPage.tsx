import { useFacilityContext } from "../../contexts/FacilityContext";

const heroImageUrl =
  "https://www.figma.com/api/mcp/asset/03e5ad06-d8aa-4ca4-ae5b-8b1ca6483802";

const primaryFeatureCards = [
  "Đặt sân trực tuyến",
  "Theo dõi lịch thi đấu",
  "Quản lý đơn đặt sân",
];

export function AdminFeatureLandingPage() {
  const { selectedFacility } = useFacilityContext();

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[20px] border border-white/15 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)]">
        <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]">
          <img
            src={heroImageUrl}
            alt="MIXIFOOT hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#05110A]/45" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
            <div className="max-w-[420px] space-y-5">
              <h2 className="text-3xl font-bold uppercase leading-tight text-white sm:text-4xl">
                Cháy cùng niềm đam mê bóng đá!
              </h2>
              <button
                type="button"
                className="rounded-md border-4 border-[#2D0B0B] bg-white px-5 py-2.5 text-xl font-bold text-[#1E160C] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)] transition hover:brightness-95"
              >
                Đặt sân ngay !
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/15 bg-[#005E2E]/32 p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)] sm:p-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <h3 className="text-3xl font-bold uppercase text-white sm:text-4xl">
            Chức năng chính
          </h3>
          <div className="h-[2px] w-[180px] bg-white/70" />
          <p className="text-sm text-white/80">
            {selectedFacility
              ? `Nền tảng quản lý tập trung cho ${selectedFacility.name}.`
              : "Nền tảng quản lý tập trung cho toàn bộ hệ thống khu sân."}
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
              {primaryFeatureCards.map((title) => (
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
                <h4 className="text-xl font-bold text-[#0d0355]">
                  Vận hành trực quầy
                </h4>
                <p className="mt-2 text-sm text-[#113520]">
                  Nhóm hỗ trợ check-in, xử lý ca, khóa sân bảo trì và điều phối
                  lịch.
                </p>
              </article>

              <article className="h-[230px] rounded-[20px] border-2 border-black/55 bg-white/95 p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)]">
                <h4 className="text-xl font-bold text-[#0d0355]">
                  Điều hành chuỗi khu sân
                </h4>
                <p className="mt-2 text-sm text-[#113520]">
                  Theo dõi doanh thu, nhân sự và hiệu suất các khu sân trên cùng
                  một màn hình.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
