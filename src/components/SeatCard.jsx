import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ArrowRightLeft, User, Plus } from 'lucide-react';
import { sound } from '../utils/audio';

export default function SeatCard({
  seat,
  student,
  isSelected,
  isShuffling,
  onSelect,
  onToggleLock,
  onDragStart,
  onDragOver,
  onDrop,
  onUpdateStudentName
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(student ? student.number : null);

  useEffect(() => {
    if (student) {
      setNameInput(student.name);
      setDisplayNumber(student.number);
    } else {
      setNameInput('');
      setDisplayNumber(null);
    }
  }, [student]);

  // Shuffling visual jitter
  useEffect(() => {
    let interval;
    if (isShuffling && !seat.isLocked) {
      interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 30) + 1);
      }, 70);
    } else {
      if (student) {
        setDisplayNumber(student.number);
      }
    }
    return () => clearInterval(interval);
  }, [isShuffling, seat.isLocked, student]);

  const handleLockClick = (e) => {
    e.stopPropagation();
    sound.playLock(!seat.isLocked);
    onToggleLock(seat);
  };

  const handleCardClick = () => {
    if (isEditing) return;
    sound.playClick();
    onSelect(seat);
  };

  const handleNameSubmit = (e) => {
    e.stopPropagation();
    if (nameInput.trim() && student) {
      onUpdateStudentName(student.id, nameInput.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit(e);
    } else if (e.key === 'Escape') {
      setNameInput(student ? student.name : '');
      setIsEditing(false);
    }
  };

  const handleDragStart = (e) => {
    if (seat.isLocked) {
      e.preventDefault();
      return;
    }
    if (onDragStart) {
      onDragStart(e, seat);
    }
  };

  const handleDragOverCard = (e) => {
    e.preventDefault();
    if (onDragOver) onDragOver(e);
    setIsDragOver(true);
  };

  const handleDragLeaveCard = () => {
    setIsDragOver(false);
  };

  const handleDropCard = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDrop) {
      onDrop(e, seat);
    }
  };

  const isEmpty = !student;
  const isLocked = seat.isLocked;

  let cardClasses = ['seat-card'];
  if (isEmpty) cardClasses.push('is-empty');
  if (isLocked) cardClasses.push('is-locked');
  if (isSelected) cardClasses.push('is-selected');
  if (isDragOver) cardClasses.push('is-drag-over');
  if (isShuffling && !isLocked) cardClasses.push('anim-shuffle');

  return (
    <div
      className={cardClasses.join(' ')}
      onClick={handleCardClick}
      draggable={!isEmpty && !isLocked}
      onDragStart={handleDragStart}
      onDragOver={handleDragOverCard}
      onDragLeave={handleDragLeaveCard}
      onDrop={handleDropCard}
      title={
        isLocked
          ? '고정된 좌석 (자리 섞기 시 유지)'
          : isSelected
          ? '선택됨: 맞바꿀 다른 자리를 클릭하세요'
          : isEmpty
          ? '빈 좌석 (클릭하여 다른 자리와 교환 가능)'
          : '클릭하여 자리 교환 / 자물쇠를 눌러 고정'
      }
    >
      {/* Card Header: Coordinate and Lock Toggle */}
      <div className="seat-header no-print">
        <span className="desk-coordinate">
          {seat.row + 1}행 {seat.col + 1}열
        </span>
        {!isEmpty && (
          <button
            type="button"
            className={`lock-toggle-btn ${isLocked ? 'locked' : ''}`}
            onClick={handleLockClick}
            title={isLocked ? '좌석 고정 해제' : '좌석 고정하기 (랜덤 섞기 시 위치 유지)'}
          >
            {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        )}
      </div>

      {/* Card Body: Student Details */}
      <div className="seat-body">
        {isEmpty ? (
          <div className="empty-placeholder-text">
            <span style={{ opacity: 0.6 }}>- 빈 자리 -</span>
          </div>
        ) : (
          <>
            <div className={`student-number-badge ${isLocked ? 'locked' : ''}`}>
              {displayNumber}번
            </div>

            {isEditing ? (
              <input
                type="text"
                autoFocus
                className="form-input"
                style={{ padding: '2px 6px', fontSize: '0.9rem', textAlign: 'center', width: '90%' }}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div
                className="student-name seat-student-name"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="더블클릭하여 이름 수정"
              >
                {student.name}
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Footer: Status Indicators */}
      <div className="seat-footer no-print">
        {isSelected ? (
          <span className="swap-hint-tag">
            <ArrowRightLeft size={10} style={{ display: 'inline', marginRight: 2 }} />
            교환 대상
          </span>
        ) : isLocked ? (
          <span className="lock-status-tag">
            <Lock size={9} />
            고정됨
          </span>
        ) : null}
      </div>
    </div>
  );
}
