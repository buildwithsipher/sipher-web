// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-white/60">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© {new Date().getFullYear()} Sipher Technologies Pvt. Ltd.</p>
          <p className="text-white/40">Proof. Not Pedigree.</p>
        </div>
      </div>
    </footer>
  );
}
