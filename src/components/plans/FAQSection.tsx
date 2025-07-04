import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: "Como funciona o período de teste?",
    answer: "Você tem 7 dias para testar todas as funcionalidades gratuitamente."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Não há fidelidade. Cancele quando quiser pelo WhatsApp."
  },
  {
    question: "O suporte está incluso?",
    answer: "Sim! Suporte completo via WhatsApp está incluído em todos os planos."
  },
  {
    question: "Funciona no celular?",
    answer: "Perfeitamente! O sistema é responsivo e funciona em qualquer dispositivo."
  }
];

export const FAQSection = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
      <div className="text-center mb-12">
        <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
          Perguntas Frequentes
        </h3>
        <p className="text-muted-foreground text-lg">
          Tire suas dúvidas sobre o Oliver
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="glass-card transition-all duration-300">
            <CardContent className="p-0">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)} 
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-foreground">{faq.question}</h4>
                  <div className={`transform transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              {expandedFaq === index && (
                <div className="px-6 pb-6 animate-fade-in">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};