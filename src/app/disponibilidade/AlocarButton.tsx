'use client';

import { useState } from 'react';
import { ColabLivre } from '@/services/api';
import { AlocacaoManualWizard } from '@/components/alocacoes/AlocacaoManualWizard';
import { useRouter } from 'next/navigation';

interface AlocarButtonProps {
  colab: ColabLivre;
}

export function AlocarButton({ colab }: AlocarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setIsOpen(false);
    router.refresh(); // Recarrega a página para atualizar as horas livres e remover da lista se necessário
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium bg-brand-cyan text-white px-3 py-1.5 rounded-lg hover:bg-brand-teal transition-all"
      >
        Alocar
      </button>

      {isOpen && (
        <AlocacaoManualWizard
          colab={colab}
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
