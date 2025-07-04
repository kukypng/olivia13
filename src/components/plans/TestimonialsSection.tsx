import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Proprietário - TechRepair",
    content: "O Oliver transformou minha assistência. Agora consigo fazer orçamentos profissionais em minutos!",
    rating: 5
  },
  {
    name: "Ana Maria",
    role: "Gerente - CelFix", 
    content: "Sistema incrível! Organização total dos clientes e orçamentos. Recomendo muito!",
    rating: 5
  },
  {
    name: "João Santos",
    role: "Técnico - MobileTech",
    content: "Interface simples e funcional. Perfeito para quem quer profissionalizar o negócio.",
    rating: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="stagger-item"
            style={{ animationDelay: `${0.6 + index * 0.1}s` }}
          >
            <Card className="card-interactive text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 fill-primary text-primary icon-bounce transition-all duration-200" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic animate-fade-in">"{testimonial.content}"</p>
                <div className="animate-slide-up">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};