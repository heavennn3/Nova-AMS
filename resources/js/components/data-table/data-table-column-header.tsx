import type { Column } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<
    TData,
    TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
    configId?: number;
    isAdmin?: boolean;
    onTitleChange?: (configId: number, newTitle: string) => void;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
    configId,
    isAdmin,
    onTitleChange,
}: DataTableColumnHeaderProps<TData, TValue>) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);

    const handleSave = async () => {
        const newTitle = editValue.trim();

        if (!newTitle || newTitle === title || !configId) {
            setEditing(false);
            setEditValue(title);

            return;
        }

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch(`/master-data/table-configurations/${configId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token, Accept: 'application/json' },
                body: JSON.stringify({ column_title: newTitle }),
            });

            if (!res.ok) {
throw new Error('Failed to rename');
}

            toast.success('Column renamed successfully');
            onTitleChange?.(configId, newTitle);
            setEditing(false);
        } catch {
            toast.error('Failed to rename column');
            setEditValue(title);
            setEditing(false);
        }
    };

    if (editing) {
        return (
            <div className={cn('flex items-center gap-1', className)}>
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
handleSave();
}

                        if (e.key === 'Escape') {
 setEditValue(title); setEditing(false); 
}
                    }}
                    className="h-7 w-40 text-xs px-2"
                    autoFocus
                />
                <button onClick={handleSave} className="p-1 hover:text-green-600"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => {
 setEditValue(title); setEditing(false); 
}} className="p-1 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
            </div>
        );
    }

    return (
        <div
            className={cn(className)}
            onDoubleClick={() => isAdmin && configId && (setEditValue(title), setEditing(true))}
            style={isAdmin && configId ? { cursor: 'pointer' } : undefined}
        >
            {title}
        </div>
    );
}
