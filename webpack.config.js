const path = require("path");
const url = require("url");
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const resolve = path.resolve.bind(path, __dirname);



module.exports = (env, argv) => {
    const devMode = argv.mode !== 'production';

    let extractCssPlugin;
    let fileLoaderPath;
    let output;

    if (!devMode) {
        const baseStaticPath = process.env.STATIC_URL || '/static/';
        const publicPath = url.resolve(baseStaticPath, 'assets/');
        output = {
            path: resolve('{{ project_name }}/static/assets/'),
            filename: "[name].[chunkhash].js",
            publicPath: publicPath
        };
        fileLoaderPath = 'file-loader?name=[name].[hash].[ext]';
        extractCssPlugin = new MiniCssExtractPlugin({
            filename: '[name].[chunkhash].css',
        })
    } else {
        output = {
            path: resolve('static/assets/'),
            filename: '[name].js',
            publicPath: '/static/assets/'
        };
        fileLoaderPath = 'file-loader?name=[name].[ext]';
        extractCssPlugin = new MiniCssExtractPlugin({
            filename: '[name].css',
        });
    }
    ;

    return {
        context: __dirname,

        entry: {
            main: './{{ project_name }}/static/js/main/index'
        },

        output: output,

        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: file => (
                        /node_modules/.test(file) &&
                        !/\.vue\.js/.test(file)
                    )
                },
                {test: /\.vue$/, loader: 'vue-loader'}, // to transform VUE into JS
                {
                    test: /\.css$/,
                    oneOf: [
                        // this matches `<style module>`
                        {
                            resourceQuery: /module/,
                            use: [
                                devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                                {
                                    loader: 'css-loader',
                                    options: {
                                        modules: true,
                                        localIdentName: '[local]_[hash:base64:5]'
                                    }
                                }
                            ]
                        },
                        // this matches plain `<style>` or `<style scoped>`
                        {
                            use: [
                                devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                                'css-loader'
                            ]
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                sourceMap: true,
                                plugins: [autoprefixer]
                            }
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                localIdentName: '[local]_[hash:base64:8]',
                                sourceMap: true
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                sourceMap: true,
                                plugins: [
                                    autoprefixer,
                                    require('precss')
                                ]
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {sourceMap: true}
                        },
                    ]
                },
                {
                    test: /\.(eot|oft|png|svg|jpg|ttf|woff|woff2)(\?v=[0-9.]+)?%/,
                    loader: fileLoaderPath,
                    include: [
                        resolve('node_modules'),
                        resolve('{{ project_name }}/static/font'),
                        resolve('{{ project_name }}/static/img')
                    ]
                }
            ],
        },

        optimization: {
            removeAvailableModules: false,
            removeEmptyChunks: false,
            splitChunks: false
        },

        plugins: [
            new VueLoaderPlugin(),
            new BundleTracker({filename: './static/webpack-stats.json'}),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'widow.jQuery': 'jquery',
                Popper: 'popper.js',
                Vue: 'vue/dist/vue.esm.js',
                vue: 'vue/dist/vue.esm.js'
            })
        ],

        resolve: {
            alias: {
                vue: 'vue/dist/vue.esm.js'
            }
        },

        devtool: "sourceMap"
    };
};
