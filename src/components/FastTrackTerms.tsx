import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface FastTrackTermsProps {
  onAccept: () => void;
  onDecline: () => void;
}

const FastTrackTerms: React.FC<FastTrackTermsProps> = ({ onAccept, onDecline }) => {
  const [hasAccepted, setHasAccepted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl"
    >
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold">Termo de Compromisso</h2>
            <p className="text-muted-foreground">
              Por favor, leia atentamente os termos abaixo antes de prosseguir com sua inscrição no Fast Track Digital.
            </p>
          </div>

          <Card className="border-primary/20">
            <ScrollArea className="h-96 p-6">
              <div className="space-y-6 text-sm leading-relaxed">
                <p className="font-semibold text-lg">
                  Ao me inscrever no Fast Track do Código F, declaro estar ciente e de acordo com os seguintes compromissos:
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">1. Participação e Dedicação</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Participar de, no mínimo, 75% das atividades previstas (palestras, tech labs, desafios e encontros).</li>
                      <li>Dedicar às atividades, estudos e desafios da trilha, incluindo aplicação prática dos aprendizados em meus projetos, desde que haja prévia comunicação ao gestor e à TI.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-2">2. Aprendizado Ativo e Ética</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Comprometer-se com exploração, curiosidade e aprendizado contínuo.</li>
                      <li>Respeitar princípios éticos, confidencialidade e propriedade intelectual, bem como diretrizes internas de cybersegurança, especialmente em atividades colaborativas.</li>
                      <li>Aplicar os aprendizados de forma prática, explorando ferramentas digitais e soluções de IA propostas pelo programa, integrando os conceitos do programa à minha prática, desde que haja prévia comunicação ao gestor e à TI.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-2">3. Acompanhamento e Feedback</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Estar disponível para mentorias, avaliações de progresso e sessões de feedback oferecidas pelo programa.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="accept-terms"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked === true)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="accept-terms" className="text-sm font-medium cursor-pointer">
                Li e concordo com os termos acima.
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={onAccept}
                disabled={!hasAccepted}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Aceitar e Continuar
              </Button>
              
              <Button
                onClick={onDecline}
                variant="outline"
                size="lg"
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Não tenho interesse
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FastTrackTerms;