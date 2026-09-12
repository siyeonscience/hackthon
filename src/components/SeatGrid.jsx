import React, { useState } from 'react';
import SeatCard from './SeatCard';

export default function SeatGrid({
  rows,
  cols,
  seats,
  studentsMap,
  selectedSeat,
  isShuffling,
  viewMode,
  layoutMode,
  onSelectSeat,
  onToggleLock,
  onSwapSeats,
  onUpdateStudentName
}) {
  const [draggedSeat, setDraggedSeat] = useState(null);

  const handleDragStart = (e, seat) => {
    setDraggedSeat(seat);
    e.dataTransfer.setData('text/plain', seat.id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetSeat) => {
    e.preventDefault();
    if (draggedSeat && draggedSeat.id !== targetSeat.id) {
      onSwapSeats(draggedSeat.id, targetSeat.id);
    }
    setDraggedSeat(null);
  };

  // Organize seats by row and col
  // In student view mode, columns are reversed (left-right mirror) to reflect looking forward towards the board
  const renderedRows = [];
  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    for (let c = 0; c < cols; c++) {
      const actualCol = viewMode === 'student' ? cols - 1 - c : c;
      const seat = seats.find((s) => s.row === r && s.col === actualCol);
      if (seat) {
        rowSeats.push(seat);
      }
    }
    renderedRows.push(rowSeats);
  }

  return (
    <div className="grid-stage">
      <div className={`classroom-grid-container mode-${layoutMode}`}>
        {renderedRows.map((rowSeats, rowIndex) => (
          <div key={`row-${rowIndex}`} className="seat-row">
            {rowSeats.map((seat, colIndex) => {
              const student = seat.studentId ? studentsMap[seat.studentId] : null;
              const isSelected = selectedSeat?.id === seat.id;

              // If layoutMode is 'pair', add aisle spacing after every 2 columns (except the last column)
              const isAisleEdge =
                layoutMode === 'pair' &&
                (colIndex + 1) % 2 === 0 &&
                colIndex + 1 < cols;

              return (
                <div
                  key={seat.id}
                  className="seat-cell-wrapper"
                  style={{
                    marginRight: isAisleEdge ? '28px' : '0'
                  }}
                >
                  <SeatCard
                    seat={seat}
                    student={student}
                    isSelected={isSelected}
                    isShuffling={isShuffling}
                    onSelect={onSelectSeat}
                    onToggleLock={onToggleLock}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onUpdateStudentName={onUpdateStudentName}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
