
const path = require('path');

const projectRoot = 'c:/projects/';

module.exports = {
    entry: './index.ts',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js'],
        alias: {
            //'flo-mat$': path.resolve(__dirname, projectRoot + 'mat/src/index.ts'),
            //'flo-bezier3$': path.resolve(__dirname, projectRoot + 'bezier/index.ts'),
        }
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bundle')
    }
};