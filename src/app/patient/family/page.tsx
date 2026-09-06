"use client";
import { useState } from "react";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { ArrowLeft, Heart, User, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface FamilyMember { id: string; name: string; relation: string; age: number; gender: string; }

export default function FamilyPage() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Self", relation: "Self", age: 30, gender: "Male" },
    { id: "2", name: "Spouse Name", relation: "Spouse", age: 28, gender: "Female" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "", age: "", gender: "Male" });

  const addMember = () => {
    if (!form.name || !form.relation || !form.age) return;
    setMembers([...members, { id: Date.now().toString(), name: form.name, relation: form.relation, age: parseInt(form.age), gender: form.gender }]);
    setForm({ name: "", relation: "", age: "", gender: "Male" });
    setShowForm(false);
  };

  const removeMember = (id: string) => setMembers(members.filter(m => m.id !== id));

  const instructions = `${t("patient.family.title")}. ${t("patient.family.addMember")}`;

  return (
    <div className="container px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Heart className="h-6 w-6 text-rose-500" />{t("patient.family.title")}</h1>
        <SpeakButton text={instructions} />
      </div>
      <Button onClick={() => setShowForm(true)} size="sm" className="gap-1 mb-4"><Plus className="h-4 w-4" />{t("patient.family.addMember")}</Button>
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <Input placeholder={t("patient.family.namePlaceholder")} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder={t("patient.family.relationPlaceholder")} value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} />
            <Input type="number" placeholder={t("patient.family.agePlaceholder")} value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={addMember} className="flex-1">{t("patient.family.addNewMember")}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">{t("patient.family.cancel")}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-4">
        {members.map(m => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><User className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.relation} • {m.age} {t("patient.family.years")} • {m.gender}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{t("common.active")}</Badge>
                  {m.relation !== "Self" && <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
