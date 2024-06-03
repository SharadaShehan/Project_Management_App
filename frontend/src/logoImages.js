const logoImages = {
    logoDefault: require('../images/projectLogos/logo-default.jpg'),
    logo1: require('../images/projectLogos/logo1.png'),
    logo2: require('../images/projectLogos/logo2.jpg'),
    logo3: require('../images/projectLogos/logo3.jpg'),
    logo4: require('../images/projectLogos/logo4.jpg'),
    logo5: require('../images/projectLogos/logo5.png'),
    logo6: require('../images/projectLogos/logo6.png'),
    logo7: require('../images/projectLogos/logo7.png'),
};

export const getLogoImage = (file) => {
    let fileNameParts = file.split('.');
    let fileName = fileNameParts[0];
    if (fileName === 'logo-default') {
        return logoImages.logoDefault;
    }
    return logoImages[fileName];
}

export const logoImagesArray = [
    { file: 'logo1.png', image: logoImages.logo1 },
    { file: 'logo2.jpg', image: logoImages.logo2 },
    { file: 'logo3.jpg', image: logoImages.logo3 },
    { file: 'logo4.jpg', image: logoImages.logo4 },
    { file: 'logo5.png', image: logoImages.logo5 },
    { file: 'logo6.png', image: logoImages.logo6 },
    { file: 'logo7.png', image: logoImages.logo7 },
];

