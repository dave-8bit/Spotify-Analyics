import type { TimeRange } from '../types';

interface Props {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const OPTIONS: { label: string; value: TimeRange }[] = [
  { label: 'Last 7 days', value: 'one_week' },
  { label: 'Last 4 weeks', value: 'short_term' },
  { label: 'Last 6 months', value: 'medium_term' },
  { label: 'All time', value: 'long_term' },
];

export default function TimeRangeSelector({ value, onChange }: Props) {
  return (
    <div className="time-range-selector">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`time-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
