import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import ClassroomBoard from './components/ClassroomBoard';
import SeatGrid from './components/SeatGrid';
import SettingsModal from './components/SettingsModal';
import RosterModal from './components/RosterModal';
import PrintHeader from './components/PrintHeader';
import { sound } from './utils/audio';
import { Check, X, ArrowRightLeft } from 'lucide-react';
import './App.css';

const STORAGE_KEY = 'class_seat_helper_data_v1';

// Default generator for 24 students, 4 rows x 6 cols
function createDefaultData() {
  const rows = 4;
  const cols = 6;
  const studentCount = 24;

  const students = Array.from({ length: studentCount }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    name: `${i + 1}번 학생`
  }));

  const seats = [];
  let seatIdCounter = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const studentIndex = r * cols + c;
      seats.push({
        id: seatIdCounter++,
        row: r,
        col: c,
        studentId: studentIndex < studentCount ? students[studentIndex].id : null,
        isLocked: false
      });
    }
  }

  return {
    rows,
    cols,
    studentCount,
    students,
    seats,
    layoutMode: 'single',
    viewMode: 'teacher',
    classNameTitle: '우리반 좌석 배치표'
  };
}

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(6);
  const [studentCount, setStudentCount] = useState(24);
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState([]);
  const [layoutMode, setLayoutMode] = useState('single'); // 'single' (no pairs), 'pair', 'exam'
  const [viewMode, setViewMode] = useState('teacher'); // 'teacher' or 'student'
  const [classNameTitle, setClassNameTitle] = useState('우리반 좌석 배치표');

  // Interactive states
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Undo history stack
  const [history, setHistory] = useState([]);

  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // 1. Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRows(parsed.rows || 4);
        setCols(parsed.cols || 6);
        setStudentCount(parsed.studentCount || 24);
        setStudents(parsed.students || []);
        setSeats(parsed.seats || []);
        setLayoutMode(parsed.layoutMode === 'pair' ? 'single' : (parsed.layoutMode || 'single'));
        setViewMode(parsed.viewMode || 'teacher');
        setClassNameTitle(parsed.classNameTitle || '우리반 좌석 배치표');
      } else {
        const initial = createDefaultData();
        setRows(initial.rows);
        setCols(initial.cols);
        setStudentCount(initial.studentCount);
        setStudents(initial.students);
        setSeats(initial.seats);
        setLayoutMode(initial.layoutMode);
        setViewMode(initial.viewMode);
        setClassNameTitle(initial.classNameTitle);
      }
    } catch (e) {
      const initial = createDefaultData();
      setRows(initial.rows);
      setCols(initial.cols);
      setStudentCount(initial.studentCount);
      setStudents(initial.students);
      setSeats(initial.seats);
    }
    setDataLoaded(true);
  }, []);

  // 2. Save to LocalStorage on state change
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const payload = {
        rows,
        cols,
        studentCount,
        students,
        seats,
        layoutMode,
        viewMode,
        classNameTitle
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [rows, cols, studentCount, students, seats, layoutMode, viewMode, classNameTitle, dataLoaded]);

  // Students lookup map
  const studentsMap = React.useMemo(() => {
    const map = {};
    students.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [students]);

  // Push to undo stack
  const recordHistory = (currentSeats) => {
    setHistory((prev) => [...prev.slice(-19), JSON.parse(JSON.stringify(currentSeats))]);
  };

  // Toggle seat lock
  const handleToggleLock = (targetSeat) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.id === targetSeat.id ? { ...s, isLocked: !s.isLocked } : s
      )
    );
    showToast(targetSeat.isLocked ? '좌석 고정이 해제되었습니다.' : '좌석이 고정되었습니다. (자리 섞기 시 유지)');
  };

  // Seat selection / click to swap
  const handleSelectSeat = (targetSeat) => {
    if (isShuffling) return;

    if (!selectedSeat) {
      setSelectedSeat(targetSeat);
    } else {
      if (selectedSeat.id === targetSeat.id) {
        setSelectedSeat(null);
      } else {
        // Perform swap between selectedSeat and targetSeat
        handleSwapSeats(selectedSeat.id, targetSeat.id);
        setSelectedSeat(null);
      }
    }
  };

  // Swap students between two seats
  const handleSwapSeats = (seatIdA, seatIdB) => {
    recordHistory(seats);
    setSeats((prev) => {
      const seatA = prev.find((s) => s.id === seatIdA);
      const seatB = prev.find((s) => s.id === seatIdB);
      if (!seatA || !seatB) return prev;

      return prev.map((s) => {
        if (s.id === seatIdA) {
          return { ...s, studentId: seatB.studentId };
        }
        if (s.id === seatIdB) {
          return { ...s, studentId: seatA.studentId };
        }
        return s;
      });
    });
    sound.playClick();
    showToast('두 좌석의 위치를 맞바꿨습니다.');
  };

  // Shuffle logic (respecting locked seats)
  const handleShuffle = () => {
    if (isShuffling) return;

    recordHistory(seats);
    setIsShuffling(true);
    sound.playShuffle();

    // Identify unlocked seats and their pool of student IDs
    const unlockedSeats = seats.filter((s) => !s.isLocked);
    const pool = unlockedSeats.map((s) => s.studentId);

    // Shuffle pool using Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Animation timer for tactile anticipation
    setTimeout(() => {
      let poolIdx = 0;
      setSeats((prev) =>
        prev.map((s) => {
          if (s.isLocked) {
            return s;
          }
          const newStudentId = pool[poolIdx++];
          return { ...s, studentId: newStudentId };
        })
      );
      setIsShuffling(false);
      sound.playComplete();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      showToast('자리 배치가 완료되었습니다!');
    }, 850);
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0 || isShuffling) return;
    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSeats(lastState);
    sound.playClick();
    showToast('이전 자리 배치로 되돌렸습니다.');
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('기본 설정(24명, 4행 6열)으로 모든 좌석 배치를 초기화하시겠습니까?')) {
      recordHistory(seats);
      const initial = createDefaultData();
      setRows(initial.rows);
      setCols(initial.cols);
      setStudentCount(initial.studentCount);
      setStudents(initial.students);
      setSeats(initial.seats);
      setLayoutMode(initial.layoutMode);
      setSelectedSeat(null);
      showToast('기본 설정으로 초기화되었습니다.');
    }
  };

  // Save new settings from SettingsModal
  const handleSaveSettings = ({ rows: newRows, cols: newCols, studentCount: newCount, layoutMode: newMode }) => {
    recordHistory(seats);
    setRows(newRows);
    setCols(newCols);
    setLayoutMode(newMode);

    // Adjust students list if student count changed
    let updatedStudents = [...students];
    if (newCount > students.length) {
      const startNum = students.length + 1;
      for (let i = startNum; i <= newCount; i++) {
        updatedStudents.push({
          id: i,
          number: i,
          name: `${i}번 학생`
        });
      }
    } else if (newCount < students.length) {
      updatedStudents = updatedStudents.slice(0, newCount);
    }
    setStudents(updatedStudents);
    setStudentCount(newCount);

    // Regenerate seats preserving existing assignments if valid
    const totalSeatsCount = newRows * newCols;
    const newSeats = [];
    let seatIdx = 0;

    // Available student IDs
    const studentIds = updatedStudents.map((s) => s.id);
    let studentPoolIndex = 0;

    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const existing = seats.find((s) => s.row === r && s.col === c);
        const assignedStudentId =
          existing && existing.studentId && studentIds.includes(existing.studentId)
            ? existing.studentId
            : studentPoolIndex < studentIds.length
            ? studentIds[studentPoolIndex++]
            : null;

        newSeats.push({
          id: seatIdx++,
          row: r,
          col: c,
          studentId: assignedStudentId,
          isLocked: existing ? existing.isLocked : false
        });
      }
    }

    setSeats(newSeats);
    showToast(`교실 크기(${newRows}행 × ${newCols}열, ${newCount}명)가 적용되었습니다.`);
  };

  // Update student name inline
  const handleUpdateStudentName = (studentId, newName) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, name: newName } : s))
    );
  };

  // Bulk update from RosterModal
  const handleUpdateStudents = (newStudentsList) => {
    setStudents(newStudentsList);
    showToast('학생 명단이 업데이트되었습니다.');
  };

  // Unlock all seats
  const handleUnlockAll = () => {
    setSeats((prev) => prev.map((s) => ({ ...s, isLocked: false })));
    showToast('모든 좌석의 고정이 해제되었습니다.');
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.muted = nextMuted;
    showToast(nextMuted ? '효과음이 꺼졌습니다.' : '효과음이 켜졌습니다.');
  };

  // Toggle Layout Mode (single / pair / exam)
  const handleToggleLayoutMode = (mode) => {
    setLayoutMode(mode);
    showToast(mode === 'single' ? '짝 없이 단독 좌석으로 배치되었습니다.' : '2열 짝꿍 분단 형태로 배치되었습니다.');
  };

  // Toggle View Mode (teacher / student)
  const handleToggleViewMode = (mode) => {
    const nextMode = mode || (viewMode === 'teacher' ? 'student' : 'teacher');
    setViewMode(nextMode);
  };

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  const lockedCount = seats.filter((s) => s.isLocked && s.studentId).length;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-msg">
          <Check size={16} style={{ color: '#4ade80' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        studentCount={studentCount}
        lockedCount={lockedCount}
        rows={rows}
        cols={cols}
        viewMode={viewMode}
        layoutMode={layoutMode}
        isShuffling={isShuffling}
        canUndo={history.length > 0}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onShuffle={handleShuffle}
        onUndo={handleUndo}
        onReset={handleReset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onPrint={handlePrint}
        onToggleViewMode={handleToggleViewMode}
        onToggleLayoutMode={handleToggleLayoutMode}
      />

      {/* Print Document Header */}
      <PrintHeader classNameTitle={classNameTitle} studentCount={studentCount} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Blackboard & Podium */}
        <ClassroomBoard
          viewMode={viewMode}
          onToggleViewMode={() => handleToggleViewMode()}
        />

        {/* Seating Grid */}
        <SeatGrid
          rows={rows}
          cols={cols}
          seats={seats}
          studentsMap={studentsMap}
          selectedSeat={selectedSeat}
          isShuffling={isShuffling}
          viewMode={viewMode}
          layoutMode={layoutMode}
          onSelectSeat={handleSelectSeat}
          onToggleLock={handleToggleLock}
          onSwapSeats={handleSwapSeats}
          onUpdateStudentName={handleUpdateStudentName}
        />
      </main>

      {/* Swap Guidance Alert Banner */}
      {selectedSeat && (
        <div className="swap-alert-banner">
          <ArrowRightLeft size={18} style={{ color: '#60a5fa' }} />
          <span>
            <strong>
              {selectedSeat.studentId
                ? `${studentsMap[selectedSeat.studentId]?.name || selectedSeat.studentId + '번'} (${selectedSeat.row + 1}행 ${selectedSeat.col + 1}열)`
                : `빈 좌석 (${selectedSeat.row + 1}행 ${selectedSeat.col + 1}열)`}
            </strong>
            이(가) 선택되었습니다. 맞바꿀 다른 자리를 클릭하세요.
          </span>
          <button
            type="button"
            className="swap-alert-cancel-btn"
            onClick={() => setSelectedSeat(null)}
          >
            선택 취소
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentRows={rows}
        currentCols={cols}
        currentStudentCount={studentCount}
        currentLayoutMode={layoutMode}
        onSaveSettings={handleSaveSettings}
      />

      {/* Student Roster Modal */}
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        students={students}
        seats={seats}
        onUpdateStudents={handleUpdateStudents}
        onUnlockAll={handleUnlockAll}
      />
    </div>
  );
}
