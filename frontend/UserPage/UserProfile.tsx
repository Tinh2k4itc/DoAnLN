import React, { useState } from 'react';

interface UserProfileProps {
  onBack: () => void;
}

const mockUserProfile = {
  personalInfo: {
    fullName: 'Nguyễn Văn A',
    email: 'student@example.com',
    phone: '0123456789',
    dateOfBirth: '2005-03-15',
    gender: 'Nam',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    avatar: 'https://picsum.photos/seed/student99/150/150',
  },
  academicInfo: {
    studentId: 'SV001',
    class: '12A1',
    school: 'THPT ABC',
    major: 'Khoa học tự nhiên',
    enrollmentDate: '2023-09-01',
    gpa: 8.5,
  },
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showProfile: true,
      showGrades: false,
      showActivity: true,
    },
  },
};

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockUserProfile);

  const handleSave = () => {
    // TODO: Save profile changes to backend
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(mockUserProfile);
    setIsEditing(false);
  };

  const updateProfile = (section: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
            <div className="space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center mb-6">
                <img
                  src={profile.personalInfo.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200"
                />
                {isEditing && (
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    Thay đổi ảnh
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã sinh viên</label>
                  <p className="text-gray-900 font-medium">{profile.academicInfo.studentId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                  <p className="text-gray-900">{profile.academicInfo.class}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trường</label>
                  <p className="text-gray-900">{profile.academicInfo.school}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  <p className="text-gray-900 font-medium">{profile.academicInfo.gpa}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cá nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.personalInfo.fullName}
                      onChange={(e) => updateProfile('personalInfo', 'fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.personalInfo.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.personalInfo.email}
                      onChange={(e) => updateProfile('personalInfo', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.personalInfo.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.personalInfo.phone}
                      onChange={(e) => updateProfile('personalInfo', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.personalInfo.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profile.personalInfo.dateOfBirth}
                      onChange={(e) => updateProfile('personalInfo', 'dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.personalInfo.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  {isEditing ? (
                    <select
                      value={profile.personalInfo.gender}
                      onChange={(e) => updateProfile('personalInfo', 'gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.personalInfo.gender}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  {isEditing ? (
                    <textarea
                      value={profile.personalInfo.address}
                      onChange={(e) => updateProfile('personalInfo', 'address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.personalInfo.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Thông báo</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.notifications.email}
                        onChange={(e) => updateProfile('preferences', 'notifications', {
                          ...profile.preferences.notifications,
                          email: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.notifications.push}
                        onChange={(e) => updateProfile('preferences', 'notifications', {
                          ...profile.preferences.notifications,
                          push: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Push notification</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.notifications.sms}
                        onChange={(e) => updateProfile('preferences', 'notifications', {
                          ...profile.preferences.notifications,
                          sms: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">SMS</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Quyền riêng tư</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.privacy.showProfile}
                        onChange={(e) => updateProfile('preferences', 'privacy', {
                          ...profile.preferences.privacy,
                          showProfile: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Hiển thị hồ sơ</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.privacy.showGrades}
                        onChange={(e) => updateProfile('preferences', 'privacy', {
                          ...profile.preferences.privacy,
                          showGrades: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Hiển thị điểm số</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences.privacy.showActivity}
                        onChange={(e) => updateProfile('preferences', 'privacy', {
                          ...profile.preferences.privacy,
                          showActivity: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Hiển thị hoạt động</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 