import type { ReactNode } from "react";

import authBackground from "../assets/images/auth-background.jpg";
import mixifootFigure from "../assets/images/mixifoot-figure.png";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 bg-auth-shell overflow-hidden">
      {/* Background Image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${authBackground})` }}
      />
      {/* Radial overlay to keep the glowing green theme */}
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_18%,rgba(8,130,70,0.45),transparent_40%),radial-gradient(circle_at_86%_82%,rgba(11,78,43,0.5),transparent_45%)]"
      />

      <div className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-auth-panel border border-white/10 bg-black/40 shadow-auth-shell backdrop-blur-md px-6 py-8 sm:px-9 sm:py-9 flex flex-col gap-5">
        <header className="flex items-center justify-center gap-3.5 text-left">
          <img
            src={mixifootFigure}
            alt="MIXIFOOT figure"
            className="h-[60px] w-[66px] rounded-md object-cover flex-shrink-0"
          />
          <div className="flex flex-col">
            <p className="font-body text-[13px] font-bold tracking-wider leading-none text-white/60 uppercase">
              Công ty AMIXI
            </p>
            <p className="font-display text-[48px] font-normal leading-none text-white tracking-widest mt-1">
              MIXIFOOT
            </p>
          </div>
        </header>

        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

