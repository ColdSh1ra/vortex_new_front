export type AboutUsContent = {
  title: string;
  description: string;
  cards_data: object[];
};

export type HomepageContent = {
  title: string;
  subtitle: string;
  about_us: AboutUsContent;
};

export type VortexContent = {
  homepage: HomepageContent;
  stats: {
    totalClicks: number;
    formSubmissions: number;
  };
};
