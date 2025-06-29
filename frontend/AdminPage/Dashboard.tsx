import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios.get("http://localhost:8080/api/report/overview")
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  if (!stats) return <div>Đang tải thống kê...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard tổng quan</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng số user" value={stats.totalUsers} />
        <StatCard label="Tổng số bài thi" value={stats.totalTests} />
        <StatCard label="Tổng số môn học" value={stats.totalCourses} />
        <StatCard label="Lượt thi" value={stats.totalTestAttempts} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Phân bố user theo vai trò</h2>
          <pre>{JSON.stringify(stats.usersByRole, null, 2)}</pre>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Phân bố bài thi theo độ khó</h2>
          <pre>{JSON.stringify(stats.testsByDifficulty, null, 2)}</pre>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Top 5 học viên xuất sắc</h2>
        {/* Hiển thị bảng top performers nếu có */}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string, value: any }) => (
  <div className="bg-white rounded shadow p-4 text-center">
    <div className="text-3xl font-bold text-sky-600">{value}</div>
    <div className="text-slate-500">{label}</div>
  </div>
);

export default AdminDashboard;