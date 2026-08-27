"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Calendar, MapPin, Phone, CheckCircle, Clock, Users } from "lucide-react";

const benefits = [
  "Daily structured chess lessons from certified coaches",
  "Tournament games with official pairings",
  "End-of-camp certificate for all participants",
  "Chess board and materials provided",
  "Snacks and refreshments included",
  "Group activities and team tournaments",
];

export default function SummerCampPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    parentName: "",
    parentPhone: "",
    weeks: "1",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const amount = form.weeks === "3" ? 20000 : form.weeks === "2" ? 14000 : 8000;

    const { error } = await supabase.from("camp_registrations").insert({
      full_name: form.fullName,
      email: form.email,
      phone: form.phone,
      age: form.age ? parseInt(form.age) : null,
      parent_name: form.parentName || null,
      parent_phone: form.parentPhone || null,
      weeks: parseInt(form.weeks) as 1 | 2 | 3,
      amount_paid: amount,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
      toast.success("Registration submitted!");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge className="mb-4 border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]">August 2026</Badge>
      <h1 className="font-serif text-4xl font-bold text-slate-900">Prochess Summer Camp</h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Intensive chess training for kids and teens. Learn from certified coaches,
        play tournament games, earn certificates, and have fun.
      </p>

      {/* Info cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-[#1B5E20]" />
            <div>
              <p className="text-xs text-slate-400">Duration</p>
              <p className="font-medium text-slate-900">10 - 28 August</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex items-center gap-3 p-4">
            <MapPin className="h-5 w-5 text-[#1B5E20]" />
            <div>
              <p className="text-xs text-slate-400">Location</p>
              <p className="font-medium text-slate-900">38 Ifelodun St, Orogun, Ibadan</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-[#1B5E20]" />
            <div>
              <p className="text-xs text-slate-400">Time</p>
              <p className="font-medium text-slate-900">9:00 AM - 3:00 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing */}
      <Card className="mt-8 border-slate-200">
        <CardContent className="p-6">
          <h2 className="font-serif text-xl font-bold text-slate-900">Pricing</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-sm text-slate-500">1 Week</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">&#8358;8,000</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-sm text-slate-500">2 Weeks</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">&#8358;14,000</p>
              <Badge className="mt-1 bg-[#D4AF37]/20 text-[#D4AF37]">Save &#8358;2,000</Badge>
            </div>
            <div className="rounded-lg border-2 border-[#1B5E20] p-4 text-center">
              <p className="text-sm text-slate-500">3 Weeks</p>
              <p className="mt-1 text-2xl font-bold text-[#1B5E20]">&#8358;20,000</p>
              <Badge className="mt-1 bg-green-50 text-[#1B5E20]">Save &#8358;4,000</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="mt-8">
        <h2 className="font-serif text-xl font-bold text-slate-900">What You Get</h2>
        <ul className="mt-4 space-y-2">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1B5E20]" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <Separator className="my-8" />

      {/* Registration Form */}
      <h2 className="font-serif text-2xl font-bold text-slate-900">Register</h2>

      {submitted ? (
        <Card className="mt-4 border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CheckCircle className="h-12 w-12 text-[#1B5E20]" />
            <p className="font-serif text-xl font-bold text-slate-900">Registration Submitted!</p>
            <p className="text-sm text-slate-500">We&apos;ll contact you soon with payment details.</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-[#1B5E20]" />
              Call us: <a href="tel:+2348081635986" className="text-[#1B5E20] hover:underline">0808 163 5986</a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" min="5" max="18" required value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian Name</Label>
              <Input id="parentName" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
              <Input id="parentPhone" type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>How many weeks?</Label>
            <Select value={form.weeks} onValueChange={(v) => v && setForm({ ...form, weeks: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Week - &#8358;8,000</SelectItem>
                <SelectItem value="2">2 Weeks - &#8358;14,000</SelectItem>
                <SelectItem value="3">3 Weeks - &#8358;20,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
            {loading ? "Submitting..." : "Register Now"}
          </Button>
        </form>
      )}

      {/* Contact */}
      <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-[#1B5E20]" />
          <a href="tel:+2348081635986" className="hover:text-[#1B5E20]">0808 163 5986</a>
        </span>
        <span className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-[#1B5E20]" />
          <a href="tel:+2348055170872" className="hover:text-[#1B5E20]">0805 517 0872</a>
        </span>
      </div>
    </div>
  );
}
