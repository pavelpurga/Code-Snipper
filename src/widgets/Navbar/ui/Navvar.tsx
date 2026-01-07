import { Code2, Menu } from 'lucide-react';
import './Navbar.css';
import { LangSwitcher } from '@/shared/ui/LangSwitcher/ui/LangSwither.tsx';
import { ThemeSwitcher } from '@/shared/ui/ThemeSwitcher/ui/ThemeSwitcher'
import { Profile } from '@/widgets/Profile/ui/Profile'
import { useDispatch } from 'react-redux'
import { toggleSidebar } from '@/app/providers/store/store'

export const Navbar = () => {
    const dispatch = useDispatch()

    return (
        <header className='navbar'>
            <div className='navbar__left'>
                <button className='navbar__burger' aria-label='Open sidebar' onClick={ () => dispatch(toggleSidebar()) }>
                    <Menu size={ 22 } />
                </button>
                <div className='navbar__logo'>
                    <Code2 size={ 24 } color='#ffffff' />
                    <span>SnippetBox</span>
                </div>
            </div>
            <div className='navbar__actions'>
                <LangSwitcher/>
                <ThemeSwitcher/>
                <Profile/>
            </div>
        </header>
    );
};