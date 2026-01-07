import { useState, useMemo } from 'react'
import './Profile.css'
import { useGetProfileIdQuery } from '@/features/users/api/usersApi'
import { Mail, User, Wrench } from 'lucide-react'

export const Profile = () => {
    const { data: profile, isLoading } = useGetProfileIdQuery()
    const [open, setOpen] = useState(false)

    const initials = useMemo(() => {
        if (!profile?.user_name) return '??'
        return profile.user_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }, [profile])

    const toggle = () => setOpen(o => !o)

    const devTypeLabel = useMemo(() => {
        const map: Record<string, string> = {
            frontend: 'Frontend',
            backend: 'Backend',
            fullstack: 'Fullstack',
            devops: 'DevOps',
            mobile: 'Mobile',
            data: 'Data',
            qa: 'QA',
            pm: 'PM',
            designer: 'Designer',
            other: 'Other',
        }
        const key = (profile?.developer_type || 'other').toLowerCase()
        return map[key] ?? key
    }, [profile?.developer_type])

    return (
        <div className='profile'>
            <div
                className='profile__avatar'
                title={ profile?.email || 'User Profile' }
                onClick={ toggle }
            >
                { isLoading ? '...' : initials }
            </div>

            { open && (
                <div className='profile__popup'>
                    <div className='profile__popup-title'>Profile</div>
                    <div className='profile__popup-row'>
                        <User size={ 16 } />
                        <span className='profile__popup-label'>Username</span>
                        <span className='profile__popup-value'>{ profile?.user_name || '-' }</span>
                    </div>
                    <div className='profile__popup-row'>
                        <Mail size={ 16 } />
                        <span className='profile__popup-label'>Email</span>
                        <span className='profile__popup-value'>{ profile?.email || '-' }</span>
                    </div>
                    <div className='profile__popup-row'>
                        <Wrench size={ 16 } />
                        <span className='profile__popup-label'>Developer</span>
                        <span className='profile__popup-value'>{ devTypeLabel }</span>
                    </div>
                </div>
            ) }
        </div>
    )
}
