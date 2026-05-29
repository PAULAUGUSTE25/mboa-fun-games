'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Crown, Palette, Zap } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { PremiumCard } from '@/components/mboa/premium-card';
import { GemsBadge } from '@/components/mboa/gems-badge';
import { formatGems } from '@/lib/format';

const storeItems = [
  {
    id: '1',
    name: 'Pack Starter',
    description: '1 000 Gems pour bien démarrer',
    price: 100,
    gems: 1000,
    icon: Sparkles,
    popular: true,
  },
  {
    id: '2',
    name: 'Pack Premium',
    description: '5 000 Gems + badge exclusif',
    price: 450,
    gems: 5000,
    icon: Crown,
    bonus: 'Badge Premium',
  },
  {
    id: '3',
    name: 'Pack Légende',
    description: '15 000 Gems + avatar unique',
    price: 1200,
    gems: 15000,
    icon: Zap,
    bonus: 'Avatar Légende',
  },
];

const cosmetics = [
  {
    id: 'c1',
    name: 'Thème Savannah',
    description: 'Ambiance savane camerounaise',
    price: 200,
    icon: Palette,
  },
  {
    id: 'c2',
    name: 'Thème Royal',
    description: 'Style palais traditionnel',
    price: 300,
    icon: Crown,
  },
];

export default function StorePage() {
  return (
    <PageShell
      topBarProps={{
        username: 'Joueur',
        gems: 500,
        title: 'Store',
      }}
    >
      <div className="py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold wood-text">Store</h1>
            <p className="text-mboa-text-muted text-sm">
              Achète des Gems et débloque du contenu exclusif
            </p>
          </div>
          
          <GemsBadge gems={500} size="lg" />
        </div>

        {/* Gems Packs */}
        <section>
          <h2 className="text-lg font-bold wood-text mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-mboa-gold" />
            Packs de Gems
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeItems.map((item) => {
              const Icon = item.icon;
              return (
                <PremiumCard
                  key={item.id}
                  glowColor={item.popular ? 'gold' : 'emerald'}
                  className="relative"
                >
                  {item.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-mboa-gold text-mboa-surface text-xs font-bold">
                      Populaire
                    </div>
                  )}
                  
                  <div className="text-center py-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                      item.popular 
                        ? 'bg-mboa-gold/10 border border-mboa-gold/30' 
                        : 'bg-mboa-primary/10 border border-mboa-primary/30'
                    }`}>
                      <Icon className={`h-8 w-8 ${item.popular ? 'text-mboa-gold' : 'text-mboa-primary'}`} />
                    </div>
                    
                    <h3 className="text-lg font-bold wood-text mb-1">{item.name}</h3>
                    <p className="text-sm text-mboa-text-muted mb-3">{item.description}</p>
                    
                    {item.bonus && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-mboa-gold/10 border border-mboa-gold/20 text-mboa-gold text-xs mb-3">
                        + {item.bonus}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-mboa-gold">{formatGems(item.gems)}</span>
                      <span className="text-sm text-mboa-text-muted">Gems</span>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${
                        item.popular
                          ? 'bg-gradient-to-r from-mboa-gold to-amber-500 text-mboa-surface'
                          : 'bg-mboa-surface-high border border-white/10 text-mboa-text hover:bg-mboa-surface-highest'
                      }`}
                    >
                      {item.price} Gems
                    </motion.button>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        </section>

        {/* Cosmetics */}
        <section>
          <h2 className="text-lg font-bold wood-text mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-mboa-gold" />
            Personnalisation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cosmetics.map((item) => {
              const Icon = item.icon;
              return (
                <PremiumCard key={item.id}>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-mboa-primary/10 flex items-center justify-center border border-mboa-primary/20">
                      <Icon className="h-7 w-7 text-mboa-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-mboa-text">{item.name}</h3>
                      <p className="text-sm text-mboa-text-muted">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-mboa-gold font-semibold">{item.price}</span>
                      <span className="text-xs text-mboa-text-muted block">Gems</span>
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        </section>

        {/* Info */}
        <div className="p-4 rounded-xl bg-mboa-surface-high border border-white/5 text-center">
          <p className="text-sm text-mboa-text-muted">
            Les Gems sont une monnaie fictive uniquement. Aucune valeur monétaire réelle.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
