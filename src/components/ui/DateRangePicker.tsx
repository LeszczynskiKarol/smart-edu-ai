// src/components/ui/DateRangePicker.tsx
interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    placeholder?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    value,
    onChange,
    placeholder
}) => (
    <div className="flex gap-2">
        <input
            type="date"
            value={value.start?.toISOString().split('T')[0] || ''}
            onChange={(e) =>
                onChange({ ...value, start: e.target.value ? new Date(e.target.value) : null })
            }
            className="w-full px-4 py-2 border rounded"
        />
        <input
            type="date"
            value={value.end?.toISOString().split('T')[0] || ''}
            onChange={(e) =>
                onChange({ ...value, end: e.target.value ? new Date(e.target.value) : null })
            }
            className="w-full px-4 py-2 border rounded"
        />
    </div>
);
