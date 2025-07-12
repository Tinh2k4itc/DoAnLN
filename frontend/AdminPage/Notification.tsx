import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { realtimeDb } from '../shared/firebase-config';
import { ref, onValue } from 'firebase/database';

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
  const [violations, setViolations] = useState<any[]>([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    // Lấy danh sách lớp/môn học từ backend
    axios.get<Group[]>('http://localhost:8080/api/notification-groups').then(res => setGroups(res.data));

    const violationsRef = ref(realtimeDb, 'exam-violations');
    const handle = onValue(violationsRef, (snapshot) => {
      const data = snapshot.val();
      let arr: any[] = [];
      if (data) {
        Object.entries(data).forEach(([examId, users]: any) => {
          Object.entries(users).forEach(([userId, info]: any) => {
            arr.push({ ...info, examId, userId });
          });
        });
      }
      arr.sort((a, b) => b.timestamp - a.timestamp);
      setViolations(arr);
      setHasNew(arr.length > 0);
    });
    return () => handle();
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
      <h1 className="text-2xl font-bold mb-4">Thông báo cảnh báo phòng thi</h1>
      <div style={{ maxHeight: 300, overflowY: 'auto', marginTop: 8 }}>
        {violations.length === 0 && <div>Không có cảnh báo nào.</div>}
        {violations.map((v, idx) => (
          <div
            key={v.examId + v.userId}
            style={{
              background: '#fff3cd',
              border: '1px solid #ffeeba',
              borderRadius: 4,
              padding: 8,
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            <b>
              Thí sinh {v.userName} vừa thoát ra khỏi màn hình thi ở bài "{v.examName}"
            </b>
            <br />
            <span>
              Thời gian: {new Date(v.timestamp).toLocaleString()} | Số lần vi phạm: {v.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
