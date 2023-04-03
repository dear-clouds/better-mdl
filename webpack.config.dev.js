const path = require('path');
const { UserscriptPlugin } = require('webpack-userscript');
const dev = process.env.NODE_ENV === 'development';

module.exports = {
    mode: dev ? 'development' : 'production',
    entry: {
        "better-mdl": "./src/index.js",
    },
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
        new UserscriptPlugin({
            headers(original) {
                if (dev) {
                    return {
                        ...original,
                        version: `${original.version}-build.[buildNo]`,
                        match: "*://www.mydramalist.com/*",
                        match: "*mydramalist.com/*",
                        name: "Better MDL (DEV)",
                        grant: "GM_addStyle GM.xmlHttpRequest GM_getValue"
                    }
                }

                return original;
            },
        }),
    ],
};