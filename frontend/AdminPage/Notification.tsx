import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Group {
  id: string;
  name: string;
  type: 'class' | 'subject';
}

const Notification: React.FC = () => {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    // Lấy danh sách lớp/môn học từ backend
    axios.get<Group[]>('http://localhost:8080/api/notification-groups').then(res => setGroups(res.data));
  }, []);

  const handleSend = async () => {
    setStatus('');
    if (!message.trim()) {
      setStatus('Vui lòng nhập nội dung thông báo!');
      return;
    }
    try {
      await axios.post('http://localhost:8080/api/notifications', {
        message,
        targets: target,
      });
      setStatus('Đã gửi thông báo!');
      setMessage('');
      setTarget([]);
    } catch (err: any) {
      setStatus('Gửi thông báo thất bại: ' + (err?.message || err));
    }
  };

  const handleTargetChange = (id: string) => {
    setTarget(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gửi thông báo</h1>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Nội dung thông báo</label>
        <textarea className="w-full border rounded px-3 py-2" rows={4} value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Gửi đến nhóm</label>
        <div className="flex flex-wrap gap-2">
          {groups.map(g => (
            <label key={g.id} className="flex items-center gap-1">
              <input type="checkbox" checked={target.includes(g.id)} onChange={() => handleTargetChange(g.id)} />
              <span>{g.name} ({g.type === 'class' ? 'Lớp' : 'Môn'})</span>
            </label>
          ))}
        </div>
      </div>
      <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={handleSend}>Gửi thông báo</button>
      {status && <div className="mt-4 text-green-600 font-semibold">{status}</div>}
    </div>
  );
};

export default Notification;
