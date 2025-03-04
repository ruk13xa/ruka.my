'use client';

import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Moon, Sun, Monitor, Dot } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { useTheme } from 'next-themes';

const ThemeSwitch = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
   
    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => { setMounted(true) }, []);
   
    if (!mounted) return null;
   
    const Item = ({ t, Icon, label }: { t: string, Icon: React.ComponentType<{ width: number }>, label: string }) => (
        <DropdownMenuItem onClick={() => setTheme(t)} >
            <div className='flex items-center gap-2 mx-1.5 my-0.5'>
                <div className='text-xs'>{label}</div>
                {theme === t ? ((<div className='inline-flex'><Icon width={12} /> <Dot /></div>)) : (<Icon width={12} />)}
            </div>
        </DropdownMenuItem>
    );
   
    return (
    <div className='fixed bottom-4 right-4 z-1'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='default'>
            <div className='flex items-center gap-0.5'>
                <Sun /> /
                <Moon />
            </div>
            <span className='sr-only'>Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <Item t='light' label='Light' Icon={Sun} />
          <Item t='dark' label='Dark' Icon={Moon} />
          <Item t='system' label='System' Icon={Monitor} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    );
  };
   
  export default ThemeSwitch;