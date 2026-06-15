//providers
import taboola from "@/assets/logos/logoTaboolaBlue.png";
import metaLogo from "@/assets/logos/logoMeta.png";
import twitterLogo from "@/assets/logos/x-Ads.png";
import teadsLogo from "@/assets/logos/Teads.png";

//checkouts
import cartpandaLogo from "@/assets/logos/logoCartpanda.png";
import payt from "@/assets/logos/logoPayt.svg";
import clickbankLogo from "@/assets/logos/clickbank.jpg";
import digistoreLogo from "@/assets/logos/digistore.jpg";
import unicopagLogo from "@/assets/logos/unicopag.png";
import yampiLogo from "@/assets/logos/yampi.png";

export const providerLogos = [
  { src: taboola, alt: "taboola", isComingSoon: false },
  { src: metaLogo, alt: "meta", isComingSoon: true },
  { src: twitterLogo, alt: "twitter", isComingSoon: true },
  { src: teadsLogo, alt: "teads", isComingSoon: true },
];

export const checkoutLogos = [
  { src: cartpandaLogo, alt: "cartpanda", isComingSoon: false, hasS2s: true },
  { src: payt, alt: "payt", isComingSoon: false },
  { src: clickbankLogo, alt: "clickbank", isComingSoon: false },
  { src: digistoreLogo, alt: "digistore", isComingSoon: false },
  { src: unicopagLogo, alt: "unicopag", isComingSoon: false },
  { src: yampiLogo, alt: "yampi", isComingSoon: false },
];
