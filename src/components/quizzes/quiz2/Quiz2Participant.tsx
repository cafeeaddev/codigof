import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const Quiz2Participant = () => {
  const [groupName, setGroupName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !keyword.trim()) return;

    setIsSubmitting(true);
    try {
      await supabase
        .from('quiz2_submissions')
        .insert({
          group_name: groupName.trim(),
          keyword: keyword.trim()
        });

      setSubmitted(true);
      setGroupName('');
      setKeyword('');

      // Allow submitting again after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600 p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Nuvem de Desafios
        </h1>
        <p className="text-center text-muted-foreground mb-6">
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
              disabled={!groupName.trim() || !keyword.trim() || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Contribuição'}
            </Button>
          </form>
        ) : (
          <div className="text-center p-8 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-2xl font-bold text-cyan-700 mb-2">
              Contribuição enviada!
            </p>
            <p className="text-lg text-cyan-600">
              Veja sua palavra no telão 👆
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
