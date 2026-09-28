import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { t } from "../i18n/dict.js";
import { C, HEAD } from "../theme.js";
import { thisMonth, allTime, monthSeries, costTrend } from "../data/db.js";
import { usd, monthStart, NOW_MS } from "../data/format.js";
import { Card, Meter, IconDot } from "../components/ui/Primitives.jsx";
import { AppBar, SectionHead } from "../components/ui/AppBar.jsx";
import { TourHelp } from "../components/tour/Tour.jsx";
import { TxnRow } from "../components/TxnRow.jsx";

const tt = (s) => t(s);

export function CashScreen({ db, go, back, act }) {
  const t = thisMonth(db), all = allTime(db), series = monthSeries(db), ct = costTrend(db);
  const recent = db.txns.slice().sort((a, b) => b.at - a.at).slice(0, 5);
  const byCat = {};
  db.txns.filter((x) => x.type === "expense" && x.at >= monthStart(NOW_MS)).forEach((x) => (byCat[x.cat] = (byCat[x.cat] || 0) + x.amount));
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return (
    <div className="pb-4">
      <AppBar title="Cash Flow" onBack={back} right={<div className="flex items-center gap-2"><TourHelp menu="records" /><button data-tour="rec-add" onClick={() => act.openAdd()} className="p-2 rounded-full" style={{ background: C.pink, color: "#fff" }} aria-label="Add record"><Plus size={16} /></button></div>} />
      <div className="p-4 space-y-4">
        <p className="text-sm" style={{ color: C.mute }}>{tt("Track your sales and expenses easily.")}</p>
        <Card tour="rec-summary" className="divide-y" style={{ borderColor: C.line }}>
          {[["Total Sales", t.inc, C.green], ["Total Expenses", t.exp, C.pink], ["Net Cash Flow", t.net, C.navy]].map(([l, v, col]) => (
            <div key={l} className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm font-semibold" style={{ color: C.mute }}>{tt(l)}</span>
              <span className="text-lg font-extrabold" style={{ color: col, fontFamily: HEAD }}>{usd(v)}</span>
            </div>
          ))}
        </Card>

        <Card className="p-4" style={{ background: ct.delta > 2 ? C.amberSoft : C.greenSoft }}>
          <div className="flex items-start gap-2.5">
            <IconDot icon={ct.delta > 2 ? AlertCircle : CheckCircle2} size={32} bg="#fff" color={ct.delta > 2 ? C.amber : C.green} />
            <div className="text-xs" style={{ color: C.ink }}>
              {ct.delta > 2
                ? <>Costs took <b>{ct.share.toFixed(0)}%</b> of your sales this month, up from <b>{ct.prevShare.toFixed(0)}%</b> last month. Your largest cost is {topCats[0]?.[0].toLowerCase()}.</>
                : <>Your costs are steady at <b>{ct.share.toFixed(0)}%</b> of sales. Keep recording every day.</>}
            </div>
          </div>
        </Card>

        <div data-tour="rec-chart">
          <SectionHead>Sales Trend</SectionHead>
          <Card className="p-3 pt-4">
            <div style={{ height: 170 }}>
              <ResponsiveContainer>
                <LineChart data={series} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#F6E6EE" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.soft }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.soft }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} formatter={(v, n) => [usd(v), n === "sales" ? "Sales" : "Net"]} />
                  <Line dataKey="sales" stroke={C.pink} strokeWidth={2.5} dot={{ r: 3, fill: C.pink }} />
                  <Line dataKey="net" stroke={C.aqua} strokeWidth={2} dot={{ r: 3, fill: C.aqua }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center text-[11px] pt-1" style={{ color: C.soft }}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.pink }} />Sales</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.aqua }} />Net</span>
            </div>
          </Card>
        </div>

        <div>
          <SectionHead>Where your money goes</SectionHead>
          <Card className="p-4 space-y-3">
            {topCats.map(([cat, v]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1"><span style={{ color: C.ink }}>{tt(cat)}</span><b style={{ color: C.navy }}>{usd(v)}</b></div>
                <Meter value={v} max={topCats[0][1]} h={6} />
              </div>
            ))}
            {topCats.length === 0 && <div className="text-sm text-center py-2" style={{ color: C.soft }}>No expenses recorded this month</div>}
          </Card>
        </div>

        <div data-tour="rec-txns">
          <SectionHead action="See all" onAction={() => go("txns")}>Recent Transactions</SectionHead>
          <Card className="px-4 divide-y" style={{ borderColor: C.line }}>
            {recent.map((x) => <TxnRow key={x.id} t={x} />)}
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold" style={{ color: C.soft }}>SINCE YOU JOINED, 12 OCT 2027</div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[["Total Sales", usd(all.inc), C.green], ["Total Expenses", usd(all.exp), C.pinkDeep], ["Net Profit", usd(all.net), C.navy], ["Transactions", String(db.txns.length), C.aqua]].map(([l, v, col]) => (
              <div key={l} className="rounded-2xl p-3 min-w-0" style={{ background: C.blush2 }}>
                <div className="text-[11px]" style={{ color: C.soft }}>{tt(l)}</div>
                <div className="text-base font-extrabold break-words" style={{ color: col, fontFamily: HEAD }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
