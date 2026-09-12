import React, { useState } from 'react';
import { X, Users, ClipboardPaste, Unlock, Check } from 'lucide-react';

export default function RosterModal({
  isOpen,
  onClose,
  students,
  seats,
  onUpdateStudents,
  onUnlockAll
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'paste'
  const [bulkText, setBulkText] = useState('');
  const [editedStudents, setEditedStudents] = useState(students || []);

  if (!isOpen) return null;

  const handleNameChange = (id, newName) => {
    setEditedStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleBulkApply = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const updated = editedStudents.map((s, idx) => {
      if (idx < lines.length) {
        return { ...s, name: lines[idx] };
      }
      return s;
    });

    setEditedStudents(updated);
    setActiveTab('list');
  };

  const handleSave = () => {
    onUpdateStudents(editedStudents);
    onClose();
  };

  // Find which seats are locked and which student is in them
  const lockedStudentIds = new Set(
    seats.filter((s) => s.isLocked && s.studentId).map((s) => s.studentId)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Users size={20} style={{ color: '#2563eb' }} />
            <h2 className="modal-title">학생 명단 관리</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 24px' }}>
          <button
            type="button"
            className="btn"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'list' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'list' ? '#2563eb' : 'var(--text-secondary)',
              fontWeight: 600,
              padding: '12px 16px'
            }}
            onClick={() => setActiveTab('list')}
          >
            학생 목록 ({editedStudents.length}명)
          </button>
          <button
            type="button"
            className="btn"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'paste' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'paste' ? '#2563eb' : 'var(--text-secondary)',
              fontWeight: 600,
              padding: '12px 16px'
            }}
            onClick={() => setActiveTab('paste')}
          >
            <ClipboardPaste size={15} />
            명단 일괄 붙여넣기 (나이스/엑셀)
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '60vh' }}>
          {activeTab === 'list' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  이름을 직접 수정하거나 더블클릭하여 변경할 수 있습니다.
                </span>
                {lockedStudentIds.size > 0 && (
                  <button
                    type="button"
                    className="btn btn-accent"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={onUnlockAll}
                  >
                    <Unlock size={12} />
                    모든 좌석 고정 해제 ({lockedStudentIds.size}명)
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>번호</th>
                      <th>학생 이름</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedStudents.map((s) => {
                      const isLocked = lockedStudentIds.has(s.id);
                      return (
                        <tr key={s.id}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                            {s.number}번
                          </td>
                          <td>
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => handleNameChange(s.id, e.target.value)}
                              placeholder={`${s.number}번 학생`}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isLocked ? (
                              <span className="lock-status-tag">고정됨</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>일반</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">
                학생 명단 텍스트 붙여넣기
                <span className="form-hint">한 줄에 한 명씩 입력하세요</span>
              </label>
              <textarea
                rows={10}
                className="form-textarea"
                placeholder={`김민수\n이서연\n박도윤\n최현우\n정다은...`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBulkApply}
                  disabled={!bulkText.trim()}
                >
                  <ClipboardPaste size={14} />
                  명단에 반영하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            <Check size={16} />
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
