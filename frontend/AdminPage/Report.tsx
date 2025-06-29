import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReport: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    axios.get("http://localhost:8080/api/courses")
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      axios.get(`http://localhost:8080/api/report/course/${selectedCourse}`)
        .then(res => setReport(res.data))
        .catch(() => setReport(null));
    }
  }, [selectedCourse]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Báo cáo & Thống kê</h1>
      <div className="mb-4">
        <label className="font-semibold mr-2">Chọn môn học:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Chọn môn học --</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>
      {report && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Thống kê môn học</h2>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AdminReport;
