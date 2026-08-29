export type IntegrationNodeSize = 'large' | 'small';

export type IntegrationNode = {
  name: string;
  imageSrc: string;
  x: number;
  y: number;
  size: IntegrationNodeSize;
  animationDelay: number;
};

export const INTEGRATION_HUB_POSITION = { x: 50, y: 55 } as const;

export const integrations: IntegrationNode[] = [
  {
    name: 'Elit',
    imageSrc: '/imgs/integrations/Elit.png',
    x: 27,
    y: 14,
    size: 'large',
    animationDelay: 0,
  },
  {
    name: 'Техномир',
    imageSrc: '/imgs/integrations/technomir-logo.png',
    x: 58,
    y: 9,
    size: 'large',
    animationDelay: 420,
  },
  {
    name: 'BM Parts',
    imageSrc: '/imgs/integrations/bm-logo.png',
    x: 90,
    y: 30,
    size: 'large',
    animationDelay: 840,
  },
  {
    name: 'AutoOriginal',
    imageSrc: '/imgs/integrations/autooriginal.png',
    x: 90,
    y: 63,
    size: 'large',
    animationDelay: 1260,
  },
  {
    name: 'S-Line',
    imageSrc: '/imgs/integrations/s-line-logo.svg',
    x: 77,
    y: 89,
    size: 'large',
    animationDelay: 1680,
  },
  {
    name: 'Omega',
    imageSrc: '/imgs/integrations/omega-logo.jpg',
    x: 34,
    y: 94,
    size: 'large',
    animationDelay: 2100,
  },
  {
    name: 'Юнік Трейд',
    imageSrc: '/imgs/integrations/uniq_logo.png',
    x: 8,
    y: 77,
    size: 'large',
    animationDelay: 2520,
  },
  {
    name: 'Autotechnics',
    imageSrc: '/imgs/integrations/autotechnics_logo.png',
    x: 12,
    y: 45,
    size: 'large',
    animationDelay: 2940,
  },
  {
    name: 'ASG',
    imageSrc: '/imgs/integrations/ASG.png',
    x: 36,
    y: 38,
    size: 'small',
    animationDelay: 180,
  },
  {
    name: 'Inter Cars',
    imageSrc: '/imgs/integrations/intercars_logo.png',
    x: 50,
    y: 31,
    size: 'small',
    animationDelay: 600,
  },
  {
    name: 'Bastion',
    imageSrc: '/imgs/integrations/bastion-logo.png',
    x: 64,
    y: 38,
    size: 'small',
    animationDelay: 1020,
  },
  {
    name: '4Cars',
    imageSrc: '/imgs/integrations/forcars.png',
    x: 33,
    y: 57,
    size: 'small',
    animationDelay: 1440,
  },
  {
    name: 'Twin',
    imageSrc: '/imgs/integrations/twin.png',
    x: 69,
    y: 57,
    size: 'small',
    animationDelay: 1860,
  },
  {
    name: 'Groupauto Україна',
    imageSrc: '/imgs/integrations/vladislav.png',
    x: 62,
    y: 70,
    size: 'small',
    animationDelay: 2280,
  },
  {
    name: 'Ford.org.ua',
    imageSrc: '/imgs/integrations/ford_org_ua.png',
    x: 50,
    y: 82,
    size: 'small',
    animationDelay: 2700,
  },
  {
    name: 'Partline',
    imageSrc: '/imgs/integrations/partline-logo.png',
    x: 36,
    y: 73,
    size: 'small',
    animationDelay: 3120,
  },
];
