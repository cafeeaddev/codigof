import { QRCodeSVG } from 'qrcode.react';
import { Users } from 'lucide-react';

interface Quiz1QRCodeProps {
  url: string;
  participantCount: number;
}

export const Quiz1QRCode = ({ url, participantCount }: Quiz1QRCodeProps) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <QRCodeSVG
          value={url}
          size={300}
          level="H"
          includeMargin
        />
      </div>
      
      <div className="flex items-center gap-3 text-4xl font-bold">
        <Users className="w-10 h-10" />
        <span>{participantCount} participantes conectados</span>
      </div>
    </div>
  );
};
