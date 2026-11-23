/*
Pseudocode:
Objective: show the shared InstaMall value proposition beside authentication forms.
Input: none.
Process: render the brand message and its benefits from one local list.
Output: a responsive, reusable marketing panel.
*/
const BENEFITS = [
  "سلة واحدة لكل المتاجر وتوزيع تلقائي",
  "تأكيد من المتجر خلال 1–24 ساعة",
  "بالليرة السورية، الدفع والتسليم مباشرة دون بوابات إلكترونية",
];

const AuthMarketingPanel = () => (
  <aside className="flex flex-1 flex-col justify-between rounded-hero bg-gradient-to-b from-brand-blue to-navy p-6 text-right text-white shadow-card sm:p-8 lg:p-12">
    <div className="space-y-6">
      <span className="inline-block rounded-pill bg-white/10 px-4 py-1 text-xs font-semibold text-white/80">
        منصة المتاجر السورية المستقلة
      </span>
      <h2 className="text-3xl leading-tight font-bold md:text-4xl">
        ستايلك من متاجر سوريا بطلب واحد
      </h2>
      <ul className="space-y-4 pt-2">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm"
            >
              ✓
            </span>
            <span className="text-base font-medium md:text-lg">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
    <p className="mt-8 border-t border-white/10 pt-6 text-xs text-white/70">
      تسوّق من متاجر متعددة بطلب موحد
    </p>
  </aside>
);

export default AuthMarketingPanel;
