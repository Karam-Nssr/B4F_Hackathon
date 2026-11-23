"use client";

import { useId, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Footprints,
  Headphones,
  Heart,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Watch,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export type OrbitalStoreIcon =
  "sneaker" | "watch" | "bag" | "sparkles" | "headphones";

export interface OrbitalStore {
  handle: string;
  icon: OrbitalStoreIcon;
  imageUrl?: string;
  priceSyp: number;
  product: string;
  productAr?: string;
  tone: "violet" | "cyan" | "champagne" | "rose" | "blue";
  verified: boolean;
}

export interface LuxuryOrbitalHeroProps {
  className?: string;
  direction?: "ltr" | "rtl";
  exploreHref?: string;
  fullBleed?: boolean;
  joinHref?: string;
  loadingLabel?: string;
  locale?: string;
  variant?: "hero" | "loader";
  stores?: OrbitalStore[];
}

const DEFAULT_STORES: OrbitalStore[] = [
  {
    handle: "@damascus.kicks",
    product: "Damascus Runner",
    productAr: "حذاء الجري الدمشقي",
    priceSyp: 285000,
    icon: "sneaker",
    tone: "violet",
    verified: true,
  },
  {
    handle: "@sham.streetwear",
    product: "Sham Varsity Jacket",
    productAr: "سترة شام الجامعية",
    priceSyp: 215000,
    icon: "bag",
    tone: "cyan",
    verified: true,
  },
  {
    handle: "@oud.atelier",
    product: "Oud No. 7",
    productAr: "عطر عود رقم 7",
    priceSyp: 175000,
    icon: "sparkles",
    tone: "champagne",
    verified: true,
  },
  {
    handle: "@aura.tech.sy",
    product: "Aura Active Watch",
    productAr: "ساعة أورا الرياضية",
    priceSyp: 490000,
    icon: "watch",
    tone: "blue",
    verified: true,
  },
  {
    handle: "@velvet.studio",
    product: "Velvet Studio Headphones",
    productAr: "سماعات فيلفت ستوديو",
    priceSyp: 320000,
    icon: "headphones",
    tone: "rose",
    verified: true,
  },
];

const PRODUCT_ICONS: Record<OrbitalStoreIcon, LucideIcon> = {
  sneaker: Footprints,
  watch: Watch,
  bag: ShoppingBag,
  sparkles: Sparkles,
  headphones: Headphones,
};

const CARD_POSITIONS = [
  "left-0 top-[3%] sm:left-[2%] sm:top-[5%]",
  "right-0 top-[3%] sm:right-[2%] sm:top-[5%]",
  "left-0 top-[54%] sm:left-[1%] sm:top-[56%]",
  "right-0 top-[54%] sm:right-[1%] sm:top-[56%]",
  "left-1/2 bottom-[0%] -translate-x-1/2",
];

const CARD_TONES: Record<OrbitalStore["tone"], string> = {
  violet: "from-violet-500/25 via-violet-400/10 to-transparent text-violet-100",
  cyan: "from-cyan-400/25 via-cyan-300/10 to-transparent text-cyan-100",
  champagne: "from-amber-200/25 via-yellow-100/10 to-transparent text-amber-50",
  rose: "from-rose-400/25 via-pink-300/10 to-transparent text-rose-100",
  blue: "from-sky-400/25 via-blue-300/10 to-transparent text-sky-100",
};

const FLOW_PATHS = [
  "M 78 78 C 150 102, 202 171, 296 248",
  "M 562 78 C 490 108, 438 174, 344 248",
  "M 72 355 C 155 345, 214 305, 296 270",
  "M 568 355 C 485 345, 426 305, 344 270",
  "M 320 468 C 320 414, 320 357, 320 302",
];

const formatHeroPrice = (priceSyp: number): string =>
  Math.trunc(priceSyp / 100).toLocaleString("en-US");

const StoreCard = ({
  active,
  index,
  locale,
  onActivate,
  onDeactivate,
  store,
}: {
  active: boolean;
  index: number;
  locale: string;
  onActivate: () => void;
  onDeactivate: () => void;
  store: OrbitalStore;
}) => {
  const ProductIcon = PRODUCT_ICONS[store.icon];
  const isEnglish = locale === "en";

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onActivate}
      onHoverStart={onActivate}
      onHoverEnd={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      initial={false}
      animate={{
        y: active ? -4 : [0, -5, 0],
        scale: active ? 1.06 : 1,
        borderColor: active
          ? "rgba(165, 243, 252, 0.75)"
          : "rgba(255, 255, 255, 0.15)",
      }}
      whileTap={{ scale: 1.06 }}
      transition={{
        y: {
          duration: active ? 0.25 : 4 + index * 0.35,
          repeat: active ? 0 : Infinity,
          ease: "easeInOut",
          delay: index * 0.12,
        },
        scale: { type: "spring", stiffness: 260, damping: 20 },
        borderColor: { duration: 0.25 },
      }}
      className={`group relative w-[132px] overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-start shadow-[0_12px_42px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-colors sm:w-[164px] ${
        active ? "z-40" : "z-20"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 ${CARD_TONES[store.tone]}`}
      />
      {store.imageUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url("${store.imageUrl}")` }}
        />
      )}
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-black/25 backdrop-blur-md">
            {store.imageUrl ? (
              <ProductIcon aria-hidden className="size-4" />
            ) : (
              <ProductIcon aria-hidden className="size-5" />
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2 py-1 text-[9px] font-medium text-white/85">
            <Heart aria-hidden className="size-3 fill-rose-400 text-rose-400" />
            {isEnglish ? "Loved" : "مفضّل"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[9px] text-white/65">
          <span>{store.handle}</span>
          {store.verified && (
            <BadgeCheck
              aria-label={isEnglish ? "Verified store" : "متجر موثّق"}
              className="size-3 shrink-0 fill-cyan-300/15 text-cyan-200"
            />
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-white sm:text-xs">
          {isEnglish ? store.product : (store.productAr ?? store.product)}
        </p>
        <p className="mt-2 font-mono text-[11px] font-semibold text-white/90">
          {formatHeroPrice(store.priceSyp)}{" "}
          <span className="font-sans text-[9px] font-medium text-white/60">
            {isEnglish ? "SYP" : "ل.س"}
          </span>
        </p>
      </div>
    </motion.button>
  );
};

const OrbitalCartHub = ({
  locale,
  stores,
}: {
  locale: string;
  stores: OrbitalStore[];
}) => {
  const [activeStore, setActiveStore] = useState<string | null>(null);
  const instanceId = useId().replace(/:/g, "");
  const flowGradientId = `${instanceId}-flow`;
  const glowFilterId = `${instanceId}-glow`;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rawRotateY = useTransform(pointerX, [-1, 1], [-9, 9]);
  const rawRotateX = useTransform(pointerY, [-1, 1], [8, -8]);
  const rotateY = useSpring(rawRotateY, { stiffness: 120, damping: 18 });
  const rotateX = useSpring(rawRotateX, { stiffness: 120, damping: 18 });
  const visibleStores = stores.slice(0, 5);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
  };

  const resetParallax = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      role="group"
      className="relative mx-auto h-[430px] w-full max-w-[650px] select-none sm:h-[500px] lg:h-[540px]"
      aria-label={
        locale === "en" ? "Orbital shopping cart" : "سلة التسوق المدارية"
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 640 520"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <linearGradient id={flowGradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F5D7A1" stopOpacity="0.12" />
          </linearGradient>
          <filter
            id={glowFilterId}
            x="-200%"
            y="-200%"
            width="400%"
            height="400%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse
          cx="320"
          cy="260"
          rx="235"
          ry="155"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeDasharray="3 9"
          strokeWidth="1"
          transform="rotate(-13 320 260)"
        />
        <ellipse
          cx="320"
          cy="260"
          rx="190"
          ry="112"
          fill="none"
          stroke="rgba(124,58,237,0.14)"
          strokeWidth="1"
          transform="rotate(18 320 260)"
        />
        {visibleStores.map((store, index) => {
          const path = FLOW_PATHS[index];
          const active = activeStore === store.handle;

          return (
            <g key={store.handle}>
              <path
                d={path}
                fill="none"
                stroke={active ? "#67E8F9" : `url(#${flowGradientId})`}
                strokeDasharray={active ? "0" : "2 8"}
                strokeLinecap="round"
                strokeWidth={active ? "2" : "1"}
                opacity={active ? "0.95" : "0.46"}
                filter={active ? `url(#${glowFilterId})` : undefined}
              />
              <circle
                r={active ? "4" : "2.5"}
                fill={active ? "#A5F3FC" : "#C4B5FD"}
                filter={`url(#${glowFilterId})`}
              >
                <animateMotion
                  dur={`${3.8 + index * 0.35}s`}
                  begin={`${index * 0.25}s`}
                  repeatCount="indefinite"
                  path={path}
                />
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {visibleStores.map((store, index) => (
          <div
            key={store.handle}
            className={`pointer-events-auto absolute ${CARD_POSITIONS[index]}`}
          >
            <StoreCard
              active={activeStore === store.handle}
              index={index}
              locale={locale}
              onActivate={() => setActiveStore(store.handle)}
              onDeactivate={() =>
                setActiveStore((current) =>
                  current === store.handle ? null : current,
                )
              }
              store={store}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[7%] flex justify-center">
        <motion.div
          animate={{
            opacity: activeStore ? 0.9 : 0.5,
            scale: activeStore ? 1.12 : 1,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="h-16 w-52 rounded-[50%] border border-violet-300/15 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.26),rgba(34,211,238,0.08)_42%,transparent_72%)] shadow-[0_0_70px_rgba(124,58,237,0.18)]"
        />
      </div>

      <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative flex h-44 w-48 items-center justify-center"
        >
          <motion.div
            animate={{
              opacity: activeStore ? 0.82 : 0.48,
              scale: activeStore ? 1.12 : 1,
            }}
            transition={{ duration: 0.35 }}
            className="absolute inset-3 rounded-[36px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.42),rgba(34,211,238,0.13)_42%,transparent_72%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-7 top-6 h-28 rounded-[30px] border border-white/20 bg-gradient-to-br from-white/[0.16] via-white/[0.04] to-violet-400/[0.12] shadow-[inset_1px_1px_0_rgba(255,255,255,0.24),0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            style={{
              transform: "rotateX(54deg) rotateZ(-12deg)",
              transformStyle: "preserve-3d",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute top-10 right-8 h-24 w-5 rounded-full border border-cyan-100/20 bg-gradient-to-b from-cyan-200/30 to-violet-500/10"
            style={{ transform: "rotateY(32deg) translateZ(25px)" }}
          />
          <div
            aria-hidden="true"
            className="absolute top-10 left-8 h-24 w-5 rounded-full border border-white/15 bg-gradient-to-b from-white/20 to-violet-500/10"
            style={{ transform: "rotateY(-32deg) translateZ(25px)" }}
          />
          <div
            className="absolute inset-x-8 top-[4.25rem] flex h-[4.5rem] items-center justify-center rounded-[24px] border border-white/25 bg-gradient-to-br from-white/[0.13] via-white/[0.06] to-cyan-300/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            style={{ transform: "translateZ(38px)" }}
          >
            <ShoppingCart
              aria-hidden="true"
              strokeWidth={1.5}
              className="size-11 text-white drop-shadow-[0_0_12px_rgba(165,243,252,0.75)]"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute bottom-7 left-[4.3rem] size-3 rounded-full border border-cyan-100/70 bg-[#09090D] shadow-[0_0_12px_rgba(103,232,249,0.9)]"
          />
          <span
            aria-hidden="true"
            className="absolute right-[4.3rem] bottom-7 size-3 rounded-full border border-cyan-100/70 bg-[#09090D] shadow-[0_0_12px_rgba(103,232,249,0.9)]"
          />
          <motion.div
            aria-hidden="true"
            animate={{
              opacity: activeStore ? 0.9 : 0.45,
              scaleX: activeStore ? 1.08 : 1,
            }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-0 h-1 w-28 rounded-full bg-gradient-to-r from-transparent via-cyan-200 to-transparent blur-[2px]"
          />
        </motion.div>
      </div>
    </div>
  );
};

const LuxuryOrbitalHero = ({
  className = "",
  direction,
  exploreHref,
  fullBleed = false,
  joinHref,
  loadingLabel,
  locale = "ar",
  variant = "hero",
  stores = DEFAULT_STORES,
}: LuxuryOrbitalHeroProps) => {
  const isEnglish = locale === "en";
  const resolvedDirection = direction ?? (isEnglish ? "ltr" : "rtl");
  const prefix = isEnglish ? "/en" : "";
  const resolvedExploreHref = exploreHref ?? `${prefix}/stores`;
  const resolvedJoinHref =
    joinHref ?? `${prefix}/signin?mode=signup&accountType=seller`;
  const resolvedLoadingLabel =
    loadingLabel ??
    (isEnglish ? "Preparing your marketplace" : "نجهّز متاجرك المفضّلة");

  if (variant === "loader") {
    return (
      <section
        dir={resolvedDirection}
        role="status"
        aria-label={resolvedLoadingLabel}
        className={`flex min-h-[70vh] items-center justify-center overflow-x-clip bg-[#09090D] px-3 py-8 text-white sm:px-6 ${className}`}
      >
        <div className="w-full max-w-3xl">
          <p className="mb-1 text-center text-xs font-medium tracking-[0.24em] text-cyan-100/75">
            {isEnglish ? "INSTA MALL" : "إنستا مول"}
          </p>
          <p className="mb-2 text-center text-sm text-white/65">
            {resolvedLoadingLabel}
          </p>
          <OrbitalCartHub locale={locale} stores={stores} />
          <span className="sr-only">{resolvedLoadingLabel}</span>
        </div>
      </section>
    );
  }

  return (
    <section
      dir={resolvedDirection}
      className={`relative isolate overflow-x-clip overflow-y-hidden ${fullBleed ? "rounded-none border-x-0" : "rounded-[30px] border border-white/10"} bg-[#09090D] px-5 py-8 text-white shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:px-8 sm:py-12 lg:px-12 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 82% 18%, rgba(124,58,237,0.19), transparent 34%), radial-gradient(ellipse at 18% 82%, rgba(34,211,238,0.08), transparent 34%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-1/3 -top-32 size-72 rounded-full bg-violet-600/10 blur-[100px]"
      />
      <div className="relative z-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-2">
        <div className="order-2 space-y-6 text-start lg:order-1 lg:col-span-5 lg:pe-5">
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl leading-[1.13] font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.55rem]">
              {isEnglish ? (
                <>
                  Every favorite store.
                  <span className="block bg-gradient-to-r from-violet-200 via-cyan-100 to-amber-100 bg-clip-text text-transparent">
                    One beautiful cart.
                  </span>
                </>
              ) : (
                <>
                  كل متاجرك المفضّلة
                  <span className="block bg-gradient-to-l from-violet-200 via-cyan-100 to-amber-100 bg-clip-text text-transparent">
                    سلة واحدة.
                  </span>
                </>
              )}
            </h1>
            <p className="max-w-lg text-sm leading-7 text-slate-300/85 sm:text-base">
              {isEnglish
                ? "Discover independent Syrian stores, bring their best finds together, and keep every order beautifully organized."
                : "اكتشف متاجر سورية مستقلة، واجمع اختياراتك المفضّلة في تجربة تسوّق واحدة وواضحة."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={resolvedExploreHref}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C40027] px-6 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(196,0,39,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[#A50021] hover:shadow-[0_12px_34px_rgba(196,0,39,0.42)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C40027]"
            >
              {isEnglish ? "Explore Stores" : "استكشف المتاجر"}
              <ArrowUpRight
                aria-hidden="true"
                className={`size-4 transition-transform group-hover:-translate-y-0.5 ${isEnglish ? "" : "rotate-[-90deg]"}`}
              />
            </Link>
            <Link
              href={resolvedJoinHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm font-medium text-white/85 backdrop-blur-xl transition-colors hover:border-cyan-100/40 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100"
            >
              <Store aria-hidden="true" className="size-4 text-cyan-100" />
              {isEnglish ? "Join as a Store" : "انضم كمتجر"}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5">
            {[
              {
                icon: Store,
                label: isEnglish ? "Syrian stores" : "متاجر سورية",
              },
              {
                icon: ShoppingBag,
                label: isEnglish ? "One shared cart" : "سلة موحّدة",
              },
              {
                icon: ShieldCheck,
                label: isEnglish
                  ? "Direct with shops"
                  : "تواصل مباشر مع المتجر",
              },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 text-[11px] text-white/60"
              >
                <Icon aria-hidden="true" className="size-4 text-cyan-100/75" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2 lg:col-span-7">
          <OrbitalCartHub locale={locale} stores={stores} />
        </div>
      </div>
    </section>
  );
};

export default LuxuryOrbitalHero;
