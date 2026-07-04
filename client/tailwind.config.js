/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0E8",
        cream2: "#EDE7D9",
        cream3: "#E2D9C8",
        white2: "#FFFDF8",
        ink: "#1A1208",
        ink2: "#3D2E18",
        muted: "#7A6A52",
        muted2: "#B0A08A",
        orange: "#E8650A",
        "orange-deep": "#C4500A",
        "orange-s": "#FDF0E6",
        "orange-mid": "#F28A3C",
        amber: "#F0A830",
        "amber-s": "#FEF6E0",
        green: "#2D7A4F",
        "green-s": "#E6F5ED",
        violet: "#6D3AC7",
        "violet-s": "#EDE8FA",
        coral: "#D63B3B",
        "coral-s": "#FDEAEA",
        border: "#DDD3C2",
        border2: "#C8BB9F",
      },
      fontFamily: {
        display: ["'Clash Display'", "sans-serif"],
        body: ["'Bricolage Grotesque'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

