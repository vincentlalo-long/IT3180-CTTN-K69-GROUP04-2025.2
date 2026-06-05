import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero-lamine.webp";
import { PlayerNavBar } from "../layouts/player/PlayerNavBar";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  MapPin, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail
} from "lucide-react";

export function LandingPage() {
  const stats = [
    { value: "15,000+", label: "Trận đấu kết nối", description: "Kết nghĩa thành công hàng ngàn kèo" },
    { value: "120+", label: "Sân bóng đối tác", description: "Phủ sóng rộng khắp khu vực" },
    { value: "30,000+", label: "Cầu thủ tin dùng", description: "Cộng đồng năng động, chuyên nghiệp" },
    { value: "98.5%", label: "Tỷ lệ hoàn thành", description: "Hệ thống uy tín, không lo hủy ca" },
  ];

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-emerald-300" />,
      title: "Đặt sân Online siêu tốc",
      description: "Xem sơ đồ sân trống theo thời gian thực. Giữ chỗ và thanh toán đặt cọc an toàn chỉ trong 30 giây.",
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-300" />,
      title: "Tìm đối & Ghép kèo",
      description: "Tìm kiếm đối thủ ngang cơ, ghép kèo giao lưu văn minh để rèn luyện sức khỏe và cọ xát nâng cao trình độ.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-emerald-300" />,
      title: "Quản lý đội bóng 4.0",
      description: "Quản lý quỹ đội, theo dõi thành viên tham gia, điểm danh trước trận và cập nhật lịch sử đấu trực quan.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-emerald-300" />,
      title: "Vận hành sân bóng thông minh",
      description: "Giải pháp chuyển đổi số dành riêng cho chủ sân bóng: Xử lý ca đấu, chấm công nhân sự và báo cáo doanh thu chi tiết.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Tìm kiếm sân bóng",
      description: "Lọc theo khoảng cách, giờ đá mong muốn và loại sân (5, 7, 11 người) phù hợp nhất.",
    },
    {
      step: "02",
      title: "Chọn khung giờ & Thanh toán",
      description: "Khóa nhanh khung giờ trống mong muốn và tiến hành đặt cọc online an toàn, linh hoạt.",
    },
    {
      step: "03",
      title: "Ra sân & Trải nghiệm",
      description: "Đến sân nhận phòng thay đồ, nhận nước uống và bắt đầu thi đấu cùng đồng đội.",
    },
  ];

  const devTeam = [
    { name: "Đinh Thái Sơn", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" },
    { name: "Nguyễn Trí Hiếu", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80" },
    { name: "Nguyễn Đăng Long", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80" },
    { name: "Nguyễn Thế Khải", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80" },
    { name: "Phạm Gia Linh", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D] text-white">
      {/* Khởi chạy thanh điều hướng */}
      <PlayerNavBar />

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="MIXIFOOT hero"
          loading="eager"
          className="h-full w-full object-cover object-center scale-105"
        />
        {/* Gradient overlay to soften the image edges */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03150c]/90 via-[#03150c]/55 to-transparent" />

        <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20">
          <div className="max-w-[700px] flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">Hệ thống đặt sân & Kết nối thể thao 4.0</span>
            </div>

            <h1 className="text-4xl font-extrabold uppercase leading-[1.1] text-white md:text-6xl lg:text-7xl tracking-tight">
              CHÁY CÙNG
              <br />
              <span className="text-emerald-300 drop-shadow-[0_0_15px_rgba(110,231,183,0.3)]">
                NIỀM ĐAM MÊ
              </span>
              <br />
              BÓNG ĐÁ!
            </h1>

            <p className="text-base text-white/80 md:text-lg max-w-[500px] leading-relaxed">
              Hệ thống đặt sân bóng trực tuyến, ghép kèo matchmaking thông minh và kết nối cộng đồng bóng đá phong trào hàng đầu Việt Nam.
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-8 py-4 text-lg font-bold text-[#03150c] transition duration-200 hover:scale-105 hover:bg-emerald-200 shadow-lg"
              >
                Đặt sân ngay
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/match"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-bold text-white transition duration-200 hover:scale-105 hover:bg-white/10 hover:border-white/40 backdrop-blur-md"
              >
                Tìm đối ghép kèo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="relative z-10 mt-16 mx-auto w-full max-w-[1200px] px-4">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 divide-y divide-white/10 lg:divide-y-0 lg:divide-x divide-solid">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-3 lg:px-6">
                <span className="text-3xl md:text-4xl font-extrabold text-emerald-300 tracking-tight">{stat.value}</span>
                <span className="mt-1.5 text-sm font-bold text-white">{stat.label}</span>
                <span className="mt-1 text-xs text-white/70 leading-normal hidden sm:inline-block">{stat.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="mx-auto w-full max-w-[1280px] px-6 py-16 sm:py-24 space-y-24 sm:space-y-32">
        
        {/* Core Features */}
        <section className="space-y-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Hệ thống vận hành
            </span>
            <h2 className="text-3xl font-extrabold uppercase text-white sm:text-4xl">
              Tính năng nổi bật
            </h2>
            <div className="h-[3px] w-[80px] bg-emerald-300 rounded-full" />
            <p className="text-sm md:text-base text-white/80 max-w-[600px]">
              MIXIFOOT cung cấp các công cụ kết nối trực tiếp, tối ưu hóa quá trình quản trị và trải nghiệm của cầu thủ.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, idx) => (
              <div 
                key={idx}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-emerald-300/40"
              >
                <div className="space-y-5">
                  <div className="inline-flex rounded-xl bg-white/5 p-3 group-hover:bg-emerald-300/10 transition-colors">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">{feat.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Quy trình dễ dàng
            </span>
            <h2 className="text-3xl font-extrabold uppercase text-white sm:text-4xl">
              Quy trình đặt sân 3 bước
            </h2>
            <div className="h-[3px] w-[80px] bg-emerald-300 rounded-full" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-xl flex flex-col items-start gap-4 transition-all duration-300 hover:bg-white/10"
              >
                <div className="absolute right-6 top-6 text-5xl font-black text-white/5 select-none">
                  {step.step}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300 font-bold text-[#03150c]">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Development Team */}
        <section className="space-y-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Đứng sau hệ thống
            </span>
            <h2 className="text-3xl font-extrabold uppercase text-white sm:text-4xl">
              Đội ngũ phát triển
            </h2>
            <div className="h-[3px] w-[80px] bg-emerald-300 rounded-full" />
            <p className="text-sm md:text-base text-white/80 max-w-[600px]">
              Gặp gỡ những lập trình viên của AMIXI đã trực tiếp thiết kế và lập trình nên nền tảng MIXIFOOT.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 justify-center">
            {devTeam.map((dev, idx) => (
              <div 
                key={idx}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl text-center flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-emerald-300/40"
              >
                <div className="relative h-20 w-20 rounded-full overflow-hidden border border-white/10 group-hover:border-emerald-300/30 transition-colors shadow-inner">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">{dev.name}</h4>
                  <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">Developer</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="border-t border-white/10 bg-black/40 text-white/70 py-16 px-6 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-widest text-white" style={{ fontFamily: '"Jersey 10", sans-serif' }}>
              MIXIFOOT
            </h2>
            <p className="text-xs leading-relaxed text-white/60">
              MIXIFOOT - Hệ thống đặt sân trực tuyến hàng đầu Việt Nam. Hỗ trợ đặt sân nhanh, tìm kèo đấu, quản lý đội bóng chuyên nghiệp và báo cáo vận hành sân bóng tối ưu.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tính năng chính</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/booking" className="hover:text-emerald-300 transition">Đặt sân online nhanh</Link></li>
              <li><Link to="/match" className="hover:text-emerald-300 transition">Matchmaking - Tìm đối</Link></li>
              <li><Link to="/team" className="hover:text-emerald-300 transition">Quản lý câu lạc bộ</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-emerald-300 transition">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-emerald-300 transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-emerald-300 transition">Điều khoản dịch vụ</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Liên hệ với chúng tôi</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-300" />
                <span>+84 909 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-300" />
                <span>support@mixifoot.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <span>123 Nguyễn Chí Thanh, Cầu Giấy, Hà Nội</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 MIXIFOOT. All rights reserved. Phát triển bởi Đội ngũ AMIXI.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Facebook</a>
            <a href="#" className="hover:text-white transition">Instagram</a>
            <a href="#" className="hover:text-white transition">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}