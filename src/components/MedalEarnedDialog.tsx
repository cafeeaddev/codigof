import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Medal } from "lucide-react";

interface MedalEarnedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionLabel: string; // e.g., "Missão 1"
  xp: number; // e.g., 25
}

export const MedalEarnedDialog: React.FC<MedalEarnedDialogProps> = ({ open, onOpenChange, missionLabel, xp }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" aria-hidden="true" />
            Medalha conquistada!
          </DialogTitle>
          <DialogDescription>
            {missionLabel} concluída com sucesso. Você ganhou +{xp} XP.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedalEarnedDialog;
