import React from 'react';
import { Eye, ArrowUpDown, Monitor } from 'lucide-react';

export default function ClassroomBoard({ viewMode, onToggleViewMode }) {
  const isTeacherView = viewMode === 'teacher';

  return (
    <div className="classroom-front-section">
      {/* Visual Blackboard */}
      <div className="blackboard classroom-board">
        <span className="blackboard-title">칠 판 ( 앞 / FRONT )</span>
      </div>

      {/* Teacher Podium */}
      <div className="teacher-podium no-print">
        교 탁
      </div>

      {/* Perspective Indicator Banner */}
      <div className="view-indicator-banner no-print">
        <Monitor size={14} style={{ color: '#2563eb' }} />
        <span>
          현재 시점: <strong>{isTeacherView ? '교사 시점 (교탁 기준)' : '학생 시점 (칠판 기준)'}</strong>
          {' — '}
          <span style={{ color: '#64748b' }}>
            {isTeacherView
              ? '교사가 교탁에서 학생들을 바라보는 방향입니다.'
              : '학생들이 교실 뒤에서 칠판을 바라보는 방향입니다.'}
          </span>
        </span>
        <button
          type="button"
          onClick={onToggleViewMode}
          className="btn btn-secondary"
          style={{ padding: '2px 8px', fontSize: '0.75rem', marginLeft: '6px' }}
          title="시점 뒤집기"
        >
          <ArrowUpDown size={12} />
          시점 전환
        </button>
      </div>
    </div>
  );
}
