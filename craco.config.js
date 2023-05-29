const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              // '@primary-color': '#ED7635',
              // '@border-radius-base': '1px',
              // '@border-color-base': '#E9E6E5',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
