import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminTestResults: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/tests")
      .then(res => setTests(res.data))
      .catch(() => setTests([]));
  }, []);

  useEffect(() => {
    if (selectedTest) {
      axios.get(`http://localhost:8080/api/test-results/test/${selectedTest}`)
        .then(res => setResults(res.data))
        .catch(() => setResults([]));
    }
  }, [selectedTest]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kết quả thi</h1>
      <div className="mb-4">
        <label className="font-semibold mr-2">Chọn bài thi:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedTest}
          onChange={e => setSelectedTest(e.target.value)}
        >
          <option value="">-- Chọn bài thi --</option>
          {tests.map(test => (
            <option key={test.id} value={test.id}>{test.name}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Điểm (%)</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.userName}</td>
                <td className="px-4 py-2">{r.userEmail}</td>
                <td className="px-4 py-2">{r.percentage}</td>
                <td className="px-4 py-2">{r.isPassed ? 'Đạt' : 'Chưa đạt'}</td>
                <td className="px-4 py-2">{r.timeSpent} phút</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTestResults;