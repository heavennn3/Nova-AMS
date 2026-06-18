import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Scan, Upload } from 'lucide-react';

interface RegistrationChoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: 'manual' | 'scan' | 'upload') => void;
}

export default function RegistrationChoiceModal({
  open,
  onClose,
  onSelect,
}: RegistrationChoiceModalProps) {
  const choices = [
    {
      id: 'manual' as const,
      icon: FileText,
      title: 'Manual Add',
      description: 'Fill in asset details manually using the registration form',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      id: 'scan' as const,
      icon: Scan,
      title: 'QR Scan',
      description: 'Scan QR codes or barcodes using device camera',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      id: 'upload' as const,
      icon: Upload,
      title: 'Bulk Upload',
      description: 'Upload spreadsheet or scan multiple items at once',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Registration Method</DialogTitle>
          <DialogDescription>
            Select how you want to register assets into the system
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          {choices.map((choice) => {
            const Icon = choice.icon;
            return (
              <button
                key={choice.id}
                onClick={() => onSelect(choice.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${choice.color} flex flex-col items-center text-center space-y-3 hover:scale-105 active:scale-95`}
              >
                <div className={`p-4 rounded-full bg-white ${choice.iconColor}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{choice.title}</h3>
                  <p className="text-sm opacity-80 mt-1">{choice.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}