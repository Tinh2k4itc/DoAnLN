import React, { useEffect, useState } from 'react';
import { fetchParts, createPart, updatePart, deletePart, Part } from './PartApi';
import { fetchCourses, Course } from '../manage-course/courseApi';

const emptyPart: Omit<Part, 'id'> = {
  name: '',
  description: '',
  duration: 60,
  courseId: ''
};

const ManagePart: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState<Omit<Part, 'id'>>(emptyPart);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [partData, courseData] = await Promise.all([
        fetchParts(),
        fetchCourses()
      ]);
      setParts(partData);
      setCourses(courseData);
      if (courseData.length === 0) {
        setLoadError('Không có dữ liệu môn học. Vui lòng tạo môn học trước khi tạo bài thi!');
      }
    } catch {
      setLoadError('Lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData(emptyPart);
    setShowCreate(true);
  };

  const handleOpenEdit = (part: Part) => {
    setEditId(part.id);
    setFormData({
      name: part.name,
      description: part.description,
      duration: part.duration,
      courseId: part.courseId
    });
    setShowEdit(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa bài thi này?')) return;
    try {
      await deletePart(id);
      await loadData();
    } catch {
      alert('Lỗi khi xóa bài thi!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
  };

  // Kiểm tra trùng tên bài thi trong cùng một môn học
  const isDuplicateName = (name: string, courseId: string, ignoreId?: string) => {
    return parts.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase() && p.courseId === courseId && p.id !== ignoreId);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) {
      alert('Vui lòng chọn môn học!');
      return;
    }
    if (isDuplicateName(formData.name, formData.courseId)) {
      alert('Tên bài thi đã tồn tại trong môn học này!');
      return;
    }
    try {
      await createPart(formData);
      setShowCreate(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data || 'Lỗi khi tạo bài thi!');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!formData.courseId) {
      alert('Vui lòng chọn môn học!');
      return;
    }
    if (isDuplicateName(formData.name, formData.courseId, editId)) {
      alert('Tên bài thi đã tồn tại trong môn học này!');
      return;
    }
    try {
      await updatePart(editId, formData);
      setShowEdit(false);
      setEditId(undefined);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data || 'Lỗi khi cập nhật bài thi!');
    }
  };

  // Lọc danh sách theo tìm kiếm
  const filteredParts = parts.filter(part => {
    const keyword = search.trim().toLowerCase();
    const course = courses.find(c => c.id === part.courseId);
    return (
      part.name.toLowerCase().includes(keyword) ||
      (course && course.name.toLowerCase().includes(keyword)) ||
      (course && course.code.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="relative min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Quản lý bài thi</h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm bài thi, tên hoặc mã môn học..."
            className="px-3 py-2 border rounded w-full sm:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700 focus:outline-none"
            onClick={handleOpenCreate}
          >
            + Thêm bài thi
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-slate-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredParts.map(part => {
            const course = courses.find(c => c.id === part.courseId);
            return (
              <div key={part.id} className="bg-white rounded-lg shadow p-5 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{part.name}</h2>
                  <div className="text-slate-600 text-sm mb-1">Môn học: <span className="font-mono">{course ? course.name : part.courseId}</span></div>
                  <div className="text-slate-600 text-sm mb-1">Mã môn học: {course ? course.code : ''}</div>
                  <div className="text-slate-600 text-sm mb-1">Thời gian: {part.duration} phút</div>
                  <div className="text-slate-500 text-xs mt-2">{part.description}</div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="flex-1 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    onClick={() => handleOpenEdit(part)}
                  >Chỉnh sửa</button>
                  <button
                    className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(part.id)}
                  >Xóa</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm bài thi */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setShowCreate(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Thêm bài thi</h2>
            {loadError ? (
              <div className="text-red-500 mb-4">{loadError}</div>
            ) : null}
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên bài thi" className="w-full px-3 py-2 border rounded" required disabled={!!loadError} />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" className="w-full px-3 py-2 border rounded" disabled={!!loadError} />
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="Thời gian (phút)" className="w-full px-3 py-2 border rounded" min={1} disabled={!!loadError} />
              {courses.length > 0 ? (
                <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={!!loadError}>
                  <option value="">Chọn môn học</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                  ))}
                </select>
              ) : (
                <div className="text-slate-500">Không có môn học nào để chọn.</div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={() => setShowCreate(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700" disabled={!!loadError || courses.length === 0}>Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa bài thi */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setShowEdit(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa bài thi</h2>
            {loadError ? (
              <div className="text-red-500 mb-4">{loadError}</div>
            ) : null}
            <form onSubmit={handleEdit} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên bài thi" className="w-full px-3 py-2 border rounded" required disabled={!!loadError} />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" className="w-full px-3 py-2 border rounded" disabled={!!loadError} />
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="Thời gian (phút)" className="w-full px-3 py-2 border rounded" min={1} disabled={!!loadError} />
              {courses.length > 0 ? (
                <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={!!loadError}>
                  <option value="">Chọn môn học</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                  ))}
                </select>
              ) : (
                <div className="text-slate-500">Không có môn học nào để chọn.</div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700" disabled={!!loadError || courses.length === 0}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePart; 