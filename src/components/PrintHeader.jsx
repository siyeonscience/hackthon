import React from 'react';

export default function PrintHeader({ classNameTitle = '학급 좌석 배치표', studentCount }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 기준`;

  return (
    <div className="print-only print-header">
      <h1 className="print-title">{classNameTitle}</h1>
      <p className="print-date">{dateStr} (총 학생 {studentCount}명)</p>
      <div className="print-blackboard">
        칠 판 ( 앞 / FRONT )
      </div>
    </div>
  );
}
