export type AboutUsContent = {
  about_us_title: string;
  about_us_subtitle: string;
  about_us_blocks: AboutUsBlock[];
};

export type AboutUsBlock = {
  about_us_title: string;
  about_us_description: string;
  about_us_image_path: string;
};

export type HomepageContent = {
  title: string;
  subtitle: string;
  about_us_block: AboutUsContent;
};

export type VortexContent = {
  homepage: HomepageContent;
  stats: {
    totalClicks: number;
    formSubmissions: number;
  };
};
