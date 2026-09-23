
export default function Footer() {
  return (
    <footer className="flex items-center justify-center px-4 py-2 backdrop-blur-md">
      <span className="text-center text-paper-line text-xs pb-6">
        @ {new Date().getFullYear()} Built with Vinay Singh Tomar
      </span>
    </footer>
  );
}
