import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, Users, Award } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: "Rápido e Eficiente",
    description: "Crie orçamentos profissionais em menos de 2 minutos"
  },
  {
    icon: Shield,
    title: "Seguro e Confiável", 
    description: "Seus dados protegidos com tecnologia de ponta"
  },
  {
    icon: Users,
    title: "Suporte Dedicado",
    description: "Atendimento brasileiro via WhatsApp quando precisar"
  },
  {
    icon: Award,
    title: "Resultados Comprovados",
    description: "Mais de 500+ assistências técnicas já confiam no Oliver"
  }
];

export const BenefitsSection = () => {
  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card 
              key={index} 
              className="glass-card text-center group hover:scale-105 transition-all duration-300" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mx-auto flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                  {benefit.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};