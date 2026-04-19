import React, { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { User, Palette, Scissors, Shirt, Eye, Sparkles, AlertTriangle, X } from "lucide-react";
import {
  type CharacterAppearance,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  FACIAL_HAIR_OPTIONS,
  EYE_SHAPES,
  EYE_COLORS,
  POSTURE_OPTIONS,
  AGE_LABELS,
  GENDER_PRESENTATIONS,
  DISTINGUISHING_MARKS,
  CLOTHING_SLOTS,
  CLOTHING_CATEGORIES,
  APPEARANCE_PRESETS,
  buildAppearancePrompt,
  validateAppearance,
  applyPreset,
  type ClothingSlot,
} from "@/lib/character-appearance-data";

// Animated label that re-mounts on text change for fade-in effect
function AnimatedLabel({ text }: { text: string }) {
  return (
    <span key={text} className="text-accent animate-scale-in inline-block font-semibold">
      {text}
    </span>
  );
}

function getAgeLabel(age: number): string {
  const ageData = AGE_LABELS.find(a => age >= a.min && age <= a.max);
  return ageData?.label || "Adult";
}

interface Props {
  appearance: CharacterAppearance;
  onChange: (appearance: CharacterAppearance) => void;
  clothingCategories?: string[];
}

export default function CharacterAppearanceEditor({ appearance, onChange, clothingCategories }: Props) {
  const [mixMode, setMixMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const cats = clothingCategories || Object.keys(CLOTHING_CATEGORIES);
    return cats[0] || "Medieval";
  });
  const [activeTab, setActiveTab] = useState("identity");

  const availableCategories = clothingCategories || Object.keys(CLOTHING_CATEGORIES);

  const livePreview = useMemo(() => buildAppearancePrompt(appearance), [appearance]);
  const validation = useMemo(() => validateAppearance(appearance), [appearance]);

  // Auto-clear hair color when switching to Bald
  useEffect(() => {
    if (appearance.hair.style === "Bald" && appearance.hair.color !== "black") {
      onChange({
        ...appearance,
        hair: { ...appearance.hair, color: "black" },
      });
    }
  }, [appearance.hair.style]);

  const updateBody = (patch: Partial<CharacterAppearance["body"]>) => {
    onChange({
      ...appearance,
      body: { ...appearance.body, ...patch },
    });
  };

  const updateFace = (patch: Partial<CharacterAppearance["face"]>) => {
    onChange({
      ...appearance,
      face: { ...appearance.face, ...patch },
    });
  };

  const updateHair = (patch: Partial<CharacterAppearance["hair"]>) => {
    onChange({
      ...appearance,
      hair: { ...appearance.hair, ...patch },
    });
  };

  const setClothing = (slot: string, catKey: string, itemLabel: string) => {
    const value = itemLabel ? `${catKey}:${itemLabel}` : "";
    onChange({
      ...appearance,
      clothing: { ...appearance.clothing, [slot]: value },
    });
  };

  const getClothingSelection = (slot: string) => {
    const val = appearance.clothing[slot];
    if (!val) return { category: "", item: "" };
    const [cat, ...rest] = val.split(":");
    return { category: cat, item: rest.join(":") };
  };

  const toggleDistinguishingMark = (mark: string) => {
    const current = appearance.distinguishingMarks || [];
    const updated = current.includes(mark)
      ? current.filter(m => m !== mark)
      : [...current, mark];
    onChange({ ...appearance, distinguishingMarks: updated });
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = APPEARANCE_PRESETS.find(p => p.name === presetName);
    if (preset) {
      onChange(applyPreset(preset));
    }
  };

  return (
    <div className="space-y-3">
      {/* Preset Selector */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <Select onValueChange={handlePresetSelect}>
          <SelectTrigger className="bg-background/50 border-white/10 font-mono text-sm flex-1">
            <SelectValue placeholder="Quick Start: Choose a Preset" />
          </SelectTrigger>
          <SelectContent>
            {APPEARANCE_PRESETS.map((preset) => (
              <SelectItem key={preset.name} value={preset.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-[10px] text-muted-foreground">{preset.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 animate-fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {validation.warnings.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Live Preview Summary */}
      {livePreview && (
        <div className="p-3 rounded-lg bg-background/40 border border-primary/15 animate-fade-in">
          <div className="flex items-center gap-2 mb-1.5">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <Label className="text-[10px] text-primary font-mono uppercase tracking-wider">Live Preview</Label>
          </div>
          <p key={livePreview.slice(0, 40)} className="text-[11px] text-muted-foreground leading-relaxed animate-fade-in">
            {livePreview}
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5 bg-background/50">
          <TabsTrigger value="identity" className="text-xs gap-1 transition-all duration-200"><Sparkles className="w-3 h-3" /> Identity</TabsTrigger>
          <TabsTrigger value="body" className="text-xs gap-1 transition-all duration-200"><User className="w-3 h-3" /> Body</TabsTrigger>
          <TabsTrigger value="face" className="text-xs gap-1 transition-all duration-200"><Palette className="w-3 h-3" /> Face</TabsTrigger>
          <TabsTrigger value="hair" className="text-xs gap-1 transition-all duration-200"><Scissors className="w-3 h-3" /> Hair</TabsTrigger>
          <TabsTrigger value="clothing" className="text-xs gap-1 transition-all duration-200"><Shirt className="w-3 h-3" /> Clothing</TabsTrigger>
        </TabsList>

        {/* ── Identity ── */}
        <TabsContent value="identity" className="space-y-4 pt-2 animate-fade-in">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Age</Label>
              <AnimatedLabel text={getAgeLabel(appearance.age)} />
            </div>
            <Slider 
              value={[appearance.age]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={([v]) => onChange({ ...appearance, age: v })} 
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60 px-1">
              <span>Teen</span>
              <span>Adult</span>
              <span>Middle</span>
              <span>Elder</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Gender Presentation</Label>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_PRESENTATIONS.map((g) => (
                <Badge
                  key={g.value}
                  variant={appearance.genderPresentation === g.value ? "default" : "outline"}
                  className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                    appearance.genderPresentation === g.value
                      ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                      : "hover:bg-accent/10 hover:scale-[1.02]"
                  }`}
                  onClick={() => onChange({ ...appearance, genderPresentation: g.value as CharacterAppearance["genderPresentation"] })}
                >
                  {g.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Distinguishing Marks</Label>
            <div className="flex flex-wrap gap-1.5">
              {DISTINGUISHING_MARKS.map((mark) => (
                <Badge
                  key={mark}
                  variant={appearance.distinguishingMarks?.includes(mark) ? "default" : "outline"}
                  className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                    appearance.distinguishingMarks?.includes(mark)
                      ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                      : "hover:bg-accent/10 hover:scale-[1.02]"
                  }`}
                  onClick={() => toggleDistinguishingMark(mark)}
                >
                  {mark}
                </Badge>
              ))}
            </div>
            {appearance.distinguishingMarks?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {appearance.distinguishingMarks.map((mark) => (
                  <span
                    key={mark}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 animate-slide-in-up"
                  >
                    {mark}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => toggleDistinguishingMark(mark)} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Body ── */}
        <TabsContent value="body" className="space-y-4 pt-2 animate-fade-in">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Height</Label>
              <AnimatedLabel text={appearance.body.height < 30 ? "Short" : appearance.body.height > 70 ? "Tall" : "Average"} />
            </div>
            <Slider value={[appearance.body.height]} min={0} max={100} step={1} onValueChange={([v]) => updateBody({ height: v })} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Build</Label>
              <AnimatedLabel text={appearance.body.build < 25 ? "Slim" : appearance.body.build < 50 ? "Lean" : appearance.body.build < 75 ? "Athletic" : "Muscular"} />
            </div>
            <Slider value={[appearance.body.build]} min={0} max={100} step={1} onValueChange={([v]) => updateBody({ build: v })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Skin Tone</Label>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateBody({ skinTone: t.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ease-out ${
                    appearance.body.skinTone === t.value
                      ? "border-primary scale-125 ring-2 ring-primary/40 animate-pulse-ring shadow-lg shadow-primary/20"
                      : "border-transparent hover:border-muted-foreground/30 hover:scale-110"
                  }`}
                  style={{ backgroundColor: t.hex }}
                  title={t.label}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Posture</Label>
            <div className="flex flex-wrap gap-1.5">
              {POSTURE_OPTIONS.map((p) => (
                <Badge
                  key={p}
                  variant={appearance.body.posture === p ? "default" : "outline"}
                  className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                    appearance.body.posture === p
                      ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                      : "hover:bg-accent/10 hover:scale-[1.02]"
                  }`}
                  onClick={() => updateBody({ posture: p })}
                >
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Face ── */}
        <TabsContent value="face" className="space-y-4 pt-2 animate-fade-in">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Face Shape</Label>
              <AnimatedLabel text={appearance.face.shape < 30 ? "Round" : appearance.face.shape > 70 ? "Angular" : "Oval"} />
            </div>
            <Slider value={[appearance.face.shape]} min={0} max={100} step={1} onValueChange={([v]) => updateFace({ shape: v })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Eye Shape</Label>
            <div className="flex flex-wrap gap-1.5">
              {EYE_SHAPES.map((e) => (
                <Badge
                  key={e}
                  variant={appearance.face.eyeShape === e ? "default" : "outline"}
                  className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                    appearance.face.eyeShape === e
                      ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                      : "hover:bg-accent/10 hover:scale-[1.02]"
                  }`}
                  onClick={() => updateFace({ eyeShape: e })}
                >
                  {e}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Eye Color</Label>
            <div className="flex flex-wrap gap-2">
              {EYE_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateFace({ eyeColor: c.value })}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ease-out ${
                    appearance.face.eyeColor === c.value
                      ? "border-primary scale-125 ring-2 ring-primary/40 animate-pulse-ring shadow-lg shadow-primary/20"
                      : "border-transparent hover:border-muted-foreground/30 hover:scale-110"
                  }`}
                  style={{ background: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Jaw Width</Label>
              <AnimatedLabel text={appearance.face.jawWidth < 30 ? "Narrow" : appearance.face.jawWidth > 70 ? "Wide" : "Medium"} />
            </div>
            <Slider value={[appearance.face.jawWidth]} min={0} max={100} step={1} onValueChange={([v]) => updateFace({ jawWidth: v })} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Nose</Label>
              <AnimatedLabel text={appearance.face.noseSize < 30 ? "Small" : appearance.face.noseSize > 70 ? "Prominent" : "Medium"} />
            </div>
            <Slider value={[appearance.face.noseSize]} min={0} max={100} step={1} onValueChange={([v]) => updateFace({ noseSize: v })} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Lip Fullness</Label>
              <AnimatedLabel text={appearance.face.lipFullness < 30 ? "Thin" : appearance.face.lipFullness > 70 ? "Full" : "Medium"} />
            </div>
            <Slider value={[appearance.face.lipFullness]} min={0} max={100} step={1} onValueChange={([v]) => updateFace({ lipFullness: v })} />
          </div>
        </TabsContent>

        {/* ── Hair ── */}
        <TabsContent value="hair" className="space-y-4 pt-2 animate-fade-in">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Hairstyle</Label>
            <div className="flex flex-wrap gap-1.5">
              {HAIR_STYLES.map((s) => (
                <Badge
                  key={s}
                  variant={appearance.hair.style === s ? "default" : "outline"}
                  className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                    appearance.hair.style === s
                      ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                      : "hover:bg-accent/10 hover:scale-[1.02]"
                  }`}
                  onClick={() => updateHair({ style: s })}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          {appearance.hair.style !== "Bald" && (
            <div className="space-y-1.5 animate-fade-in">
              <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Hair Color</Label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateHair({ color: c.value })}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ease-out ${
                      appearance.hair.color === c.value
                        ? "border-primary scale-125 ring-2 ring-primary/40 animate-pulse-ring shadow-lg shadow-primary/20"
                        : "border-transparent hover:border-muted-foreground/30 hover:scale-110"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Facial Hair</Label>
            <div className="flex flex-wrap gap-1.5">
              {FACIAL_HAIR_OPTIONS.map((f) => (
                <Badge
                  key={f}
                  variant={appearance.hair.facialHair === f ? "default" : "outline"}
                  className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                    appearance.hair.facialHair === f
                      ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                      : "hover:bg-accent/10 hover:scale-[1.02]"
                  }`}
                  onClick={() => updateHair({ facialHair: f })}
                >
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Clothing ── */}
        <TabsContent value="clothing" className="space-y-4 pt-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Style Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background/50 border-white/10 font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((k) => (
                    <SelectItem key={k} value={k}>{CLOTHING_CATEGORIES[k]?.label || k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-4 pt-5">
              <Switch checked={mixMode} onCheckedChange={setMixMode} />
              <Label className="text-xs text-muted-foreground font-mono">Mix</Label>
            </div>
          </div>

          {CLOTHING_SLOTS.map((slot) => {
            const sel = getClothingSelection(slot);
            const catForSlot = mixMode ? (sel.category || selectedCategory) : selectedCategory;
            const cat = CLOTHING_CATEGORIES[catForSlot];
            const items = cat?.slots[slot] || [];

            return (
              <div key={slot} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{slot}</Label>
                  {mixMode && sel.category && sel.category !== selectedCategory && (
                    <span className="text-[10px] text-primary font-mono animate-fade-in">({CLOTHING_CATEGORIES[sel.category]?.label})</span>
                  )}
                </div>
                {mixMode ? (
                  <div className="space-y-1.5">
                    <Select
                      value={sel.category || selectedCategory}
                      onValueChange={(newCat) => setClothing(slot, newCat, "")}
                    >
                      <SelectTrigger className="bg-background/50 border-white/10 font-mono text-xs h-8">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((k) => (
                          <SelectItem key={k} value={k}>{CLOTHING_CATEGORIES[k]?.label || k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1.5">
                      {(CLOTHING_CATEGORIES[sel.category || selectedCategory]?.slots[slot] || []).map((item) => (
                        <Badge
                          key={item.label}
                          variant={sel.item === item.label ? "default" : "outline"}
                          className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                            sel.item === item.label
                              ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                              : "hover:bg-accent/10 hover:scale-[1.02]"
                          }`}
                          onClick={() => setClothing(slot, sel.category || selectedCategory, sel.item === item.label ? "" : item.label)}
                        >
                          {item.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <Badge
                        key={item.label}
                        variant={sel.item === item.label && sel.category === selectedCategory ? "default" : "outline"}
                        className={`cursor-pointer text-[11px] transition-all duration-200 ease-out ${
                          sel.item === item.label && sel.category === selectedCategory
                            ? "scale-105 shadow-md shadow-primary/20 ring-1 ring-primary/30"
                            : "hover:bg-accent/10 hover:scale-[1.02]"
                        }`}
                        onClick={() => setClothing(slot, selectedCategory, sel.item === item.label && sel.category === selectedCategory ? "" : item.label)}
                      >
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Animated Outfit Summary */}
          {Object.values(appearance.clothing).some(Boolean) && (
            <div className="mt-3 p-2 rounded-lg bg-background/30 border border-white/[0.06] animate-fade-in">
              <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1 block">Outfit Summary</Label>
              <div className="flex flex-wrap gap-1">
                {Object.entries(appearance.clothing).map(([slot, val]) => {
                  if (!val) return null;
                  const [, itemLabel] = val.split(":");
                  return (
                    <span
                      key={`${slot}-${itemLabel}`}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 animate-slide-in-up"
                    >
                      {slot}: {itemLabel}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
