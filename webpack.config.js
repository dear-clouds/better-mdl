const WebpackUserscript = require("webpack-userscript").default;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const packageJson = require("./package.json");
const path = require('path');

module.exports = {
    mode: "production",
    entry: {
        "better-mdl": "./src/index.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        fallback: {
            url: require.resolve('url'),
            path: require.resolve('path-browserify'),
        },
    },
    output: {
        publicPath: '/',
    },
    plugins: [
        new WebpackUserscript({
            headers: {
                name: "Better MDL",
                namespace: "https://dear-clouds.carrd.co/#better-mdl",
                version: packageJson.version,
                author: "Mio.",
                // licence: "GPL3",
                match: ["*://www.mydramalist.com/*", "*mydramalist.com/*"],
                description: "A userscript to enhance the website by making it more friendly & modern",
                downloadURL: "https://github.com/dear-clouds/better-mdl/raw/main/better-mdl.user.js",
                updateURL: "https://github.com/dear-clouds/better-mdl/raw/main/better-mdl.meta.js",
                supportURL: "https://mydramalist.com/discussions/general-discussion/88611-gathering-feedbacks",
                grant: ["GM_addStyle", "GM.xmlHttpRequest", "GM_getValue"],
                icon: "https://github.com/dear-clouds/better-mdl/raw/main/images/favicon.png",
            },
        }),
        // new BundleAnalyzerPlugin(),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, '/'),
        },
        compress: true,
        port: 8080,
        hot: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
};