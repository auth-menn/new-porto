export type JourneyCategory = 'education' | 'internship' | 'workExperience';

export type Journey = {
    id: number;
    category: JourneyCategory;
    organization: string;
    title: string;
    logoUrl: string | null;
    startYear: number;
    endYear: number | null;
    activities: string[];
    documentationUrl: string | null;
};
