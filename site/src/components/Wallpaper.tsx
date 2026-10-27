/* Win7-style wallpaper drawn in code: deep blue, a bright center and
   sweeping light streaks. No Microsoft artwork or logo. */
function Wallpaper() {
  const streaks = [
    { d: "M-100 760 C 300 640, 640 520, 900 380 S 1300 120, 1560 40", w: 120, o: 0.16 },
    { d: "M-100 820 C 340 700, 700 590, 960 450 S 1340 200, 1560 120", w: 46, o: 0.22 },
    { d: "M-100 880 C 380 760, 760 650, 1010 520 S 1380 280, 1560 210", w: 14, o: 0.45 },
    { d: "M-100 700 C 260 600, 600 470, 860 330 S 1260 60, 1560 -20", w: 6, o: 0.5 },
    { d: "M-100 930 C 420 820, 800 720, 1060 590 S 1420 360, 1560 300", w: 3, o: 0.55 },
  ];

  return (
    <div className="wallpaper" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="streak" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0" stopColor="#bfe9ff" stopOpacity="0" />
            <stop offset=".35" stopColor="#e6f7ff" stopOpacity="1" />
            <stop offset=".75" stopColor="#ffffff" stopOpacity=".8" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="streakBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        {streaks.map((s, i) => (
          <path
            key={i}
            d={s.d}
            stroke="url(#streak)"
            strokeWidth={s.w}
            strokeOpacity={s.o}
            fill="none"
            strokeLinecap="round"
            filter={s.w > 20 ? "url(#streakBlur)" : undefined}
          />
        ))}
      </svg>
    </div>
  );
}

export default Wallpaper;
