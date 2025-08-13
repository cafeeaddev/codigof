import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecretFAQDialogProps {
  children: React.ReactNode;
}

const faqs = [
  {
    q: "Q1: O que é essa etapa do quiz?",
    a:
      "É o ponto de partida da nossa jornada de transformação digital. Você vai participar de um quiz online em formato de game, com desafios interativos e personalizados, guiado pela Cody — sua IA mentora. O objetivo é diagnosticar o seu nível de maturidade digital de forma leve, divertida e estratégica.",
  },
  {
    q: "Q2: Quais temas são abordados no quiz?",
    a: (
      <>
        <p className="mb-2">O quiz avalia conhecimentos e habilidades relacionados a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tecnologia e ferramentas digitais;</li>
          <li>Mindset digital;</li>
          <li>Inteligência artificial e automatização de tarefas;</li>
          <li>Raciocínio lógico e resolução de problemas;</li>
        </ul>
      </>
    ),
  },
  {
    q: "Q3: Por que esse diagnóstico é importante?",
    a: (
      <>
        <p className="mb-2">
          Este quiz marca o início de um programa mais amplo de aceleramento digital que será lançado oficialmente no final de agosto.
        </p>
        <p className="mb-2">
          Ele nos ajuda a entender o nível atual de maturidade digital dos colaboradores, permitindo que as próximas ações sejam mais personalizadas, direcionadas e eficazes.
        </p>
        <p className="mb-2">A partir dele será possível:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Planejar ações de nivelamento e desenvolvimento;</li>
          <li>Identificar talentos para aprofundamento e possíveis Ninjas digitais;</li>
          <li>Apoiar a evolução estratégica da transformação digital da empresa.</li>
        </ul>
      </>
    ),
  },
  {
    q: "Q4: Quem deve participar?",
    a: "Todos os colaboradores da empresa devem responder o quiz.",
  },
  {
    q: "Q5: Como o quiz será aplicado?",
    a: "O quiz será 100% online, com acesso por meio de um link enviado por e-mail e Teams. Durante o jogo, você responde perguntas e ganha XP por engajamento.",
  },
  {
    q: "Q6: Existe tempo para concluir?",
    a: "Reserve cerca de 8 a 10 minutos. Você pode salvar o seu progresso e completá-lo mais tarde. Porém, àqueles que responder no primeiro dia receberão pontuação adicional e concorrerão a prêmios no programa Código F.",
  },
  {
    q: "Q8: Posso refazer o quiz?",
    a: "Não. O quiz é de tentativa única para garantir autenticidade. Mas fique tranquilo: não existem erros, só reflexos do seu momento atual.",
  },
  {
    q: "Q9: Quando receberei o resultado?",
    a: "Ao final do quiz você receberá o resultado do seu quiz com base no nível de maturidade digital identificado. Aproveite para compartilhar com colegas e nas suas redes.",
  },
  {
    q: "Q10: Com quem falo em caso de dúvidas?",
    a: "Caso tenha dúvidas ou dificuldades de acesso, entre em contato com o nosso time pelo canal [e-mail ou canal interno].",
  },
];

export const SecretFAQDialog: React.FC<SecretFAQDialogProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-purple bg-clip-text text-transparent">
            Segredos do Código F
          </DialogTitle>
          <DialogDescription>
            Psiu! Aqui estão todos os detalhes que você queria saber sobre sua jornada digital.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx + 1}`}>
                <AccordionTrigger className="text-left">
                  <span className="text-secondary font-medium">{item.q.replace(/^Q\d+:\s*/, "")}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>

        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecretFAQDialog;
