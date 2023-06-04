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
    plugins: [
        new WebpackUserscript({
            headers: {
                name: "Better MDL",
                namespace: "https://dear-clouds.carrd.co/#better-mdl",
                version: packageJson.version,
                author: "Mio.",
                match: ["*://www.mydramalist.com/*", "*mydramalist.com/*"],
                description: "An enhance version making the website more friendly & modern",
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
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080,
        hot: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
};