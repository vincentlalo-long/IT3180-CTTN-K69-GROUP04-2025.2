import type { ReactNode } from "react";

import authBackground from "../assets/images/auth-background.jpg";
import mixifootFigure from "../assets/images/mixifoot-figure.png";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-auth-shell">
      <div className="mx-auto min-h-screen w-full max-w-[1536px] px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto grid min-h-[calc(100vh-24px)] w-full overflow-hidden rounded-auth-panel border border-white/15 bg-black/25 shadow-auth-shell backdrop-blur-[1px] lg:grid-cols-[minmax(0,1fr)_minmax(370px,655px)]">
          <section className="relative hidden min-h-[340px] lg:block">
            <img
              src={authBackground}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/50" />
          </section>

          <section className="relative flex w-full flex-col bg-gradient-to-b from-auth-panel-start to-auth-panel-end px-[24px] py-[24px] sm:px-[40px] sm:py-[34px] lg:px-[50px] lg:py-[46px]">
            <header className="flex items-center gap-4 sm:gap-6">
              <img
                src={mixifootFigure}
                alt="MIXIFOOT figure"
                className="h-[86px] w-[95px] rounded-md object-cover sm:h-[114px] sm:w-[126px]"
              />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[40px] font-normal leading-none text-white sm:text-[48px]">
                  Công ty AMIXI
                </p>
                <p className="font-display text-[100px] font-normal leading-none text-white sm:text-[120px]">
                  MIXIFOOT
                </p>
              </div>
            </header>

            <div className="mt-8 flex flex-1 items-start sm:mt-10 lg:mt-12">
              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
