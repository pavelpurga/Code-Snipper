import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface CreateSnippetButtonProps {
    onClick: () => void;
    className?: string;
}

export const CreateSnippetButton = ({ onClick, className }: CreateSnippetButtonProps) => {
    return (
        <Button
            onClick={ onClick }
            className={ cn(
                'flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all active:scale-95 shadow-sm',
                className
            ) }
        >
            <Plus size={ 18 } />
            <span>Новый сниппет</span>
        </Button>
    );
};