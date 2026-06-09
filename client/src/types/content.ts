export type HomepageContent = {
  title: string;
  subtitle: string;
};

export type VortexContent = {
  homepage: HomepageContent;
  stats: {
    totalClicks: number;
    formSubmissions: number;
  };
};
