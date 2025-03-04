import Image from "next/image";
import React, { useState } from "react";
import { Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";

export default function Header() {

    const [active, setActive] = useState<string | null>(null);

    return (
    <>
        <div className="fixed top-11 right-5 z-51 md:top-1/130">
            <a href="https://github.com/ruk13xa" target="_blank"><Image src={'/assets/github-mark-white.svg'} alt="logo" width={25} height={25} /></a>
        </div>

        <header className="fixed hidden md:block top-0 z-1">
            <nav className="bg-black flex justify-center w-screen opacity-90 backdrop-blur-2xl">
                <ul className="text-white flex gap-x-30 font-scdream">
                    <li className="relative table-cell py-2"><a className="inline-block relative no-underline after-line" href="#">소개</a></li>
                    <li className="relative table-cell py-2"><a className="inline-block relative no-underline after-line" href="#">포트폴리오</a></li>
                    <li className="relative table-cell py-2"><a className="inline-block relative no-underline after-line" href="https://velog.io/@ruk13xa" target="_blank">블로그</a></li>
                    <li className="relative table-cell py-2"><a className="inline-block relative no-underline after-line" href="#">프로젝트</a></li>
                </ul>
            </nav>
        </header>

    <div className="fixed top-5 inset-x-0 max-w-2xl mx-auto z-50 md:hidden">
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="소개">
            <a href="#"></a>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="포트폴리오">
            <a href="#"></a>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="블로그">
            <a href="#"></a>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="프로젝트">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="CMS Portal"
              href="https://cms.ruka.my"
              src="https://github.com/cms-md/cmsportal"
              description="Prepare for tech interviews like never before."
            />
          </div>
        </MenuItem>
        {/* <MenuItem setActive={setActive} active={active} item="Pricing">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/hobby">Hobby</HoveredLink>
            <HoveredLink href="/individual">Individual</HoveredLink>
            <HoveredLink href="/team">Team</HoveredLink>
            <HoveredLink href="/enterprise">Enterprise</HoveredLink>
          </div>
        </MenuItem> */}
      </Menu>
      </div>
    </>
    )
}