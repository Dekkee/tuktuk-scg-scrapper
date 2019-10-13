const path = require('path');
const package = require('../../package');

module.exports = {
    name: "Tuktuk SCG scrapper",
    short_name: "Tuktuk",
    description: package.description,
    author: package.author,
    homepage_url: package.homepage,
    lang: "en-GB",
    start_url: "/",
    display: "standalone",
    theme_color: "#5a9117",
    background_color: "#FFFFFF",
    ios: true,
    icons: [
    {
        src: path.resolve(__dirname, '../icons/android-icon-192x192.png'),
        sizes: [36, 48, 72, 144, 192],
        type: "image/png",
        destination: path.join('icons', 'android')
    },
    {
        src: path.resolve(__dirname, '../icons/apple-icon-1024x1024.png'),
        sizes: [57, 60, 72, 76, 114, 120, 144, 152, 180, 1024],
        type: "image/png",
        destination: path.join('icons', 'ios'),
        ios: true
    },
    {
        src: path.resolve(__dirname, '../icons/apple-icon-1024x1024.png'),
        sizes: 1024,
        type: "image/png",
        destination: path.join('icons', 'ios'),
        ios: 'startup'
    },
    {
        src: path.resolve(__dirname, '../icons/ms-icon-310x310.png'),
        sizes: [70, 144, 150, 310],
        type: "image/png",
        destination: path.join('icons', 'ms')
    },
]
}
