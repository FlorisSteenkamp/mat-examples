
const path = require('path');

module.exports = {
    entry: './index.ts',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js'],
        /*
        alias: {
            'flo-mat$': path.resolve(__dirname, projectRoot + 'mat/index.ts'),
        }
        */
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bundle')
    }
};