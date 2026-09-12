import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  currentRows,
  currentCols,
  currentStudentCount,
  currentLayoutMode,
  onSaveSettings
}) {
  const [rows, setRows] = useState(currentRows);
  const [cols, setCols] = useState(currentCols);
  const [studentCount, setStudentCount] = useState(currentStudentCount);
  const [layoutMode, setLayoutMode] = useState(currentLayoutMode);

  if (!isOpen) return null;

  const totalSeats = rows * cols;

  const handleRowChange = (val) => {
    const newRows = Math.max(1, Math.min(8, parseInt(val, 10) || 1));
    setRows(newRows);
    if (studentCount > newRows * cols) {
      setStudentCount(newRows * cols);
    }
  };

  const handleColChange = (val) => {
    const newCols = Math.max(1, Math.min(10, parseInt(val, 10) || 1));
    setCols(newCols);
    if (studentCount > rows * newCols) {
      setStudentCount(rows * newCols);
    }
  };

  const handleStudentCountChange = (val) => {
    const count = Math.max(1, Math.min(totalSeats, parseInt(val, 10) || 1));
    setStudentCount(count);
  };

  const applyPreset = (presetRows, presetCols, presetStudents, mode = 'pair') => {
    setRows(presetRows);
    setCols(presetCols);
    setStudentCount(presetStudents);
    setLayoutMode(mode);
  };

  const handleSave = () => {
    onSaveSettings({
      rows,
      cols,
      studentCount,
      layoutMode
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders size={20} style={{ color: '#2563eb' }} />
            <h2 className="modal-title">교실 크기 및 배치 설정</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Preset Buttons */}
          <div className="form-group">
            <label className="form-label">자주 사용하는 학급 규격 프리셋</label>
            <div className="preset-pills">
              <button
                type="button"
                className={`preset-pill-btn ${rows === 4 && cols === 6 && studentCount === 24 && layoutMode === 'single' ? 'active' : ''}`}
                onClick={() => applyPreset(4, 6, 24, 'single')}
              >
                기본 24명 (4행 6열 짝 없음)
              </button>
              <button
                type="button"
                className={`preset-pill-btn ${rows === 4 && cols === 6 && studentCount === 24 && layoutMode === 'pair' ? 'active' : ''}`}
                onClick={() => applyPreset(4, 6, 24, 'pair')}
              >
                24명 (4행 6열 짝꿍 분단)
              </button>
              <button
                type="button"
                className={`preset-pill-btn ${rows === 4 && cols === 5 && studentCount === 20 ? 'active' : ''}`}
                onClick={() => applyPreset(4, 5, 20, 'single')}
              >
                20명 (4행 5열 단독)
              </button>
              <button
                type="button"
                className={`preset-pill-btn ${rows === 5 && cols === 5 && studentCount === 25 ? 'active' : ''}`}
                onClick={() => applyPreset(5, 5, 25, 'single')}
              >
                25명 (5행 5열 단독)
              </button>
              <button
                type="button"
                className={`preset-pill-btn ${rows === 5 && cols === 6 && studentCount === 30 ? 'active' : ''}`}
                onClick={() => applyPreset(5, 6, 30, 'single')}
              >
                30명 (5행 6열 단독)
              </button>
            </div>
          </div>

          {/* Grid Dimensions */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                행 수 (앞뒤 줄)
                <span className="form-hint">1 ~ 8행</span>
              </label>
              <input
                type="number"
                min="1"
                max="8"
                className="form-input"
                value={rows}
                onChange={(e) => handleRowChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                열 수 (좌우 줄)
                <span className="form-hint">1 ~ 10열</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={cols}
                onChange={(e) => handleColChange(e.target.value)}
              />
            </div>
          </div>

          {/* Student Count */}
          <div className="form-group">
            <label className="form-label">
              총 학생 수
              <span className="form-hint">최대 {totalSeats}명 (전체 책상 수)</span>
            </label>
            <input
              type="number"
              min="1"
              max={totalSeats}
              className="form-input"
              value={studentCount}
              onChange={(e) => handleStudentCountChange(e.target.value)}
            />
            {totalSeats > studentCount && (
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                * 총 {totalSeats}개의 좌석 중 {totalSeats - studentCount}개는 빈자리로 설정됩니다.
              </p>
            )}
          </div>

          {/* Layout Mode */}
          <div className="form-group">
            <label className="form-label">책상 배열 형태</label>
            <select
              className="form-select"
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
            >
              <option value="single">단독형 (짝 없이 균등 배치 - 추천)</option>
              <option value="pair">짝꿍형 (2열씩 짝꿍 분단)</option>
              <option value="exam">시험 대형 (책상 사이 간격 넓힘)</option>
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            <Check size={16} />
            설정 적용
          </button>
        </div>
      </div>
    </div>
  );
}
