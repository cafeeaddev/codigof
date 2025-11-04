import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const Quiz2Participant = () => {
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupMembers.trim() || !keyword.trim()) return;

    setIsSubmitting(true);
    try {
      await supabase
        .from('quiz2_submissions')
        .insert({
          group_name: groupName.trim(),
          group_members: groupMembers.trim(),
          keyword: keyword.trim()
        });

      setSubmitted(true);
      setGroupName('');
      setGroupMembers('');
      setKeyword('');

      // Allow submitting again after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <Card className="w-full max-w-md p-8 bg-[#1a1a2e] border-2 border-blue-500/30 shadow-lg shadow-blue-500/20">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          Nuvem de Desafios
        </h1>
        <p className="text-center text-cyan-300 mb-6">
          Compartilhe o maior desafio do seu grupo
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Nome do Grupo"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
                className="text-lg"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Input
                type="text"
                placeholder="Pessoas do Grupo"
                value={groupMembers}
                onChange={(e) => setGroupMembers(e.target.value)}
                maxLength={100}
                className="text-lg"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Input
                type="text"
                placeholder="Uma palavra-chave (ex: retrabalho)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                maxLength={30}
                className="text-lg"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Envie apenas uma palavra que represente seu desafio
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full text-lg py-6"
              disabled={!groupName.trim() || !groupMembers.trim() || !keyword.trim() || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Contribuição'}
            </Button>
          </form>
        ) : (
          <div className="text-center p-8 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-2xl font-bold text-cyan-400 mb-2">
              Contribuição enviada!
            </p>
            <p className="text-lg text-gray-300">
              Veja sua palavra no telão 👆
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
