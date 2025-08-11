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
          <li>Tecnologia e ferramentas digitais</li>
          <li>Mindset digital</li>
          <li>Inteligência artificial e automatização de tarefas</li>
          <li>Raciocínio lógico e resolução de problemas</li>
        </ul>
        <p className="mt-3">Tudo isso sem julgamentos — você vai receber um espelho do seu momento atual.</p>
      </>
    ),
  },
  {
    q: "Q3: Por que esse diagnóstico é importante?",
    a: (
      <>
        <p className="mb-2">
          Este quiz marca a Etapa 1 de um programa mais amplo de aceleramento digital que será lançado oficialmente no final de agosto. Ele nos ajuda a entender o nível atual de maturidade digital dos colaboradores, permitindo que as próximas ações sejam mais personalizadas, direcionadas e eficazes.
        </p>
        <p className="mb-2">A partir dele será possível:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Planejar ações de nivelamento e desenvolvimento</li>
          <li>Identificar talentos para aprofundamento e possíveis Ninjas digitais</li>
          <li>Apoiar a evolução estratégica da transformação digital da empresa</li>
        </ul>
      </>
    ),
  },
  {
    q: "Q4: Quem deve participar?",
    a: "Todos os colaboradores da empresa estão convidados a jogar. Se você chegou até aqui, já está no caminho da evolução digital!",
  },
  {
    q: "Q5: Como o quiz será aplicado?",
    a: (
      <ul className="list-disc pl-5 space-y-1">
        <li>100% online</li>
        <li>Composto por 4 missões</li>
        <li>Apresentado em formato de jogo leve, com visual futurista</li>
        <li>Durante o jogo, você responde perguntas e ganha XP por engajamento.</li>
      </ul>
    ),
  },
  {
    q: "Q6: Existe tempo para concluir?",
    a: "Reserve cerca de 8 a 10 minutos. Após iniciar, o tempo para conclusão é contínuo — então escolha um momento tranquilo para jogar.",
  },
  {
    q: "Q7: Como serão definidos os níveis?",
    a: (
      <>
        <p className="mb-2">Com base nas suas respostas, você será classificado em um dos perfis:</p>
        <p>🟡 Beginner / Beginner+ • 🟠 Explorer • 🔵 Pro-Player • 🔴 Ninja</p>
        <p className="mt-2">Cada perfil vem com um espelho personalizado que ajuda a entender seus pontos fortes e próximos passos.</p>
      </>
    ),
  },
  {
    q: "Q8: Posso refazer o quiz?",
    a: "Não. O quiz é de tentativa única para garantir autenticidade. Mas fique tranquilo: não existem erros, só reflexos do seu momento atual.",
  },
  {
    q: "Q9: Quando receberei o resultado?",
    a: "Os resultados individuais e consolidados serão divulgados após a etapa de aplicação. Você será informado por e-mail ou canal interno.",
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
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
            Segredos do Código F
          </DialogTitle>
          <DialogDescription>
            Psiu! Aqui estão todos os detalhes que você queria saber sobre sua jornada digital.
          </DialogDescription>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx + 1}`}>
              <AccordionTrigger className="text-left">
                <span className="text-secondary font-medium">{item.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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
