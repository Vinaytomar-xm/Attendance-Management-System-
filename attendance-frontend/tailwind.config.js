/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1f2a44",
          soft: "#364266",
        },
        paper: {
          DEFAULT: "#f6f1e4",
          line: "#d8cdb0",
        },
        brass: {
          DEFAULT: "#b8862b",
          light: "#d9a94a",
        },
        stamp: {
          green: "#3f6e52",
          "green-dark": "#2c4f3b",
          red: "#a3392e",
          "red-dark": "#7c2a21",
          amber: "#b0791f",
          slate: "#5b6478",
        },
        ink2: "#241d12",
        muted: "#6b6250",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Space Grotesk", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        page: "10px",
      },
      boxShadow: {
        page: "0 1px 0 rgba(255,255,255,0.4) inset, 0 24px 48px -20px rgba(0,0,0,0.55)",
        card: "0 12px 32px -18px rgba(0,0,0,0.5)",
        stat: "0 12px 28px -16px rgba(0,0,0,0.45)",
        toast: "0 12px 30px -10px rgba(0,0,0,0.6)",
        "btn-primary": "0 6px 16px -6px rgba(31,42,68,0.6)",
        "brand-mark": "0 4px 10px rgba(184,134,43,0.4)",
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(#f6f1e4, #f6f1e4 37px, #d8cdb0 37px, #d8cdb0 38px)",
        "hero-glow":
          "radial-gradient(circle at 30% 20%, rgba(184,134,43,0.18), transparent 45%), linear-gradient(160deg, #223255, #1f2a44 60%)",
        "body-glow":
          "radial-gradient(circle at 15% 10%, rgba(184,134,43,0.08), transparent 40%)",
      },
    },
  },
  plugins: [],
};
