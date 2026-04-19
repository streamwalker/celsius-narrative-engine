import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Sword, Shield, Shirt, Gem } from 'lucide-react';
import {
  Equipment,
  EquippedItems,
  EquipmentSlot,
  getEquipmentForClass,
  getRarityColor,
  SLOT_LABELS,
  WEAPONS,
  OFFHAND,
  HEAD_ARMOR,
  CHEST_ARMOR,
  ACCESSORIES,
} from '@/lib/equipment';
import { cn } from '@/lib/utils';

interface EquipmentSelectorProps {
  classId: string;
  equipped: EquippedItems;
  onEquipmentChange: (equipped: EquippedItems) => void;
}

export function EquipmentSelector({ classId, equipped, onEquipmentChange }: EquipmentSelectorProps) {
  const [activeTab, setActiveTab] = useState<'weapons' | 'armor' | 'accessories'>('weapons');

  const availableEquipment = getEquipmentForClass(classId);

  const weapons = availableEquipment.filter(e => WEAPONS.some(w => w.id === e.id));
  const offhand = availableEquipment.filter(e => OFFHAND.some(o => o.id === e.id));
  const headArmor = availableEquipment.filter(e => HEAD_ARMOR.some(h => h.id === e.id));
  const chestArmor = availableEquipment.filter(e => CHEST_ARMOR.some(c => c.id === e.id));
  const accessories = availableEquipment.filter(e => ACCESSORIES.some(a => a.id === e.id));

  const handleEquip = (item: Equipment) => {
    onEquipmentChange({
      ...equipped,
      [item.slot]: item,
    });
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    const newEquipped = { ...equipped };
    delete newEquipped[slot];
    onEquipmentChange(newEquipped);
  };

  const isEquipped = (item: Equipment) => {
    return equipped[item.slot]?.id === item.id;
  };

  const EquipmentCard = ({ item }: { item: Equipment }) => (
    <div
      onClick={() => isEquipped(item) ? handleUnequip(item.slot) : handleEquip(item)}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        isEquipped(item)
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50 hover:bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {SLOT_LABELS[item.slot]}
            </Badge>
            <span className={cn("text-xs capitalize", getRarityColor(item.rarity))}>
              {item.rarity}
            </span>
          </div>
        </div>
        {isEquipped(item) && (
          <Badge className="bg-primary text-primary-foreground text-xs">
            Equipped
          </Badge>
        )}
      </div>
    </div>
  );

  const EquipmentSection = ({ title, items, icon }: { title: string; items: Equipment[]; icon: React.ReactNode }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="grid gap-2">
        {items.map(item => (
          <EquipmentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  const equippedCount = Object.keys(equipped).length;
  const equippedItems = Object.entries(equipped) as [EquipmentSlot, Equipment][];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Equipped Items ({equippedCount})</span>
            {equippedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEquipmentChange({})}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {equippedCount === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No equipment selected. Choose items below.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {equippedItems.map(([slot, item]) => (
                <Badge
                  key={slot}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => handleUnequip(slot)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full">
          <TabsTrigger value="weapons" className="flex-1 gap-1">
            <Sword className="w-4 h-4" />
            Weapons
          </TabsTrigger>
          <TabsTrigger value="armor" className="flex-1 gap-1">
            <Shirt className="w-4 h-4" />
            Armor
          </TabsTrigger>
          <TabsTrigger value="accessories" className="flex-1 gap-1">
            <Gem className="w-4 h-4" />
            Accessories
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[400px] mt-4">
          <TabsContent value="weapons" className="mt-0 space-y-4">
            <EquipmentSection
              title="Main Hand"
              items={weapons}
              icon={<Sword className="w-4 h-4" />}
            />
            <EquipmentSection
              title="Off Hand"
              items={offhand}
              icon={<Shield className="w-4 h-4" />}
            />
          </TabsContent>

          <TabsContent value="armor" className="mt-0 space-y-4">
            <EquipmentSection
              title="Head"
              items={headArmor}
              icon={<span>👑</span>}
            />
            <EquipmentSection
              title="Chest"
              items={chestArmor}
              icon={<Shirt className="w-4 h-4" />}
            />
          </TabsContent>

          <TabsContent value="accessories" className="mt-0 space-y-4">
            <EquipmentSection
              title="Accessories"
              items={accessories}
              icon={<Gem className="w-4 h-4" />}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
