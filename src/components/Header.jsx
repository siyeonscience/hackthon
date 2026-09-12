import React from 'react';
import {
  Shuffle,
  RotateCcw,
  Settings,
  Users,
  Printer,
  Volume2,
  VolumeX,
  School,
  Lock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({
  studentCount,
  lockedCount,
  rows,
  cols,
  viewMode,
  layoutMode,
  isShuffling,
  canUndo,
  isMuted,
  onToggleMute,
  onShuffle,
  onUndo,
  onReset,
  onOpenSettings,
  onOpenRoster,
  onPrint,
  onToggleViewMode,
  onToggleLayoutMode
}) {
  return (
    <header className="header no-print">
      <div className="header-content">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-icon">
            <School size={24} />
          </div>
          <div>
            <h1 className="brand-title">학급 자리 배치 도우미</h1>
            <p className="brand-subtitle">초중고 교실을 위한 직관적인 좌석 관리 도구</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Main Shuffle Button */}
          <button
            type="button"
            className="btn btn-primary btn-primary-large"
            onClick={onShuffle}
            disabled={isShuffling}
            title="고정된 좌석을 제외하고 학생들의 자리를 무작위로 섞습니다"
          >
            <Shuffle size={18} className={isShuffling ? 'anim-shuffle' : ''} />
            {isShuffling ? '자리 섞는 중...' : '자리 섞기 (랜덤)'}
          </button>

          {/* Undo Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onUndo}
            disabled={!canUndo || isShuffling}
            title="이전 배치 상태로 되돌립니다"
          >
            <RotateCcw size={16} />
            되돌리기
          </button>

          {/* Student Roster Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenRoster}
            disabled={isShuffling}
            title="학생 번호 및 이름 목록을 관리하고 엑셀/나이스 명단을 붙여넣습니다"
          >
            <Users size={16} />
            학생 명단
          </button>

          {/* Classroom Settings Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenSettings}
            disabled={isShuffling}
            title="행, 열 크기 및 분단 간격을 설정합니다"
          >
            <Settings size={16} />
            교실 설정
          </button>

          {/* Print Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onPrint}
            title="인쇄용 배치표를 출력하거나 PDF로 저장합니다"
          >
            <Printer size={16} />
            인쇄
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            onClick={onToggleMute}
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            onClick={onReset}
            title="기본 설정(24명, 4행 6열)으로 초기화"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Quick Statistics Bar */}
      <div className="stats-bar">
        <div className="stats-group">
          <span className="stat-chip">
            교실 크기: <strong>{rows}행 × {cols}열 ({rows * cols}석)</strong>
          </span>
          <span className="stat-chip">
            학생 수: <strong>{studentCount}명</strong>
          </span>
          {lockedCount > 0 && (
            <span className="stat-chip locked-chip">
              <Lock size={12} />
              고정된 좌석: <strong>{lockedCount}명</strong>
            </span>
          )}
        </div>

        {/* Controls: Layout Mode (Single vs Pair) and View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Layout Mode Toggle */}
          <div className="view-toggle-wrap">
            <button
              type="button"
              className={`view-toggle-btn ${layoutMode === 'single' ? 'active' : ''}`}
              onClick={() => onToggleLayoutMode('single')}
              title="짝 없이 모든 책상을 단독으로 배치합니다"
            >
              짝 없음 (단독)
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${layoutMode === 'pair' ? 'active' : ''}`}
              onClick={() => onToggleLayoutMode('pair')}
              title="2열씩 짝을 이루어 분단 형태로 배치합니다"
            >
              짝꿍형 (2열 분단)
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle-wrap">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'teacher' ? 'active' : ''}`}
              onClick={() => onToggleViewMode('teacher')}
            >
              교사 시점 (교탁)
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'student' ? 'active' : ''}`}
              onClick={() => onToggleViewMode('student')}
            >
              학생 시점 (칠판)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
