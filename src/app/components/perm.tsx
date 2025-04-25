'use client';

import { useState } from 'react';
import data from '@/data/perm.json';
import dayMap from '@/data/days.json';
import { differenceInMinutes, isBefore, isAfter } from 'date-fns';

const roundUpToHour = (minutes: number) => Math.ceil(minutes / 60);
const generateHourOptions = () => {
  const hours: string[] = [];
  for (let i = 9; i <= 23; i++) {
    hours.push(i.toString().padStart(2, '0') + ':00');
  }
  hours.push('23:59');
  return hours;
};

const Perm = () => {
  const [beginDay, setBeginDay] = useState('');
  const [beginHour, setBeginHour] = useState('09:00');
  const [endDay, setEndDay] = useState('');
  const [endHour, setEndHour] = useState('23:59');
  const [missedHoursGraph, setMissedHoursGraph] = useState<number | null>(null);
  const [missedHoursRush, setMissedHoursRush] = useState<number | null>(null);

  const getDateFromDay = (day: string) => {
    const found = dayMap.find(d => d.day === day);
    return found?.date || '';
  };

  const calculateMissedTime = () => {
    const beginDate = getDateFromDay(beginDay);
    const endDate = getDateFromDay(endDay);

    if (!beginDate || !endDate) {
      alert("Please select both start and end days.");
      return;
    }

    const startTime = new Date(`${beginDate}T${beginHour}`);
    const endTime = new Date(`${endDate}T${endHour === '00:00' ? '23:59' : endHour}`);

    let totalMissedMinutesGraph = 0;
    let totalMissedMinutesRush = 0;

    data.forEach(session => {
      const sessionStart = new Date(session.start);
      const sessionEnd = new Date(session.end);

      if (isBefore(sessionEnd, startTime) || isAfter(sessionStart, endTime)) {
        return;
      }

      let time_before = differenceInMinutes(startTime, sessionStart);
      time_before = time_before < 0 ? 0 : time_before;

      let time_after = differenceInMinutes(sessionEnd, endTime);
      time_after = time_after < 0 ? 0 : time_after;

      const time = differenceInMinutes(sessionEnd, sessionStart) - time_after - time_before;

      if (session.type === 'graph') {
        totalMissedMinutesGraph += time;
      } else {
        totalMissedMinutesRush += time;
      }
    });

    setMissedHoursGraph(roundUpToHour(totalMissedMinutesGraph));
    setMissedHoursRush(roundUpToHour(totalMissedMinutesRush));
  };

  const dayOptions = dayMap.map(({ day }) => (
    <option key={day} value={day}>{day}</option>
  ));

  const hourOptions = generateHourOptions().map(time => (
    <option key={time} value={time}>{time}</option>
  ));

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4 bg-white rounded-2xl mt-20">
      <h1 className="text-xl font-bold text-gray-900">Calculateur de decalage JS</h1>

      <div className="space-y-2">
        <label className='text-gray-900'>Start Day</label>
        <select value={beginDay} onChange={e => setBeginDay(e.target.value)} className="w-full border p-2 rounded text-gray-900">
          <option value="">Select start day</option>
          {dayOptions}
        </select>

        <label className='text-gray-900'>Start Hour</label>
        <select value={beginHour} onChange={e => setBeginHour(e.target.value)} className="w-full border p-2 rounded text-gray-900">
          {hourOptions}
        </select>
      </div>

      <div className="space-y-2">
        <label className='text-gray-900'>End Day</label>
        <select value={endDay} onChange={e => setEndDay(e.target.value)} className="w-full border p-2 rounded text-gray-900">
          <option value="">Select end day</option>
          {dayOptions}
        </select>

        <label className='text-gray-900'>End Hour</label>
        <select value={endHour} onChange={e => setEndHour(e.target.value)} className="w-full border p-2 rounded text-gray-900">
          {hourOptions}
        </select>
      </div>

      <button onClick={calculateMissedTime} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Calculate
      </button>

      {missedHoursGraph !== null && (
        <p className="mt-4 text-lg font-semibold text-gray-900">
          Missed Graph: {missedHoursGraph} hour{missedHoursGraph !== 1 ? 's' : ''}
        </p>
      )}
      {missedHoursRush !== null && (
        <p className="text-lg font-semibold text-gray-900">
          Missed Rush: {missedHoursRush} hour{missedHoursRush !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default Perm;
