export type CmsMenuItem = {
    id: string;
    label: string;
    target?: string;
    children?: CmsMenuItem[];
};
export type LayoutContent = {
    header_logo: string;
    header_logo_alt: string;
    footer_logo: string;
    footer_logo_alt: string;
    menu: CmsMenuItem[];
    header_menu?: CmsMenuItem[];
    footer_menu: CmsMenuItem[];
    buttons: {
        try_free_text: string;
        try_free_target: string;
        try_demo_text: string;
        try_demo_target: string;
    };
    socials: {
        network: string;
        url: string;
        label: string;
        icon: string;
    }[];
    privacy_text: string;
    privacy_link: string;
    partner_images: {
        image: string;
        alt: string;
        url: string;
    }[];
};
export type CmsSeo = {
    title: string;
    description: string;
    share_image: string;
    share_image_alt: string;
    indexing: string;
};
export type CmsImage = {
    image: string;
    image_alt: string;
};
export type CmsAutoshrot = {
    hero: CmsImage & {
        visible: boolean;
        eyebrow: string;
        title: string;
        slogan: string;
        intro: string;
        cta_text: string;
        cta_target: string;
    };
    navigation: {
        visible: boolean;
        label: string;
        items: {
            label: string;
            target: string;
        }[];
    };
    car: CmsImage & {
        visible: boolean;
        eyebrow: string;
        title: string;
        description: string;
        characteristics: string[];
        benefits: {
            title: string;
            description: string;
        }[];
    };
    statuses: {
        visible: boolean;
        eyebrow: string;
        title: string;
        description: string;
        items: {
            name: string;
            card_title: string;
            card_description: string;
        }[];
    };
    removal: CmsImage & {
        visible: boolean;
        eyebrow: string;
        title: string;
        description: string;
        methods: {
            title: string;
            description: string;
        }[];
    };
    workflow: {
        visible: boolean;
        title: string;
        steps: string[];
        note: string;
    };
    anchor_aliases: Record<string, string>;
};
export type CmsTecdoc = {
    visible: boolean;
    hero: CmsImage & {
        eyebrow: string;
        title: string;
        subtitle: string;
        cta_text: string;
        cta_target: string;
        secondary_cta_text: string;
        secondary_cta_target: string;
        details: string[];
    };
    stats: {
        value: number | string;
        suffix: string;
        label: string;
    }[];
    sections: (CmsImage & {
        id: string;
        eyebrow?: string;
        title: string;
        description: string;
        items: string[];
        button_text: string;
        button_target: string;
        blocks?: {
            id: string;
            title: string;
            paragraphs: string[];
        }[];
    })[];
    license: {
        visible: boolean;
        eyebrow: string;
        price: number;
        currency: string;
        billing_type: string;
        price_period: string;
        payment_terms: string;
        trial_terms: string;
        trial_badge: string;
    };
    cta: {
        title: string;
        text: string;
        button_text: string;
        button_target: string;
    };
};
export type CmsWebsites = {
    gallery: {
        visible: boolean;
        section_title: string;
        items: {
            id: string;
            image: string;
            title: string;
            alt: string;
            template: string;
            url: string;
        }[];
    };
    pricing: {
        visible: boolean;
        section_title: string;
        section_description: string;
        tariffs: {
            id: string;
            name: string;
            price: number;
            currency: string;
            billing_type: string;
            extra_payments_note: string;
            cta_text: string;
        }[];
        services: {
            id: string;
            text: string;
            plans: Record<string, {
                included: boolean;
                note: string;
                text?: string;
            }>;
        }[];
    };
};
export type CmsIntegrationPage = {
    slug: string;
    path: string;
    visible: boolean;
    title: string;
    lead: string;
    logo: string;
    logo_alt: string;
    sections: {
        id?: string;
        title: string;
        paragraphs: string[];
        items: string[];
        image: string;
        image_alt: string;
    }[];
    gallery: {
        id?: string;
        image: string;
        alt: string;
    }[];
    links: {
        label: string;
        href: string;
    }[];
};
export type CmsIntegrationPages = {
    visible: boolean;
    label: string;
    eyebrow: string;
    connect: string;
    viewFeatures: string;
    featuresTitle: string;
    linksTitle: string;
    back: string;
    relatedTitle: string;
    pages: Record<string, CmsIntegrationPage>;
};
export type CmsPrivacyPolicy = {
    visible: boolean;
    eyebrow: string;
    title: string;
    lead: string;
    updated: string;
    updated_at: string;
    contents: string;
    sections: {
        id: string;
        title: string;
        html: string;
    }[];
};
export type CmsSupplementaryContent = {
    layout?: LayoutContent;
    autoshrot?: CmsAutoshrot;
    tecdoc?: CmsTecdoc;
    websites?: CmsWebsites;
    integration_pages?: CmsIntegrationPages;
    privacy_policy?: CmsPrivacyPolicy;
    blog_copy?: {
        title: string;
        intro: string;
        texts: Record<string, string>;
    };
    seo?: Partial<Record<'home' | 'faq' | 'contacts' | 'car_service' | 'websites' | 'autoshrot' | 'tecdoc' | 'privacy_policy' | 'blog', CmsSeo>> & {
        integrations?: Record<string, CmsSeo>;
    };
};
