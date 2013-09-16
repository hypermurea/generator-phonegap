require.config({
    paths: {
		index: 'index'
    }
});

require(['index'], function (index) {
    'use strict';
	index.initialize();
});