export interface ProductItem {
  id: string;
  name: string;
  domain: string;
  url: string;
  category: 'academic' | 'automation' | 'iot' | 'business';
  categoryLabel: string;
  description: string;
  techStack: string[];
  status: 'Production Live' | 'Active SaaS';
}

export interface Mql5Feature {
  id: string;
  title: string;
  description: string;
  tag: string;
  details: string[];
}

export interface TechItem {
  name: string;
  level: string;
  category: 'Frontend' | 'Backend' | 'Trading & Algo' | 'IoT & Hardware';
  icon: string;
}

export interface AffiliateItem {
  id: string;
  title: string;
  platform: 'Shopee Affiliate' | 'TikTok Affiliate' | 'VPS Partner';
  category: 'IoT & Microcontroller' | 'Workstation Gear' | 'Trading Infrastructure';
  description: string;
  specs: string[];
  linkUrl: string;
}
