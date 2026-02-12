'use client';

import { useState, useMemo } from 'react';

interface CalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = Jan, 11 = Dec
  const [currentYear] = useState(2026);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentMonth, currentYear]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentMonth, currentYear]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
  };

  const handleSelectDay = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split('T')[0];
    onSelectDate(dateStr);
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate || !day) return false;
    const [year, month, dayStr] = selectedDate.split('-');
    return (
      parseInt(year) === currentYear &&
      parseInt(month) - 1 === currentMonth &&
      parseInt(dayStr) === day
    );
  };

  return (
    <div className="calendar">
      <div className="calendarHeader">
        <button className="calendarNav" onClick={handlePrevMonth}>←</button>
        <h2 className="calendarTitle">
          {monthNames[currentMonth]} de {currentYear}
        </h2>
        <button className="calendarNav" onClick={handleNextMonth}>→</button>
      </div>

      <div className="calendarWeekdays">
        {weekDayNames.map(day => (
          <div key={day} className="calendarWeekday">{day}</div>
        ))}
      </div>

      <div className="calendarDays">
        {days.map((day, idx) => (
          <button
            key={idx}
            className={`calendarDay ${day ? 'active' : 'empty'} ${isSelectedDate(day!) ? 'selected' : ''}`}
            onClick={() => day && handleSelectDay(day)}
            disabled={!day}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
