export type MenuCardImage = {
    id: number;
    imageUrl: string;
};

export type MenuImageSide = 'left' | 'right';

export type ManagedMenuImage = MenuCardImage & {
    side: MenuImageSide;
};

export type MenuImages = {
    left: MenuCardImage[];
    right: MenuCardImage[];
};
