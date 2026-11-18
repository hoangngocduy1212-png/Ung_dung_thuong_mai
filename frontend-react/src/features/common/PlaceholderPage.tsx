import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Construction, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  subsystem: string;
  phase: string;
  description: string;
  vanillaLink?: string;
  vanillaLinkLabel?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subsystem,
  phase,
  description,
  vanillaLink,
  vanillaLinkLabel = 'Mở tính năng trên Vanilla Frontend (Port 5500)',
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="flex flex-col items-center text-center py-8 px-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
            <Construction className="w-8 h-8" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="amber">{phase}</Badge>
            <span className="text-xs text-[#78889b]">Phân hệ: {subsystem}</span>
          </div>

          <h2 className="text-2xl font-bold text-[#17283e] mb-2">{title}</h2>
          <p className="text-sm text-[#78889b] max-w-lg mb-6 leading-relaxed">
            {description}
          </p>

          <div className="bg-slate-50 border border-[#e6edf5] rounded-xl p-4 max-w-md w-full text-left mb-6 text-xs text-[#17283e] space-y-2">
            <p className="font-semibold text-[#1267d5]">Trạng thái kỹ thuật hiện tại:</p>
            <ul className="list-disc list-inside space-y-1 text-[#78889b]">
              <li>Nền tảng React Route & Route Guard đã được thiết lập.</li>
              <li>Backend API đã hoàn thiện và sẵn sàng kết nối.</li>
              <li>Frontend Vanilla hiện tại vẫn hoạt động ổn định và đầy đủ chức năng.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>

            {vanillaLink && (
              <a href={vanillaLink} target="_blank" rel="noreferrer">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                >
                  {vanillaLinkLabel}
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
