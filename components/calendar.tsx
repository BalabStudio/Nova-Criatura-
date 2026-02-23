'use client';

import { useState, useMemo } from 'react';

interface CalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

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
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
