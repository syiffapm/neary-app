import { useState } from "react";
import { ChevronLeft, Check, CheckCircle2, Building2, Store, MapPin, Camera } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD, inputCls } from "../theme.js";
import { BIZ_TYPES } from "../data/business.js";
import { fmtDate } from "../data/format.js";
import { Card, IconDot, Row, Btn, Field, Pill } from "../components/ui/Primitives.jsx";
import { AppBar } from "../components/ui/AppBar.jsx";

export function RegisterScreen({ db, back, act, go }) {
  const reg = db.registration;
  const [step, setStep] = useState(reg.step || 0);
  const [type, setType] = useState(reg.type || "sole");
  const [d, setD] = useState(reg.details);
  const steps = ["Business Type", "Your Details", "Documents", "Review"];
  const ready = db.docs.filter((x) => x.status === "Verified" || x.status === "Under review").length >= 2;
  if (reg.status === "submitted") {
    return (
      <div>
        <AppBar title="Business Registration" onBack={back} />
        <div className="p-4 space-y-4">
          <Card className="p-5 text-center">
            <div className="flex justify-center"><IconDot icon={CheckCircle2} size={62} bg={C.greenSoft} color={C.green} /></div>
            <div className="text-lg font-extrabold mt-3" style={{ color: C.navy, fontFamily: HEAD }}>Registration submitted</div>
            <div className="text-sm mt-1" style={{ color: C.mute }}>Sent to business.gov.kh on {fmtDate(reg.submittedAt)}. Most applications are reviewed within 10 working days.</div>
          </Card>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            <Row icon={Building2} title="Business type" sub={BIZ_TYPES.find((b) => b.id === reg.type)?.t} right={null} />
            <Row icon={Store} title="Business name" sub={reg.details.name} right={null} />
            <Row icon={MapPin} title="Address" sub={reg.details.address} right={null} />
          </Card>
          <Btn full variant="quiet" onClick={() => go("module", "LM-04")}>Learn what happens next</Btn>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-4">
      <AppBar title="Business Registration" onBack={back} />
      <div className="p-4 space-y-4">
        <p className="text-sm" style={{ color: C.mute }}>Get step-by-step guidance to register your business.</p>
        <button onClick={() => go("guide", "G-02")} className="text-xs font-bold flex items-center gap-1" style={{ color: C.pink }}><ChevronLeft size={13} />Back to the registration guide</button>
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center relative">
              {i > 0 && <span className="absolute h-0.5 right-1/2 w-full" style={{ top: 13, background: i <= step ? C.pink : C.line }} />}
              <span className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold" style={i <= step ? { background: C.pink, color: "#fff" } : { background: "#fff", color: C.soft, border: `2px solid ${C.line}` }}>{i < step ? <Check size={13} /> : i + 1}</span>
              <span className="text-[10px] mt-1 text-center leading-tight" style={{ color: i <= step ? C.pink : C.soft }}>{s}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <h3 className="font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>What type of business are you registering?</h3>
            {BIZ_TYPES.map((b) => (
              <Card key={b.id} className="p-3.5" onClick={() => setType(b.id)} style={type === b.id ? { borderColor: C.pink, background: C.blush2 } : undefined}>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={type === b.id ? { background: C.pink, color: "#fff" } : { border: `2px solid ${C.line}` }}>{type === b.id && <Check size={13} />}</span>
                  <div><div className="text-sm font-bold" style={{ color: C.navy }}>{b.t}</div><div className="text-xs" style={{ color: C.soft }}>{b.sub}</div><div className="text-xs mt-1" style={{ color: C.mute }}>{b.note}</div></div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>Your details</h3>
            <Field label="Business name"><input className={inputCls} style={{ borderColor: C.line }} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
            <Field label="Owner's full name"><input className={inputCls} style={{ borderColor: C.line }} value={d.owner} onChange={(e) => setD({ ...d, owner: e.target.value })} /></Field>
            <Field label="Business address" hint="Village, commune, district"><input className={inputCls} style={{ borderColor: C.line }} value={d.address} onChange={(e) => setD({ ...d, address: e.target.value })} placeholder="e.g. Wat Bo village, Sala Kamreuk" /></Field>
            <Field label="Contact number"><input className={inputCls} style={{ borderColor: C.line }} value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} /></Field>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>Documents</h3>
            <p className="text-sm" style={{ color: C.mute }}>Registration uses documents you already added to Neary.</p>
            {db.docs.slice(0, 3).map((x) => (
              <Card key={x.id} className="p-3.5">
                <Row icon={x.status === "Needed" ? Camera : CheckCircle2} iconBg={x.status === "Needed" ? C.blush : C.greenSoft} iconColor={x.status === "Needed" ? C.pink : C.green}
                  title={x.name} sub={x.status} right={x.status === "Needed" ? <Btn small variant="ghost" onClick={() => act.uploadDoc(x.id)}>Add</Btn> : <Pill tone="green" small>Ready</Pill>} />
              </Card>
            ))}
            {!ready && <Card className="p-3.5" style={{ background: C.amberSoft, borderColor: C.amberSoft }}><div className="text-xs" style={{ color: C.ink }}>Add at least your ID card and a photo of your business before submitting.</div></Card>}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-extrabold" style={{ color: C.navy, fontFamily: HEAD }}>Review</h3>
            <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
              {[["Business type", BIZ_TYPES.find((b) => b.id === type)?.t], ["Business name", d.name], ["Owner", d.owner], ["Address", d.address || "Not filled in"], ["Contact", d.phone]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5"><span className="text-xs" style={{ color: C.soft }}>{t(k)}</span><span className="text-xs font-bold text-right" style={{ color: C.navy }}>{v}</span></div>
              ))}
            </Card>
            <Card className="p-3.5" style={{ background: C.blush2 }}><div className="text-xs" style={{ color: C.mute }}>Neary sends this to business.gov.kh for you and keeps your progress. Official fees, if any, are paid on the government portal.</div></Card>
          </div>
        )}

        <div className="flex gap-3">
          {step > 0 && <Btn variant="quiet" onClick={() => setStep(step - 1)}>Back</Btn>}
          {step < 3 ? <Btn full disabled={step === 1 && !d.address.trim()} onClick={() => { act.saveRegistration({ step: step + 1, type, details: d }); setStep(step + 1); }}>Next</Btn>
            : <Btn full disabled={!ready} onClick={() => { act.submitRegistration({ type, details: d }); }}>Submit registration</Btn>}
        </div>
      </div>
    </div>
  );
}
