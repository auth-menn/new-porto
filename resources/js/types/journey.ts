export type JourneyCategory = 'education' | 'internship' | 'workExperience';

export type JourneyTranslation = {
    title: string | null;
    activities: Array<string | null>;
};

export type JourneyTranslations = Partial<
    Record<'en' | 'ja' | 'zh' | 'ru' | 'ar', JourneyTranslation>
>;

export type Journey = {
    id: number;
    category: JourneyCategory;
    organization: string;
    title: string;
    logoUrl: string | null;
    startYear: number;
    endYear: number | null;
    activities: string[];
    translations: JourneyTranslations;
    documentationUrl: string | null;
};
