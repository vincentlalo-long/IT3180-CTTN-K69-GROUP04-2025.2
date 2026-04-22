interface StaffMember {
  id: string;
  fullName: string;
  role: "Quản lý" | "Lễ tân" | "Thu ngân";
  status: "Hoạt động" | "Tạm khóa";
  email: string;
}

const mockStaffMembers: StaffMember[] = [
  {
    id: "NV-001",
    fullName: "Nguyen Minh Khoa",
    role: "Quản lý",
    status: "Hoạt động",
    email: "khoa.nguyen@mixifoot.vn",
  },
  {
    id: "NV-002",
    fullName: "Tran Le Uyen",
    role: "Lễ tân",
    status: "Hoạt động",
    email: "uyen.tran@mixifoot.vn",
  },
  {
    id: "NV-003",
    fullName: "Pham Duc Anh",
    role: "Thu ngân",
    status: "Tạm khóa",
    email: "anh.pham@mixifoot.vn",
  },
];

export function UserManagementTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Quản lý nhân viên</h3>
        <p className="mt-1 text-sm text-white/75">
          Danh sách mẫu cho module nhân viên/người dùng. Có thể mở rộng CRUD
          sau.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-[#0a4d29]/65">
        <table className="min-w-full divide-y divide-white/15 text-left text-sm text-white/90">
          <thead className="bg-white/10 text-xs uppercase tracking-wide text-white/80">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {mockStaffMembers.map((member) => (
              <tr key={member.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">
                  {member.id}
                </td>
                <td className="px-4 py-3">{member.fullName}</td>
                <td className="px-4 py-3">{member.role}</td>
                <td className="px-4 py-3">{member.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      member.status === "Hoạt động"
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-amber-400/20 text-amber-200"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
