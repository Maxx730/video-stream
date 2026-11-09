import '../css/HolidayLights.css';

const BULB_COLORS = ['red', 'gold', 'green', 'blue'];

// Render inside an element with the holiday-frame class, and outside anything
// that clips its overflow.
export const HolidayLights = () => (
    <svg className="holiday-lights" aria-hidden="true">
        <rect className="holiday-wire" width="100%" height="100%" rx="10" />
        {BULB_COLORS.map(color => (
            <rect key={color} className={`holiday-bulbs ${color}`} width="100%" height="100%" rx="10" />
        ))}
    </svg>
);
